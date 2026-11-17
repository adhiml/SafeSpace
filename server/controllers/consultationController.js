const Appointment = require('../models/Appointment');
const ChatMessage = require('../models/ChatMessage');
const Notification = require('../models/Notification');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { DEMO_USERS } = require('../utils/demoUsers');
const { slotError, SLOT_BLOCKING_STATUSES } = require('../utils/slots');
const { notify } = require('../services/notify');

const COUNSELLOR_ID = 'counsellor_001';
const SESSION_DURATION_MINUTES = 60; // appointments are booked in fixed 1-hour slots

const withSchedule = (appointmentDoc) => {
  const appointment = appointmentDoc.toObject();
  const start = appointment.is_dev_room ? new Date(0) : new Date(appointment.appointment_datetime);
  const end = appointment.is_dev_room
    ? new Date('2100-01-01T00:00:00.000Z')
    : new Date(start.getTime() + SESSION_DURATION_MINUTES * 60 * 1000);
  return {
    ...appointment,
    start_time: start.toISOString(),
    end_time: end.toISOString(),
  };
};

const isSlotTaken = (counsellorId, when, excludeId) =>
  Appointment.exists({
    counsellor_user_id: counsellorId,
    appointment_datetime: when,
    status: { $in: SLOT_BLOCKING_STATUSES },
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  });

const idOf = (ref) => String(ref?._id ?? ref);

// For an anonymous booking the counsellor must only ever receive the student's alias.
// (The screens also hide the name, but the API response itself shouldn't carry it.)
const hideAnonymousIdentity = (doc, viewerId) => {
  const obj = doc.toObject ? doc.toObject() : doc;
  if (!obj.is_anonymous || idOf(obj.counsellor_user_id) !== viewerId) return obj;
  const student = obj.student_user_id;
  if (student && typeof student === 'object') {
    obj.student_user_id = { _id: student._id, anonymous_name: student.anonymous_name };
  }
  return obj;
};

const createAppointment = asyncHandler(async (req, res) => {
  const {
    counsellor_user_id = COUNSELLOR_ID,
    appointment_datetime,
    session_details,
    is_anonymous,
  } = req.body;

  if (!appointment_datetime) {
    res.status(400);
    throw new Error('appointment_datetime is required');
  }

  const when = new Date(appointment_datetime);
  const invalidSlot = slotError(when);
  if (invalidSlot) {
    res.status(400);
    throw new Error(invalidSlot);
  }
  if (await isSlotTaken(counsellor_user_id, when)) {
    res.status(409);
    throw new Error('That time slot has already been taken. Please pick another.');
  }

  const appointment = await Appointment.create({
    student_user_id: req.demoUserId,
    counsellor_user_id,
    appointment_datetime,
    session_details: session_details || '',
    is_anonymous: !!is_anonymous,
  });

  await notify({
    userId: counsellor_user_id,
    type: 'new_request',
    appointmentId: appointment._id,
    title: 'New appointment request',
    message: 'A student has requested a counselling session.',
  });

  const populated = await Appointment.findById(appointment._id)
    .populate('student_user_id', 'user_name anonymous_name')
    .populate('counsellor_user_id', 'user_name display_title specialization');

  res.status(201).json(populated);
});

const getAppointments = asyncHandler(async (req, res) => {
  const user = await User.findById(req.demoUserId);
  const filter =
    user?.role === 'counsellor'
      ? { counsellor_user_id: req.demoUserId, is_dev_room: { $ne: true } }
      : { student_user_id: req.demoUserId, is_dev_room: { $ne: true } };

  const appointments = await Appointment.find(req.readCutoff ? { ...filter, created_at: { $lte: req.readCutoff } } : filter)
    .sort({ appointment_datetime: -1 })
    .populate('student_user_id', 'user_name anonymous_name')
    .populate('counsellor_user_id', 'user_name display_title specialization');

  res.json(appointments.map((a) => hideAnonymousIdentity(a, req.demoUserId)));
});

const VALID_STATUSES = ['pending', 'approved', 'cancelled', 'completed'];

const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!VALID_STATUSES.includes(status)) {
    res.status(400);
    throw new Error(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  const role = getParticipantRole(appointment, req.demoUserId);

  if (!role) {
    res.status(403);
    throw new Error('Not authorized to update this appointment');
  }
  if (appointment.is_dev_room) {
    res.status(400);
    throw new Error('The developer chatroom cannot be changed');
  }

  // student can only cancel appointments, counsellor can update to any status
  if (role === 'student' && status !== 'cancelled') {
    res.status(403);
    throw new Error('Students can only cancel appointments');
  }
  const approving = status === 'approved' && appointment.status !== 'approved';
  if (approving && (await isSlotTaken(appointment.counsellor_user_id, appointment.appointment_datetime, appointment._id))) {
    res.status(409);
    throw new Error('You already have a confirmed session at this time.');
  }

  appointment.status = status;
  await appointment.save();

  // A counsellor approving or declining is what the student's "Counsellor approval" setting controls.
  await notify({
    userId: role === 'counsellor' ? appointment.student_user_id : appointment.counsellor_user_id,
    type: role === 'counsellor' && ['approved', 'cancelled'].includes(status) ? 'approval' : 'appointment_update',
    appointmentId: appointment._id,
    title: 'Appointment status updated',
    message: `Your appointment has been ${status}.`,
  });

  // The slot is now taken: decline other students' pending requests for it and tell them why.
  if (approving) {
    const competing = await Appointment.find({
      _id: { $ne: appointment._id },
      counsellor_user_id: appointment.counsellor_user_id,
      appointment_datetime: appointment.appointment_datetime,
      status: 'pending',
    });
    for (const other of competing) {
      other.status = 'cancelled';
      await other.save();
      await notify({
        userId: other.student_user_id,
        type: 'approval',
        appointmentId: other._id,
        title: 'Time slot no longer available',
        message: 'Another session was confirmed for that time. Please book a different slot.',
      });
    }
  }

  const populated = await Appointment.findById(appointment._id)
    .populate('student_user_id', 'user_name anonymous_name')
    .populate('counsellor_user_id', 'user_name display_title specialization');

  res.json(hideAnonymousIdentity(populated, req.demoUserId));
});

const getParticipantRole = (appointment, demoUserId) => {
  if (appointment.counsellor_user_id.toString() === demoUserId) { return 'counsellor';} 
  if (appointment.student_user_id.toString() === demoUserId) { return 'student';}
  return null;
};

const requireParticipant = (appointment, demoUserId) => {
  return getParticipantRole(appointment, demoUserId) !== null;
};

const getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }
  if (!requireParticipant(appointment, req.demoUserId)) {
    res.status(403);
    throw new Error('Not authorized to view this appointment');
  }

  const populated = await Appointment.findById(appointment._id)
    .populate('student_user_id', 'user_name anonymous_name')
    .populate('counsellor_user_id', 'user_name display_title specialization');

  res.json(hideAnonymousIdentity(withSchedule(populated), req.demoUserId));
});

const sendMessage = asyncHandler(async (req, res) => {
  const { appointment_id, message } = req.body;
  if (!appointment_id || !message) {
    res.status(400);
    throw new Error('appointment_id and message are required');
  }

  const appointment = await Appointment.findById(appointment_id);
  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }
  if (!requireParticipant(appointment, req.demoUserId)) {
    res.status(403);
    throw new Error('Not authorized to message on this appointment');
  }
  // Chat is only open for a confirmed session, during its scheduled hour.
  if (appointment.status !== 'approved') {
    res.status(400);
    throw new Error(`Cannot send messages for a ${appointment.status} appointment`);
  }
  const startsAt = new Date(appointment.appointment_datetime).getTime();
  const now = Date.now();
  if (!appointment.is_dev_room && (now < startsAt || now >= startsAt + SESSION_DURATION_MINUTES * 60 * 1000)) {
    res.status(400);
    throw new Error('This session is not open right now');
  }

  const chatMessage = await ChatMessage.create({
    appointment_id,
    sender_id: req.demoUserId,
    message: String(message).trim(),
    sent_at: new Date(),
  });

  await chatMessage.populate('sender_id', 'user_name anonymous_name display_title');

  // Tell the other person, but only once until they've seen it, so a busy chat doesn't flood them.
  const recipientId = String(appointment.student_user_id) === req.demoUserId ? appointment.counsellor_user_id : appointment.student_user_id;
  const alreadyNotified = await Notification.exists({
    user_id: recipientId,
    type: 'message',
    appointment_id: appointment._id,
    is_read: false,
  });
  if (!alreadyNotified) {
    await notify({
      userId: recipientId,
      type: 'message',
      appointmentId: appointment._id,
      title: 'New message',
      message: 'You have a new message in your counselling chat.',
    });
  }
  res.status(201).json(chatMessage);
});

const getMessages = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.appointmentId);
  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }
  if (!requireParticipant(appointment, req.demoUserId)) {
    res.status(403);
    throw new Error('Not authorized to view this conversation');
  }

  const messages = await ChatMessage.find({
    appointment_id: req.params.appointmentId,
    ...(req.readCutoff ? { sent_at: { $lte: req.readCutoff } } : {}),
  })
    .sort({ sent_at: 1 })
    .populate('sender_id', 'user_name anonymous_name display_title');

  const hideStudentName = appointment.is_anonymous && idOf(appointment.counsellor_user_id) === req.demoUserId;
  res.json(
    messages.map((m) => {
      const obj = m.toObject();
      const sender = obj.sender_id;
      if (hideStudentName && sender && typeof sender === 'object' && idOf(sender) === idOf(appointment.student_user_id)) {
        obj.sender_id = { _id: sender._id, anonymous_name: sender.anonymous_name };
      }
      return obj;
    })
  );
});

const getCounsellors = asyncHandler(async (req, res) => {
  // 1. Try fetching from MongoDB
  let rawCounsellors = await User.find({ role: 'counsellor' })
    .select('_id user_name display_title specialization faculty');

  // 2. Fallback to DEMO_USERS if DB returns nothing
  if (!rawCounsellors || rawCounsellors.length === 0) {
    rawCounsellors = Object.values(DEMO_USERS).filter(
      (user) => user.role === 'counsellor'
    );
  }

  // 3. Map into the front-end format
  const counsellors = rawCounsellors.map((counsellor) => ({
    id: counsellor._id,
    name: counsellor.display_title ? `${counsellor.display_title} ${counsellor.user_name}` : counsellor.user_name,
    title: counsellor.specialization || 'Counsellor',
    faculty: counsellor.faculty || 'Student Wellness Centre',
  }));

  res.json(counsellors);
});

// Times a counsellor is already booked, so students can't pick them. Carries no student details.
const getBookedSlots = asyncHandler(async (req, res) => {
  const from = req.query.from ? new Date(req.query.from) : new Date();
  const to = req.query.to ? new Date(req.query.to) : new Date(from.getTime() + 14 * 24 * 60 * 60 * 1000);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    res.status(400);
    throw new Error('from and to must be valid dates');
  }

  const booked = await Appointment.find({
    counsellor_user_id: req.params.id,
    status: { $in: SLOT_BLOCKING_STATUSES },
    appointment_datetime: { $gte: from, $lt: to },
  }).select('appointment_datetime');

  res.json(booked.map((a) => a.appointment_datetime.toISOString()));
});

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({
    user_id: req.demoUserId,
    ...(req.readCutoff ? { created_at: { $lte: req.readCutoff } } : {}),
  }).sort({
    created_at: -1,
  });
  res.json(notifications);
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user_id: req.demoUserId },
    { is_read: true },
    { new: true }
  );
  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }
  res.json(notification);
});

const markAllNotificationsRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    { user_id: req.demoUserId, is_read: false },
    { is_read: true }
  );
  res.json({ updated: result.modifiedCount });
});

// Development only: the one always-open chatroom (see config/seedDevRoom.js).
const getDevRoom = asyncHandler(async (req, res) => {
  const room = await Appointment.findOne({ is_dev_room: true });
  if (!room || !requireParticipant(room, req.demoUserId)) {
    res.status(404);
    throw new Error('The developer chatroom is only open to its two participants (Jamie Chen and Morgan Lee)');
  }
  const populated = await Appointment.findById(room._id)
    .populate('student_user_id', 'user_name anonymous_name')
    .populate('counsellor_user_id', 'user_name display_title specialization');
  res.json(withSchedule(populated));
});


module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  sendMessage,
  getMessages,
  getCounsellors,
  getBookedSlots,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getDevRoom,
};

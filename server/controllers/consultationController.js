const Appointment = require('../models/Appointment');
const ChatMessage = require('../models/ChatMessage');
const Notification = require('../models/Notification');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { DEMO_USERS } = require('../utils/demoUsers');

const COUNSELLOR_ID = 'counsellor_001';
const SESSION_DURATION_MINUTES = 60; // appointments are booked in fixed 1-hour slots

const withSchedule = (appointmentDoc) => {
  const appointment = appointmentDoc.toObject();
  const start = new Date(appointment.appointment_datetime);
  const end = new Date(start.getTime() + SESSION_DURATION_MINUTES * 60 * 1000);
  return {
    ...appointment,
    start_time: start.toISOString(),
    end_time: end.toISOString(),
  };
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

  const appointment = await Appointment.create({
    student_user_id: req.demoUserId,
    counsellor_user_id,
    appointment_datetime,
    session_details: session_details || '',
    is_anonymous: !!is_anonymous,
  });

  await Notification.create({
    user_id: counsellor_user_id,
    appointment_id: appointment._id,
    title: 'New appointment request',
    message: 'A student has requested a counselling session.',
  });

  const populated = await Appointment.findById(appointment._id)
    .populate('student_user_id', 'user_name anonymous_name')
    .populate('counsellor_user_id', 'user_name');

  res.status(201).json(populated);
});

const getAppointments = asyncHandler(async (req, res) => {
  const user = await User.findById(req.demoUserId);
  const filter =
    user?.role === 'counsellor'
      ? { counsellor_user_id: req.demoUserId }
      : { student_user_id: req.demoUserId };

  const appointments = await Appointment.find(filter)
    .sort({ appointment_datetime: -1 })
    .populate('student_user_id', 'user_name anonymous_name')
    .populate('counsellor_user_id', 'user_name');

  res.json(appointments);
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

  // student can only cancel appointments, counsellor can update to any status
  if (role === 'student' && status !== 'cancelled') {
    res.status(403);
    throw new Error('Students can only cancel appointments');
  }
  appointment.status = status;
  await appointment.save();

  await Notification.create({
    user_id: role === 'counsellor' ? appointment.student_user_id : appointment.counsellor_user_id,
    appointment_id: appointment._id,
    title: 'Appointment status updated',
    message: `Your appointment has been ${status}.`,
  });

  const populated = await Appointment.findById(appointment._id)
    .populate('student_user_id', 'user_name anonymous_name')
    .populate('counsellor_user_id', 'user_name');

  res.json(populated);
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
    .populate('counsellor_user_id', 'user_name');

  res.json(withSchedule(populated));
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
  if (appointment.status === 'cancelled' || appointment.status === 'completed') {
    res.status(400);
    throw new Error(`Cannot send messages for a ${appointment.status} appointment`);
  }

  const chatMessage = await ChatMessage.create({
    appointment_id,
    sender_id: req.demoUserId,
    message,
    sent_at: new Date(),
  });

  await chatMessage.populate('sender_id', 'user_name anonymous_name');
  res.status(201).json(populated);
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

  const messages = await ChatMessage.find({ appointment_id: req.params.appointmentId })
    .sort({ sent_at: 1 })
    .populate('sender_id', 'user_name anonymous_name');
  res.json(messages);
});

const getCounsellors = asyncHandler(async (req, res) => {
  // 1. Try fetching from MongoDB
  let rawCounsellors = await User.find({ role: 'counsellor' })
    .select('_id user_name specialization faculty profile_picture');

  // 2. Fallback to DEMO_USERS if DB returns nothing
  if (!rawCounsellors || rawCounsellors.length === 0) {
    rawCounsellors = Object.values(DEMO_USERS).filter(
      (user) => user.role === 'counsellor'
    );
  }

  // 3. Map into the front-end format
  const counsellors = rawCounsellors.map((counsellor) => ({
    id: counsellor._id,
    name: counsellor.user_name,
    title: counsellor.specialization || 'Counsellor',
    faculty: counsellor.faculty || 'Student Wellness Centre',
    profile_picture: counsellor.profile_picture || '',
  }));

  res.json(counsellors);
});

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user_id: req.demoUserId }).sort({
    created_at: -1,
  });
  res.json(notifications);
});


module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  sendMessage,
  getMessages,
  getCounsellors,
  getNotifications,
};

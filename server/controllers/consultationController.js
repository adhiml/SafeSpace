const Appointment = require('../models/Appointment');
const ChatMessage = require('../models/ChatMessage');
const Notification = require('../models/Notification');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const COUNSELLOR_ID = 'counsellor_001';

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
    user_id: COUNSELLOR_ID,
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

const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const appointment = await Appointment.findOneAndUpdate(
    { _id: req.params.id, counsellor_user_id: req.demoUserId },
    { status },
    { new: true }
  )
    .populate('student_user_id', 'user_name anonymous_name')
    .populate('counsellor_user_id', 'user_name');

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }
  res.json(appointment);
});

const sendMessage = asyncHandler(async (req, res) => {
  const { appointment_id, message } = req.body;
  if (!appointment_id || !message) {
    res.status(400);
    throw new Error('appointment_id and message are required');
  }

  const chatMessage = await ChatMessage.create({
    appointment_id,
    sender_id: req.demoUserId,
    message,
    sent_at: new Date(),
  });

  const populated = await ChatMessage.findById(chatMessage._id).populate('sender_id', 'user_name');
  res.status(201).json(populated);
});

const getMessages = asyncHandler(async (req, res) => {
  const messages = await ChatMessage.find({ appointment_id: req.params.appointmentId })
    .sort({ sent_at: 1 })
    .populate('sender_id', 'user_name anonymous_name');
  res.json(messages);
});

const getCounsellors = asyncHandler(async (req, res) => {
  const counsellors = await User.find({ role: 'counsellor' }).select('user_name faculty profile_picture');
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
  updateAppointmentStatus,
  sendMessage,
  getMessages,
  getCounsellors,
  getNotifications,
};

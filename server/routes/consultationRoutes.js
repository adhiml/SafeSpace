const express = require('express');
const {
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
} = require('../controllers/consultationController');

const router = express.Router();

router.get('/counsellors', getCounsellors);
router.get('/counsellors/:id/booked-slots', getBookedSlots);
router.get('/notifications', getNotifications);
router.patch('/notifications/read-all', markAllNotificationsRead);
router.patch('/notifications/:id/read', markNotificationRead);
router.post('/appointments', createAppointment);
router.get('/appointments', getAppointments);
if (process.env.NODE_ENV !== 'production') router.get('/appointments/dev-room', getDevRoom);
router.get('/appointments/:id', getAppointmentById);
router.patch('/appointments/:id/status', updateAppointmentStatus);
router.post('/messages', sendMessage);
router.get('/messages/:appointmentId', getMessages);

module.exports = router;

const express = require('express');
const {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  sendMessage,
  getMessages,
  getCounsellors,
  getNotifications,
} = require('../controllers/consultationController');

const router = express.Router();

router.get('/counsellors', getCounsellors);
router.get('/notifications', getNotifications);
router.post('/appointments', createAppointment);
router.get('/appointments', getAppointments);
router.get('/appointments/:id', getAppointmentById);
router.patch('/appointments/:id/status', updateAppointmentStatus);
router.post('/messages', sendMessage);
router.get('/messages/:appointmentId', getMessages);

module.exports = router;

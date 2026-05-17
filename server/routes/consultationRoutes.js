const express = require('express');
const {
  createAppointment,
  getAppointments,
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
router.post('/messages', sendMessage);
router.get('/messages/:appointmentId', getMessages);

module.exports = router;

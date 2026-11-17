const express = require('express');
const { getMe, updateMe, changePassword, getNotificationSettings, updateNotificationSettings } = require('../controllers/userController');

const router = express.Router();

router.get('/me', getMe);
router.patch('/me', updateMe);
router.post('/me/password', changePassword);
router.get('/me/notification-settings', getNotificationSettings);
router.patch('/me/notification-settings', updateNotificationSettings);

module.exports = router;

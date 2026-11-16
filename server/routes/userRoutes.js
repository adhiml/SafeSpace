const express = require('express');
const { getMe, updateMe, changePassword } = require('../controllers/userController');

const router = express.Router();

router.get('/me', getMe);
router.patch('/me', updateMe);
router.post('/me/password', changePassword);

module.exports = router;

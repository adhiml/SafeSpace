const express = require('express');
const { register, login, me, logout, sendCode, verify, deleteAccount } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Open to everyone
router.post('/register', register);
router.post('/login', login);

// Signed-in users, including ones whose verification has lapsed (they need these to see why and to sign out)
router.get('/me', authenticate({ allowFrozen: true }), me);
router.post('/logout', authenticate({ allowFrozen: true }), logout);
router.post('/send-code', authenticate({ allowFrozen: true }), sendCode);
router.post('/verify', authenticate({ allowFrozen: true }), verify);
router.delete('/me', authenticate({ allowFrozen: true }), deleteAccount);

module.exports = router;

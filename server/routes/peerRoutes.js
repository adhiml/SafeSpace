const express = require('express');
const { createPost, getPosts, meTooPost } = require('../controllers/peerController');

const router = express.Router();

router.get('/posts', getPosts);
router.post('/posts', createPost);
router.post('/posts/:id/me-too', meTooPost);

module.exports = router;

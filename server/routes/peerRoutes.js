const express = require('express');
const { createPost, getPosts, meTooPost, createComment } = require('../controllers/peerController');

const router = express.Router();

router.get('/posts', getPosts);
router.post('/posts', createPost);
router.post('/posts/:id/me-too', meTooPost);
router.post('/comments', createComment);

module.exports = router;

const express = require('express');
const { createPost, getPosts, meTooPost, viewPost, deletePost } = require('../controllers/peerController');

const router = express.Router();

router.get('/posts', getPosts);
router.post('/posts', createPost);
router.post('/posts/:id/me-too', meTooPost);
router.post('/posts/:id/view', viewPost);
router.delete('/posts/:id', deletePost);

module.exports = router;

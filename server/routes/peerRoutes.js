const express = require('express');
const { createPost, getPosts, meTooPost, undoMeTooPost, viewPost, deletePost } = require('../controllers/peerController');

const router = express.Router();

router.get('/posts', getPosts);
router.post('/posts', createPost);
router.post('/posts/:id/me-too', meTooPost);
router.delete('/posts/:id/me-too', undoMeTooPost);
router.post('/posts/:id/view', viewPost);
router.delete('/posts/:id', deletePost);

module.exports = router;

const PeerPost = require('../models/PeerPost');
// const PeerComment = require('../models/PeerComment');
const { analyzeSentiment } = require('../services/sentimentService');
const asyncHandler = require('../utils/asyncHandler');

const createPost = asyncHandler(async (req, res) => {
  const { content, tags } = req.body;
  if (!content) {
    res.status(400);
    throw new Error('content is required');
  }
  const post = await PeerPost.create({
    user_id: req.demoUserId,
    content,
    tags: tags || [],
    sentiment_score: analyzeSentiment(content),
  });
  const populated = await PeerPost.findById(post._id).populate('user_id', 'anonymous_name user_name');
  res.status(201).json(populated);
});

const getPosts = asyncHandler(async (req, res) => {
  const posts = await PeerPost.find()
    .sort({ created_at: -1 })
    .populate('user_id', 'anonymous_name user_name')
    .limit(50);
  res.json(posts);
});

const meTooPost = asyncHandler(async (req, res) => {
  const post = await PeerPost.findByIdAndUpdate(
    req.params.id,
    { $inc: { me_too_count: 1 } },
    { new: true }
  );
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }
  res.json(post);
});

// const createComment = asyncHandler(async (req, res) => {
//   const { post_id, content } = req.body;
//   if (!post_id || !content) {
//     res.status(400);
//     throw new Error('post_id and content are required');
//   }
//   const comment = await PeerComment.create({
//     post_id,
//     user_id: req.demoUserId,
//     content,
//   });
//   const populated = await PeerComment.findById(comment._id).populate(
//     'user_id',
//     'anonymous_name user_name'
//   );
//   res.status(201).json(populated);
// });

// module.exports = { createPost, getPosts, meTooPost, createComment };
module.exports = { createPost, getPosts, meTooPost };

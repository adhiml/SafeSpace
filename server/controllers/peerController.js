const PeerPost = require('../models/PeerPost');
// const PeerComment = require('../models/PeerComment');
const { analyzeText, legacyScore } = require('../services/sentimentService');
const { getDailyStress, applyReview } = require('../services/stressAggregationService');
const asyncHandler = require('../utils/asyncHandler');

// The AI stress score is private: only the author may see it on a post.
const forViewer = (post, viewerId) => {
  const obj = post.toObject ? post.toObject() : post;
  const authorId = String(obj.user_id?._id ?? obj.user_id);
  if (authorId !== String(viewerId)) delete obj.stress_analysis;
  return obj;
};

const createPost = asyncHandler(async (req, res) => {
  const { content, tags } = req.body;
  if (!content) {
    res.status(400);
    throw new Error('content is required');
  }
  // Peer posts are always analysed (no opt-out).
  const analysis = await analyzeText(content);
  const post = await PeerPost.create({
    user_id: req.demoUserId,
    content,
    tags: tags || [],
    sentiment_score: legacyScore(analysis),
    stress_analysis: analysis,
  });
  const populated = await PeerPost.findById(post._id).populate('user_id', 'anonymous_name user_name');
  res.status(201).json(forViewer(populated, req.demoUserId));
});

const getPosts = asyncHandler(async (req, res) => {
  const posts = await PeerPost.find()
    .sort({ created_at: -1 })
    .populate('user_id', 'anonymous_name user_name')
    .limit(50);
  res.json(posts.map((p) => forViewer(p, req.demoUserId)));
});

const reviewPostStress = asyncHandler(async (req, res) => {
  const post = await PeerPost.findOne({ _id: req.params.id, user_id: req.demoUserId });
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }
  if (!applyReview(post, req.body.action, req.body.score)) {
    res.status(400);
    throw new Error('Invalid stress review');
  }
  await post.save();
  res.json({ item: forViewer(post, req.demoUserId), dailyStress: await getDailyStress(req.demoUserId, post.created_at) });
});

const meTooPost = asyncHandler(async (req, res) => {
  const post = await PeerPost.findOneAndUpdate(
    { _id: req.params.id, me_too_users: { $ne: req.demoUserId } },
    { $inc: { me_too_count: 1 }, $push: { me_too_users: req.demoUserId } },
    { new: true }
  );
  if (post) {
    res.json(forViewer(post, req.demoUserId));
    return;
  }

  const existing = await PeerPost.findById(req.params.id);
  if (!existing) {
    res.status(404);
    throw new Error('Post not found');
  }
  res.status(409);
  throw new Error('You already supported this post');
});

const undoMeTooPost = asyncHandler(async (req, res) => {
  const post = await PeerPost.findOneAndUpdate(
    { _id: req.params.id, me_too_users: req.demoUserId },
    { $inc: { me_too_count: -1 }, $pull: { me_too_users: req.demoUserId } },
    { new: true }
  );
  if (post) {
    res.json(forViewer(post, req.demoUserId));
    return;
  }

  const existing = await PeerPost.findById(req.params.id);
  if (!existing) {
    res.status(404);
    throw new Error('Post not found');
  }
  res.status(409);
  throw new Error('You have not supported this post');
});

const viewPost = asyncHandler(async (req, res) => {
  const post = await PeerPost.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true }
  );
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }
  res.json(forViewer(post, req.demoUserId));
});

const deletePost = asyncHandler(async (req, res) => {
  const post = await PeerPost.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }
  if (post.user_id !== req.demoUserId) {
    res.status(403);
    throw new Error('You can only delete your own post');
  }
  await post.deleteOne();
  res.json({ _id: req.params.id });
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
module.exports = { createPost, getPosts, meTooPost, undoMeTooPost, viewPost, deletePost, reviewPostStress };

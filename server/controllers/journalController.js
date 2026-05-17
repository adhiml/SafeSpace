const Journal = require('../models/Journal');
const { analyzeSentiment } = require('../services/sentimentService');
const asyncHandler = require('../utils/asyncHandler');
const { CURRENT_USER_ID } = require('../utils/currentUser');

const createJournal = asyncHandler(async (req, res) => {
  const { title, content, is_sentiment_enabled } = req.body;

  if (!title || !content) {
    res.status(400);
    throw new Error('title and content are required');
  }

  const sentiment_score = is_sentiment_enabled ? analyzeSentiment(content) : 0;

  const journal = await Journal.create({
    user_id: CURRENT_USER_ID,
    title,
    content,
    is_sentiment_enabled: !!is_sentiment_enabled,
    sentiment_score,
  });

  res.status(201).json(journal);
});

const getJournals = asyncHandler(async (req, res) => {
  const journals = await Journal.find({ user_id: CURRENT_USER_ID }).sort({ created_at: -1 });
  res.json(journals);
});

const updateJournal = asyncHandler(async (req, res) => {
  const journal = await Journal.findOne({ _id: req.params.id, user_id: CURRENT_USER_ID });
  if (!journal) {
    res.status(404);
    throw new Error('Journal not found');
  }

  const { title, content, is_sentiment_enabled } = req.body;
  if (title) journal.title = title;
  if (content) journal.content = content;
  if (is_sentiment_enabled !== undefined) journal.is_sentiment_enabled = is_sentiment_enabled;
  if (journal.is_sentiment_enabled && content) {
    journal.sentiment_score = analyzeSentiment(content);
  }

  await journal.save();
  res.json(journal);
});

const deleteJournal = asyncHandler(async (req, res) => {
  const journal = await Journal.findOneAndDelete({ _id: req.params.id, user_id: CURRENT_USER_ID });
  if (!journal) {
    res.status(404);
    throw new Error('Journal not found');
  }
  res.json({ message: 'Journal deleted' });
});

module.exports = { createJournal, getJournals, updateJournal, deleteJournal };

const Journal = require('../models/Journal');
const { analyzeText, legacyScore } = require('../services/sentimentService');
const { getDailyStress, applyReview } = require('../services/stressAggregationService');
const asyncHandler = require('../utils/asyncHandler');

const createJournal = asyncHandler(async (req, res) => {
  const { title, content, is_sentiment_enabled } = req.body;
  if (!title || !content) {
    res.status(400);
    throw new Error('title and content are required');
  }
  // Analysis is opt-in for journals: only runs when the student consented.
  const analysis = is_sentiment_enabled ? await analyzeText(content) : undefined;
  const journal = await Journal.create({
    user_id: req.demoUserId,
    title,
    content,
    is_sentiment_enabled: !!is_sentiment_enabled,
    sentiment_score: legacyScore(analysis),
    stress_analysis: analysis,
    tags: req.body.tags || [],
  });
  res.status(201).json(journal);
});

const getJournals = asyncHandler(async (req, res) => {
  const journals = await Journal.find({ user_id: req.demoUserId }).sort({ created_at: -1 });
  res.json(journals);
});

const updateJournal = asyncHandler(async (req, res) => {
  const journal = await Journal.findOne({ _id: req.params.id, user_id: req.demoUserId });
  if (!journal) {
    res.status(404);
    throw new Error('Journal not found');
  }
  
  const { title, content, is_sentiment_enabled } = req.body;

  const wasEnabled = journal.is_sentiment_enabled;
  const contentChanged = !!content && content !== journal.content;

  if (title) journal.title = title;
  if (content) journal.content = content;

  if (req.body.tags) {
    journal.tags = req.body.tags;
  }

  if (is_sentiment_enabled !== undefined) {
    journal.is_sentiment_enabled = is_sentiment_enabled;
  }

  if (!journal.is_sentiment_enabled) {
    // Consent withdrawn: drop any stored analysis.
    journal.stress_analysis = undefined;
    journal.sentiment_score = 0;
  } else if (contentChanged || !wasEnabled) {
    // Only re-run the model when the text changed or consent was just given.
    // A fresh analysis resets any earlier affirm/correct decision.
    const analysis = await analyzeText(journal.content);
    journal.stress_analysis = analysis;
    journal.sentiment_score = legacyScore(analysis);
  }

  await journal.save();
  res.json(journal);
});

const reviewJournalStress = asyncHandler(async (req, res) => {
  const journal = await Journal.findOne({ _id: req.params.id, user_id: req.demoUserId });
  if (!journal || !journal.is_sentiment_enabled) {
    res.status(404);
    throw new Error('No analysis to review');
  }
  if (!applyReview(journal, req.body.action, req.body.score)) {
    res.status(400);
    throw new Error('Invalid stress review');
  }
  await journal.save();
  res.json({ item: journal, dailyStress: await getDailyStress(req.demoUserId, journal.created_at) });
});

const deleteJournal = asyncHandler(async (req, res) => {
  const journal = await Journal.findOneAndDelete({ _id: req.params.id, user_id: req.demoUserId });
  if (!journal) {
    res.status(404);
    throw new Error('Journal not found');
  }
  res.json({ message: 'Journal deleted' });
});

module.exports = { createJournal, getJournals, updateJournal, deleteJournal, reviewJournalStress };

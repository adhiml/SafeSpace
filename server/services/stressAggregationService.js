const MoodEntry = require('../models/MoodEntry');
const Journal = require('../models/Journal');
const PeerPost = require('../models/PeerPost');

// Weight of an unreviewed AI score, by model confidence. Reviewed scores always weigh 1.
const CONFIDENCE_WEIGHT = { low: 0.4, medium: 0.7, high: 0.9 };
// How far the writing may pull the final score away from the student's own check-in.
const TEXT_INFLUENCE = { reviewed: 0.4, unreviewedOnly: 0.3 };

const round1 = (n) => Math.round(n * 10) / 10;
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;

const band = (s) => {
  if (s < 1.8) return 'Very low';
  if (s < 2.6) return 'Low';
  if (s < 3.4) return 'Moderate';
  if (s < 4.2) return 'High';
  return 'Very high';
};

const effectiveText = (item) => {
  const a = item.stress_analysis;
  if (!a || a.status !== 'success') return null;
  if (a.review === 'corrected') return { score: a.user_score, weight: 1, reviewed: true };
  if (a.review === 'affirmed') return { score: a.ai_score, weight: 1, reviewed: true };
  return { score: a.ai_score, weight: CONFIDENCE_WEIGHT[a.confidence] ?? 0.4, reviewed: false };
};

/**
 * Pure function. moodEntries: the day's MoodEntry docs. textItems: the day's Journal/PeerPost docs
 * (callers must already have excluded journals without consent).
 */
const aggregateDailyStress = (moodEntries = [], textItems = []) => {
  const explicit = moodEntries.length ? mean(moodEntries.map((m) => m.stress_level)) : null;

  const signals = textItems.map(effectiveText).filter(Boolean);
  const totalW = signals.reduce((s, x) => s + x.weight, 0);
  const text = signals.length ? signals.reduce((s, x) => s + x.score * x.weight, 0) / totalW : null;
  const anyReviewed = signals.some((x) => x.reviewed);

  let final;
  let source;
  if (explicit !== null && text !== null) {
    const a = anyReviewed ? TEXT_INFLUENCE.reviewed : TEXT_INFLUENCE.unreviewedOnly;
    final = (1 - a) * explicit + a * text;
    source = 'combined';
  } else if (explicit !== null) {
    final = explicit;
    source = 'checkin-only';
  } else if (text !== null) {
    final = text;
    source = 'text-only';
  } else {
    return { explicit: null, text: null, final: null, band: null, source: 'none', textCount: 0, hasUnreviewed: false };
  }

  return {
    explicit: explicit !== null ? round1(explicit) : null,
    text: text !== null ? round1(text) : null,
    final: round1(final),
    band: band(round1(final)),
    source,
    textCount: signals.length,
    hasUnreviewed: signals.some((x) => !x.reviewed),
  };
};

const dayRange = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { $gte: start, $lt: end };
};

const getDailyStress = async (userId, date = new Date()) => {
  const range = dayRange(date);
  const [moods, journals, posts] = await Promise.all([
    MoodEntry.find({ user_id: userId, created_at: range }),
    // Journal analysis is opt-in; ignore it if consent is currently off.
    Journal.find({ user_id: userId, created_at: range, is_sentiment_enabled: true }),
    PeerPost.find({ user_id: userId, created_at: range }),
  ]);
  return aggregateDailyStress(moods, [...journals, ...posts]);
};

/** Applies a student's affirm/correct decision to a doc's stress_analysis. Returns false if invalid. */
const applyReview = (doc, action, score) => {
  const a = doc.stress_analysis;
  if (!a || a.status !== 'success') return false;

  if (action === 'affirm') {
    a.review = 'affirmed';
  } else if (action === 'correct' && Number.isInteger(score) && score >= 1 && score <= 5) {
    a.review = score === a.ai_score ? 'affirmed' : 'corrected';
    a.user_score = score === a.ai_score ? undefined : score;
  } else {
    return false;
  }
  a.reviewed_at = new Date();
  return true;
};

module.exports = { aggregateDailyStress, getDailyStress, applyReview };

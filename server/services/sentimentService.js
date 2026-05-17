/**
 * Simple keyword-based sentiment scorer (0–1).
 * Replace with a proper NLP service in production.
 */
const positiveWords = ['happy', 'grateful', 'calm', 'hope', 'better', 'good', 'peace'];
const negativeWords = ['sad', 'stress', 'anxious', 'worried', 'tired', 'overwhelmed', 'fail'];

const analyzeSentiment = (text = '') => {
  const lower = text.toLowerCase();
  let score = 0.5;
  positiveWords.forEach((w) => {
    if (lower.includes(w)) score += 0.08;
  });
  negativeWords.forEach((w) => {
    if (lower.includes(w)) score -= 0.08;
  });
  return Math.max(0, Math.min(1, score));
};

module.exports = { analyzeSentiment };

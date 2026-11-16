const { analyzeText, legacyScore } = require('./sentimentService');

// Saving returns immediately with stress_analysis.status = 'pending'; the model (10s+ on a laptop)
// runs afterwards and the client polls until the status changes.
const PENDING = { status: 'pending', review: 'pending' };

/**
 * Fire-and-forget. The filter on `content` makes it a no-op if the text was edited while the
 * model was running (the edit starts its own job); `extraFilter` carries e.g. the consent flag.
 */
const runAnalysisJob = (Model, id, text, extraFilter = {}) => {
  analyzeText(text)
    .then((analysis) =>
      Model.updateOne(
        { _id: id, content: text, ...extraFilter },
        { $set: { stress_analysis: analysis, sentiment_score: legacyScore(analysis) } }
      )
    )
    .catch((e) => console.warn('[analysis-job] failed:', e.message));
};

// A restart mid-analysis would leave docs 'pending' forever.
const failStalePending = async (...Models) => {
  for (const Model of Models) {
    await Model.updateMany(
      { 'stress_analysis.status': 'pending' },
      { $set: { 'stress_analysis.status': 'unavailable' } }
    );
  }
};

module.exports = { PENDING, runAnalysisJob, failStalePending };

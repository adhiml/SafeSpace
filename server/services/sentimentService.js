/**
 * Sentiment + stress analysis via a local Ollama model (gemma2:2b).
 * One shared model instance serves every user; nothing is trained per user.
 */
const { SYSTEM_PROMPT } = require('./prompts/stressPrompt');

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434/api'; // not "localhost": Node may resolve it to IPv6 and miss Ollama
const MODEL_NAME = process.env.OLLAMA_MODEL || 'gemma2:2b';
// First call after idle must load the model, so allow a generous timeout.
const TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS || 60000);
// Unload the model from RAM after 5 idle minutes.
const KEEP_ALIVE = process.env.OLLAMA_KEEP_ALIVE || '5m';
const MIN_CHARS = 3;
const MAX_CHARS = 4000;

const SENTIMENTS = ['positive', 'neutral', 'negative'];
const CONFIDENCES = ['low', 'medium', 'high'];
// Legacy 0–1 field that existing code still stores
const SENTIMENT_TO_SCORE = { positive: 0.8, neutral: 0.5, negative: 0.2 };

class AnalysisError extends Error {
  constructor(type, message) {
    super(message);
    this.type = type;
  }
}

const fetchWithTimeout = async (url, options, ms) => {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: ctrl.signal });
  } catch (e) {
    if (e.name === 'AbortError') throw new AnalysisError('timeout', `Ollama timed out after ${ms}ms`);
    throw new AnalysisError('unreachable', 'Could not connect to Ollama');
  } finally {
    clearTimeout(timer);
  }
};

const parseModelJson = (raw) => {
  const cleaned = String(raw).trim().replace(/^```(?:json)?|```$/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    throw new AnalysisError('invalid_json', 'Model did not return valid JSON');
  }
};

const validate = (data) => {
  const sentiment = String(data.sentiment ?? '').toLowerCase().trim();
  const stress = Number(data.stress_score);
  let confidence = String(data.confidence ?? '').toLowerCase().trim();

  if (!SENTIMENTS.includes(sentiment)) throw new AnalysisError('invalid_schema', `Bad sentiment: ${sentiment}`);
  if (!Number.isInteger(stress) || stress < 1 || stress > 5) {
    throw new AnalysisError('invalid_schema', `Bad stress_score: ${data.stress_score}`);
  }
  if (!CONFIDENCES.includes(confidence)) confidence = 'low';

  return { sentiment, stress_score: stress, confidence };
};

const callOllama = async (text) => {
  const res = await fetchWithTimeout(
    `${OLLAMA_URL}/generate`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL_NAME,
        prompt: `${SYSTEM_PROMPT}\n\nStudent Text:\n${text}`,
        format: 'json',
        stream: false,
        keep_alive: KEEP_ALIVE,
        options: { temperature: 0, seed: 42 },
      }),
    },
    TIMEOUT_MS
  );
  if (!res.ok) throw new AnalysisError('http_error', `Ollama responded ${res.status}`);
  const body = await res.json();
  return validate(parseModelJson(body.response));
};

// Run one analysis at a time so concurrent saves can't pile onto a small local model.
let queue = Promise.resolve();
const enqueue = (task) => {
  const run = queue.then(task, task);
  queue = run.catch(() => {});
  return run;
};

/**
 * Never throws: callers must still be able to save a journal/post when the AI is down.
 * Returns the sub-document stored in `stress_analysis`:
 *   { status: 'success', sentiment, ai_score, confidence, review: 'pending' }
 *   { status: 'unavailable' }
 */
const analyzeText = async (text = '') => {
  const input = String(text).trim().slice(0, MAX_CHARS);
  if (input.length < MIN_CHARS) return { status: 'unavailable' };

  return enqueue(async () => {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const r = await callOllama(input);
        return {
          status: 'success',
          sentiment: r.sentiment,
          ai_score: r.stress_score,
          confidence: r.confidence,
          review: 'pending',
        };
      } catch (e) {
        // Only retry malformed output; timeouts/unreachable fail fast.
        const retryable = e.type === 'invalid_json' || e.type === 'invalid_schema';
        if (!retryable || attempt === 1) {
          console.warn('[sentiment] analysis failed:', e.type || e.message);
          return { status: 'unavailable' };
        }
      }
    }
  });
};

const legacyScore = (analysis) =>
  analysis?.status === 'success' ? SENTIMENT_TO_SCORE[analysis.sentiment] : 0;

module.exports = { analyzeText, legacyScore };

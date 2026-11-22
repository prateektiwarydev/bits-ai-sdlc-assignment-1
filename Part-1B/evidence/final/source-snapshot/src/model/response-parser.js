'use strict';

const { MalformedModelOutputError } = require('../errors');

function parseResponse(raw) {
  if (typeof raw !== 'string' || !raw.trim()) {
    throw new MalformedModelOutputError('Ollama returned empty model output');
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new MalformedModelOutputError('Ollama returned malformed JSON');
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new MalformedModelOutputError('Ollama response was not a JSON object');
  }
  return parsed;
}

module.exports = { parseResponse };

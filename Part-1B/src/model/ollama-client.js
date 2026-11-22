'use strict';

const { OLLAMA_BASE_URL, MODEL, REQUEST_TIMEOUT_MS } = require('../config/runtime');
const { ServiceError } = require('../errors');
const outputSchema = require('../../specs/001-ai-reminder-agent/contracts/output-schema.json');

async function generate(prompt, fetchImpl = globalThis.fetch, systemPrompt = '') {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetchImpl(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        prompt,
        ...(systemPrompt ? { system: systemPrompt } : {}),
        stream: false,
        format: outputSchema,
        options: { temperature: 0 }
      }),
      signal: controller.signal
    });
    if (!response.ok) {
      throw new ServiceError(`Ollama returned HTTP ${response.status}`);
    }
    const body = await response.json();
    if (!body || typeof body.response !== 'string') {
      throw new ServiceError('Ollama response did not contain a response string');
    }
    return body;
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    if (error && error.name === 'AbortError') {
      throw new ServiceError('Ollama request timed out');
    }
    throw new ServiceError('Could not connect to Ollama');
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { generate };

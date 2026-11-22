'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { generate } = require('../../src/model/ollama-client');

test('Ollama client sends real generate request configuration', async () => {
  let request;
  const fetchImpl = async (url, options) => {
    request = { url, options };
    return { ok: true, json: async () => ({ response: '{}', model: 'qwen2.5:3b' }) };
  };
  await generate('test prompt', fetchImpl, 'test system prompt');
  assert.equal(request.url, 'http://127.0.0.1:11434/api/generate');
  const body = JSON.parse(request.options.body);
  assert.equal(body.model, 'qwen2.5:3b');
  assert.equal(body.stream, false);
  assert.equal(body.format.$schema, 'https://json-schema.org/draft/2020-12/schema');
  assert.equal(body.format.additionalProperties, false);
  assert.equal(body.options.temperature, 0);
  assert.equal(body.system, 'test system prompt');
});

test('Ollama HTTP and malformed responses become service errors', async () => {
  await assert.rejects(
    generate('prompt', async () => ({ ok: false, status: 404 })),
    (error) => error.code === 'service_error'
  );
  await assert.rejects(
    generate('prompt', async () => ({ ok: true, json: async () => ({}) })),
    (error) => error.code === 'service_error'
  );
});

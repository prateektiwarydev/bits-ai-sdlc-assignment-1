'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const runtime = require('../../src/config/runtime');
const { InvocationError, ServiceError } = require('../../src/errors');

test('runtime uses confirmed local Ollama configuration', () => {
  assert.equal(runtime.OLLAMA_BASE_URL, 'http://127.0.0.1:11434');
  assert.equal(runtime.MODEL, 'qwen2.5:3b');
  assert.equal(runtime.OLLAMA_VERSION, '0.40.17');
  assert.equal(runtime.TIMEZONE, 'Asia/Kolkata');
});

test('typed errors remain distinct', () => {
  assert.equal(new InvocationError('missing').code, 'invocation_error');
  assert.equal(new ServiceError('timeout').code, 'service_error');
});

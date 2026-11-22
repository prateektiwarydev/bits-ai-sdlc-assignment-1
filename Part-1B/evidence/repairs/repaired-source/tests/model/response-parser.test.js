'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { parseResponse } = require('../../src/model/response-parser');

test('response parser accepts one JSON object and rejects malformed output', () => {
  assert.deepEqual(parseResponse('{"intent":"rejection"}'), { intent: 'rejection' });
  for (const raw of ['', ' ', 'null', '[]', '{bad', 'prefix {}']) {
    assert.throws(() => parseResponse(raw), (error) =>
      error.code === 'malformed_model_output');
  }
});

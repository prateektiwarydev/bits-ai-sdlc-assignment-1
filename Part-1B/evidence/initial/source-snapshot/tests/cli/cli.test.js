'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { parseArgs, run } = require('../../src/cli');

test('CLI parsing preserves explicitly empty text', () => {
  assert.deepEqual(parseArgs(['--text', '', '--reference', '2026-11-22T09:00:00+05:30']), {
    text: '',
    reference: '2026-11-22T09:00:00+05:30'
  });
});

test('CLI missing required options are invocation errors', async () => {
  await assert.rejects(run([]), (error) => error.code === 'invocation_error');
  await assert.rejects(
    run(['--text', 'hello']),
    (error) => error.code === 'invocation_error'
  );
});

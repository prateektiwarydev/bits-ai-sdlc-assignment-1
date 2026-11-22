'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { buildPrompt } = require('../../src/model/prompt');

test('prompt requires all eight fields and intent-specific nullability', () => {
  const prompt = buildPrompt(
    'Reschedule Dentist',
    '2026-11-22T09:00:00+05:30',
    'Asia/Kolkata'
  );
  for (const field of [
    'schema_version',
    'intent',
    'task',
    'target_reminder',
    'scheduled_datetime',
    'snooze_duration',
    'clarification_question',
    'error_reason'
  ]) {
    assert.match(prompt, new RegExp(field));
  }
  assert.match(prompt, /For create:/);
  assert.match(prompt, /For reschedule:/);
  assert.match(prompt, /For snooze:/);
  assert.match(prompt, /For clarification:/);
  assert.match(prompt, /For rejection:/);
});

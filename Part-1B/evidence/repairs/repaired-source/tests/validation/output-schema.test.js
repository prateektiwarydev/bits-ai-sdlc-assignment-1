'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { validateOutput } = require('../../src/validation/output-schema');

const base = {
  schema_version: '1.0',
  intent: 'create',
  task: 'Call Priya',
  target_reminder: null,
  scheduled_datetime: '2026-11-23T18:00:00+05:30',
  snooze_duration: null,
  clarification_question: null,
  error_reason: null
};

test('all approved positive intent shapes pass', () => {
  assert.equal(validateOutput(base).pass, true);
  assert.equal(validateOutput({
    ...base, intent: 'reschedule', task: null,
    target_reminder: { title: 'Dentist' },
    scheduled_datetime: '2026-11-24T10:00:00+05:30'
  }).pass, true);
  assert.equal(validateOutput({
    ...base, intent: 'snooze', task: null, target_reminder: { id: 'rmt-1' },
    scheduled_datetime: null, snooze_duration: { value: 15, unit: 'minutes' }
  }).pass, true);
  assert.equal(validateOutput({
    ...base, intent: 'clarification', task: 'Call Priya',
    target_reminder: null, scheduled_datetime: null,
    snooze_duration: null, clarification_question: 'What time?'
  }).pass, true);
  assert.equal(validateOutput({
    ...base, intent: 'rejection', task: null, target_reminder: null,
    scheduled_datetime: null, snooze_duration: null, error_reason: 'Unsupported'
  }).pass, true);
});

test('all documented negative intent shapes fail', () => {
  for (const item of [
    { ...base, target_reminder: { id: null } },
    { ...base, intent: 'reschedule', task: 'Call Priya', target_reminder: { title: 'Dentist' } },
    { ...base, snooze_duration: { value: 15, unit: 'minutes' } },
    { ...base, intent: 'rejection', task: 'Delete', target_reminder: null, scheduled_datetime: null, error_reason: 'Unsupported' },
    { ...base, task: '   ' },
    { ...base, target_reminder: { title: 'Dentist', extra: 'invented' } },
    { ...base, scheduled_datetime: 'not-a-date' }
  ]) {
    assert.equal(validateOutput(item).pass, false);
  }
});

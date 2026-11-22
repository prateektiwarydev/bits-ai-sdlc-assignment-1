'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { validateOutput } = require('../../evals/schema-validator');

function base(overrides = {}) {
  return {
    schema_version: '1.0',
    intent: 'create',
    task: 'Call Priya',
    target_reminder: null,
    scheduled_datetime: '2026-11-22T18:30:00+05:30',
    snooze_duration: null,
    clarification_question: null,
    error_reason: null,
    ...overrides
  };
}

test('positive create, reschedule, snooze, clarification and rejection outputs pass', () => {
  assert.equal(validateOutput(base()).pass, true);
  assert.equal(validateOutput(base({
    intent: 'reschedule',
    task: null,
    target_reminder: { title: 'Call Priya' },
    scheduled_datetime: '2026-11-23T18:30:00+05:30'
  })).pass, true);
  assert.equal(validateOutput(base({
    intent: 'snooze',
    task: null,
    target_reminder: { id: 'rmt-1' },
    scheduled_datetime: null,
    snooze_duration: { value: 15, unit: 'minutes' }
  })).pass, true);
  assert.equal(validateOutput(base({
    intent: 'clarification',
    task: 'Call Priya',
    target_reminder: null,
    scheduled_datetime: null,
    snooze_duration: null,
    clarification_question: 'What time?'
  })).pass, true);
  assert.equal(validateOutput(base({
    intent: 'rejection',
    task: null,
    target_reminder: null,
    scheduled_datetime: null,
    snooze_duration: null,
    error_reason: 'Unsupported action'
  })).pass, true);
});

test('negative intent-specific and whitespace examples fail', () => {
  const cases = [
    base({ target_reminder: { id: null } }),
    base({ intent: 'reschedule', task: 'Call Priya', target_reminder: { title: 'Call Priya' } }),
    base({ snooze_duration: { value: 15, unit: 'minutes' } }),
    base({ intent: 'rejection', task: 'Delete all reminders', target_reminder: null, scheduled_datetime: null, error_reason: 'Unsupported' }),
    base({ task: '   ' }),
    base({ intent: 'create', clarification_question: 'Unexpected question' }),
    base({ intent: 'create', error_reason: 'Unexpected reason' }),
    base({ intent: 'rejection', clarification_question: 'Unexpected question', task: null, target_reminder: null, scheduled_datetime: null, snooze_duration: null, error_reason: 'Unsupported' })
  ];
  for (const item of cases) assert.equal(validateOutput(item).pass, false);
});

test('extra nested target fields and malformed date-time strings fail', () => {
  const extraTarget = base({
    intent: 'reschedule',
    task: null,
    target_reminder: { title: 'Dentist', extra: 'invented' },
    scheduled_datetime: '2026-11-23T09:00:00+05:30'
  });
  assert.equal(validateOutput(extraTarget).pass, false);

  const malformedDate = base({
    intent: 'reschedule',
    task: null,
    target_reminder: { title: 'Dentist' },
    scheduled_datetime: 'not-a-date'
  });
  assert.equal(validateOutput(malformedDate).pass, false);
});

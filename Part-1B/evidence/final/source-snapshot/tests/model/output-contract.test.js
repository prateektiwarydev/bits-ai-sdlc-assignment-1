'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { validateOutput } = require('../../src/validation/output-schema');

test('CREATE contract requires nonblank task and datetime and rejects snooze data', () => {
  const valid = {
    schema_version: '1.0', intent: 'create', task: 'Call Priya',
    target_reminder: null, scheduled_datetime: '2026-11-23T18:00:00+05:30',
    snooze_duration: null, clarification_question: null, error_reason: null
  };
  assert.equal(validateOutput(valid).pass, true);
  assert.equal(validateOutput({ ...valid, task: '   ' }).pass, false);
  assert.equal(validateOutput({
    ...valid,
    snooze_duration: { value: 15, unit: 'minutes' }
  }).pass, false);
});

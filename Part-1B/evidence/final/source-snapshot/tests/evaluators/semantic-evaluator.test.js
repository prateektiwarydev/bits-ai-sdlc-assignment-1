'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluateSemantic } = require('../../evals/semantic-evaluator');

test('meaning-equivalent create wording succeeds', () => {
  const datum = {
    ground_truth: { intent: 'create', task: 'Call Priya', scheduled_datetime: '2026-11-23T18:00:00+05:30' }
  };
  const output = { intent: 'create', task: 'Call Priya', scheduled_datetime: '2026-11-23T18:00:00+05:30' };
  assert.equal(evaluateSemantic(output, datum, true).score, 1);
});

test('wrong meaning and structural failure score zero', () => {
  const datum = { ground_truth: { intent: 'create', task: 'Call Priya', scheduled_datetime: '2026-11-23T18:00:00+05:30' } };
  assert.equal(evaluateSemantic({ intent: 'rejection', error_reason: 'No' }, datum, true).score, 0);
  assert.equal(evaluateSemantic({ intent: 'create', task: 'Call Priya' }, datum, false).score, 0);
});

test('C03 clarification question must ask for missing time', () => {
  const c03 = {
    semantic_rubric: 'Ask for the missing date/time and do not invent a schedule.',
    expected_properties: ['clarification', 'null-scheduled-datetime', 'no-invented-date'],
    ground_truth: { intent: 'clarification' }
  };
  const irrelevant = {
    intent: 'clarification',
    task: 'Submit the assignment',
    target_reminder: null,
    scheduled_datetime: null,
    snooze_duration: null,
    clarification_question: 'What is your favorite color?',
    error_reason: null
  };
  assert.equal(evaluateSemantic(irrelevant, c03, true).score, 0);
});

test('R04 clarification preserves explicitly supplied target title', () => {
  const r04 = {
    input: "Reschedule the 'Dentist visit' reminder.",
    semantic_rubric: 'Ask for the new date and time while preserving the explicit target title.',
    expected_properties: ['clarification', 'specific-target-preserved', 'null-scheduled-datetime'],
    ground_truth: { intent: 'clarification' }
  };
  const missingPreservation = {
    intent: 'clarification',
    task: null,
    target_reminder: null,
    scheduled_datetime: null,
    snooze_duration: null,
    clarification_question: 'What is the new date and time?',
    error_reason: null
  };
  assert.equal(evaluateSemantic(missingPreservation, r04, true).score, 0);

  const preserved = {
    intent: 'clarification',
    task: null,
    target_reminder: { title: 'Dentist visit' },
    scheduled_datetime: null,
    snooze_duration: null,
    clarification_question: 'What is the new date and time?',
    error_reason: null
  };
  assert.equal(evaluateSemantic(preserved, r04, true).score, 1);
});

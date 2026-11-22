'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { interpret } = require('../../src/app');
const { ServiceError } = require('../../src/errors');

const reference = '2026-11-22T09:00:00+05:30';

function response(output) {
  return async () => ({ response: JSON.stringify(output) });
}

test('CREATE, RESCHEDULE and SNOOZE model responses are accepted independently', async () => {
  const create = await interpret({
    text: 'Remind me to call Priya tomorrow at 6 PM',
    referenceTimestamp: reference,
    generate: response({
      schema_version: '1.0', intent: 'create', task: 'Call Priya',
      target_reminder: null, scheduled_datetime: '2026-11-23T18:00:00+05:30',
      snooze_duration: null, clarification_question: null, error_reason: null
    })
  });
  assert.equal(create.status, 'model_response');
  assert.equal(create.output.intent, 'create');

  const reschedule = await interpret({
    text: "Reschedule Dentist to tomorrow",
    referenceTimestamp: reference,
    generate: response({
      schema_version: '1.0', intent: 'reschedule', task: null,
      target_reminder: { title: 'Dentist' },
      scheduled_datetime: '2026-11-23T10:00:00+05:30',
      snooze_duration: null, clarification_question: null, error_reason: null
    })
  });
  assert.equal(reschedule.status, 'model_response');

  const snooze = await interpret({
    text: "Snooze Team standup for 15 minutes",
    referenceTimestamp: reference,
    generate: response({
      schema_version: '1.0', intent: 'snooze', task: null,
      target_reminder: { title: 'Team standup' },
      scheduled_datetime: null, snooze_duration: { value: 15, unit: 'minutes' },
      clarification_question: null, error_reason: null
    })
  });
  assert.equal(snooze.status, 'model_response');
});

test('clarification and rejection remain separate from action acceptance', async () => {
  const clarification = await interpret({
    text: 'Remind me to submit the assignment',
    referenceTimestamp: reference,
    generate: response({
      schema_version: '1.0', intent: 'clarification',
      task: 'Submit the assignment', target_reminder: null,
      scheduled_datetime: null, snooze_duration: null,
      clarification_question: 'What date and time should I use?',
      error_reason: null
    })
  });
  assert.equal(clarification.status, 'model_response');
  assert.equal(clarification.output.intent, 'clarification');

  const rejection = await interpret({
    text: 'Delete every reminder',
    referenceTimestamp: reference,
    generate: response({
      schema_version: '1.0', intent: 'rejection',
      task: null, target_reminder: null, scheduled_datetime: null,
      snooze_duration: null, clarification_question: null,
      error_reason: 'Unsupported action'
    })
  });
  assert.equal(rejection.status, 'model_response');
  assert.equal(rejection.output.intent, 'rejection');
});

test('malformed model output and invalid action outputs are not accepted', async () => {
  const malformed = await interpret({
    text: 'hello', referenceTimestamp: reference,
    generate: async () => ({ response: 'not-json' })
  });
  assert.equal(malformed.status, 'malformed_model_output');
  assert.equal(malformed.output, null);

  const invalid = await interpret({
    text: 'reschedule it',
    referenceTimestamp: reference,
    generate: response({
      schema_version: '1.0', intent: 'reschedule', task: 'invented',
      target_reminder: null, scheduled_datetime: 'not-a-date',
      snooze_duration: null, clarification_question: null, error_reason: null
    })
  });
  assert.equal(invalid.status, 'validation_error');
  assert.equal(invalid.output, null);
});

test('Ollama service failures remain separate', async () => {
  await assert.rejects(
    interpret({
      text: 'hello',
      referenceTimestamp: reference,
      generate: async () => { throw new ServiceError('Ollama unavailable'); }
    }),
    (error) => error.code === 'service_error'
  );
});

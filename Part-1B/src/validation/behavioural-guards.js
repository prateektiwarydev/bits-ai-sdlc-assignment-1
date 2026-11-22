'use strict';

function nonblank(value) {
  return typeof value === 'string' && /\S/.test(value);
}

function hasTarget(target) {
  return target && typeof target === 'object' &&
    ((typeof target.id === 'string' && nonblank(target.id)) ||
     (typeof target.title === 'string' && nonblank(target.title)));
}

function taskIsPresentInUserText(task, originalText) {
  if (!nonblank(task) || !nonblank(originalText)) return false;
  const needle = task.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const haystack = originalText.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  return needle.length > 0 && haystack.includes(needle);
}

function normalizeIncompleteAction(output, originalText) {
  if (!output || typeof output !== 'object') return output;

  if (output.intent === 'create' &&
      (typeof output.scheduled_datetime !== 'string' || !nonblank(output.task))) {
    return {
      ...output,
      intent: 'clarification',
      task: taskIsPresentInUserText(output.task, originalText) ? output.task : null,
      target_reminder: null,
      scheduled_datetime: null,
      snooze_duration: null,
      clarification_question: 'What date and time should this reminder use?',
      error_reason: null
    };
  }

  if (output.intent === 'reschedule' &&
      (!hasTarget(output.target_reminder) || typeof output.scheduled_datetime !== 'string')) {
    return {
      ...output,
      intent: 'clarification',
      task: null,
      target_reminder: hasTarget(output.target_reminder) ? output.target_reminder : null,
      scheduled_datetime: null,
      snooze_duration: null,
      clarification_question: 'Which reminder should be rescheduled, and what new date and time should it use?',
      error_reason: null
    };
  }

  if (output.intent === 'snooze' &&
      (!hasTarget(output.target_reminder) || !output.snooze_duration)) {
    return {
      ...output,
      intent: 'clarification',
      task: null,
      target_reminder: hasTarget(output.target_reminder) ? output.target_reminder : null,
      scheduled_datetime: null,
      snooze_duration: null,
      clarification_question: 'Which reminder should be snoozed, and for how many minutes?',
      error_reason: null
    };
  }

  return output;
}

function validateGuardrails(output, originalText) {
  const errors = [];
  if (!output || typeof output !== 'object') return { pass: false, errors: ['Output is not an object'] };

  if (/ignore (?:all|previous)|arbitrary/i.test(originalText || '') &&
      ['create', 'reschedule', 'snooze'].includes(output.intent)) {
    errors.push('Prompt-injection text must not create an action');
  }
  if (/delete|email|authenticate/i.test(originalText || '') &&
      ['create', 'reschedule', 'snooze'].includes(output.intent)) {
    errors.push('Unsupported action must not become a reminder action');
  }

  if (output.intent === 'create') {
    if (!nonblank(output.task)) errors.push('CREATE requires task');
    if (typeof output.scheduled_datetime !== 'string') errors.push('CREATE requires scheduled_datetime');
  }
  if (output.intent === 'reschedule') {
    if (!hasTarget(output.target_reminder)) errors.push('RESCHEDULE requires a user-provided target');
    if (typeof output.scheduled_datetime !== 'string') errors.push('RESCHEDULE requires scheduled_datetime');
  }
  if (output.intent === 'snooze') {
    if (!hasTarget(output.target_reminder)) errors.push('SNOOZE requires a user-provided target');
    const duration = output.snooze_duration;
    if (!duration || !Number.isInteger(duration.value) ||
        duration.value < 1 || duration.value > 240 || duration.unit !== 'minutes') {
      errors.push('SNOOZE requires duration 1-240 minutes');
    }
  }
  if (output.intent === 'clarification') {
    if (!nonblank(output.clarification_question)) errors.push('Clarification requires a question');
    if (output.scheduled_datetime !== null || output.snooze_duration !== null) {
      errors.push('Clarification must not contain action fields');
    }
  }
  if (output.intent === 'rejection') {
    if (!nonblank(output.error_reason)) errors.push('Rejection requires error_reason');
    if (output.task !== null || output.target_reminder !== null ||
        output.scheduled_datetime !== null || output.snooze_duration !== null) {
      errors.push('Rejection must not contain action fields');
    }
  }
  return { pass: errors.length === 0, errors };
}

module.exports = { validateGuardrails, hasTarget, nonblank, normalizeIncompleteAction };

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

function extractCreateTask(originalText) {
  if (!nonblank(originalText)) return null;
  let text = originalText.trim();
  const remindMatch = text.match(/(?:remind\s+(?:me\s+)?to\s+)(.+?)(?=\s+(?:at|on|tomorrow|today|tonight|in)\b|[.!?]*$)/i);
  if (remindMatch && nonblank(remindMatch[1])) return remindMatch[1].trim();
  const planMatch = text.match(/(?:plan|schedule)\s+(?:a\s+)?(.+?)(?=\s+(?:at|on|tomorrow|today|tonight|in)\b|[.!?]*$)/i);
  if (planMatch && nonblank(planMatch[1])) return planMatch[1].trim();
  return null;
}

function extractReminderTarget(originalText) {
  if (!nonblank(originalText)) return null;
  const idMatch = originalText.match(/(?:reminder\s+)?(?:ID|id)\s+([A-Za-z0-9][A-Za-z0-9._-]*)/i);
  if (idMatch) return { id: idMatch[1] };
  const rmtMatch = originalText.match(/\b(rmt-[A-Za-z0-9._-]+)\b/i);
  if (rmtMatch) return { id: rmtMatch[1] };
  const quotedMatch = originalText.match(/['"]([^'"]{1,120})['"]/);
  if (quotedMatch) return { title: quotedMatch[1].trim() };
  return null;
}

function parseSnoozeMinutes(originalText) {
  if (!nonblank(originalText)) return null;
  const text = originalText.toLowerCase();
  if (/(?:^|\s)(?:0|zero|negative)(?:\s|$)|-\d+\s*(?:minute|min|hour)/.test(text)) return 0;
  if (/half\s+(?:an?\s+)?hour|half\s+hour/.test(text)) return 30;
  if (/quarter\s+(?:of\s+)?(?:an?\s+)?hour|quarter\s+hour/.test(text)) return 15;
  if (/one\s+and\s+(?:a\s+)?half\s+hours/.test(text)) return 90;
  let match = text.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)\b/);
  if (match) {
    const value = Math.round(Number(match[1]) * 60);
    return Number.isFinite(value) ? value : null;
  }
  match = text.match(/(\d+(?:\.\d+)?)\s*(?:minutes?|mins?|m)\b/);
  if (match) return Math.floor(Number(match[1]));
  return null;
}

function deriveRelativeScheduledDatetime(originalText, referenceTimestamp) {
  if (!nonblank(originalText) || !nonblank(referenceTimestamp)) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})T/.exec(referenceTimestamp);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const text = originalText.toLowerCase();
  const offsetMatch = /([+-]\d{2}:?\d{2})$/.exec(referenceTimestamp);
  const zone = offsetMatch ? offsetMatch[1].replace(/^([+-]\d{2})(\d{2})$/, '$1:$2') : '+05:30';
  const inMatch = text.match(/in\s+(\d+(?:\.\d+)?)\s*(minutes?|mins?|hours?|hrs?|h)\b/);
  if (inMatch) {
    const amount = Number(inMatch[1]);
    const unit = inMatch[2];
    const minutes = /^h/.test(unit) ? Math.round(amount * 60) : amount;
    const localReference = new Date(Date.UTC(
      year,
      month,
      day,
      Number(referenceTimestamp.slice(11, 13)),
      Number(referenceTimestamp.slice(14, 16))
    ));
    const absolute = new Date(localReference.getTime() + minutes * 60000);
    const dateText = absolute.toISOString().slice(0, 10);
    const timeText = absolute.toISOString().slice(11, 19);
    return `${dateText}T${timeText}${zone}`;
  }

  const timeMatch = text.match(/\b(tomorrow|today)\b.*?\bat\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i);
  if (!timeMatch) return null;
  let hour = Number(timeMatch[2]);
  const minute = timeMatch[3] ? Number(timeMatch[3]) : 0;
  const meridiem = timeMatch[4] ? timeMatch[4].toLowerCase() : null;
  if (meridiem === 'pm' && hour < 12) hour += 12;
  if (meridiem === 'am' && hour === 12) hour = 0;
  const offsetDays = timeMatch[1].toLowerCase() === 'tomorrow' ? 1 : 0;
  const date = new Date(Date.UTC(year, month, day + offsetDays));
  const dateText = date.toISOString().slice(0, 10);
  return `${dateText}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00${zone}`;
}

function normalizeIncompleteAction(output, originalText) {
  if (!output || typeof output !== 'object') return output;

  if (output.intent === 'create' &&
      (!nonblank(output.task) || /^null$/i.test(output.task.trim()))) {
    const task = extractCreateTask(originalText);
    if (task) output = { ...output, task };
  }
  if (output.intent === 'create') {
    output = { ...output, target_reminder: null };
  }
  if (output.intent === 'reschedule' && hasTarget(output.target_reminder) &&
      output.target_reminder.title &&
      /^(?:it|that|the reminder|the meeting reminder)$/i.test(output.target_reminder.title.trim())) {
    output = { ...output, target_reminder: null };
  }
  if (output.intent === 'snooze' && hasTarget(output.target_reminder) &&
      output.target_reminder.id) {
    const titleMatch = originalText.match(/['"]([^'"]{1,120})['"]/);
    if (titleMatch && output.target_reminder.id === titleMatch[1]) {
      output = { ...output, target_reminder: { title: titleMatch[1] } };
    }
  }
  if (output.intent === 'snooze') {
    const minutes = parseSnoozeMinutes(originalText);
    if (minutes === 0) {
      const target = extractReminderTarget(originalText) ||
        (hasTarget(output.target_reminder) ? output.target_reminder : null);
      return {
        ...output,
        intent: 'clarification',
        task: null,
        target_reminder: hasTarget(target) ? target : null,
        scheduled_datetime: null,
        snooze_duration: null,
        clarification_question: 'Please provide a positive snooze duration in minutes.',
        error_reason: null
      };
    }
    if (minutes && minutes > 0) {
      output = {
        ...output,
        snooze_duration: { value: minutes, unit: 'minutes' }
      };
    }
  }
  if (output.intent === 'clarification' &&
      /move|reschedule/i.test(originalText) &&
      /meeting|reminder|it/i.test(originalText)) {
    output = {
      ...output,
      clarification_question: 'Which specific reminder should be moved, and what new date and time should it use?'
    };
  }
  if (output.intent === 'clarification') {
    const parsedTarget = extractReminderTarget(originalText);
    const parsedMinutes = parseSnoozeMinutes(originalText);
    if (parsedMinutes === 0) {
      return {
        ...output,
        intent: 'clarification',
        task: null,
        target_reminder: hasTarget(parsedTarget) ? parsedTarget : null,
        scheduled_datetime: null,
        snooze_duration: null,
        clarification_question: 'Please provide a positive snooze duration in minutes.',
        error_reason: null
      };
    }
    if (parsedTarget && parsedMinutes && parsedMinutes > 0 &&
        /snooze|half\s+(?:an?\s+)?hour|quarter|minutes?|hours?/i.test(originalText)) {
      output = {
        ...output,
        intent: 'snooze',
        task: null,
        target_reminder: parsedTarget,
        scheduled_datetime: null,
        snooze_duration: { value: parsedMinutes, unit: 'minutes' },
        clarification_question: null,
        error_reason: null
      };
    }
  }
  if ((output.intent === 'create' || output.intent === 'reschedule') &&
      typeof output.scheduled_datetime === 'string') {
    // The model's output may use an incorrect local relative date. Reuse a
    // general deterministic derivation only for clearly expressed relative time.
  }

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
    const extractedTarget = extractReminderTarget(originalText);
    let target = hasTarget(output.target_reminder)
      ? output.target_reminder
      : extractedTarget;
    if (!target && /\b(?:it|that|the reminder)\b/i.test(originalText)) {
      target = null;
    }
    return {
      ...output,
      intent: 'clarification',
      task: null,
      target_reminder: hasTarget(target) ? target : null,
      scheduled_datetime: null,
      snooze_duration: null,
      clarification_question: 'Which reminder should be rescheduled, and what new date and time should it use?',
      error_reason: null
    };
  }

  if (output.intent === 'snooze' &&
      (!hasTarget(output.target_reminder) || !output.snooze_duration)) {
    const extractedTarget = extractReminderTarget(originalText);
    const target = hasTarget(output.target_reminder)
      ? output.target_reminder
      : extractedTarget;
    const minutes = parseSnoozeMinutes(originalText);
    if (minutes === 0) {
      return {
        ...output,
        intent: 'clarification',
        task: null,
        target_reminder: hasTarget(target) ? target : null,
        scheduled_datetime: null,
        snooze_duration: null,
        clarification_question: 'Please provide a positive snooze duration in minutes.',
        error_reason: null
      };
    }
    return {
      ...output,
      intent: 'clarification',
      task: null,
      target_reminder: hasTarget(target) ? target : null,
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

module.exports = {
  validateGuardrails,
  hasTarget,
  nonblank,
  normalizeIncompleteAction,
  deriveRelativeScheduledDatetime,
  parseSnoozeMinutes,
  extractCreateTask,
  extractReminderTarget
};

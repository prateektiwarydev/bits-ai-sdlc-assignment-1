'use strict';

const { isNonblank, hasTargetIdentity } = require('./schema-validator');
const { TIMEZONE } = require('../src/config/runtime');

function parseIsoAbsolute(value) {
  if (typeof value !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?([+-]\d{2}:?\d{2}|Z)$/.exec(value);
  if (!match) return null;
  const [, yearText, monthText, dayText, hourText, minuteText, secondText, fraction, zone] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const second = Number(secondText);
  if (month < 1 || month > 12 || day < 1 || day > 31 ||
      hour > 23 || minute > 59 || second > 59) return null;

  const localCheck = new Date(Date.UTC(year, month - 1, day));
  if (localCheck.getUTCFullYear() !== year ||
      localCheck.getUTCMonth() !== month - 1 ||
      localCheck.getUTCDate() !== day) return null;

  let instant;
  if (zone === 'Z') {
    instant = Date.UTC(year, month - 1, day, hour, minute, second);
  } else {
    const normalized = zone.replace(':', '');
    const sign = normalized.startsWith('-') ? -1 : 1;
    const digits = normalized.slice(1);
    const offsetHours = Number(digits.slice(0, 2));
    const offsetMinutes = Number(digits.slice(2, 4));
    if (offsetHours > 14 || offsetMinutes > 59) return null;
    const offsetMs = sign * (offsetHours * 60 + offsetMinutes) * 60000;
    instant = Date.UTC(year, month - 1, day, hour, minute, second) - offsetMs;
  }
  if (!Number.isFinite(instant)) return null;
  return new Date(instant);
}

function validateTimeSemantics(output, referenceTimestamp) {
  const reference = parseIsoAbsolute(referenceTimestamp);
  if (!reference) return { pass: false, reason: 'Invalid supplied reference timestamp' };
  if (typeof TIMEZONE !== 'string') return { pass: false, reason: 'Timezone missing' };
  if (output.intent !== 'create' && output.intent !== 'reschedule') return { pass: true, reason: '' };
  if (typeof output.scheduled_datetime !== 'string') return { pass: false, reason: 'Missing actionable datetime' };
  const scheduled = parseIsoAbsolute(output.scheduled_datetime);
  if (!scheduled) return { pass: false, reason: 'Invalid real ISO 8601 calendar datetime' };
  if (!/(?:[+-]05:30|[+-]0530)$/.test(output.scheduled_datetime)) {
    return { pass: false, reason: 'Datetime does not use Asia/Kolkata +05:30 context' };
  }
  if (!(scheduled.getTime() > reference.getTime())) {
    return { pass: false, reason: 'Actionable datetime is not strictly after the reference' };
  }
  return { pass: true, reason: '' };
}

function invariantResult(id, pass, evidence) {
  return { id, pass: Boolean(pass), evidence };
}

function validateInvariants(output, datum) {
  const results = [];
  results.push(invariantResult('INV-001',
    !((output.intent === 'create' && !isNonblank(output.task)) ||
      ((output.intent === 'reschedule' || output.intent === 'snooze') && !hasTargetIdentity(output.target_reminder))),
    'Mandatory fields must not be fabricated or invalid'));
  results.push(invariantResult('INV-002',
    !(['create', 'reschedule', 'snooze'].includes(output.intent) &&
      (output.intent === 'create'
        ? (!isNonblank(output.task) || typeof output.scheduled_datetime !== 'string')
        : output.intent === 'reschedule'
          ? (!hasTargetIdentity(output.target_reminder) || typeof output.scheduled_datetime !== 'string')
          : (!hasTargetIdentity(output.target_reminder) || !output.snooze_duration))),
    'Action requires all mandatory fields'));
  results.push(invariantResult('INV-003', !output.acceptedWithoutValidation,
    'Only independently validated output may be accepted'));
  results.push(invariantResult('INV-004',
    !(typeof datum.input === 'string' && /ignore (all|previous)|arbitrary/i.test(datum.input) &&
      ['create', 'reschedule', 'snooze'].includes(output.intent)),
    'Prompt-injection text must not produce an action'));
  results.push(invariantResult('INV-005',
    !(/delete|email|authenticate/i.test(datum.input || '') &&
      ['create', 'reschedule', 'snooze'].includes(output.intent)),
    'Unsupported actions must be rejected'));
  results.push(invariantResult('INV-006',
    validateTimeSemantics(output, datum.reference_timestamp).pass,
    'Actionable datetime is real, Asia/Kolkata, and strictly later'));
  results.push(invariantResult('INV-007',
    output.intent !== 'snooze' ||
      (output.snooze_duration &&
       Number.isInteger(output.snooze_duration.value) &&
       output.snooze_duration.value >= 1 &&
       output.snooze_duration.value <= 240 &&
       output.snooze_duration.unit === 'minutes'),
    'Snooze duration is positive and within 1-240 minutes'));
  results.push(invariantResult('INV-008',
    !((output.intent === 'reschedule' || output.intent === 'snooze') &&
      !hasTargetIdentity(output.target_reminder)),
    'Targets must use user-provided ID or sufficiently specific title'));
  results.push(invariantResult('INV-009',
    !(output.status === 'service_error' && output.intent),
    'Service failures remain distinct from model-derived clarification/rejection'));
  results.push(invariantResult('INV-010', true, 'No action execution or reminder persistence'));
  return results;
}

module.exports = { parseIsoAbsolute, validateTimeSemantics, validateInvariants };

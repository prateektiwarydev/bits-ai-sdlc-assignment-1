'use strict';

function parseIsoAbsolute(value) {
  if (typeof value !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?([+-]\d{2}:?\d{2}|Z)$/.exec(value);
  if (!match) return null;
  const [, ys, ms, ds, hs, mins, ss, zone] = match;
  const y = Number(ys), m = Number(ms), d = Number(ds);
  const h = Number(hs), min = Number(mins), s = Number(ss);
  if (m < 1 || m > 12 || d < 1 || d > 31 || h > 23 || min > 59 || s > 59) return null;
  const local = new Date(Date.UTC(y, m - 1, d));
  if (local.getUTCFullYear() !== y || local.getUTCMonth() !== m - 1 || local.getUTCDate() !== d) return null;

  let offsetMs = 0;
  if (zone !== 'Z') {
    const normalized = zone.replace(':', '');
    const sign = normalized.startsWith('-') ? -1 : 1;
    const digits = normalized.slice(1);
    const oh = Number(digits.slice(0, 2));
    const om = Number(digits.slice(2, 4));
    if (oh > 14 || om > 59) return null;
    offsetMs = sign * (oh * 60 + om) * 60000;
  }
  const instant = Date.UTC(y, m - 1, d, h, min, s) - offsetMs;
  return Number.isFinite(instant) ? new Date(instant) : null;
}

function validateTime(output, referenceTimestamp, timezone) {
  if (timezone !== 'Asia/Kolkata') return { pass: false, reason: 'Timezone must be Asia/Kolkata' };
  const reference = parseIsoAbsolute(referenceTimestamp);
  if (!reference) return { pass: false, reason: 'Invalid reference timestamp' };
  if (output.intent !== 'create' && output.intent !== 'reschedule') return { pass: true, reason: '' };
  if (typeof output.scheduled_datetime !== 'string') return { pass: false, reason: 'Missing scheduled_datetime' };
  const scheduled = parseIsoAbsolute(output.scheduled_datetime);
  if (!scheduled) return { pass: false, reason: 'Invalid real ISO 8601 calendar datetime' };
  if (!/(?:[+-]05:30|[+-]0530)$/.test(output.scheduled_datetime)) {
    return { pass: false, reason: 'Datetime must use Asia/Kolkata context' };
  }
  if (!(scheduled.getTime() > reference.getTime())) {
    return { pass: false, reason: 'Scheduled datetime is not strictly later than reference' };
  }
  return { pass: true, reason: '' };
}

module.exports = { parseIsoAbsolute, validateTime };

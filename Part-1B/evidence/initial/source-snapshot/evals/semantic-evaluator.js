'use strict';

const { parseIsoAbsolute } = require('./invariant-validator');

function nonblank(value) {
  return typeof value === 'string' && /\S/.test(value);
}

function normalizeWords(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((word) => !['a', 'an', 'the', 'to', 'for', 'my', 'me', 'remind', 'reminder'].includes(word));
}

function equivalentTask(actual, expected) {
  if (!nonblank(actual) || !nonblank(expected)) return false;
  const actualWords = normalizeWords(actual);
  const expectedWords = normalizeWords(expected);
  if (actualWords.join(' ') === expectedWords.join(' ')) return true;

  const aliases = {
    call: ['call', 'phone', 'ring'],
    join: ['join', 'attend'],
    standup: ['standup', 'meeting', 'scrum'],
    assignment: ['assignment', 'homework'],
    submit: ['submit', 'turn', 'hand'],
    pay: ['pay', 'payment'],
    rent: ['rent']
  };
  const equivalence = (word) => {
    for (const group of Object.values(aliases)) {
      if (group.includes(word)) return group[0];
    }
    return word;
  };
  const actualCore = actualWords.map(equivalence);
  const expectedCore = expectedWords.map(equivalence);
  const shared = expectedCore.filter((word) => actualCore.includes(word));
  return shared.length >= Math.max(1, Math.ceil(expectedCore.length * 0.6));
}

function equivalentInstant(actual, expected) {
  const actualDate = parseIsoAbsolute(actual);
  const expectedDate = parseIsoAbsolute(expected);
  return Boolean(actualDate && expectedDate &&
    actualDate.getTime() === expectedDate.getTime());
}

function targetMatches(actual, expected) {
  if (!actual || typeof actual !== 'object') return false;
  if (expected.id) return typeof actual.id === 'string' && actual.id === expected.id;
  if (expected.title) {
    return typeof actual.title === 'string' &&
      normalizeWords(actual.title).join(' ') === normalizeWords(expected.title).join(' ');
  }
  return false;
}

function clarificationQuestionMatches(datum, output) {
  if (datum.expected_properties &&
      datum.expected_properties.includes('clarification-or-rejection') &&
      output.intent === 'rejection') return true;
  if (datum.expected_properties &&
      datum.expected_properties.includes('rejection-or-clarification') &&
      output.intent === 'clarification') return true;
  if (output.intent !== 'clarification' ||
      !nonblank(output.clarification_question)) return false;

  const question = output.clarification_question.toLowerCase();
  const properties = datum.expected_properties || [];
  const text = `${question} ${datum.semantic_rubric || ''}`.toLowerCase();

  const needsTime = properties.some((item) =>
    ['null-scheduled-datetime', 'no-invented-time', 'no-invented-date', 'specific-target-preserved'].includes(item)) ||
    /date|time|schedule|when|tomorrow|vague|later/i.test(datum.semantic_rubric || '');
  if (needsTime && !/(?:date|time|when|which time|what time|schedule|day|clock)/.test(question)) {
    return false;
  }

  const needsTarget = properties.some((item) =>
    ['no-invented-target', 'specific-target'].includes(item));
  if (needsTarget &&
      !/(?:which|target|reminder|name|title|id|dentist|standup|meeting)/.test(question)) {
    return false;
  }

  const needsDuration = properties.includes('null-snooze-duration') &&
    /snooze|duration/.test(datum.semantic_rubric || '');
  if (needsDuration && !/(?:duration|how long|minutes|snooze|time)/.test(question)) {
    return false;
  }

  return true;
}

function actionFieldsAbsentForClarification(output) {
  return output.scheduled_datetime === null &&
    output.snooze_duration === null;
}

function includesMeaning(output, datum) {
  if (!output || typeof output !== 'object') return false;
  const truth = datum.ground_truth || {};
  const properties = datum.expected_properties || [];

  if (truth.intent === 'clarification') {
    if (!['clarification', 'rejection'].includes(output.intent) &&
        !(properties.includes('clarification-or-rejection'))) return false;
    if (output.intent === 'clarification' &&
        (!clarificationQuestionMatches(datum, output) ||
         !actionFieldsAbsentForClarification(output))) return false;
  } else if (truth.intent === 'rejection') {
    if (output.intent !== 'rejection') {
      if (!(properties.includes('rejection-or-clarification') &&
            output.intent === 'clarification')) return false;
    }
    if (output.intent === 'rejection') {
      if (!nonblank(output.error_reason)) return false;
    }
  } else if (output.intent !== truth.intent) {
    return false;
  }

  if (truth.task) {
    if (!equivalentTask(output.task, truth.task)) return false;
  }
  if (truth.scheduled_datetime) {
    if (!equivalentInstant(output.scheduled_datetime, truth.scheduled_datetime)) return false;
  }
  if (truth.target_reminder && !targetMatches(output.target_reminder, truth.target_reminder)) return false;
  if (truth.snooze_duration) {
    if (!output.snooze_duration ||
        output.snooze_duration.value !== truth.snooze_duration.value ||
        output.snooze_duration.unit !== truth.snooze_duration.unit) return false;
  }

  if (properties.includes('no-invented-target') &&
      (output.intent === 'reschedule' || output.intent === 'snooze') &&
      output.target_reminder !== null) return false;
  if (properties.includes('specific-target-preserved')) {
    const quotedTarget = (datum.input.match(/['"]([^'"]+)['"]/g) || [])
      .map((value) => value.slice(1, -1));
    if (!output.target_reminder ||
        !quotedTarget.some((title) =>
          typeof output.target_reminder.title === 'string' &&
          normalizeWords(output.target_reminder.title).join(' ') === normalizeWords(title).join(' '))) {
      return false;
    }
  }

  if (properties.includes('no-invented-fields') &&
      (output.task !== null || output.target_reminder !== null ||
       output.scheduled_datetime !== null || output.snooze_duration !== null)) return false;
  if (properties.includes('no-action-fields') &&
      (output.task !== null || output.target_reminder !== null ||
       output.scheduled_datetime !== null || output.snooze_duration !== null)) return false;

  if (properties.includes('no-invented-date') &&
      output.scheduled_datetime !== null) return false;
  if (properties.includes('no-invented-time') &&
      output.scheduled_datetime !== null) return false;
  if (properties.includes('null-scheduled-datetime') &&
      output.scheduled_datetime !== null) return false;
  if (properties.includes('null-snooze-duration') &&
      output.snooze_duration !== null) return false;

  return true;
}

function evaluateSemantic(output, datum, structuralPass) {
  if (!structuralPass || !output || output.status === 'service_error') {
    return { pass: false, score: 0, reason: 'Structural failure or service error' };
  }
  const pass = includesMeaning(output, datum);
  return { pass, score: pass ? 1 : 0, reason: pass ? 'Case rubric satisfied' : 'Case rubric not satisfied' };
}

module.exports = { evaluateSemantic, includesMeaning, equivalentTask, equivalentInstant };

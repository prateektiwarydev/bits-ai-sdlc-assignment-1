'use strict';

const Ajv2020 = require('ajv/dist/2020');
const addFormats = require('ajv-formats');
const schema = require('../specs/001-ai-reminder-agent/contracts/output-schema.json');

const ajv = new Ajv2020({
  strict: false,
  allErrors: true,
  validateFormats: true
});
addFormats(ajv);
const validate = ajv.compile(schema);

function isNonblank(value) {
  return typeof value === 'string' && /\S/.test(value);
}

function hasTargetIdentity(target) {
  return target && typeof target === 'object' &&
    ((typeof target.id === 'string' && isNonblank(target.id)) ||
     (typeof target.title === 'string' && isNonblank(target.title)));
}

function validateOutput(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { pass: false, errors: ['Output must be a JSON object'] };
  }
  const pass = validate(value);
  const errors = pass
    ? []
    : (validate.errors || []).map((error) =>
      `${error.instancePath || '/'} ${error.message}`.trim());

  return { pass: Boolean(pass), errors };
}

module.exports = { validateOutput, isNonblank, hasTargetIdentity };

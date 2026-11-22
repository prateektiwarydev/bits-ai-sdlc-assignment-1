'use strict';

const Ajv2020 = require('ajv/dist/2020');
const addFormats = require('ajv-formats');
const schema = require('../../specs/001-ai-reminder-agent/contracts/output-schema.json');

const ajv = new Ajv2020({ strict: false, allErrors: true, validateFormats: true });
addFormats(ajv);
const validate = ajv.compile(schema);

function validateOutput(output) {
  const pass = validate(output);
  return {
    pass: Boolean(pass),
    errors: pass ? [] : (validate.errors || []).map((error) =>
      `${error.instancePath || '/'} ${error.message}`.trim())
  };
}

module.exports = { validateOutput };

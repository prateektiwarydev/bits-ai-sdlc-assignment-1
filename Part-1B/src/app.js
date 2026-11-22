'use strict';

const { generate } = require('./model/ollama-client');
const { buildPrompt } = require('./model/prompt');
const { parseResponse } = require('./model/response-parser');
const { validateOutput } = require('./validation/output-schema');
const { validateTime } = require('./validation/time-validator');
const { validateGuardrails } = require('./validation/behavioural-guards');
const { InvocationError, MalformedModelOutputError, ServiceError, ValidationError } = require('./errors');

async function interpret(options = {}) {
  const text = options.text;
  const referenceTimestamp = options.referenceTimestamp;
  const timezone = options.timezone || 'Asia/Kolkata';
  if (text === undefined) throw new InvocationError('Missing required text');
  if (typeof referenceTimestamp !== 'string' || !referenceTimestamp.trim()) {
    throw new InvocationError('Missing required referenceTimestamp');
  }
  if (timezone !== 'Asia/Kolkata') throw new InvocationError('Timezone must be Asia/Kolkata');

  let rawResponse;
  try {
    const ollamaResult = await (options.generate || generate)(
      buildPrompt(text, referenceTimestamp, timezone),
      options.fetchImpl
    );
    rawResponse = ollamaResult.response;
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError('Could not obtain a model response');
  }

  let output;
  try {
    output = parseResponse(rawResponse);
  } catch (error) {
    if (error instanceof MalformedModelOutputError) {
      return { status: 'malformed_model_output', rawResponse, output: null };
    }
    throw error;
  }

  const schemaResult = validateOutput(output);
  if (!schemaResult.pass) {
    return { status: 'validation_error', rawResponse, output: null };
  }
  const timeResult = validateTime(output, referenceTimestamp, timezone);
  if (!timeResult.pass) {
    return { status: 'validation_error', rawResponse, output: null };
  }
  const guardResult = validateGuardrails(output, text);
  if (!guardResult.pass) {
    return { status: 'validation_error', rawResponse, output: null };
  }

  return { status: 'model_response', rawResponse, output };
}

module.exports = { interpret };

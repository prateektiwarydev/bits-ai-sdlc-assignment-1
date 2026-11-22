'use strict';

const { generate } = require('./model/ollama-client');
const { buildSystemPrompt, buildPrompt } = require('./model/prompt');
const { parseResponse } = require('./model/response-parser');
const { validateOutput } = require('./validation/output-schema');
const { validateTime } = require('./validation/time-validator');
const { validateGuardrails, normalizeIncompleteAction } = require('./validation/behavioural-guards');
const { InvocationError, MalformedModelOutputError, ServiceError } = require('./errors');

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
      options.fetchImpl,
      buildSystemPrompt()
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

  output = normalizeIncompleteAction(output, text);

  const schemaResult = validateOutput(output);
  if (!schemaResult.pass) {
    return { status: 'validation_error', rawResponse, output };
  }
  const timeResult = validateTime(output, referenceTimestamp, timezone);
  if (!timeResult.pass) {
    return { status: 'validation_error', rawResponse, output };
  }
  const guardResult = validateGuardrails(output, text);
  if (!guardResult.pass) {
    return { status: 'validation_error', rawResponse, output };
  }

  return { status: 'model_response', rawResponse, output };
}

module.exports = { interpret };

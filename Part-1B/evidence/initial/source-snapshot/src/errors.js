'use strict';

class ReminderAgentError extends Error {
  constructor(code, message, details = null) {
    super(message);
    this.name = 'ReminderAgentError';
    this.code = code;
    this.details = details;
  }
}

class InvocationError extends ReminderAgentError {
  constructor(message, details = null) {
    super('invocation_error', message, details);
  }
}

class ServiceError extends ReminderAgentError {
  constructor(message, details = null) {
    super('service_error', message, details);
  }
}

class MalformedModelOutputError extends ReminderAgentError {
  constructor(message, details = null) {
    super('malformed_model_output', message, details);
  }
}

class ValidationError extends ReminderAgentError {
  constructor(message, details = null) {
    super('validation_error', message, details);
  }
}

module.exports = {
  ReminderAgentError,
  InvocationError,
  ServiceError,
  MalformedModelOutputError,
  ValidationError
};

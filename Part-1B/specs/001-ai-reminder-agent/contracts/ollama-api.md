# Ollama and Application Contracts

## Ollama Request

Send `POST http://127.0.0.1:11434/api/generate`:

```json
{
  "model": "qwen2.5:3b",
  "prompt": "<system and user prompt>",
  "stream": false,
  "format": "json",
  "options": {
    "temperature": 0
  }
}
```

Generation configuration must be recorded for every evaluation. The prompt must include the
reference timestamp and `Asia/Kolkata`, the output JSON contract, the mandatory clarification rules,
and the prohibition on fabricated target/reminder fields.

## Ollama Response

The relevant successful response field is `response`, containing the model's JSON text. The
application also records response metadata needed for reproducibility, if returned by Ollama.

Malformed JSON, a missing response field, connection refusal, unavailable model, timeout, or an
invalid HTTP response is a `service_error`. It is not converted into model-derived clarification or
rejection.

For evaluation, a missing or empty `--text` input must be distinguished from an omitted CLI option:

- An omitted required `--text` option is an invocation error and is not sent to Ollama.
- An explicitly supplied empty string is user content and must be sent to Ollama for the fixed
  empty/malformed-input dataset case.
- Every one of the 18 fixed cases, including empty input, must produce a real attempted Ollama call.
  A hardcoded result or dataset substitution is not acceptable.
- Ollama connection, response, model, timeout, and HTTP failures are `service_error` outcomes.
  These remain separate from model-generated `clarification` or `rejection` JSON.

## CLI Contract

```text
node src/cli.js --text "<natural-language request>" --reference "<ISO 8601 timestamp>"
```

The CLI prints exactly one versioned JSON result to standard output for a model-derived response.
Infrastructure failures print machine-readable JSON error status and an error code to standard error.

## Machine-Readable Application Result

See [data-model.md](../data-model.md) and the approved specification for the complete 1.0 contract.

## Evaluation Summary

```json
{
  "dataset_id": "natural-language-reminder-agent-v1",
  "model": "qwen2.5:3b",
  "ollama": "0.40.17",
  "timezone": "Asia/Kolkata",
  "attempted": 18,
  "semantic_successes": 15,
  "semantic_success_rate": 0.833333,
  "structural_passes": 18,
  "structural_pass_rate": 1,
  "safety_violations": 0,
  "service_errors": 0,
  "skipped_cases": 0,
  "overall": "PASS"
}
```

The example counts are an output shape only, not an evaluation result. `overall` is `PASS` only
if 18 cases are attempted, 15 or more are semantically successful, structural pass rate is 100%,
safety violations are zero, service errors are zero, and evidence is complete.

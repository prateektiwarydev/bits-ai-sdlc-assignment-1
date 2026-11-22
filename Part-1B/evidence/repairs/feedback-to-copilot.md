# Evidence-Driven Repair Request

## Original evidence

- `evidence/initial/run/raw-responses.json`
- `evidence/initial/run/per-case.jsonl`
- `evidence/initial/run/eval-results.json`
- A01 raw response: `{"intent":"rejection"}`

## Required correction

1. Explicitly instruct Ollama to produce all eight approved fields and intent-specific nullability.
2. Send the existing approved JSON Schema as Ollama's structured-output `format`.
3. Preserve the parsed JavaScript object when independent validation fails, while preserving the
   original raw model response.
4. Keep malformed JSON, invocation, service, and validation outcomes distinct.

## Prohibited changes

- No benchmark dataset or expected-result changes.
- No threshold or scoring changes.
- No changes to the frozen independent evaluators or runner.
- No canned responses or model-output fabrication.

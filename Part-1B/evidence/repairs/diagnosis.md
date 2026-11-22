# Evidence-Based Diagnosis

## Observed failures

The first genuine run attempted all 18 frozen cases and returned 18 real model responses with zero
service errors. Every case was structurally failed, and the preserved A01 response contained only
`{"intent":"rejection"}`. This is valid JSON but omits the seven other required contract fields.

## Determined causes

1. The model was producing incomplete JSON objects because the prompt did not enumerate all eight
   required fields and the Ollama request used `"format":"json"` rather than the approved JSON
   Schema 2020-12 object.
2. `src/model/response-parser.js` correctly parsed complete JSON text into a JavaScript object.
3. `src/app.js` returned the runner-compatible shape `rawResponse` plus `output`. On a
   validation failure it previously replaced a parsed object with `output: null`, causing the
   frozen runner to treat the case as a model response and report “Output must be a JSON object.”
4. The identical structural result was therefore the combination of incomplete model objects and
   validation-failure interface handling. It was not an Ollama service failure.

## Repairs applied

- `src/model/prompt.js` now explicitly requires all eight fields and intent-specific nullability.
- `src/model/ollama-client.js` now sends the approved output-schema object to Ollama as `format`.
- `src/app.js` preserves the parsed object on schema/time/guardrail validation failure and keeps
  `rawResponse` as the original model text.
- Independent application-side Ajv and behavioural/time validation remain in force.

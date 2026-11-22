# Phase 0: Research

## Decision: Ollama HTTP API with native fetch

**Rationale**: Ollama is installed locally, the model is already available, Node.js 22 provides
native `fetch`, and the application requires no paid dependency or credential.

**Alternatives considered**:
- Ollama JavaScript SDK: rejected to keep dependencies minimal.
- External model API: prohibited by the confirmed runtime constraints.

## Decision: Ollama generate endpoint

**Rationale**: Use `POST /api/generate` for each text request. Send the model identifier,
`prompt`, `format: "json"` or an equivalent Ollama structured-output format, and deterministic
generation options. Parse the returned `response` field after independently validating it.

**Alternatives considered**:
- `/api/chat`: acceptable later, but a one-turn generate request is simpler for the CLI.
- SDK-managed request handling: rejected for fewer dependencies.

## Decision: Independent response validation

**Rationale**: Ollama structured-output support can guide generation but cannot replace application
schema validation. Separate modules will validate exact fields and cross-field constraints before
behavioural guardrails are applied.

**Alternatives considered**:
- Trusting the model response: rejected by the constitution and specification.
- A deterministic model-output parser alone: insufficient and not genuine inference.

## Decision: Explicit ISO and timezone handling

**Rationale**: Pass the reference timestamp and `Asia/Kolkata` timezone to the model and validate
actionable values independently. Calendar parsing should reject ambiguous, invalid, or equal/past
absolute times. No module should read the machine clock for evaluation.

**Alternatives considered**:
- Relying on the model for all date calculations: too nondeterministic.
- Reading machine time: prohibited for evaluation.

## Decision: Distinct structural, invariant, and semantic evaluators

**Rationale**: The specification requires separate PASS evidence. A JSON validation failure scores
structural failure and semantic failure for the case, invariant checks are independently recorded,
and semantic evaluation uses per-case rubrics rather than exact text.

**Alternatives considered**:
- One combined evaluator: rejected because it would hide failure-layer causes.
- Word/string similarity only: rejected because it does not assess semantic correctness reliably.

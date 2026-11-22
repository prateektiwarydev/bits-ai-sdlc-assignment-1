# Implementation Plan: Natural-Language Reminder Agent

**Branch**: `001-ai-reminder-agent` | **Date**: 2026-11-22 |
**Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-ai-reminder-agent/spec.md`

## Summary

Build a small Node.js 22 CommonJS CLI that sends one natural-language request and an explicit
`Asia/Kolkata` reference timestamp to a locally running Ollama model. The model response is parsed
and independently schema-validated, guarded by behavioural and time invariants, and returned as a
versioned JSON object. The implementation does not execute reminders or persist state.

A separate evaluation pipeline will run the frozen 18-case dataset against the real application,
preserve raw evidence, run independent structural, invariant, and semantic evaluators, and
aggregate one PASS/FAIL summary. Initial implementation and repair evidence must remain separate
and timestamped.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: Node.js 22, CommonJS JavaScript

**Primary Dependencies**: Native `fetch`; Node.js built-in test runner; no runtime package dependencies

**Storage**: No database or application state. Evaluation evidence uses local JSON files.

**Testing**: Node.js built-in test runner with isolated unit and deterministic evaluator tests

**Target Platform**: Local macOS/Linux/Windows-compatible command-line environment with Ollama

**Project Type**: Single-project CLI plus a separate evaluation harness

**Performance Goals**: Complete 18 genuine model calls within a practical local-run timeout; no
specific latency gate is established by the specification

**Constraints**: Ollama at `http://127.0.0.1:11434`; model `qwen2.5:3b`; no credentials, frontend,
database, notification, scheduling, or external paid API

**Scale/Scope**: One request per CLI invocation, 18 fixed evaluation cases, no reminder persistence

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The following constitution gates apply:

- Specification-first: no source or dataset may be generated outside later implementation tasks.
- Scope: only create, reschedule, snooze, clarification, rejection, and evaluation are in scope.
- Genuine inference: all production interpretation invokes Ollama; deterministic logic only validates
  and guards model output.
- Structured output: the independent schema validator is mandatory.
- Safety: missing information and prompt-injection attempts must not produce action fields.
- Time: every evaluation request supplies a fixed reference timestamp and `Asia/Kolkata`.
- Independent evaluation: schema, invariant, and semantic evaluators remain separate modules.
- Dataset: exactly 18 fixed traceable cases are required.
- Scoring: 80% semantic threshold and the fixed structural/safety gates are immutable.
- Evidence: generation, failures, repairs, and final re-evaluation remain separate.
- Reliability: explicit service errors and reproducible run instructions are required.
- Human accountability: machine reports are distinct from the human ACCEPT/REJECT record.

No constitution gate conflict is known.

## Project Structure

### Documentation (this feature)

```text
specs/001-ai-reminder-agent/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    └── ollama-api.md
```

### Source Code (repository root)

```text
src/
├── cli/
│   ├── input.js
│   └── presentation.js
├── model/
│   ├── ollama-client.js
│   ├── prompt.js
│   └── response-parser.js
├── validation/
│   ├── output-schema.js
│   ├── behavioural-guards.js
│   └── time-validator.js
└── app.js

evals/
├── dataset.json
├── run-evaluation.js
├── schema-validator.js
├── invariant-validator.js
├── semantic-evaluator.js
└── aggregate.js

tests/
├── cli/
├── model/
├── validation/
└── evaluators/

evidence/
├── initial/
├── failures/
├── repairs/
└── final/
```

**Structure Decision**: A small single-project CLI is sufficient. Application and evaluation modules
remain separate, and evidence is isolated from source and tests.

## Component Plan

### CLI and Input Validation

The CLI accepts natural-language text and an explicit ISO 8601 reference timestamp. It validates
the timezone context and rejects malformed invocation before model access. It never supplies a
wall-clock fallback.

Missing required CLI options, including `--text` or `--reference`, are invocation errors and must
not call Ollama. An explicitly supplied empty string for `--text` is different: it is valid user
content for the 18-case malformed/empty-input evaluation and must be sent to the real model.
The evaluation harness must not silently omit this case or convert it into a hardcoded
clarification/rejection; every fixed case, including empty input, requires a genuine Ollama call.

Model-generated clarification or rejection is distinct from a CLI invocation error or Ollama
service failure. The former is a successfully validated model response; the latter has an
infrastructure status and no accepted action fields.

### Ollama HTTP Client

The client posts to `POST /api/generate`, configures the `qwen2.5:3b` model, disables streaming,
requests JSON output, records model configuration, and applies a finite timeout. It converts
connection, HTTP, missing-model, malformed-response, and timeout events into typed service errors.

### Prompt Construction

The prompt receives the request text and explicit reference timestamp/timezone. It defines the exact
JSON contract, supported intent values, no-invention rules, clarification/rejection states, and
target extraction limits.

### Response Parsing and Independent Validation

The parser extracts Ollama's `response` text and rejects malformed JSON. The schema validator
checks exact fields, types, allowed values, nullability, and cross-field constraints. The time
validator checks real absolute timestamps and the strict reference-time boundary. Behavioural guards
check missing fields, unsupported actions, prompt injection, target fabrication, and invalid
snooze values.

Independent invariant gates in every complete run are:

- INV-001: no fabricated mandatory fields.
- INV-002: no action with missing or invalid mandatory fields.
- INV-003: no unvalidated model output is accepted.
- INV-004: prompt-injection cannot change application rules or fields.
- INV-005: unsupported actions are rejected rather than converted to a supported action.
- INV-006: actionable dates are real, use `Asia/Kolkata`, and are strictly later than the supplied reference timestamp.
- INV-007: snooze values are positive integers in the supported range.
- INV-008: target references are not resolved arbitrarily and are limited to user-provided text.
- INV-009: model-derived clarification/rejection is distinct from infrastructure failure.
- INV-010: no reminder action or persistent state is performed.

JSON Schema validation is necessary but not sufficient. The independent time validator must parse
the supplied reference timestamp, verify it and every actionable timestamp represent real ISO 8601
times with an `Asia/Kolkata` offset or timezone context, validate real calendar dates, and compare
absolute instant values so actionable values are strictly after the reference.

### Independent Evaluation Pipeline

The pipeline loads exactly 18 fixed cases, invokes the real application for all cases, preserves raw
Ollama text and application context, and runs the three evaluator layers independently. It does not
reuse application guards as semantic judgment and does not skip cases.

The semantic evaluator compares case-specific ground truth or rubrics and returns a binary case
score. Structural failure also yields semantic failure for that case. The aggregate denominator is
fixed at 18.

### Evidence and Repair

Before evaluation, preserve the first implementation source and frozen dataset. A genuine initial
run creates an immutable timestamped run directory containing raw responses, per-case results,
summary, and failure feedback. Repairs are copied with specific Copilot feedback to a timestamped
repair directory, followed by re-evaluation evidence. Final source remains distinct from historical
source. Human ACCEPT/REJECT and narrative stay separate under a student-review record.

## Implementation Sequence

1. Prepare and freeze the 18-case dataset and per-case expected properties or rubrics.
2. Implement independent schema, invariant, semantic, and aggregate evaluators.
3. Add deterministic evaluator tests, including structural gates and safety failures.
4. Implement the CLI, Ollama client, prompt, parser, schema, and guard modules.
5. Snapshot the first generated source before the genuine evaluation.
6. Run all 18 cases once against Ollama and preserve raw evidence.
7. Repair only from recorded genuine failures, then re-run the frozen benchmark.
8. Preserve final source and re-evaluation results.
9. Human reviewer records ACCEPT or REJECT separately from machine evidence.

No implementation or evaluation fixture is created by this planning phase.

## Complexity Tracking

No constitution violations require a complexity justification.

## Constitution Re-check

The Phase 1 design is consistent with the constitution. It preserves genuine inference, small scope,
independent evaluation, exact scoring, evidence separation, security, and human accountability.

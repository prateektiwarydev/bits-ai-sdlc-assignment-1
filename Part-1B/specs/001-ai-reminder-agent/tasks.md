# Tasks: Natural-Language Reminder Agent

**Input**: Design documents from `/specs/001-ai-reminder-agent/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Organization**: Tasks are ordered to freeze and test independent evaluation before application
generation, then implement by user story, preserve the first source generation, evaluate the real
local model, repair from evidence, and produce final submission evidence.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with different files and no dependency on incomplete tasks.
- **[Story]**: User-story label only for tasks in a user-story phase.
- Every task names an exact file or deliverable and a testable completion condition.

## Phase 1: Project Setup

**Purpose**: Initialize the CommonJS Node.js project and local Ollama integration boundaries.

- [X] T001 Create the package layout and directories `package.json`, `src/`, `evals/`, `tests/`, and `evidence/` per `specs/001-ai-reminder-agent/plan.md`; completion: all listed directories exist and no frontend, database, or unrelated feature directory exists.
- [X] T002 [P] Initialize Node.js 22 CommonJS package metadata in `package.json` with scripts `test`, `eval`, `start`, and no runtime dependencies; completion: `npm test` resolves a built-in test runner command and `npm start -- --help` has an executable entry target.
- [X] T003 [P] Configure the Ollama endpoint and model constants in `src/config/runtime.js` for `http://127.0.0.1:11434`, `qwen2.5:3b`, Ollama `0.40.17`, and `Asia/Kolkata`; completion: constants contain no credentials and a test verifies the exact values.
- [X] T004 [P] Add typed application error classes in `src/errors.js` for `invocation_error`, `service_error`, `malformed_model_output`, and `validation_error`; completion: every error has a stable code and message and no error class accepts or returns reminder action fields.
- [X] T005 [P] Create the top-level CLI entry in `src/cli.js` to accept `--text` and `--reference` and route to `src/app.js`; completion: omitted options produce `invocation_error`, explicitly supplied `--text ""` is retained as user content, and no machine clock fallback exists (FR-012).
- [X] T006 [P] Create JSON presentation helpers in `src/cli/presentation.js`; completion: model-derived 1.0 JSON is written to stdout and service/invocation errors are written as separate machine-readable stderr records.
- [X] T007 [P] Create no-secret environment guidance in `README.md` and `.gitignore`; completion: setup instructions name no credential requirement, `.gitignore` excludes only secrets and temporary/local files, and it does not exclude `evidence/initial/`, `evidence/repairs/`, `evidence/final/`, `evidence/eval-results.json`, failure reports, or repair records.
- [X] T008 Add native-fetch Ollama connectivity configuration in `src/model/ollama-client.js`, including a finite timeout and `POST /api/generate`; completion: request construction targets exactly `/api/generate` at `127.0.0.1:11434` and timeout/HTTP/model failures map to `service_error`.
- [X] T009 Verify the Ollama setup with a non-evaluation local smoke command documented in `specs/001-ai-reminder-agent/quickstart.md`; completion: setup instructions distinguish connectivity verification from the genuine 18-case evaluation and require no result fabrication.

**Checkpoint**: Project setup is complete, Ollama configuration is explicit, and invocation errors are separable from model responses.

## Phase 2: Independent Evaluation Foundation

**Purpose**: Freeze the benchmark and independent evaluators before application source generation.

- [X] T010 Create the dataset structure and freeze metadata in `evals/dataset.json`; completion: the file has the evaluation-case array and metadata fields needed for T011-T015 to populate C01-C04, R01-R04, S01-S04, X01-X03, and A01-A03 without pre-populating or duplicating cases.
- [X] T011 Populate create cases C01-C04 in `evals/dataset.json` sequentially after T010 with explicit reference timestamps, `Asia/Kolkata`, ground truth or semantic rubrics, expected properties, FR-002/FR-005/FR-009/FR-012/FR-013 mappings, and INV-001/INV-002/INV-006 mappings; completion: C01-C04 cover complete, relative, missing-time, and past/invalid-date cases and no duplicate case ID exists.
- [X] T012 Populate reschedule cases R01-R04 in `evals/dataset.json` sequentially after T011; completion: cases cover complete target/time, relative time, missing target, and missing new time and map to FR-003/FR-005/FR-012/FR-013 plus INV-002/INV-006/INV-008, with no duplicate case ID.
- [X] T013 Populate snooze cases S01-S04 in `evals/dataset.json` sequentially after T012; completion: cases cover complete target/duration, relative duration, missing target, and invalid duration and map to FR-004/FR-007/FR-009 plus INV-007/INV-008, with no duplicate case ID.
- [X] T014 Populate clarification and malformed cases X01-X03 in `evals/dataset.json` sequentially after T013; completion: cases cover vague date/time, ambiguous target, and explicitly empty/malformed input with rubric fields and FR-005/FR-006/FR-009/FR-012 plus relevant invariants, with no duplicate case ID.
- [X] T015 Populate adversarial cases A01-A03 in `evals/dataset.json` sequentially after T014; completion: cases cover unsupported action, prompt injection, and conflicting intent with FR-009/FR-010/FR-011 mappings and INV-002/INV-004/INV-005, with no duplicate case ID.
- [X] T016 Add dataset schema and freeze metadata to `evals/dataset.json`; completion: every case contains ID, input, explicit reference timestamp, timezone, ground truth or rubric, expected properties, requirement IDs, and invariant IDs, and the file records dataset version and 18-case count.
- [X] T017 Implement an independent JSON-schema loader and validator in `evals/schema-validator.js` using `specs/001-ai-reminder-agent/contracts/output-schema.json`; completion: malformed JSON, unknown fields, invalid intent, whitespace-only strings, invalid target identity, null/question/reason mismatches, and cross-field violations fail structure.
- [X] T018 [P] Add independent time validation to `evals/invariant-validator.js`; completion: it independently rejects real-calendar-invalid dates, wrong timezone context, timestamps equal to or before the explicit reference, and model strings that JSON `format: date-time` alone might accept incorrectly.
- [X] T019 Implement independent behavioural/property checks in `evals/invariant-validator.js` for INV-001 through INV-010; completion: each invariant produces pass/fail/evidence with traceable IDs and no function imports application guard claims.
- [X] T020 [P] Implement independent semantic rubric evaluation in `evals/semantic-evaluator.js`; completion: semantic success is binary by meaning and case-specific ground truth/rubric, structural failure forces semantic failure for that case, and exact wording is not required.
- [X] T021 Implement the fixed scoring aggregator in `evals/aggregate.js`; completion: denominator is exactly 18, 15/18 minimum means PASS, structural pass rate must be 100%, safety violations and service errors block PASS, skipped cases block PASS, and missing evidence blocks PASS.
- [X] T022 Implement a complete 18-case runner in `evals/run-evaluation.js`; completion: it loads all fixed cases, invokes actual application/Ollama paths for every case, captures raw input/response/configuration/errors, records no skipped case, and exits PASS/FAIL from `evals/aggregate.js`.
- [X] T023 [P] Add deterministic dataset validation tests in `tests/evaluators/dataset.test.js`; completion: tests prove exactly 18 unique cases, required fields on every case, category coverage, and traceability IDs are present.
- [X] T024 Add negative schema tests in `tests/evaluators/schema-validator.test.js` for `target_reminder: {"id": null}`, non-null task on reschedule, snooze duration on create, non-null task on rejection, whitespace-only strings, non-null clarification question outside clarification, and non-null error reason outside rejection.
- [X] T025 Add positive schema tests sequentially after T024 in `tests/evaluators/schema-validator.test.js` for create, reschedule, snooze, clarification with explicitly supplied task text, and rejection; completion: each intent-specific valid example passes and the negative examples fail.
- [X] T026 [P] Add invariant tests in `tests/evaluators/invariant-validator.test.js` for prompt injection, missing/invalid mandatory fields, invalid calendar dates, wrong timezone, equal/past timestamps, target ambiguity, service/model distinction, and snooze range boundaries.
- [X] T027 [P] Add semantic evaluator tests in `tests/evaluators/semantic-evaluator.test.js`; completion: meaning-equivalent wording scores 1 and materially wrong or structural-failed responses score 0.
- [X] T028 [P] Add aggregate gate tests in `tests/evaluators/aggregate.test.js`; completion: 15/18 passes only with 100% structure, zero safety failures, zero service errors, 18 attempts, and complete evidence; 14/18, any skip/error/structural/safety failure, or missing evidence fails.
- [X] T029 Review and freeze evaluation foundation `evals/dataset.json`, evaluator modules, tests, contracts, and acceptance aggregation; completion: independent review record proves benchmark/rules are immutable before first genuine evaluation and no application module is used to judge its own outputs.

**Checkpoint**: Independent evaluation foundation is complete and reviewed; no application implementation may proceed to genuine evaluation until T029 passes.

## Phase 3: Application Implementation - User Story 1 (Create) (Priority: P1)

**Goal**: Interpret complete create requests and clarify missing or invalid mandatory create details.
**Independent Test**: Create-only fixture requests produce create JSON, clarification, or rejection without rescheduling/snoozing.

- [X] T030 [P] [US1] Implement create prompt constraints in `src/model/prompt.js`, requiring nonblank `task` and actionable absolute time while forbidding invented values (FR-002/FR-006/FR-013).
- [X] T031 [P] [US1] Add create contract tests in `tests/model/output-contract.test.js`; completion: mock model data tests require task string and scheduled datetime, reject `task: "   "`, reject create with snooze data, and preserve schema separation.
- [X] T032 [US1] Implement application create/time guardrails in `src/validation/behavioural-guards.js` and `src/validation/time-validator.js`; completion: create is rejected unless task and datetime are valid, real, in `Asia/Kolkata`, and strictly later than reference (INV-001/INV-002/INV-006).
- [X] T033 [US1] Integrate CREATE handling into `src/app.js`; completion: valid create reaches the versioned 1.0 JSON result, missing time becomes clarification with null action fields, and past/invalid time becomes clarification/rejection (FR-002/FR-014).

**Checkpoint**: User Story 1 is independently testable with the real Ollama path or deterministic unit fixtures.

## Phase 4: Application Implementation - User Story 2 (Reschedule) (Priority: P2)

**Goal**: Interpret reschedules using only a user-provided ID or sufficiently specific title.
**Independent Test**: Complete reschedule requests produce reschedule JSON; missing/ambiguous targets or times produce clarification.

- [X] T034 [P] [US2] Implement reschedule prompt constraints in `src/model/prompt.js`; completion: prompt requires user-provided ID or sufficiently specific title and future absolute datetime and says not to claim database existence/uniqueness (FR-003).
- [X] T035 [P] [US2] Add reschedule contract tests in `tests/validation/output-schema.test.js`; completion: valid title/ID target passes, `{"id": null}` fails, non-null task fails, missing action datetime fails, and clarification null fields pass.
- [X] T036 [US2] Implement reschedule target and time guards in `src/validation/behavioural-guards.js`; completion: missing or ambiguous target requires clarification, no target is fabricated, and datetime must be strictly later than reference (INV-002/INV-006/INV-008).
- [X] T037 [US2] Integrate RESCHEDULE handling into `src/app.js`; completion: complete valid reschedule emits create-incompatible fields as null and clarification emits task only if explicitly supplied by the user (FR-003/FR-014).

**Checkpoint**: User Story 2 is independently testable and does not introduce reminder storage or identity verification.

## Phase 5: Application Implementation - User Story 3 (Snooze) (Priority: P2)

**Goal**: Interpret snooze requests with user-provided target and valid positive duration.
**Independent Test**: Valid snooze output passes; missing target/duration or invalid range requires clarification/rejection.

- [X] T038 [P] [US3] Implement snooze prompt constraints in `src/model/prompt.js`; completion: prompt requires user-provided target and `{ "value": integer, "unit": "minutes" }` in the 1-240 range (FR-004).
- [X] T039 [P] [US3] Add snooze contract tests in `tests/validation/output-schema.test.js`; completion: 1 and 240 pass, 0, negative, decimal, and 241 fail, and target `{"id": null}` fails.
- [X] T040 [US3] Implement snooze target/duration guards in `src/validation/behavioural-guards.js`; completion: missing target/duration or out-of-range snooze produces no accepted snooze action (INV-002/INV-007/INV-008).
- [X] T041 [US3] Integrate SNOOZE handling into `src/app.js`; completion: valid snooze has target and positive duration, while clarification/rejection have scheduled/snooze fields null as applicable (FR-004/FR-014).

**Checkpoint**: User Story 3 is independently testable without persistent reminder state.

## Phase 6: Application Implementation - User Stories 4 and 5 (Clarification and Safety) (Priority: P3)

**Goal**: Safely clarify missing/ambiguous input and reject malformed, unsupported, or adversarial requests.
**Independent Test**: Clarification/rejection fixtures contain no invented mandatory fields and are distinct from service failures.

- [X] T042 [P] [US4] Implement clarification prompt and response rules in `src/model/prompt.js`; completion: clarification is allowed to preserve only explicitly supplied task text and requires `scheduled_datetime`, `snooze_duration`, and `error_reason` null as defined by the contract (FR-014).
- [X] T043 [P] [US4] Add clarification tests in `tests/validation/output-schema.test.js`; completion: valid explicitly supplied task plus clarification passes; whitespace task, scheduled datetime, or snooze duration in clarification fails.
- [X] T044 [US4] Implement clarification guard behavior in `src/validation/behavioural-guards.js`; completion: missing/ambiguous date or target produces a relevant question and no fabricated action fields (INV-001/INV-002/INV-008).
- [X] T045 [P] [US5] Implement rejection prompt and response rules in `src/model/prompt.js`; completion: unsupported and adversarial input maps to rejection, no supported action fields are emitted, and prompt-injection text cannot alter schema/rules (FR-009/FR-010).
- [X] T046 [P] [US5] Add adversarial application tests in `tests/validation/behavioural-guards.test.js`; completion: unsupported actions, prompt injection, malformed input, and conflicting intents fail action eligibility and either clarify/reject safely.
- [X] T047 [US5] Integrate REJECTION handling and service-error separation in `src/app.js`; completion: model-generated rejection has nonblank error reason and no action fields; Ollama/parse/timeout failures remain `service_error` (INV-009).

**Checkpoint**: User Stories 4 and 5 are independently testable and no model/service failure is represented as a valid model result.

## Phase 7: Shared Model and Application Integration

**Purpose**: Complete the real Ollama invocation and independent output acceptance path.

- [X] T048 Implement the Ollama generate client in `src/model/ollama-client.js` using native `fetch`; completion: request includes `model: "qwen2.5:3b"`, `stream: false`, `format: "json"`, temperature 0 or frozen equivalent, finite timeout, and captured metadata.
- [X] T049 Implement strict JSON parsing in `src/model/response-parser.js`; completion: empty/invalid/multi-object/non-object response becomes a typed malformed-model result and never accepted action data.
- [X] T050 Implement the 1.0 schema acceptance layer in `src/validation/output-schema.js` using the contract; completion: exact fields, nullability, intent constraints, whitespace patterns, target identity, and snooze rules match `contracts/output-schema.json`.
- [X] T051 Implement independent time acceptance in `src/validation/time-validator.js`; completion: real calendar dates and `Asia/Kolkata` context are verified and actionable timestamps are strictly later than reference (INV-006/FR-013).
- [X] T052 [P] Implement application unit tests in `tests/model/ollama-client.test.js` with mocked HTTP; completion: connection refusal, non-2xx, missing model, timeout, malformed response, and valid Ollama JSON map to separate expected outcomes.
- [X] T053 [P] Implement response parser tests in `tests/model/response-parser.test.js`; completion: valid 1.0 JSON parses and empty, truncated, extra-text, and non-object output are rejected.
- [X] T054 [P] Implement schema acceptance tests in `tests/validation/output-schema.test.js`; completion: all positive contract examples pass and every documented negative example fails.
- [X] T055 [P] Implement time/guardrail tests in `tests/validation/behavioural-guards.test.js`; completion: past/equal timestamp, 31 February, wrong timezone, target ambiguity, snooze boundary, and prompt injection are covered.
- [X] T056 Integrate all shared components in `src/app.js`; completion: every invocation calls Ollama once, independently validates schema/time/guards, outputs only accepted model-derived 1.0 JSON or typed service/error status, and never executes reminders (FR-017/INV-010).
- [X] T057 Add CLI integration tests in `tests/cli/cli.test.js`; completion: missing `--text` or `--reference` is invocation error, `--text ""` is sent explicitly, and stdout/stderr separation is verified.
- [X] T058 Add full application contract tests in `tests/integration/application.test.js` using mocked Ollama only; completion: create, reschedule, snooze, clarification, rejection, malformed output, and service failure follow separate outcomes with no canned substitution.

**Checkpoint**: The application implementation is complete, testable, and all real interpretation enters the Ollama HTTP path.

## Phase 8: First-Generation Preservation

**Purpose**: Preserve the untouched initial implementation before genuine evaluation or repair.

- [X] T059 Confirm that the initial application implementation produced by T030-T058 is complete and has not undergone evaluation-driven repair; completion: implementation status records that `src/`, `evals/`, and `tests/` reflect ordinary implementation/testing only, not changes made after a genuine frozen-dataset evaluation.
- [X] T060 Preserve the first complete source generation in `evidence/initial/` and `evidence/initial/source-snapshot/` after T059 and before the first genuine model evaluation or any repair; completion: snapshot includes source, package metadata, frozen dataset, evaluators, tests, contracts, and run instructions with no omission.
- [X] T061 Verify the first snapshot matches the pre-evaluation source generation in `evidence/initial/verification.json`; completion: recorded file hashes/manifest match source exactly, snapshot timestamp predates the first genuine dataset evaluation and every evaluation correction.
- [X] T062 Record the corresponding Git milestone for the first complete source generation in `evidence/initial/git-milestone.txt` before the first genuine model evaluation or repair; completion: commit hash or milestone reference is recorded and evidence states no repair commit has occurred.

**Checkpoint**: T060-T062 prove a complete, verifiable first-generation source before any repair.

## Phase 9: Genuine Initial Evaluation

**Purpose**: Run all 18 frozen cases against the actual local Ollama model with real evidence.

- [X] T063 Run the complete genuine evaluation through `evals/run-evaluation.js`; completion: exactly 18 cases invoked Ollama, no case was fabricated or skipped, and actual raw outputs were written to `evidence/initial/run/`.
- [X] T064 Preserve raw initial inputs and model responses in `evidence/initial/run/raw/`; completion: C01-C04, R01-R04, S01-S04, X01-X03, A01-A03 each have raw input/reference and actual Ollama response metadata.
- [X] T065 Preserve per-case structural, invariant, and semantic results in `evidence/initial/run/per-case.jsonl`; completion: each case includes schema outcome, applicable invariant outcomes, rubric result, requirement/invariant trace, status, and no manual success fields.
- [X] T066 Preserve model configuration and errors in `evidence/initial/run/model-config.json` and `evidence/initial/run/service-errors.json`; completion: model, Ollama version/configuration, endpoint, timeout, execution timestamps, and actual service-error count are recorded.
- [X] T067 Preserve aggregate PASS/FAIL evidence in `evidence/initial/run/eval-results.json`; completion: denominator 18, semantic success count/rate, structural pass rate, safety failures, service errors, skipped count, evidence completeness, and FAIL result are recorded.
- [X] T068 Review and report genuine initial failures in `evidence/initial/run/failure-feedback.md`; completion: the report names all actual failing case IDs and structural/semantic reasons without changing hard cases or thresholds.

**Checkpoint**: A complete genuine initial run is preserved before any application repair.

## Phase 10: Evidence-Driven Repair

**Purpose**: Apply justified corrections only when genuine failures require them.

- [X] T069 Inspect actual failed cases in `evidence/initial/run/` and map each failure to a code/configuration defect; completion: every planned correction cites per-case actual output and affected FR/INV/contract item.
- [X] T070 Preserve the original failed evaluation as immutable evidence under `evidence/initial/run/`; completion: no initial raw response, per-case result, or aggregate file is overwritten.
- [X] T071 Supply actionable failure evidence to Copilot and record the request in `evidence/repairs/feedback-to-copilot.md`; completion: feedback contains actual failures, evidence paths, defect hypotheses, and prohibited actions (no threshold/hardcase weakening).
- [X] T072 Apply only justified repairs to source/configuration, preserving repair scope in `evidence/repairs/repair-summary.json`; completion: changed files, rationale, and linked failed case IDs are recorded and no benchmark expectation is changed.
- [X] T073 Create a repaired source snapshot in `evidence/repairs/repaired-source/`; completion: complete repaired source and configuration are distinct from initial snapshot.
- [X] T074 Rerun all 18 cases with the same frozen dataset and acceptance rules through `evals/run-evaluation.js`; completion: re-evaluation invoked all 18 real cases and wrote results to `evidence/repairs/re-evaluation/`.
- [X] T075 Preserve re-evaluation raw/per-case/configuration/aggregate evidence in `evidence/repairs/re-evaluation/`; completion: files cover all cases and permit independent reproduction without overwriting initial evidence.

**Checkpoint**: Repairs are traceable to genuine failures and the original evaluation remains immutable.

## Phase 11: Final Validation and Submission Evidence

**Purpose**: Finalize source, evidence, reproducibility, and human accountability.

- [ ] T076 Preserve final-generation source separately from initial/repair snapshots in `evidence/final/source-snapshot/`; completion: final source manifest/hash is complete and `evidence/final/git-milestone.txt` identifies the final milestone.
- [ ] T077 Produce final machine-readable results in `evidence/eval-results.json`; completion: it includes 18 attempts, semantic successes/rate, 100% structural gate status, safety failures, service errors, skipped count, evidence completeness, and overall PASS/FAIL.
- [ ] T078 Independently verify final evaluation evidence in `evidence/final/independent-verification.json`; completion: a reviewer other than the generation/evaluation code recomputes 18/18 attempts, 15/18 threshold, structural/safety gates, service errors, and evidence completeness.
- [ ] T079 Verify final PASS gates against the frozen criteria: completion: PASS only if 18/18 attempted, structural 100%, zero safety-critical failures, at least 15/18 semantic successes, zero service errors, and complete evidence.
- [ ] T080 Create the student-authored human review and narrative records in `evidence/human-review.json` and `evidence/harness-log.md`; completion: the student records explicit ACCEPT or REJECT, reviewer identity/date, interpretation, limitations, residual risks, assessed reflections, and clearly separates this narrative from machine-generated evidence.
- [ ] T081 Create a machine-generated structured execution report in `evidence/run-manifest.json` for each run or in the existing run directories; completion: report records commands, timestamps, model/runtime versions, run paths, aggregate outputs, and repair/re-evaluation sequence without adding student-authored narrative to `evidence/harness-log.md`.
- [ ] T082 Write reproducible local setup and execution instructions in `README.md` and `specs/001-ai-reminder-agent/quickstart.md`; completion: setup, Ollama model preparation, test command, genuine evaluation command, evidence paths, and expected gate interpretation are runnable on Node.js 22.
- [ ] T083 Add a secret-scan and repository-scope verification task for final files; completion: no API key, token, credential, machine-local absolute path, or Part-1A modification is committed.
- [ ] T084 Inspect final Git scope and commit only final Part 1B artifacts on existing branch `001-ai-reminder-agent`; completion: commit contains constitution/spec/plan/task/implementation/evidence as appropriate, excludes secrets, and no push or branch change occurred.

**Checkpoint**: Final source and evidence are preserved, human review is separate, and submission is reproducible.

## Dependencies & Execution Order

### Phase Dependencies

- Phase 1 setup must complete first.
- Phase 2 independent evaluation foundation is a blocking dependency and must be frozen before T059 first-source generation or T063 genuine evaluation.
- Phases 3-7 implement application stories and shared integration after evaluation foundation.
- Phase 8 first-generation preservation must occur immediately after T059 and before T063/T069 repair.
- Phase 9 genuine initial evaluation follows preservation.
- Phase 10 repair, if required, follows genuine failures and cannot overwrite Phase 9 evidence.
- Phase 11 final evidence follows re-evaluation or initial PASS.

### User Story Dependencies

- **US1 Create (P1)**: depends on T048-T051 shared model/validation foundations and T010-T029 evaluator foundation.
- **US2 Reschedule (P2)**: independent of US1; depends on shared validation and target/data contracts.
- **US3 Snooze (P2)**: independent of US1/US2; depends on snooze schema and guard foundations.
- **US4 Clarification (P3)**: depends on shared output schema and guardrails.
- **US5 Rejection/Safety (P3)**: depends on shared service-error separation and guardrails.

### Critical Sequencing

1. T001-T029: setup plus frozen evaluation foundation.
2. T030-T058: application and application tests.
3. T059-T062: first source and Git milestone preservation.
4. T063-T068: genuine initial evaluation and failure evidence.
5. T069-T075: conditional evidence-driven repair and re-evaluation.
6. T076-T084: final source, independent verification, human review, and commit.

## Parallel Opportunities

- T003-T007 can proceed in parallel after T001.
- T011-T015 must run sequentially after T010 because they share `evals/dataset.json`; T016 freezes the complete 18-case result only after T015.
- T017-T020 can proceed in parallel once schemas/data model are fixed.
- T023-T028 evaluator test files can proceed in parallel.
- US1-US5 implementation can proceed in parallel after shared T048-T051 foundations where staff permits.
- T052-T055 application tests can proceed in parallel after corresponding modules exist.
- Initial snapshot tasks T060-T062 proceed only after T059.
- Final verification tasks T077-T082 can proceed after the final evaluation, but T084 is last.

## Implementation Strategy

### MVP Scope

Suggested MVP is User Story 1 plus shared create validation and real Ollama invocation. It must not
be considered a completed benchmark until the entire evaluator foundation, all 18 cases, and all
acceptance gates are preserved.

### Incremental Delivery

1. Setup and frozen independent evaluation foundation.
2. User Story 1 create behavior.
3. User Story 2 reschedule behavior.
4. User Story 3 snooze behavior.
5. Clarification and rejection/safety behavior.
6. Preserve first source and run genuine evaluation.
7. Repair only from genuine evidence and re-evaluate.
8. Final verification, human review, and submission commit.

## Notes

- [P] tasks use different files and no dependency on incomplete tasks.
- Story labels appear only in user-story phases.
- Every task is executable and names a file/deliverable plus measurable completion.
- No task changes threshold, removes cases, or accepts fabricated evaluation results.

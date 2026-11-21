# Tasks: Smart Todo & Task CLI

**Input**: Design documents from `/specs/001-smart-todo-task/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md,
contracts/cli.md, quickstart.md

**Tests**: Specification-derived unit and CLI contract tests are explicitly
required for implementation validation.

**Organization**: Tests and harness controls are prepared before initial
implementation. User story implementation follows priority and preserves
independent test coverage.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallelizable across different files with no incomplete dependency.
- **[Story]**: US1–US5 map to specification user stories.
- Every task includes an exact file path or directory.

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 Create Node.js 22 package structure in package.json and src/, tests/,
  .harness/, evidence/, and data/ per specs/001-smart-todo-task/plan.md.
- [ ] T002 Create built-in test/package scripts in package.json for
  `node --test "tests/**/*.test.js"` and project utilities.
- [ ] T003 Configure JavaScript syntax discovery and package scripts in
  package.json: find each individual JavaScript file under src/ and invoke
  `node --check <file>` separately for every file; fail if no source file is
  found or any individual check fails.
- [ ] T004 [P] Create explicit ESLint configuration in
  .harness/eslint.config.js and document
  `eslint --config .harness/eslint.config.js "src/**/*.js" "tests/**/*.test.js"`.
- [ ] T005 [P] Create project-local Semgrep configuration in
  .harness/semgrep.yml for use alongside `p/javascript` and
  `p/security-audit`.
- [ ] T006 [P] Exclude mutable runtime JSON in .gitignore, including
  data/*.json, and preserve harness evidence (evidence/initial/, evidence/final/,
  evidence/harness/) under version-control rules appropriate for the assignment
  without committing mutable runtime JSON.
- [ ] T007 [P] Create test fixture directories and an isolated data-path helper
  under tests/fixtures/ and tests/helpers/ for deterministic temporary storage.
- [ ] T008 Create initial evidence directories evidence/initial/,
  evidence/final/, evidence/harness/, and evidence/keep/ (human narrative is
  separate) per the constitution.

---

## Phase 2: Specification-Derived Test and Fixture Preparation

**Purpose**: Establish expected outcomes before initial application code.

**Checkpoint**: Test fixtures and exact acceptance expectations are inspectable
and harness-prepared.

- [ ] T009 [P] [US1] Create CRUD unit test cases in
  tests/unit/task-crud.test.js covering create, get, list, update, delete,
  blank title, invalid field types, invalid tags, immutable ID, and non-mutation
  (FR-001–FR-004, FR-012, FR-016, FR-019, SC-002, SC-009).
- [ ] T010 [P] [US1] Create CLI CRUD contract cases in
  tests/contract/task-crud.test.js for machine-readable success/error results,
  exit statuses, immutable `--id`, and exact non-mutation behavior
  (FR-002–FR-004, FR-017–FR-019).
- [ ] T011 [P] [US2] Create exact case-insensitive tag unit cases in
  tests/unit/tag-filter.test.js, including exact matches, no substring matches,
  zero matches, mixed case, empty, whitespace-only, and non-string input
  (FR-005–FR-006, FR-016, FR-019, SC-003, SC-010).
- [ ] T012 [P] [US2] Create tag filter CLI contract cases in
  tests/contract/tag-filter.test.js for `--tag`, `INVALID_INPUT`, JSON output,
  exit status 2, and unchanged task data (FR-006, FR-018–FR-019).
- [ ] T013 [P] [US3] Create persistence unit cases in
  tests/unit/json-store.test.js for missing file, valid round trip, malformed
  JSON, structurally invalid JSON, non-mutation, and atomic write behavior
  (FR-007–FR-009, FR-016, FR-019, NFR-003, SC-004, SC-007).
- [ ] T014 [P] [US3] Create persistence CLI contract cases in
  tests/contract/persistence.test.js for missing-file startup, valid restore,
  `INVALID_JSON`, no overwrite, isolated data paths, and exact error output
  (FR-007–FR-009, FR-018–FR-019).
- [ ] T015 [P] [US4] Create stable priority unit cases in
  tests/unit/priority-sort.test.js for HIGH, MEDIUM, LOW, empty/single
  collections, equal priorities, and invalid priority rejection
  (FR-010–FR-012, SC-005).
- [ ] T016 [P] [US4] Create priority CLI contract cases in
  tests/contract/priority-sort.test.js for descending machine-readable output,
  stable tie order, invalid priority `INVALID_INPUT`, and no mutation
  (FR-010–FR-012, FR-018–FR-019).
- [ ] T017 [P] [US5] Create status-transition unit cases in
  tests/unit/status-transition.test.js for TODO→IN_PROGRESS,
  IN_PROGRESS→DONE, backward/skipped/DONE transitions, unknown IDs,
  direct status/ID update rejection, and successful mutation only
  (FR-013–FR-015, FR-019, SC-006, SC-011).
- [ ] T018 [P] [US5] Create status-transition CLI contract cases in
  tests/contract/status-transition.test.js for success, `INVALID_TRANSITION`,
  `TASK_NOT_FOUND`, `INVALID_INPUT`, exit statuses, and unchanged data
  (FR-013–FR-019).
- [ ] T019 [P] Create fixture JSON for valid, missing, malformed, and
  structurally invalid persistence states under tests/fixtures/persistence/.
- [ ] T020 [P] Create exact expected-result fixtures under tests/fixtures/results/
  for success objects, error objects, exit statuses, priority order, tag
  matches, and transition outcomes.
- [ ] T021 Create a traceability matrix in tests/traceability.md mapping FR,
  NFR, acceptance scenarios and SC cases to unit and contract test files
  (NFR-006, SC-001, SC-007).

---

## Phase 3: Independent Harness Preparation

**Purpose**: Prepare all mandatory gates before initial application execution.

- [ ] T022 Create harness entrypoint .harness/run.sh that invokes every
  mandatory gate and exits nonzero if any gate fails (NFR-005).
- [ ] T023 Implement Gate 1 in .harness/run.sh using reliable individual-file
  discovery and separate `node --check <file>` invocations for every JavaScript
  source file, plus
  `eslint --config .harness/eslint.config.js "src/**/*.js" "tests/**/*.test.js"`
  (NFR-005, SC-008). Fail if no application JavaScript file is found or any
  syntax check fails.
- [ ] T024 Implement Gate 2 in .harness/run.sh using Semgrep with
  `p/javascript`, `p/security-audit`, `.harness/semgrep.yml`, `--error`, and
  actual `src/**/*.js` targets (NFR-005, SC-008).
- [ ] T025 Implement Semgrep result handling in .harness/run.sh and
  evidence/harness/ to fail on findings, invalid rules, rule-loading/scan
  tool errors, missing application source, or missing scan output (NFR-005,
  SC-008).
- [ ] T026 Implement Gate 3 in .harness/run.sh to verify both unit and contract
  suites have at least one `tests/**/*.test.js` file, execute
  `node --test "tests/**/*.test.js"`, and fail if either suite is missing, no
  matching test file exists, or zero tests execute
  (NFR-002, NFR-005, SC-007–SC-011).
- [ ] T027 Add per-gate stdout/stderr/exit-status capture to .harness/run.sh
  and timestamped or run-specific evidence under evidence/harness/.
- [ ] T028 Add overall harness summary generation to .harness/run.sh that
  records all gate outcomes without rewriting earlier runs or inventing values
  (NFR-005–NFR-006, SC-008).
- [ ] T029 [P] Add `.harness/` configuration for deterministic environment and
  isolated `--data-file` test paths without mutating data/tasks.json.
- [ ] T030 Add evidence ownership and AI-use restrictions to .harness/run.sh
  comments or output: machine data only; student-authored harness narrative,
  reflection and ACCEPT/REJECT are not generated (constitution principles V,
  VII, VIII).

---

## Phase 4: Initial Application Implementation — US1 Task CRUD

**Goal**: Deliver independently testable task creation, retrieval, update and
deletion after specification-derived tests and harness exist.

**Independent Test**: Run US1 unit/contract tests against an isolated JSON file
and verify exact CRUD state, validation, immutable IDs and non-mutation.

- [ ] T031 [US1] Implement Task field types and validation in
  src/domain/validation.js for required nonblank string title, optional
  description default `""`, tags list default `[]`, priority `MEDIUM`,
  status `TODO`, and immutable ID (FR-001, FR-003, FR-012, FR-018).
- [ ] T032 [US1] Implement in-memory task operations in
  src/domain/task-service.js for create, get, list, update and delete
  (FR-001–FR-004).
- [ ] T033 [US1] Implement collision-safe sequential string ID generation in
  src/persistence/json-store.js using persisted `nextId`/counter state and
  sequence values never reused (FR-001, NFR-003).
- [ ] T034 [US1] Implement US1 CLI argument parsing and presentation in
  src/cli/args.js and src/cli/presentation.js for create/get/list/update/delete
  (FR-001–FR-004, FR-017–FR-018).
- [ ] T035 [US1] Prepare US1 CLI command integration in src/cli.js with
  `TaskService`; the end-to-end CRUD wiring depends on T039–T042 and must not
  be checkpointed as complete in this phase (FR-001–FR-004).

**Checkpoint**: US1 domain and CLI contracts are prepared, but complete CLI
CRUD execution remains dependent on persistence tasks T039–T042.

---

## Phase 5: Initial Application Implementation — US2 Tag Filtering

**Goal**: Deliver exact case-insensitive tag matching without substring behavior.

**Independent Test**: Run tag unit/contract tests against known tagged fixtures.

- [ ] T036 [US2] Implement exact case-insensitive tag matching in
  src/domain/task-service.js and validation of nonblank string filter input
  (FR-005–FR-006, FR-018–FR-019).
- [ ] T037 [US2] Add `task filter-tag --tag` parsing/output in
  src/cli/args.js and src/cli/presentation.js (FR-006, FR-017–FR-018).
- [ ] T038 [US2] Connect tag filter operation to the CLI entrypoint in src/cli.js
  (FR-005–FR-006).

**Checkpoint**: US2 tag matching is exact and independently testable.

---

## Phase 6: Initial Application Implementation — US3 JSON Persistence

**Goal**: Persist and restore the complete task state safely.

**Independent Test**: Run persistence unit/contract tests with isolated files.

- [ ] T039 [US3] Implement JSON document loading and structural validation in
  src/persistence/json-store.js for missing, valid, malformed and invalid-schema
  states (FR-007–FR-009, NFR-003).
- [ ] T040 [US3] Implement atomic same-directory JSON writes in
  src/persistence/json-store.js after successful mutations only
  (FR-007–FR-009, FR-019).
- [ ] T041 [US3] Implement missing-file initialization and preserve malformed
  files unchanged in src/persistence/json-store.js (FR-009, FR-018–FR-019).
- [ ] T042 [US3] Add configurable `--data-file` support in src/cli/args.js and
  src/cli.js, defaulting to data/tasks.json (NFR-003–NFR-004).
- [ ] T043 [US1] Complete and verify end-to-end CLI CRUD wiring in src/cli.js
  against the completed JSON persistence layer from T039–T042; verify isolated
  create/get/update/delete behavior and non-mutation failures
  (FR-001–FR-004, FR-007–FR-009, FR-019).

**Checkpoint**: US3 persistence/restoration is independently testable.

---

## Phase 7: Initial Application Implementation — US4 Priority Sorting

**Goal**: Return stable HIGH, MEDIUM, LOW descending priority order.

**Independent Test**: Run priority unit/contract tests with ties and empty lists.

- [ ] T044 [US4] Implement priority validation and stable descending sort in
  src/domain/task-service.js (FR-010–FR-012, SC-005).
- [ ] T045 [US4] Add `task list --sort priority` parsing/output in
  src/cli/args.js and src/cli/presentation.js (FR-010, FR-017).
- [ ] T046 [US4] Connect priority sorting to src/cli.js without changing stored
  task order (FR-010–FR-011).

**Checkpoint**: US4 priority behavior is independently testable.

---

## Phase 8: Initial Application Implementation — US5 Status Transitions

**Goal**: Provide only adjacent forward status transitions.

**Independent Test**: Run transition unit/contract tests for success and rejection.

- [ ] T047 [US5] Implement dedicated status transition validation in
  src/domain/task-service.js for TODO→IN_PROGRESS and IN_PROGRESS→DONE only
  (FR-013–FR-015, SC-006, SC-011).
- [ ] T048 [US5] Prevent generic updates from changing status or ID in
  src/domain/task-service.js and src/domain/validation.js
  (FR-003, FR-014, FR-019).
- [ ] T049 [US5] Add `task transition --id --to` parsing/output in
  src/cli/args.js and src/cli/presentation.js (FR-013–FR-018).
- [ ] T050 [US5] Connect transition behavior to src/cli.js and use
  `INVALID_TRANSITION`/`TASK_NOT_FOUND` where specified (FR-015, FR-018).

**Checkpoint**: US5 lifecycle behavior is independently testable.

---

## Phase 9: Initial Evidence, Harness Execution and Student Feedback

**Purpose**: Preserve first generation and execute all mandatory gates.

- [ ] T051 Preserve the complete first generated application implementation
  unchanged in evidence/initial/ with timestamps or identifiers (constitution
  VII).
- [ ] T052 Execute `.harness/run.sh evidence/initial` and run every gate even
  when one fails (Gate 1, Gate 2, Gate 3).
- [ ] T053 Preserve actual stdout, stderr, exit statuses and reports under
  evidence/initial/harness/ without overwriting earlier evidence.
- [ ] T054 If genuine failures occur, prepare actionable feedback from actual
  findings and failed assertions for the coding agent, with no weakening or
  fabricated defects (constitution V).
- [ ] T055 Do not add machine-generated narrative, reflection or ACCEPT/REJECT
  entries to evidence/harness-log.md; reserve those for the student
  (constitution VIII).

---

## Phase 10: Genuine Repair and Complete Revalidation

**Purpose**: Repair genuine implementation failures and rerun the same gates.

- [ ] T056 Apply only genuine implementation repairs tied to failed tests or
  findings; do not alter assertions, disable findings or lower thresholds
  (constitution V).
- [ ] T057 Document each repair in machine-inspectable evidence under
  evidence/final/ without inventing repair cycles (constitution VII).
- [ ] T058 Preserve repaired application code in evidence/final/ and do not
  overwrite evidence/initial/.
- [ ] T059 Rerun every mandatory gate through `.harness/run.sh evidence/final`
  and preserve complete rerun stdout, stderr, exit statuses and reports.
- [ ] T060 Verify the harness reports PASS only when all gates execute successfully
  and at least one test suite has executed actual tests (SC-008).

---

## Phase 11: Final Cross-Cutting Review and Student Decision

**Purpose**: Student-owned acceptance, documentation and traceability only.

- [ ] T061 Recheck FR-001–FR-019 and NFR-001–NFR-006 against implementation,
  tests and evidence for no unsupported functionality or scope change.
- [ ] T062 Recheck SC-001–SC-011 and map outcomes to machine-generated reports
  and file locations (NFR-006).
- [ ] T063 Leave evidence/harness-log.md for student-authored narrative,
  actual outcomes, known limitations and explicit ACCEPT/REJECT decision.
- [ ] T064 Do not generate narrative, reflection or human reasoning in this task
  phase; require explicit student review (constitution VIII).

---

## Dependencies & Execution Order

- **Phase 1** has no dependencies and establishes configuration.
- **Phase 2** depends on Setup and prepares all specification-derived tests
  before implementation.
- **Phase 3** depends on test/fixture preparation and establishes all three
  mandatory harness gates.
- **Phases 4–8** depend on the prepared tests and harness; they follow US1,
  US2/US3, US4 and US5 priority order.
- **Phase 9** requires all initial application layers and executes all gates.
- **Phase 10** requires genuine failures or a complete initial run, then
  preserves final code and reruns all gates.
- **Phase 11** is student-owned and occurs after machine evidence is complete.

## Parallel Opportunities

- T004–T007 may run in parallel because they create separate configuration,
  fixture and ignore files. T002 and T003 must be sequential with each other
  because both edit package.json.
- T009–T020 may run in parallel for independent unit/contract test files.
- T023–T026 must be sequenced where they update .harness/run.sh and share
  incomplete harness output.
- T034, T037, T045 and T049 must not run concurrently: they update shared CLI
  parser/presentation files and depend on stable domain contracts.
- T035 and T043 require persistence tasks T039–T042 before complete CRUD
  integration; T043 is the end-to-end checkpoint after storage exists.
- User story implementation is ordered by P1→P2→P3 but US2, US3, US4 and US5
  tests remain independently testable.

## Parallel Example: Test Preparation

```text
T009 US1 CRUD unit tests
T011 US2 tag unit tests
T013 US3 persistence unit tests
T015 US4 priority unit tests
T017 US5 transition unit tests
T023 Gate 1 configuration
T024 Gate 2 configuration
T026 Gate 3 test discovery
```

## Implementation Strategy

### MVP Scope

1. Complete Setup and test/harness preparation.
2. Implement and validate US1 CRUD independently.
3. Continue US2–US5 only after shared foundation and accepted tests remain
   intact.
4. Preserve initial/final implementations and genuine evidence.
5. Student performs final ACCEPT/REJECT review.

## Notes

- [P] tasks affect different files or can be executed independently.
- [Story] labels are used for user story test and implementation phases.
- No task creates application source, tests, harness scripts or evidence in
  this task-planning phase.
- No task claims implementation, validation or a PASS has occurred.

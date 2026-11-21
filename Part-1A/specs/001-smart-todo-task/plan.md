# Implementation Plan: Smart Todo & Task CLI

**Branch**: `main` | **Date**: 2026-11-22 | **Spec**:
[spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-smart-todo-task/spec.md`

## Summary

Implement a small Node.js 22 CLI for task CRUD, exact case-insensitive tag
filtering, local JSON persistence/restoration, stable priority ordering, and
dedicated adjacent-only status transitions. The proposed architecture separates
CLI presentation, domain operations, persistence, tests, and harness evidence.
These technology choices are proposed technical decisions, not BITS
requirements.

## Technical Context

**Language/Version**: JavaScript (ES2022+) on Node.js 22.

**Primary Dependencies**: Node.js built-ins; ESLint; Semgrep; no application
framework or database.

**Storage**: A local JSON file with a default path and configurable test path.

**Testing**: Built-in `node:test` and `node:assert`.

**Target Platform**: macOS Apple Silicon for development and an evaluation
host with Node.js 22.

**Project Type**: Local command-line application.

**Performance Goals**: None prescribed; deterministic behavior and exact tests
are required.

**Constraints**: One task list; no authentication, server/API, frontend,
database, external service, cloud hosting, or CI/CD requirement.

**Scale/Scope**: Small deterministic application only.

## Constitution Check

Pass, subject to implementation evidence and human review:

- Specification-first: implementation starts only after the approved
  specification, plan, tasks, and tests exist.
- Deterministic correctness: exact assertions cover normal, boundary,
  invalid-input, persistence, sorting, tag, and transition behavior.
- Independent harness: syntax/lint, Semgrep SAST, and unit/CLI contract tests
  are distinct mandatory gates.
- Feedforward/feedback: preserve first/final code, actual results, and genuine
  repair evidence; never weaken tests or manufacture failures.
- Traceability/evidence: requirements map to tests, harness reports, and
  `harness-log.md`.
- Human accountability: a human records ACCEPT or REJECT.

## Project Structure

### Documentation

```text
specs/001-smart-todo-task/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    └── cli.md
```

### Source and validation layout

```text
src/
├── cli.js
├── cli/
│   ├── args.js
│   └── presentation.js
├── domain/
│   ├── task-service.js
│   └── validation.js
└── persistence/
    └── json-store.js

tests/
├── unit/
├── contract/
└── fixtures/

.harness/
├── run.sh
├── eslint.config.js
└── semgrep.yml

evidence/
├── initial/
├── final/
└── harness-log.md

data/
└── tasks.json       # mutable runtime data; excluded from Git

package.json
```

**Structure Decision**: Use a small single-package CLI. The CLI layer parses
arguments and formats machine-readable results; the domain layer owns validation
and state transitions; the persistence adapter owns JSON loading and atomic
writes. Tests and evidence remain independently inspectable.

## Architecture

1. The CLI delegates operations to `TaskService`.
2. `TaskService` validates input and invokes only approved state transitions.
3. `JsonStore` loads persistence once and writes only after an operation has
   passed domain validation.
4. Successful mutations update an in-memory snapshot and then persist atomically.
5. Failed operations return an error category and do not mutate persisted or
   in-memory valid task data.
6. Stable sorting does not alter stored task order; equal-priority tasks retain
   their existing sequence.

## Implementation Sequence

1. Add package scripts, lint/SAST configuration, JSON storage configuration,
   and test fixtures.
2. Derive unit and CLI contract test cases and expected outcomes from the
   approved specification before application implementation.
3. Define and inspect the independent three-gate harness design, including
   pass/fail contracts and evidence paths.
4. Generate the initial application implementation only after the test suite
   and harness expectations exist.
5. Preserve the initial generated code unchanged in `evidence/initial/`.
6. Run the complete independent harness against the initial implementation;
   record actual stdout, stderr, exit codes, reports, and genuine failures.
7. Repair genuine implementation failures based on the evidence, without
   weakening tests or acceptance criteria.
8. Preserve final repaired code in `evidence/final/`, rerun the same three gates,
   and retain actual rerun evidence.
9. Stop before human ACCEPT/REJECT; the student authors all narrative and
   reflection entries and the final decision.

## Harness

Gate 1 discovers individual JavaScript source files under `src/`, executes
`node --check <file>` separately for every discovered file, and fails if no
source file is found or any individual syntax check fails. It also executes
`eslint --config .harness/eslint.config.js "src/**/*.js" "tests/**/*.test.js"`.
It is syntax/lint validation only.

Gate 2 executes Semgrep against the JavaScript application targets
`src/**/*.js`. It uses the registry rulesets `p/javascript` and
`p/security-audit` together with the project-local
`.harness/semgrep.yml` override/rules file, with `--error`. The proposed
invocation is:

```sh
semgrep scan --config p/javascript --config p/security-audit \
  --config .harness/semgrep.yml --error --json \
  --output evidence/semgrep.json src
```

The project-local file is used, not an unused placeholder. Semgrep `--error` makes
qualifying findings fail the scan with a nonzero exit status; a scan or
rule-loading failure is also a gate failure and MUST NOT be interpreted as an
application PASS. The gate passes only when rules load successfully, the scan
targets application JavaScript, and no qualifying finding remains. Ordinary
ESLint findings, syntax checks, and dependency auditing are not SAST.

Gate 3 first verifies that at least one `tests/**/*.test.js` file exists,
then executes `node --test "tests/**/*.test.js"` against the
specification-derived unit and CLI contract suites. The harness fails if no
matching test file exists or if the test runner reports zero executed tests.
The harness script invokes
every gate even after an earlier gate fails, records every exit status and
captured output, summarizes every outcome, and exits nonzero if any gate fails.
This prevents an unchecked or skipped gate from receiving a PASS-shaped overall
result.

The complete rerun writes timestamped machine-readable stdout/stderr, exit
status, and a combined summary under `evidence/`. No harness result may be edited
or fabricated. The harness may capture actual machine-generated outputs only.
The student authors human narrative text in `harness-log.md`, reflections,
and the final ACCEPT/REJECT decision; AI MUST NOT generate or invent it.

## Traceability

| Requirement | Planned verification |
| --- | --- |
| FR-001–FR-004 | Unit CRUD tests and CLI contract tests |
| FR-005–FR-006 | Case-insensitive exact-match and invalid-filter tests |
| FR-007–FR-009 | Persistence round-trip and malformed-data tests |
| FR-010–FR-012 | Stable sorting and priority-validation tests |
| FR-013–FR-015 | Adjacent transition and no-bypass tests |
| FR-016–FR-019 | Error-category and non-mutation tests |
| SC-009–SC-011 | Boundary/type/tag/status test matrices |

## Unresolved Technical Choices

- Semgrep rule-set pinning and the exact project-local rule policy need approval.
- Package manifest and exact lint rule strictness need approval during
  implementation planning, but not as application requirements.

## Complexity Tracking

No constitution gate violation is planned. The independent SAST gate is
mandatory, and the modular layout is the smallest structure that separates
CLI, domain, persistence, tests, and harness evidence.

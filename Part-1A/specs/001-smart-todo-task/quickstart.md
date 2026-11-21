# Quickstart Validation

This guide describes validation to execute after implementation. It does not
pretend that implementation or checks have already run.

Before implementation, create the specification-derived test fixtures and
expected outcomes under `tests/` and inspect the `.harness/` design. Test
preparation is feedforward work and does not execute application code.

## Prerequisites

- macOS Apple Silicon or evaluation host
- Node.js 22
- npm
- ESLint
- Semgrep

Suggested setup:

```sh
node --version
npm --version
brew install semgrep
```

The exact package versions require confirmation; the recommended default JSON
path is `data/tasks.json`.

## Specification-Derived Unit Tests

After implementation, run:

```sh
node --test "tests/**/*.test.js"
```

Expected coverage:

- CRUD sequences
- Invalid title, field type, priority, tag, and ID input
- Optional field defaults
- Exact case-insensitive tag matching
- Stable priority ordering
- TODO-to-IN_PROGRESS-to-DONE transitions
- Unknown-task and prohibited-transition behavior
- Missing, valid, malformed, and invalid-schema JSON persistence
- Non-mutation after unsuccessful operations

The single command discovers both unit and CLI contract test files. If no
`.test.js` files exist or Node executes zero tests, the harness MUST treat the
gate as failed rather than passing.

Set an isolated data file for every invocation so tests cannot mutate personal
or repository data.

## Mandatory Harness

After implementation, run:

```sh
.harness/run.sh evidence/final
```

The harness executes:

1. Discover individual JavaScript source files under `src/`, run
   `node --check <file>` separately for every file, and fail if no source file
   is found or any syntax check fails. Then run
   `eslint --config .harness/eslint.config.js "src/**/*.js" "tests/**/*.test.js"`
2. Semgrep SAST against `src/**/*.js`, loading `p/javascript`,
   `p/security-audit`, and `.harness/semgrep.yml` with `--error`
3. `node --test "tests/**/*.test.js"`

Semgrep is selected for a real SAST gate and uses `p/javascript` and
`p/security-audit` together with `.harness/semgrep.yml` and `--error`.
Any qualifying finding or scan/rule-loading failure fails the gate. The harness
also fails if no application source is scanned or no test file executes.
ESLint, syntax checks, and dependency checks remain separate from SAST.

The result is PASS only if all gates execute and return success, and reports
remain inspectable. The harness does not change test assertions or suppress
findings.

## Evidence

The harness writes stdout, stderr, exit status, and a summary. Initial and final
implementation states, genuine repair evidence, and the human review decision
must be retained separately. The student must document narrative entries; this
guide generates no reflective text.

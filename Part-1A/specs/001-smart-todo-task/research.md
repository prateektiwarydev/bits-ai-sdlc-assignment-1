# Phase 0 Research

## Decision: Node.js 22 JavaScript

**Engineering decision for human acceptance**: This is a proposed implementation
choice, not a BITS-mandated requirement.

**Decision**: Use Node.js 22 CommonJS or ES modules in JavaScript.

**Rationale**: It is a deterministic local CLI platform with built-in JSON,
filesystem, subprocess, test, and assertion support. It avoids an application
framework or database.

**Alternatives considered**: Python and compiled languages remain possible
technical choices but are not selected in this reviewed plan. Node.js is a
preference for this design, not a BITS-mandated choice.

## Decision: CLI and JSON result contract

**Decision**: Use positional or named CLI arguments and emit JSON success/error
objects to stdout, with concise usage text and nonzero exit statuses.

**Rationale**: Machine-readable output makes contract tests exact and keeps the
interface small.

**Alternatives considered**: An API/server or interactive prompts were rejected
because the approved interface is CLI-only.

## Decision: Built-in test framework

**Decision**: Use `node:test` and `node:assert`.

**Rationale**: Both ship with Node.js 22 and provide independent deterministic
unit and subprocess/CLI contract testing without a framework dependency.

**Alternatives considered**: Jest, Vitest, and Mocha add dependencies and setup
without a demonstrated need.

## Decision: Semgrep for SAST

**Decision**: Use Semgrep as the separate Security/SAST gate.

**Engineering decision for human acceptance**: Semgrep is proposed for this
project, not required by BITS Pilani. ESLint configuration and Semgrep registry/
project rules remain implementation choices that must be reviewed and verified
when setup begins.

**Rationale**: Semgrep is static application-security analysis for JavaScript,
can return JSON and text findings, and is available on macOS Apple Silicon.
It is not a replacement for lint or syntax checking.

**Recommended macOS setup**: `brew install semgrep`.

**Selected scan**:

```sh
semgrep scan --config p/javascript --config p/security-audit \
  --config .harness/semgrep.yml --error --json \
  --output "$EVIDENCE_DIR/semgrep.json" src
```
EVIDENCE_DIR is provided by the harness for each execution. Initial and final runs must use separate evidence directories, and previous run outputs must not be overwritten.

The target directory is the JavaScript application under `src/`; test fixtures
and planning artifacts are not the application scan target. The gate loads the
selected security rules before scanning and fails on qualifying findings through
`--error`. Semgrep's exit behavior is handled explicitly: a nonzero exit from
findings, rule loading, target resolution, or scanning is a gate failure.

For reproducibility, pin the Semgrep version and add reviewed project rules.
A rule-loading error MUST fail and MUST not be reported as an application
security PASS.

No ESLint or Semgrep version is recorded in this planning phase. Actual versions
and rule behavior will be recorded during implementation setup; no scan or
tool success will be claimed until it actually executes.

**Alternatives considered**: ESLint alone, syntax checks, and dependency
auditing cannot satisfy SAST because they do not independently perform
security-focused static data-flow/rule analysis.

## Decision: Sequential, collision-safe string IDs

**Decision**: Propose sequential decimal string IDs such as `1`, `2`, `3`,
with a persisted `nextId` or monotonic counter so deleted and restarted tasks
cannot reuse or collide with existing IDs.

This is a proposed engineering decision for human acceptance, not a
BITS-mandated requirement.

**Rationale**: The specification requires stable generated string identities
but defers representation; a persisted counter is small and deterministic.

**Alternatives considered**: UUIDs improve entropy but add less inspectability;
reuse counters increase collision risk and are not selected.

**Human approval required**: Confirm whether sequential ID strings are
acceptable; no approved clarification currently requires UUIDs or a format.

## Decision: Local JSON persistence

**Decision**: Use `data/tasks.json` under the Part 1A project root as the
documented default. Allow `--data-file` or an environment variable for isolated
tests.

This storage design is proposed engineering, not a BITS-mandated implementation
requirement.

**Rationale**: This preserves JSON persistence and avoids accidental test
mutation of real data.

**Git handling**: Add `data/*.json` or the mutable `data/` runtime directory
to `.gitignore` so runtime task state is not committed. Cloud storage is not
in scope.

**Human approval required**: Confirm `data/tasks.json` and the final ignore
pattern.

## Decision: Safe JSON writes

**Decision**: Parse and validate on load, keep malformed data unchanged, write
through a temporary file in the same directory, flush/close it, then rename
atomically when supported by the platform. Reject writes after failed domain
validation.

**Rationale**: Atomic replacement reduces partial-write risk and preserves
malformed data for diagnosis.

**Missing data**: A missing `data/tasks.json` initializes an empty in-memory
collection and writes JSON only after the first successful state-changing
operation.

**Malformed or structurally invalid data**: Preserve the original file, return
`INVALID_JSON`, and perform no mutation or overwrite. Valid existing data remains
unchanged. A malformed or structurally invalid persistence document MUST NOT be
silently replaced with an empty collection.

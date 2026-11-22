# Smart Todo CLI

Part 1A is a deterministic Node.js 22 command-line application for managing
one local task list. It supports task creation, retrieval, update, deletion,
exact case-insensitive tag filtering, stable high-to-low priority sorting, and
forward status transitions from `TODO` to `IN_PROGRESS` to `DONE`.

The CLI returns machine-readable JSON. It does not expose a server or API,
require authentication, or use an external database.

## Prerequisites and installation

- Node.js 22
- npm
- Semgrep for the SAST gate

Install dependencies from the Part-1A directory:

```bash
cd Part-1A
npm ci
```

If Semgrep is not already installed on macOS with Homebrew:

```bash
brew install semgrep
```

## Run the CLI

The executable entry point is `node src/cli.js <command> [arguments]`.
The following commands use an explicit local JSON file:

```bash
node src/cli.js task create \
  --title "Review specification" \
  --priority HIGH \
  --tag work \
  --data-file ./data/tasks.json

node src/cli.js task list --data-file ./data/tasks.json
node src/cli.js task get --id 1 --data-file ./data/tasks.json
node src/cli.js task update --id 1 --title "Review approved specification" \
  --data-file ./data/tasks.json
node src/cli.js task filter-tag --tag WORK --data-file ./data/tasks.json
node src/cli.js task list --sort priority --data-file ./data/tasks.json
node src/cli.js task transition --id 1 --to IN_PROGRESS \
  --data-file ./data/tasks.json
node src/cli.js task transition --id 1 --to DONE \
  --data-file ./data/tasks.json
node src/cli.js task delete --id 1 --data-file ./data/tasks.json
```

The first task in a new store has ID `1`. Creation accepts repeated `--tag`
options. Valid priorities are `HIGH`, `MEDIUM`, and `LOW`; valid statuses are
managed through the dedicated transition command. Error results use the
contract codes `INVALID_INPUT`, `TASK_NOT_FOUND`, `INVALID_TRANSITION`, and
`INVALID_JSON`.

## Local JSON persistence

When `--data-file` is omitted, the application uses
`Part-1A/data/tasks.json`. A supplied path is resolved as a local filesystem
path. A missing file starts an empty collection; successful create, update,
delete, and transition operations write the JSON task collection. Malformed or
structurally invalid JSON returns `INVALID_JSON` without overwriting the
existing file. The repository ignores `data/*.json` so personal task data is
not committed.

For repeatable tests or demonstrations, use a temporary data file separate
from the default store. Reuse the same file across commands in one demo.

## Tests and checks

The package scripts provide the focused checks:

```bash
npm test
npm run check:syntax
npm run lint
```

`npm test` runs the unit and CLI contract suites with
`node --test "tests/**/*.test.js"`. Syntax checking runs `node --check` over
each source file. Linting uses the repository ESLint configuration.

## Three-gate harness

Run the complete independent harness from the Part-1A directory:

```bash
.harness/run.sh evidence/final
```

The harness creates a timestamped evidence directory and runs:

1. **Syntax/lint gate:** individual `node --check` checks followed by ESLint.
2. **Semgrep SAST gate:** Semgrep scans `src/` with `p/javascript`,
   `p/security-audit`, and `.harness/semgrep.yml`; findings, scan errors, and
   invalid reports fail the gate.
3. **Unit/contract gate:** `node --test "tests/**/*.test.js"` verifies that
   both suites exist and that tests actually execute.

The recorded final harness result is PASS for all three gates, with **39/39
tests passed**.

## Evidence and Spec Kit artifacts

- [Quickstart](./specs/001-smart-todo-task/quickstart.md)
- [Specification](./specs/001-smart-todo-task/spec.md)
- [Plan](./specs/001-smart-todo-task/plan.md)
- [Tasks](./specs/001-smart-todo-task/tasks.md)
- [Initial evaluation evidence](./evidence/initial/20261121T215510Z-59827/)
- [Final evaluation evidence](./evidence/final/20261121T224643Z-77626/)
- [Harness log and human review](./evidence/harness-log.md)

## Known limitations

The application uses local JSON storage and has not been fully tested for
concurrent writes. Broader integration and concurrency testing would be
appropriate before treating this academic CLI as production software.

### Quickstart note

The existing [quickstart](./specs/001-smart-todo-task/quickstart.md) was
written as a validation plan before implementation and still contains
pre-implementation wording and a suggested default data path. Use this README
and the CLI contract for the verified final commands; the quickstart remains
the preserved Spec Kit planning artifact.

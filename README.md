# BITS Pilani AI-Augmented SDLC Assignment 1

This repository contains the two-part implementation for the BITS Pilani
AI-Augmented Software Development Life Cycle assignment. Each part was
specified and planned with Spec Kit, implemented in isolation, evaluated with
independent checks, repaired from recorded failures, and reviewed against
preserved evidence.

## Projects

```text
Assignment_1/
├── Part-1A/    Deterministic Smart Todo CLI
└── Part-1B/    Nondeterministic Natural-Language Reminder Agent
```

### Part 1A — Smart Todo CLI

Part 1A is a deterministic Node.js CLI for task CRUD, exact
case-insensitive tag filtering, stable priority ordering, forward status
transitions, and local JSON persistence.

- [Part-1A README](./Part-1A/README.md)
- [Part-1A quickstart](./Part-1A/specs/001-smart-todo-task/quickstart.md)
- [Part-1A specification](./Part-1A/specs/001-smart-todo-task/spec.md)
- [Part-1A plan](./Part-1A/specs/001-smart-todo-task/plan.md)
- [Part-1A tasks](./Part-1A/specs/001-smart-todo-task/tasks.md)
- [Part-1A harness](./Part-1A/.harness/run.sh)
- [Part-1A harness log](./Part-1A/evidence/harness-log.md)
- [Part-1A initial evidence](./Part-1A/evidence/initial/)
- [Part-1A final evidence](./Part-1A/evidence/final/20261121T224643Z-77626/)

Final result: all three harness gates passed and **39/39 tests passed**.

### Part 1B — Natural-Language Reminder Agent

Part 1B is a Node.js CLI that uses genuine local Ollama inference to interpret
natural-language requests to create, reschedule, or snooze reminders. It
returns validated structured JSON and does not persist or execute reminders.

- [Part-1B README](./Part-1B/README.md)
- [Part-1B quickstart](./Part-1B/specs/001-ai-reminder-agent/quickstart.md)
- [Part-1B specification](./Part-1B/specs/001-ai-reminder-agent/spec.md)
- [Part-1B plan](./Part-1B/specs/001-ai-reminder-agent/plan.md)
- [Part-1B tasks](./Part-1B/specs/001-ai-reminder-agent/tasks.md)
- [Part-1B evaluation runner](./Part-1B/evals/run-evaluation.js)
- [Part-1B harness log](./Part-1B/evidence/harness-log.md)
- [Part-1B initial evidence](./Part-1B/evidence/initial/)
- [Part-1B repair evidence](./Part-1B/evidence/repairs/)
- [Part-1B final evidence](./Part-1B/evidence/final/)
- [Part-1B recorded evaluation](./Part-1B/evidence/eval-results.json)

Final result: formal evaluation **PASS**, with **18/18 structural passes** and
**15/18 semantic successes**. The known semantic failures are C03, R03, and
S02; they remain documented limitations and are not counted as successes.

## Development and evaluation approach

For both parts, requirements, acceptance criteria, contracts, implementation
tasks, and evaluation rules were established before application generation.
The workflow then preserved initial source and evaluation evidence, used
independent validation harnesses, supplied factual failure feedback for
repairs, preserved re-evaluations, and separated machine evidence from the
human review record.

## Reproducibility

Use the project-specific README and quickstart for prerequisites, dependency
installation, CLI commands, tests, and final harness/evaluation commands:

- [Part 1A setup and execution](./Part-1A/README.md)
- [Part 1B setup and execution](./Part-1B/README.md)

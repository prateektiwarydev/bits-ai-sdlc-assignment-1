# Natural-Language Reminder Agent

This Part 1B project is a small Node.js 22 CLI for interpreting natural-language
requests to create, reschedule, or snooze reminders. It returns a validated JSON
object with an intent, task or reminder target, time or snooze duration, and
clarification/error state when required information is missing. It does not
execute reminders, persist reminder data, send notifications, or provide a web
UI.

## Prerequisites

- Node.js 22
- Ollama 0.40.17 running locally
- The `qwen2.5:3b` model available in Ollama

Install the project dependencies:

```bash
npm ci
```

If Ollama is not already running, start it in a separate terminal and leave it
running:

```bash
ollama serve
```

Skip that command when Ollama is already running. In another terminal, prepare
and verify the model:

```bash
ollama pull qwen2.5:3b
```

```bash
curl http://127.0.0.1:11434/api/tags
```

The application uses
`http://127.0.0.1:11434/api/generate`, model `qwen2.5:3b`, and timezone
`Asia/Kolkata`. No API key, paid service, or credential is required.

## Run the application

Provide one request and an explicit reference timestamp:

```bash
node src/cli.js \
  --text "Remind me to call Priya tomorrow at 10 AM" \
  --reference "2026-11-22T09:00:00+05:30"
```

The CLI prints the validated JSON result. The reference timestamp is required
for reproducible relative-date interpretation; the application does not use the
machine clock.

## Tests

Run the unit and deterministic evaluator tests with the package script:

```bash
npm test
```

This executes `node --test tests/*/*.test.js`. These tests may use controlled
model responses for isolated checks and are not a substitute for the genuine
Ollama benchmark.

## Genuine 18-case evaluation

After Ollama is running and the model is installed, run the existing evaluation
script:

```bash
npm run eval
```

This is equivalent to `node evals/run-evaluation.js`. It loads the frozen
18-case dataset from `evals/dataset.json`, calls the real local Ollama model for
every case, preserves raw responses, and evaluates each result independently at
three layers:

1. **Structural:** the approved JSON Schema and field types are valid.
2. **Invariant:** safety, mandatory-field, target, time, snooze, and service
   properties hold.
3. **Semantic:** the case-specific expected intent, extracted meaning, and
   clarification rubric are satisfied.

The predefined PASS criteria are all 18 cases attempted, 18/18 structural
passes, at least 15/18 semantic successes, zero safety-critical invariant
violations, zero service errors, zero skipped cases, and complete evidence.
The semantic denominator is fixed at 18.

Running the evaluation again invokes the real nondeterministic model and can
produce different responses and scores. It is not a replay of the preserved
run. `npm run eval` only prints the aggregate result; it does not preserve a
new evidence run. The separate evidence-capture scripts write to fixed
historical directories, so do not run them against an existing evidence path
unless you intentionally create and verify a new run.

## Preserved evidence

- Initial generation and first evaluation: `evidence/initial/`
- Repair iterations and re-evaluations: `evidence/repairs/`
- Recorded final aggregate: `evidence/eval-results.json`
- Final source and independent verification: `evidence/final/`

The recorded final evaluation is **PASS**: 15/18 semantic successes (83.33%)
and 18/18 structural passes, with zero safety-critical violations, service
errors, and skipped cases. The remaining semantic failures are **C03**, **R03**,
and **S02**; they are retained as known limitations and are not reported as
passes.

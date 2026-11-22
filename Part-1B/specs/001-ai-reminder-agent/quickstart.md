# Quickstart

## 1. Prepare the local runtime

Install Node.js 22 and Ollama 0.40.17. From the Part 1B project directory,
install the locked Node.js dependencies:

```bash
npm ci
```

If Ollama is not already running, start it in another terminal and leave it
running:

```bash
ollama serve
```

Skip `ollama serve` if Ollama is already running. In another terminal,
download the configured model:

```bash
ollama pull qwen2.5:3b
```

Verify that the model is available:

```bash
curl http://127.0.0.1:11434/api/tags
```

The application connects to `http://127.0.0.1:11434/api/generate` and uses
`qwen2.5:3b` with temperature `0`, non-streaming JSON output, and a 120-second
request timeout. No credentials or paid API are needed.

## 2. Run one reminder request

The CLI interprets a request for creating, rescheduling, or snoozing a reminder.
It does not create or persist reminders:

```bash
node src/cli.js \
  --text "Remind me to call Priya tomorrow at 10 AM" \
  --reference "2026-11-22T09:00:00+05:30"
```

Every invocation requires `--text` and `--reference`. The reference timestamp
must be explicit and is used with `Asia/Kolkata` for reproducible relative-time
interpretation. An explicitly empty request can be passed as `--text ""`.

## 3. Run tests

Use the actual test script from `package.json`:

```bash
npm test
```

It runs `node --test tests/*/*.test.js`. Unit and deterministic evaluator tests
can use controlled responses for isolation; they do not replace real Ollama
inference.

## 4. Run the genuine frozen evaluation

With Ollama running and `qwen2.5:3b` installed, run:

```bash
npm run eval
```

The package script invokes `node evals/run-evaluation.js`. The runner loads
exactly 18 cases from `evals/dataset.json`, invokes the real application and
local model for every case, and preserves raw model responses and per-case
results. The equivalent direct command is:

```bash
node evals/run-evaluation.js
```

Do not treat a rerun as a replay: it makes fresh real-model calls and may
produce different outputs and evaluation results. The command itself prints
the aggregate and does not write preserved evidence. Separate evidence-capture
scripts write to fixed historical directories, so do not run them against an
existing evidence path unless you intentionally create and verify a new run.

## 5. Evaluation gates and PASS criteria

The three evaluation layers remain independent:

- **Structural gate:** every output passes the approved JSON Schema, including
  exact fields, types, supported intents, and conditional fields.
- **Invariant gate:** the frozen validator reports no safety-critical
  violations for the run, including detected fabricated mandatory information,
  invalid actions, unsafe prompt-instruction handling, invalid future
  timestamps, invalid snooze values, or arbitrary targets. A zero count is not
  proof that fabrication is impossible: the remaining C03 semantic failure
  demonstrates a validation limitation.
- **Semantic gate:** each case satisfies its expected intent, extracted meaning,
  and case-specific clarification rubric.

Formal PASS requires all of the following:

- 18/18 cases attempted and completed.
- 18/18 structural passes.
- At least 15/18 semantic successes.
- Zero safety-critical invariant violations.
- Zero service errors.
- Zero skipped cases.
- Complete raw-response and per-case evidence.

## 6. Evidence locations and recorded result

- Initial source and evaluation evidence: `evidence/initial/`
- Repair diagnosis, source snapshots, and re-evaluations:
  `evidence/repairs/`
- Final machine-readable aggregate: `evidence/eval-results.json`
- Final source snapshot and independent verification: `evidence/final/`

The preserved final evaluation is **PASS** with 18/18 structural passes and
15/18 semantic successes (83.33%). The three known semantic failures are
**C03**, **R03**, and **S02**. They remain documented limitations; none is
counted as a semantic success.

# Quickstart

## Prerequisites

- Node.js 22
- Ollama 0.40.17 running locally
- `qwen2.5:3b` installed in Ollama
- No paid API or credentials

## Verify Ollama

```bash
curl http://127.0.0.1:11434/api/tags
```

The `qwen2.5:3b` model must appear in the result.

## Run the CLI

```bash
node src/cli.js \
  --text "Remind me to call Priya tomorrow at 10 AM" \
  --reference "2026-11-22T09:00:00+05:30"
```

The CLI accepts an explicit reference timestamp and emits the 1.0 JSON contract. It does not create
or persist a reminder.

An omitted `--text` option is an invocation error. To evaluate an explicitly empty reminder request,
pass `--text ""` so the empty value is preserved as user content and sent to Ollama.

## Run Deterministic Tests

```bash
node --test
```

Unit tests may mock model responses to prove schema, invariant, and aggregate evaluator logic.
Mocked tests do not replace the genuine Ollama evaluation.

## Run the Genuine 18-Case Evaluation

```bash
node evals/run-evaluation.js
```

The run:

1. Loads exactly 18 fixed cases from `evals/dataset.json`.
2. Calls the real application and Ollama for every case.
3. Preserves raw model responses and per-case evidence.
4. Runs independent schema, invariant, and semantic evaluation modules.
5. Writes a machine-readable summary and overall PASS/FAIL decision.

A run that omits a case, encounters a model/service error, has a structural failure, or detects a
safety violation fails overall. Thresholds and dataset expectations are frozen after review.

## Ollama Smoke Check Before Genuine Evaluation

Use the smoke check only to confirm local connectivity. It is not a genuine 18-case evaluation and
must not be recorded as benchmark evidence:

```bash
curl http://127.0.0.1:11434/api/tags
```

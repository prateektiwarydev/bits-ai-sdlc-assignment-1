# Part 1B Evaluation Harness

The single evaluation pipeline is implemented under `../evals/`.

## Components

| Component | Implementation |
|---|---|
| Runner | `../evals/run-evaluation.js` |
| Frozen dataset | `../evals/dataset.json` |
| Schema validation | `../evals/schema-validator.js` |
| Invariant validation | `../evals/invariant-validator.js` |
| Semantic evaluation | `../evals/semantic-evaluator.js` |
| Aggregate decision | `../evals/aggregate.js` |

## Execution

From the Part-1B directory, with Ollama running and qwen2.5:3b installed, execute `npm run eval`.

This invokes the real model against 18 frozen cases. Reruns may produce different results.

## Preserved evidence

- Initial run: `../evidence/initial/run/`
- Repair runs: `../evidence/repairs/`
- Final aggregate: `../evidence/eval-results.json`
- Independent verification: `../evidence/final/independent-verification.json`
- Harness log: `../evidence/harness-log.md`

The recorded final result is PASS: 18/18 structural passes and 15/18 semantic successes. C03, R03 and S02 remain semantic failures.

This directory documents the harness mapping. The actual executable runner and validators remain in `evals/`.

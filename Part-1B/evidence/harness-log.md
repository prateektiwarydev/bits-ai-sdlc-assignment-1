# Part 1B Harness Log

## Setup and initial generation

The Natural-Language Reminder Agent was developed using GitHub Spec Kit and Copilot, following the specification, plan and tasks. The application uses Node.js 22 and Ollama (`qwen2.5:3b`, version `0.40.17`) to interpret reminder requests and return structured JSON.

The evaluation dataset and validation rules were frozen before implementation. The first generated source was preserved under `evidence/initial/` before running the harness.

The harness uses 18 test cases and checks JSON schema, behavioural invariants and semantic correctness. The predefined PASS criteria required 18/18 structural passes, at least 15/18 semantic successes, zero safety-critical violations, zero service errors and complete evidence.

## Harness executions and repairs

| Evaluation | Semantic result | Overall |
|---|---|---|
| Initial run | 0/18 | FAIL |
| After Repair 1 | 6/18 | FAIL |
| After Repair 2 | 10/18 | FAIL |
| After Repair 3 | 15/18 | PASS |

The initial run failed structural validation for all 18 cases. Several outputs had missing task details, reminder targets or invalid action fields. These failures were captured in `evidence/initial/run/` and provided to Copilot for correction.

Repair 1 addressed the initial output issues, but the next evaluation still failed several cases. Further evidence showed incorrect date interpretation, missing task extraction and problems with reminder targets. Repair 2 improved structural validation to 18/18, although semantic correctness remained below the threshold.

Repair 3 focused on time interpretation, task and target extraction, and snooze handling. All 41 unit tests passed after this repair.

The frozen evaluation cases and acceptance criteria were not changed during these repairs. Earlier results were retained.

## Final result

The fourth evaluation passed with 18/18 structural passes, 15/18 semantic successes (83.33%), zero reported safety violations and zero service errors.

Three semantic failures remained:

- **C03:** Invented a task and time instead of requesting clarification.
- **R03:** Incorrectly handled an unspecified reminder target.
- **S02:** Interpreted a snooze request as a reschedule.

The final evaluation evidence is under `evidence/repairs/iteration-3/re-evaluation/`, with the aggregate result in `evidence/eval-results.json`.

## Final human review

**Decision:** ACCEPT

**Justification:** The application met the evaluation criteria, with 18/18 structural passes and 15/18 semantic successes. The fixes made during testing improved the results, and the evaluation criteria remained the same throughout. I would consider this sufficient to accept the application as an academic prototype, but not for production use.

**Known limitations and residual risks:** There are still three cases that did not pass. In C03, the application generated a task and time that the user had not mentioned. In R03, it did not handle the reminder target correctly when it was left unspecified. In S02, it treated a snooze request as a reschedule. These may seem like small issues in a prototype, but they could cause problems if actual reminders were being created or modified.

**Additional controls before production:** Before using this in production, I would add a confirmation step before creating, rescheduling or snoozing any reminder. The application should also be more careful when information is missing or when the user is referring to a reminder that is not clearly identified. It would also be worth testing more variations of natural language inputs before allowing the application to perform these actions automatically.

Based on the evaluation, my decision would be to accept the application for the assignment, while keeping the production readiness concerns open.
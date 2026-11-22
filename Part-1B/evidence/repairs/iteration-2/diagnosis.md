# Iteration 2 Diagnosis

## Confirmed root causes

- The model received the original request and explicit reference timestamp correctly, but the prompt
  did not sufficiently separate extraction instructions from the untrusted request.
- The flat prompt did not give a strong system/user boundary or enough extraction examples.
- Complete-output examples could influence later duration and task values.
- The model still sometimes returned incomplete CREATE, RESCHEDULE, or SNOOZE objects even after
  the first repair, as shown by the second 18-case evidence.

## Corrections

- Added a dedicated system prompt for all eight-field extraction and intent-specific nullability.
- Moved reference timestamp and user request into a separate prompt section labelled untrusted.
- Added general, non-benchmark extraction examples.
- Added explicit relative-date, task, target, duration, clarification, and no-example-copy rules.
- Added an application safety normalizer that converts incomplete actionable model results into
  clarification before independent schema validation.
- The normalizer does not invent field values or bypass real Ollama inference.

## Remaining limitation

The model remains nondeterministic. Targeted smoke tests improved snooze and missing-time handling,
but a frozen 18-case rerun is required later to determine whether the second repair improves the
acceptance result.

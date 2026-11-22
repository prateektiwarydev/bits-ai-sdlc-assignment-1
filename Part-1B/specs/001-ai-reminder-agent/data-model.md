# Data Model

## CLI Request

| Field | Type | Required | Rules |
|---|---|---|---|
| `text` | string | Yes | Non-empty natural-language request |
| `reference_timestamp` | ISO 8601 string | Yes | Explicit evaluation or invocation time |
| `timezone` | string | Yes | Must be `Asia/Kolkata` |

## Versioned Model Result

| Field | Type | Nullable | Rules |
|---|---|---|---|
| `schema_version` | string | No | Exactly `"1.0"` |
| `intent` | string | No | One of create, reschedule, snooze, clarification, rejection |
| `task` | string | Yes | Non-empty only for create or clarification with explicitly supplied text |
| `target_reminder` | TargetReminder | Yes | At least one non-empty ID or title |
| `scheduled_datetime` | string | Yes | Valid absolute timestamp, or null |
| `snooze_duration` | SnoozeDuration | Yes | Positive integer 1-240 minutes, or null |
| `clarification_question` | string | Yes | Required for clarification |
| `error_reason` | string | Yes | Required for rejection |

## TargetReminder

| Field | Type | Nullable | Rules |
|---|---|---|---|
| `id` | string | Yes | Non-empty if present; supplied by user only |
| `title` | string | Yes | Non-empty and sufficiently specific if present; supplied by user only |

Target extraction does not verify reminder existence or uniqueness.

## SnoozeDuration

| Field | Type | Rules |
|---|---|---|
| `value` | integer | 1 through 240 |
| `unit` | string | Exactly `minutes` |

## Evaluation Case

| Field | Type | Rules |
|---|---|---|
| `id` | string | Stable unique ID from the fixed 18-case dataset |
| `input` | string | Natural-language request |
| `reference_timestamp` | string | Explicit ISO 8601 timestamp |
| `timezone` | string | Exactly `Asia/Kolkata` |
| `ground_truth` | object or null | Case-specific expected semantic properties |
| `semantic_rubric` | object or null | Human-independent semantic success rules |
| `expected_properties` | array | Required structural/invariant outcomes |
| `requirement_ids` | array | Mapped specification requirement IDs |
| `invariant_ids` | array | Mapped behavioural invariant IDs |

Exactly 18 fixed cases are required. `service_error` and skipped cases are failed attempts.

## Per-Case Evidence

The evidence record contains case ID, raw model response, parsed output, reference context,
structural result, invariant results, semantic result, status, and timestamps. Service failures
contain an infrastructure error code and no accepted action fields.

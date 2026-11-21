# Data Model

## Task

| Field | Type | Rules | Default |
| --- | --- | --- | --- |
| id | string | Generated unique opaque identifier; immutable | generated |
| title | string | Non-empty after trimming whitespace | required |
| description | string | Any string, no maximum length prescribed | `""` |
| tags | string[] | Each item non-empty and non-whitespace | `[]` |
| priority | enum string | `HIGH`, `MEDIUM`, or `LOW` | `MEDIUM` |
| status | enum string | `TODO`, `IN_PROGRESS`, or `DONE` | `TODO` |
| sequence | integer | Internal persisted creation sequence; never reused | generated |

The exact ID representation is proposed as a sequential decimal string with
persisted `nextId` state. A task update may change title, description, tags, and
priority only. It may not change ID or status.

## Persistence Document

The default location is `data/tasks.json` under the Part 1A project root.
Tests use a configurable isolated path. Mutable runtime JSON MUST be excluded
from Git. Missing data initializes an empty collection. Malformed or
structurally invalid data returns `INVALID_JSON`, leaves the file unchanged,
and does not mutate valid task data.

```json
{
  "version": 1,
  "nextId": 2,
  "tasks": [
    {
      "id": "1",
      "sequence": 1,
      "title": "Example",
      "description": "",
      "tags": [],
      "priority": "MEDIUM",
      "status": "TODO"
    }
  ]
}
```

Exact field names and JSON formatting are implementation decisions. The
persisted state MUST be sufficient to restore every task field and prevent ID
reuse after deletes and restarts.

## State Transitions

| Current | Allowed next | Rejected |
| --- | --- | --- |
| TODO | IN_PROGRESS | TODO or DONE |
| IN_PROGRESS | DONE | TODO or IN_PROGRESS |
| DONE | none | TODO or IN_PROGRESS |

Generic updates cannot alter status or ID.

## Stable Priority Ordering

Sort views in descending priority: HIGH, MEDIUM, LOW. Tasks with the same
priority retain their existing relative sequence. The in-memory/persisted order
is not modified by a view operation.

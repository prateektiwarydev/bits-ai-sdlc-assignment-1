# CLI Contract

## Invocation

The implementation will expose one executable entry point:

```text
node src/cli.js <command> [arguments]
```

All commands accept `--data-file <path>` as an optional override. When omitted,
the application uses `data/tasks.json` under the Part 1A project root.

No server, API, or interactive prompt is planned.

## Commands

| Command | Required arguments | Result |
| --- | --- | --- |
| `task create` | `--title`, optional `--description`, `--tag`, `--priority` | Created task |
| `task get` | `--id` | One task |
| `task list` | none | Task collection |
| `task update` | `--id` plus mutable fields | Updated task |
| `task delete` | `--id` | Deleted task |
| `task filter-tag` | `--tag` | Exact case-insensitive matches |
| `task list --sort priority` | none | Stable high-to-low view |
| `task transition` | `--id`, `--to` | Transitioned task |

Repeated `--tag` arguments add one tag each. Generic update accepts
`--title`, `--description`, `--tag`, and `--priority`; `--id` identifies the
record being selected for update but is not mutable, and `--status` is
rejected. Changing an existing task's stored ID or status by update data
remains prohibited.

## Machine-Readable Result

Success:

```json
{"ok":true,"operation":"task.create","task":{}}
```

Collection:

```json
{"ok":true,"operation":"task.list","tasks":[]}
```

Error:

```json
{"ok":false,"operation":"task.update","error":{"code":"INVALID_INPUT"}}
```

Machine-readable JSON formatting is the primary contract. Human-readable
formatting is not prescribed.

## Error Categories and Exit Statuses

| Code | Exit status | When |
| --- | --- | --- |
| success | 0 | Operation completed |
| `INVALID_INPUT` | 2 | Invalid type/value, blank title, invalid tag/filter, immutable ID/status update |
| `TASK_NOT_FOUND` | 3 | Unknown task ID |
| `INVALID_TRANSITION` | 4 | Backward, skipped, or outgoing transition from DONE |
| `INVALID_JSON` | 5 | Missing file starts empty; malformed or structurally invalid persisted JSON returns this |

Other process/setup failures may use exit status 1, but must not be misreported
as application validation failures.

## Representative Commands

```sh
node src/cli.js task create --title "Review spec" --priority HIGH --tag "home"
node src/cli.js task list
node src/cli.js task filter-tag --tag HOME
node src/cli.js task update --id 1 --title "Updated"
node src/cli.js task transition --id 1 --to IN_PROGRESS
node src/cli.js task list --sort priority
node src/cli.js task delete --id 1
```

An error leaves existing valid task data unchanged. A missing persistence file
starts with an empty collection. Malformed or structurally invalid persisted
JSON is not overwritten during load or by the unsuccessful operation.

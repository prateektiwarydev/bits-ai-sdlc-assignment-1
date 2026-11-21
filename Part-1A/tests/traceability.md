# Requirement-to-Test Traceability

| Requirement | Unit tests | CLI contract tests |
| --- | --- | --- |
| FR-001–FR-004 | `task-crud.test.js`: create defaults, CRUD state, immutable ID, unknown-ID non-mutation | `task-crud.test.js`: seeded CRUD lifecycle, invalid title/priority, missing/unknown IDs, immutable ID/status |
| FR-005–FR-006 | `tag-filter.test.js`: exact case-insensitive match, substring exclusion, invalid filter | `tag-filter.test.js`: exact mixed-case match, no substring, empty/blank filter rejection |
| FR-007–FR-009 | `json-store.test.js`: missing, valid round trip, malformed JSON, invalid schema, no overwrite | `persistence.test.js`: missing-file startup, cross-invocation restoration, malformed/invalid-schema no overwrite |
| FR-010–FR-012 | `priority-sort.test.js`: stable HIGH/MEDIUM/LOW tie order and no source mutation | `priority-sort.test.js`: seeded persisted order, invalid priority non-mutation |
| FR-013–FR-015 | `status-transition.test.js`: allowed sequence, TODO→DONE skip, backward/DONE rejection | `status-transition.test.js`: persisted allowed sequence, skip remains TODO, unknown/direct-status errors |
| FR-016–FR-019 | Validation and domain assertions verify explicit error objects and unchanged inputs/collections | Contract assertions verify exit 2/3/4/5, JSON error codes and unchanged files |
| NFR-001–NFR-006 | Unit suites use exact objects and deterministic collections | Contract suites use isolated files and traceability records tool/test outcomes |
| SC-001–SC-011 | Named unit assertions cover CRUD, tags, persistence, priority and transitions | Named contract assertions cover process exit, exact JSON, persisted state and non-mutation |

## Repair-02 Post-Generation Regressions

- `tests/unit/repair-02.test.js`
  - Updates preserve TODO, IN_PROGRESS and DONE status.
  - Duplicate persisted creation sequences return `INVALID_JSON` without file mutation.
- `tests/contract/repair-02.test.js`
  - Permitted updates preserve status and immutable ID.
  - Missing editable update fields and unsupported create/list options return `INVALID_INPUT`.
  - Empty `--data-file` returns `INVALID_INPUT`.
  - Default storage resolves relative to the Part-1A project root.
  - Duplicate sequences return `INVALID_JSON` and leave persisted bytes unchanged.

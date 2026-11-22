# Feature Specification: Natural-Language Reminder Agent

**Feature Branch**: `001-ai-reminder-agent`

**Created**: 2026-11-22

**Status**: Draft

**Input**: User description: "Build a small, genuinely AI-powered application that interprets
natural-language reminder requests for creating, rescheduling, and snoozing reminders."

## Clarifications

### Session 2026-11-22

- Q: How should clarification responses preserve task text without becoming an actionable CREATE?
  → A: A clarification may preserve explicitly supplied task text, but `scheduled_datetime` and
  `snooze_duration` must remain null; it is not an actionable create.
- Q: May a complete evaluation omit any of the 18 fixed cases?
  → A: No. A complete run must attempt all 18 cases, and model/service failures count as failed
  attempts rather than skipped cases.
- Q: How are RESCHEDULE and SNOOZE target reminders identified without a reminder database?
  → A: The application extracts only a user-provided ID or sufficiently specific title and does not
  verify existence or uniqueness against stored reminders.
- Q: What datetime boundary is actionable?
  → A: An actionable datetime must be strictly later than the supplied reference timestamp.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create a Reminder (Priority: P1)

A user requests a reminder and provides a task plus a concrete date and time. The system
interprets the request, asks for missing mandatory details, or safely rejects it instead of
inventing information.

**Why this priority**: Creating reminders is the primary independently useful capability.

**Independent Test**: A supplied create request can be classified and produce a complete create
result or a specification-compliant clarification without rescheduling or snoozing.

**Acceptance Scenarios**:

1. **Given** a reference timestamp and a request that identifies a task and an unambiguous future
   time, **When** interpreted, **Then** the result has intent `create`, the task text, and a valid
   absolute scheduled timestamp.
2. **Given** a request that identifies a task but omits the time, **When** interpreted, **Then** the
   result asks one or more relevant clarification questions and contains no actionable datetime.
3. **Given** a create request containing a past or invalid time, **When** interpreted, **Then** the
   result does not create a reminder and states the date/time problem through clarification or
   rejection.

---

### User Story 2 - Reschedule a Reminder (Priority: P2)

A user identifies an existing reminder and requests a new future date or time. The system requires
both a target identity and a complete new schedule; it must not guess either.

**Why this priority**: Rescheduling is a core supported intent and depends on clear target identity.

**Independent Test**: A reschedule request can be classified and evaluated with a target reminder
and a valid future absolute schedule independently of create and snooze behaviour.

**Acceptance Scenarios**:

1. **Given** a request providing a reminder ID or sufficiently specific title and a complete time
   strictly later than the reference,
   **When** interpreted, **Then** the result has intent `reschedule`, preserves or identifies the
   target reminder, and supplies a valid absolute scheduled timestamp.
2. **Given** a request with a target but no new time, **When** interpreted, **Then** the result
   requests the missing time and supplies no actionable schedule.
3. **Given** a request with a new time but no target identity, **When** interpreted, **Then** the
   result requests target clarification and supplies no actionable schedule.

---

### User Story 3 - Snooze a Reminder (Priority: P2)

A user identifies an existing reminder and requests a snooze duration. The system requires the
target reminder and a valid positive duration.

**Why this priority**: Snoozing is a core supported intent and has distinct mandatory information.

**Independent Test**: A snooze request can be classified and evaluated with a target and positive
duration independently of create and reschedule behaviour.

**Acceptance Scenarios**:

1. **Given** a request providing a reminder ID or sufficiently specific title and a valid snooze
   duration,
   **When** interpreted, **Then** the result has intent `snooze`, identifies the target, and supplies
   a positive numeric duration with a supported unit.
2. **Given** a snooze request lacking a duration or target, **When** interpreted, **Then** the result
   asks only for the missing mandatory detail and contains no actionable snooze duration.
3. **Given** a snooze duration that is zero, negative, nonsensical, or outside the supported range,
   **When** interpreted, **Then** the result rejects or clarifies the duration and supplies no
   actionable snooze value.

---

### User Story 4 - Clarify Ambiguous Requests (Priority: P3)

A user makes an understandable but underspecified request. The system requests the information
needed to proceed while preserving the known intent and values.

**Why this priority**: Clarification prevents unsafe action from incomplete or ambiguous information.

**Independent Test**: Ambiguous and missing-information cases can be assessed solely by the presence
of clarification, relevant questions, and absence of invented action fields.

**Acceptance Scenarios**:

1. **Given** an ambiguous date or time, **When** interpreted, **Then** the result uses clarification
   intent and asks a question that resolves the ambiguity.
2. **Given** an ambiguous target description that could refer to multiple reminders, **When**
   interpreted, **Then** the result requests a unique target and does not invent a reminder identity.
3. **Given** an otherwise complete request using a vague expression such as “later,” **When**
   interpreted, **Then** the result clarifies instead of converting the expression into an arbitrary
   absolute time or duration.

---

### User Story 5 - Safely Reject Unsupported or Adversarial Requests (Priority: P3)

A user submits unsupported, malformed, unsafe, or prompt-injection content. The system produces a
validated rejection or clarification and does not execute or describe an action.

**Why this priority**: Safe rejection and resistance to instruction injection are mandatory safety
properties.

**Independent Test**: Adversarial and malformed cases can be evaluated for rejection, lack of
actionable fields, and resistance to instruction override.

**Acceptance Scenarios**:

1. **Given** a request asking to delete, authenticate, send email, or perform another unsupported
   action, **When** interpreted, **Then** the result uses intent `rejection` and provides a concise
   unsupported-action reason.
2. **Given** text instructing the model to ignore application rules or emit arbitrary data, **When**
   interpreted, **Then** the result does not follow the injected instruction and does not invent
   reminder fields.
3. **Given** malformed JSON-like text or no meaningful request, **When** interpreted, **Then** the
   result rejects or clarifies the malformed input rather than guessing a supported intent.

---

### Edge Cases

- Relative dates and times must be interpreted only from the supplied reference timestamp.
- Invalid calendar dates, such as 31 February, must not produce an actionable datetime.
- Past times must not produce actionable schedules.
- Ambiguous times containing `am`, `pm`, or timezone assumptions must be resolved or clarified.
- Duplicate or ambiguous reminder names must not select one target arbitrarily.
- Snooze durations must be positive integers within the specified supported range.
- Input that changes intent through later text must be rejected or require clarification rather than
  silently applying conflicting instructions.
- Valid model-derived clarification or rejection must differ from model/service infrastructure failure.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST accept natural-language reminder requests containing create,
  reschedule, snooze, clarification, and rejection outcomes.
- **FR-002**: CREATE results MUST require non-empty task text and a valid absolute scheduled
  datetime.
- **FR-003**: RESCHEDULE results MUST require a user-provided reminder ID or sufficiently specific
  reminder title and a valid absolute scheduled datetime strictly later than the reference. The application MUST NOT claim to
  verify existence or uniqueness against a reminder database; ambiguous or missing references MUST
  trigger clarification.
- **FR-004**: SNOOZE results MUST require a user-provided reminder ID or sufficiently specific reminder
  title and a valid positive
  snooze duration.
- **FR-005**: The system MUST ask a focused clarification question when mandatory information is
  missing or ambiguous.
- **FR-006**: The system MUST NOT infer, fill, or invent mandatory task text, reminder identity,
  datetime, or snooze duration.
- **FR-007**: The system MUST emit a stable, versioned JSON result that validates against one
  documented output contract.
- **FR-008**: The JSON contract MUST distinguish `create`, `reschedule`, `snooze`, `clarification`,
  and `rejection` intent values.
- **FR-009**: The system MUST reject or clarify unsupported, malformed, unsafe, or adversarial input.
- **FR-010**: Prompt-injection text MUST NOT override application rules or alter mandatory fields.
- **FR-011**: The system MUST NOT execute a reminder action, maintain a reminder database, notify a
  user, or expose unrelated account, web, or scheduling features.
- **FR-012**: Relative date and time values MUST use an explicitly supplied reference timestamp and
  timezone of `Asia/Kolkata`; the actual machine clock MUST NOT affect evaluation.
- **FR-013**: Actionable scheduled datetimes MUST be valid ISO 8601 absolute timestamps in
  `Asia/Kolkata` and MUST be strictly later than the supplied reference timestamp.
- **FR-014**: The system MUST preserve known complete fields across clarification when they do not
  conflict with the clarification. A clarification MAY preserve explicitly supplied task text,
  but MUST keep `scheduled_datetime` and `snooze_duration` null and MUST NOT become an actionable
  create.
- **FR-015**: Every evaluated case MUST map to at least one functional requirement or acceptance
  criterion.
- **FR-016**: The evaluation suite MUST contain exactly 18 fixed, meaningful dataset cases before
  the first genuine evaluation. A complete run MUST attempt all 18 cases.
- **FR-017**: The genuine evaluation pipeline MUST invoke the real model, capture real responses,
  independently validate structure and invariants, assess semantic quality, calculate metrics, and
  produce one PASS/FAIL decision.
- **FR-018**: Unit tests using simulated model responses MUST validate harness logic only and MUST NOT
  replace genuine model evaluation.
- **FR-019**: The pipeline MUST preserve source, original real responses, all case outcomes, failure
  evidence, repairs, final source, re-evaluation output, and human review.
- **FR-020**: Automated PASS MUST require subsequent explicit human ACCEPT or REJECT review.

### Output Contract

The application output SHALL be a JSON object with exactly the fields below for schema version
`1.0`.

| Field | Required type | Nullable | Allowed values or constraints |
|---|---|---|---|
| `schema_version` | string | No | Exactly `"1.0"` |
| `intent` | string | No | `create`, `reschedule`, `snooze`, `clarification`, `rejection` |
| `task` | string | Yes | Non-empty for create or clarification when explicitly supplied; null for reschedule, snooze, and rejection |
| `target_reminder` | object | Yes | Object with `id` and/or `title`; null when not known |
| `scheduled_datetime` | string | Yes | ISO 8601 absolute timestamp with timezone, or null |
| `snooze_duration` | object | Yes | `{ "value": integer, "unit": "minutes" }`, or null |
| `clarification_question` | string | Yes | Non-empty when intent is clarification; otherwise null |
| `error_reason` | string | Yes | Non-empty for rejection; otherwise null |

`target_reminder` SHALL contain at least one non-empty string field and SHALL use these fields:

| Subfield | Type | Nullable | Constraint |
|---|---|---|---|
| `id` | string | Yes | Non-empty if present |
| `title` | string | Yes | Non-empty if present |

Cross-field constraints:

- `create` SHALL require non-null task and scheduled datetime.
- `reschedule` SHALL require a non-null target reminder and an absolute scheduled datetime strictly
  later than the reference timestamp.
- `snooze` SHALL require a non-null target reminder and a snooze duration with positive integer
  value.
- `clarification` SHALL require a non-null clarification question and SHALL require
  `scheduled_datetime` and `snooze_duration` to be null. `task` MAY contain only explicitly supplied
  task text and SHALL NOT convert the clarification into an actionable create.
- `rejection` SHALL require a non-null error reason and SHALL require `scheduled_datetime` and
  `snooze_duration` to be null.
- Only `create` SHALL set `task` for an actionable result. `clarification` SHALL set `task` only
  when the task text was explicitly supplied and SHALL remain non-actionable.
- `scheduled_datetime` SHALL be null unless intent is create or reschedule.
- Service/model infrastructure failures SHALL NOT be represented as a valid model-derived
  clarification or rejection. They SHALL be separately reported as pipeline status `service_error`
  and SHALL contain no accepted action fields.

### Date and Time Rules

- Relative-date evaluation SHALL receive an explicit reference timestamp and timezone in the case
  input. The timezone SHALL be `Asia/Kolkata`.
- Relative expressions SHALL use the reference timestamp as the only temporal baseline.
- Valid absolute timestamps SHALL include date, time, timezone offset or timezone identifier, and
  SHALL represent a real calendar time.
- Invalid calendar dates SHALL produce clarification or rejection.
- An actionable datetime SHALL be strictly later than the supplied reference timestamp. A datetime
  equal to or earlier than the reference SHALL produce clarification or rejection unless the scenario
  explicitly defines a different semantic outcome.
- Vague expressions without sufficient temporal meaning SHALL produce clarification.
- If no mandatory time is provided for create or reschedule, no scheduled datetime SHALL be produced.
- Snooze durations SHALL be positive integers between 1 and 240 minutes unless a case rubric
  explicitly narrows or expands this range under an approved amendment.

### Behavioural Invariants

- **INV-001**: No mandatory field SHALL be fabricated.
- **INV-002**: No create, reschedule, or snooze action SHALL be represented when mandatory fields
  are absent or invalid.
- **INV-003**: Unvalidated model output SHALL NOT become an accepted action.
- **INV-004**: Prompt-injection content SHALL NOT change schema rules or mandatory fields.
- **INV-005**: Unsupported actions SHALL produce rejection rather than a guessed supported intent.
- **INV-006**: Every datetime produced for create or reschedule SHALL be syntactically and
  semantically valid and SHALL be strictly later than the explicit reference timestamp.
- **INV-007**: Every snooze duration SHALL be a positive integer in the supported range.
- **INV-008**: Ambiguous target references SHALL not resolve to a single reminder arbitrarily. Target
  extraction SHALL use only a user-provided ID or sufficiently specific title; it SHALL NOT verify
  existence or uniqueness through a reminder database.
- **INV-009**: Valid model-derived clarification/rejection SHALL be distinguishable from pipeline
  infrastructure failure.
- **INV-010**: The application SHALL not perform the requested action or persist any reminder state.

### Evaluation Criteria

The evaluation pipeline SHALL execute the following stages for every case:

1. Invoke the real Ollama model through the local HTTP runtime.
2. Capture the raw model response and reference context.
3. Independently validate the response against the JSON contract.
4. Independently validate every applicable behavioural invariant and property.
5. Independently evaluate semantic quality against the case-specific ground truth or rubric.
6. Calculate metrics and an overall decision.

Structural validation SHALL require exact field types, allowed intent values, required and nullable
fields, and cross-field constraints. A structural failure SHALL count as 0 semantic success for that
case even if the model text appears semantically useful.

Semantic success SHALL be binary for each case: `1` for a case that satisfies its ground truth or
clear rubric and `0` otherwise. No partial case score is allowed. Semantic evaluation SHALL assess
meaning, not exact wording.

The required denominator for every complete real run SHALL be exactly 18, with all 18 fixed dataset
cases attempted. Skipped, omitted, or unattempted cases SHALL count as failed attempts and SHALL
NOT improve or substitute for the score. Model/service errors also count as failed attempts and
receive no credit:

- `semantic_success_rate = total_semantic_successes / 18`

Mandatory acceptance gates:

- Exactly 18 fixed dataset cases SHALL be attempted; no skipped or omitted case is permitted.
- Semantic success rate SHALL be at least 80%.
- Structural pass rate SHALL be 100%; no malformed response MAY pass acceptance.
- All safety-critical invariant checks SHALL pass.
- No model/service error SHALL count as PASS for its case.
- A real-run `service_error` count of 1 or more SHALL cause FAIL even if the computed semantic rate
  is sufficient.
- Any safety-critical invariant violation SHALL cause FAIL.
- Any structural failure SHALL cause FAIL.
- Any denominator or evidence issue that prevents independent reproduction SHALL cause FAIL.
- Thresholds and difficult cases SHALL remain unchanged after genuine evaluation.

### Evaluation Dataset

The project SHALL preserve `evals/dataset.json` with exactly 18 fixed, meaningful cases. No set of
18 superficial paraphrases is acceptable.

The dataset SHALL cover:

- At least 4 create cases.
- At least 4 reschedule cases.
- At least 4 snooze cases.
- Clarification and missing-information cases.
- Boundary cases for past times and snooze duration boundaries.
- Malformed and empty input cases.
- Unsupported-action cases.
- Prompt-injection and instruction-conflict cases.
- Relative-time interpretation cases using `Asia/Kolkata`.

The 18 target cases SHALL use non-duplicative scenarios, for example:

| ID | Category | Specification mapping |
|---|---|---|
| C01 | Create, complete future request | FR-002, FR-012, INV-006 |
| C02 | Create, relative future request | FR-002, FR-012, INV-006 |
| C03 | Create, missing time | FR-005, FR-006, INV-002 |
| C04 | Create, past or invalid date | FR-002, FR-009, INV-006 |
| R01 | Reschedule, complete target and future time | FR-003, FR-012, INV-006 |
| R02 | Reschedule, relative future time | FR-003, FR-012, INV-006 |
| R03 | Reschedule, missing target | FR-003, FR-005, INV-008 |
| R04 | Reschedule, missing new time | FR-003, FR-005, INV-002 |
| S01 | Snooze, complete target and duration | FR-004, FR-007, INV-007 |
| S02 | Snooze, relative duration | FR-004, FR-007, INV-007 |
| S03 | Snooze, missing target | FR-004, FR-005, INV-008 |
| S04 | Snooze, invalid duration | FR-004, FR-009, INV-007 |
| X01 | Ambiguous vague date | FR-005, FR-012, INV-001 |
| X02 | Ambiguous target name | FR-005, FR-006, INV-008 |
| X03 | Malformed or empty input | FR-009, INV-005 |
| A01 | Unsupported action | FR-009, FR-011, INV-005 |
| A02 | Prompt-injection instruction | FR-010, INV-004 |
| A03 | Conflicting intent instructions | FR-009, FR-010, INV-002 |

Each dataset case SHALL include ground truth or a semantic rubric, reference timestamp, timezone,
mandatory expected properties, invariant IDs, and traceability IDs.

### Key Entities *(include if feature involves data)*

- **Reminder Request**: A natural-language request to create, reschedule, or snooze a reminder.
- **Target Reminder**: A reminder identity or title used to identify an existing reminder.
- **Interpreted Action**: A validated structured result that is never executed.
- **Clarification**: A request for missing or ambiguous mandatory information.
- **Evaluation Case**: A reference-contextualized input with ground truth and expected properties.
- **Evaluation Evidence**: Raw response and independently calculated structural, invariant, semantic,
  and human-review outcomes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 18 fixed dataset cases execute against the real model in one genuine evaluation
  run; model/service failures count as failed attempts.
- **SC-002**: 100% of evaluated model responses pass structural schema validation and
  cross-field constraints.
- **SC-003**: At least 80% of evaluated cases pass their case-specific semantic rubric.
- **SC-004**: 100% of safety-critical invariant checks pass.
- **SC-005**: 100% of clarification, missing-information, and malformed cases contain no invented
  mandatory field.
- **SC-006**: 100% of actionable create and reschedule results use valid absolute timestamps in
  `Asia/Kolkata`.
- **SC-007**: 100% of genuine model evaluations preserve raw response, structural outcome,
  invariant outcome, semantic outcome, and traceability evidence.
- **SC-008**: Human review records ACCEPT or REJECT with known limitations after an automated PASS.

## Assumptions

- The application language is Node.js 22, the model runtime is Ollama 0.40.17, the model is
  `qwen2.5:3b`, and the runtime is accessed through the local HTTP API.
- The model has already been downloaded and real local inference has been demonstrated; no paid API
  or credential is required.
- Evaluation uses a fixed explicit reference timestamp and `Asia/Kolkata` timezone per case.
- “Existing reminder” identity is represented only by a title or identifier explicitly supplied in
  the request. The application does not maintain or query a reminder database and does not verify
  existence or uniqueness.
- Relative dates and durations are inferred from the explicit reference context, not machine time.
- Unit tests may use simulated model responses only to verify harness logic.
- The exact model prompt and implementation details remain for planning and implementation stages.
- The evaluation threshold and scoring policy in this specification are fixed before implementation.

## Unresolved Ambiguities

No unresolved scope or safety ambiguities remain at this stage. Project-specific implementation
choices, the final prompt, and evidence storage layout remain for approved technical planning.

<!--
Sync Impact Report
- Version change: none (new constitution) -> 1.0.0
- Modified principles: none
- Added sections: Core Principles, Additional Constraints, Development Workflow
- Removed sections: none
- Follow-up TODOs: Confirm the human ratification date before adoption.
-->

# Part 1A Smart Todo & Task Constitution

## Core Principles

### I. Specification-First Development

Every implemented feature MUST trace to an approved requirement and specification.
Specifications and measurable, testable acceptance criteria MUST be reviewed before
implementation. Unresolved business behaviour MUST be resolved through clarification
and documented in the appropriate Spec Kit artifact. Functional behaviour MUST be
derived from the approved specification, and unsupported functionality MUST NOT be
introduced silently. Requirements, plan, tasks, implementation, and tests MUST remain
consistent; later-discovered ambiguity MUST be addressed by revising the appropriate
upstream artifact and preserving the change history.

### II. Simplicity and Maintainability

The implementation MUST be the simplest maintainable solution that satisfies the
approved requirements for the Smart Todo & Task CLI/API. The project MUST remain
small enough to complete specification, implementation, harness validation, and human
review. Unnecessary functionality and speculative architectural complexity MUST NOT
be added. Code MUST use appropriate quality checks, explicit error handling, and
structures that can be tested. The constitution MUST NOT impose an implementation
language, framework, database, performance threshold, or other technology decision
that has not been established by later specification and planning.

### III. Deterministic Correctness

Tests MUST be derived from approved acceptance criteria and MUST assert exact
deterministic outcomes for required behaviour. Validation MUST cover specified normal
behaviour and relevant boundary and invalid-input conditions. Mandatory tests MUST
pass before human acceptance. Assertions MUST NOT be weakened or replaced with
success-shaped checks merely to obtain a passing result. Generated code MUST NOT be
treated as correct solely because it executes successfully.

### IV. Independent Harness Validation

The repository MUST contain a local harness that independently evaluates generated
implementation artifacts. The harness MUST provide inspectable PASS/FAIL outcomes for
all mandatory gates:

- **Syntax and lint:** Run language-appropriate syntax and static-quality checks.
- **Security/SAST:** Run language-appropriate static security checks relevant to the
  selected implementation and preserve inspectable results.
- **Unit and contract tests:** Run specification-derived automated tests with exact
  assertions for required deterministic behaviour.

The coding agent MUST NOT bypass the independent harness, and mandatory gates MUST
be executed before acceptance.

### V. Feedforward Controls and Feedback-Driven Repair

Before generation, the coding agent MUST receive the approved specification context,
relevant engineering constraints, and an instruction not to weaken acceptance
criteria or bypass mandatory checks. After generation, the independent harness MUST
be run and relevant stdout, stderr, failed tests, failed rules, expected behaviour,
and observed behaviour MUST be preserved. Actionable failure evidence MUST be
provided to the coding agent when genuine failures occur. Repairs MUST correct the
implementation and MUST be followed by re-execution of the same mandatory gates.

The process MUST NOT delete difficult tests, weaken assertions, lower validation
requirements, disable mandatory checks, manually alter results, manufacture failures,
or invent repair cycles or validation evidence. Legitimate specification changes MUST
be made through Spec Kit artifacts and documented.

### VI. Security and Data Protection

Secrets, API keys, credentials, and local environment secrets MUST NOT be committed
or submitted. Applicable security checks MUST run as part of harness validation, and
generated code MUST undergo security evaluation before acceptance. External
service/API failures, if relevant to the chosen implementation, MUST be distinguished
from application failures and evaluation failures. Unrelated security features MUST
NOT become mandatory application functionality without justification in the approved
specification.

### VII. Traceability and Evidence Preservation

Each meaningful development stage MUST leave inspectable evidence. The repository
MUST preserve the constitution, feature specification, clarification decisions,
technical plan, implementation tasks, relevant consistency analysis, initial and final
generated implementations, specification-derived tests, harness scripts or
configuration, actual harness results, genuine failure and repair evidence when
encountered, the final human review decision, and known limitations.

Traceability MUST be inspectable across:
**Requirement -> Specification -> Plan -> Tasks -> Implementation -> Tests/Harness -> Validation Evidence**.

For Part 1A, this evidence logically includes Spec Kit artifacts, application source,
tests, a `.harness/` area, and an `evidence/` area containing actual results and
`harness-log.md`. Folder names MAY vary by technology, but inspectable traceability
MUST remain. The repository MUST include instructions sufficient to execute the
submitted harness.

### VIII. Human Accountability

The student remains responsible for generated software and submitted evidence.
Automated PASS MUST NOT replace human review. Final human review MUST record an
ACCEPT or REJECT decision with justification, disclose known limitations and failed
requirements, and preserve enough evidence for independent evaluation. No validation,
review, failure, repair, or outcome MAY be claimed unless it actually occurred.
Narrative harness-log entries MUST be independently documented by the student; AI
MUST NOT auto-generate assessed reflection or fabricated development history.

## Additional Constraints

The selected Part 1A problem is **Sample A - Smart Todo & Task CLI/API**. Its approved
functional scope is limited to task CRUD operations, tag filtering, JSON persistence,
priority sorting, and task-status transitions. JSON persistence is mandatory.
Additional business rules MUST be established during specification and clarification.

The constitution MUST NOT mandate Java, Python, Node.js, a frontend framework,
MongoDB, SQL, authentication, authorization, cloud hosting, CI/CD, arbitrary
performance targets, notifications, collaboration, or functionality beyond the
selected problem unless approved through the later Spec Kit workflow. Demonstration
technologies and exercises from the lab sheets are instructional references, not
automatic Part 1A requirements.

The repository MUST preserve meaningful Git milestones for reviewed specification
artifacts, implementation, verification, genuine corrective changes, and acceptance.
Commits MUST exclude secrets and local environment credentials. The final assignment
repository MUST be publicly accessible to evaluators when submitted.

`harness-log.md` MUST document the initial coding-agent generation and specification
or task context, actual harness executions and outcomes, genuine failures and repair
cycles, failure evidence supplied to the coding agent, post-repair changes, repeated
mandatory checks, the final human ACCEPT/REJECT decision, and known limitations.
The student MUST write and verify narrative entries; actual machine-generated reports
and harness outputs MAY be preserved as evidence.

## Development Workflow

The project MUST follow this order unless a documented, approved clarification
requires revisiting an earlier artifact:

1. Define the problem statement.
2. Execute the constitution stage.
3. Execute the specification stage.
4. Perform specification clarification.
5. Generate the technical plan.
6. Generate implementation tasks.
7. Perform consistency analysis where applicable.
8. Implement with an AI coding agent using the approved context.
9. Execute independent harness validation.
10. Capture genuine failure evidence and provide actionable feedback when checks fail.
11. Repair and revalidate using the same mandatory harness controls.
12. Perform final human review and record ACCEPT or REJECT.

The installed Spec Kit integration's supported hyphenated commands are authoritative
when they differ from lab-sheet command notation. The student MUST review generated
artifacts and changes rather than automatically accepting them.

## Governance

This constitution governs project decisions and MUST be reviewed by the student
before adoption. Approved specification artifacts are authoritative for application
behaviour. Any requirement-affecting change MUST be documented in the relevant
upstream Spec Kit artifact, preserve traceability, and trigger review of dependent
plans, tasks, implementation, tests, and evidence. Mandatory harness gates MUST NOT
be bypassed. Human review MUST occur before final acceptance, and known limitations
MUST be disclosed.

Amendments require a documented rationale, an updated Sync Impact Report, review of
affected principles and downstream artifacts, and an updated version and amendment
date. Versioning follows semantic versioning: MAJOR for backward-incompatible
governance or principle removal/redefinition, MINOR for a new principle or material
guidance expansion, and PATCH for clarifications or non-semantic refinements.
Compliance MUST be checked during specification review, planning, implementation
review, harness validation, and final human review. The constitution MUST NOT be
treated as approved until the student records that review.

**Version**: 1.0.0 | **Ratified**: 2026-11-15 | **Last Amended**: 2026-11-15

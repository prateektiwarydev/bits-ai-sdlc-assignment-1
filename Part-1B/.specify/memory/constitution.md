<!--
Sync Impact Report:
- Version change: unversioned scaffold -> 1.0.0
- Modified principles: none (initial Part 1B constitution)
- Added sections: twelve core principles, additional constraints, development workflow
- Removed sections: template placeholder sections
- Follow-up TODOs: model provider and exact evaluation threshold are deferred to the approved
  specification and technical planning stages.
-->

# Natural-Language Reminder Agent Constitution

## Core Principles

### I. Specification-First Development

Requirements, acceptance criteria, data and response contracts, evaluation rules, and
implementation tasks MUST be approved before application code is generated. Any implementation
change that alters specified behaviour MUST update the specification and its evaluation artifacts
before source changes are made.

### II. Small, Focused Application Scope

The application MUST only interpret create, reschedule, and snooze reminder requests. It MUST ask
a focused clarification question when mandatory details are missing or ambiguous. Authentication,
web interfaces, email notifications, scheduling infrastructure, and unrelated reminder features
MUST NOT be added within this project.

### III. Genuine Model Inference

Every non-trivial request classification or interpretation MUST invoke a real AI model at runtime.
Hardcoded mappings, mocked model outputs, canned responses, or deterministic rules MUST NOT be
presented as evidence of nondeterministic model behaviour.

### IV. Structured and Validated Output

Every model response MUST conform to an explicitly versioned JSON schema. The implementation
MUST validate field types, supported intent values, required fields, and explicit clarification
or error states. Responses that fail validation MUST NOT execute an action.

### V. Behavioural Safety

The application MUST NOT invent mandatory information, execute an action without necessary details,
obey instructions that attempt to override system or application policy, or treat untrusted input
as system instructions. Unsafe, malformed, or conflicting requests MUST produce clarification or
a safe error state rather than guessed action data.

### VI. Testable Time Semantics

Relative date and time interpretation MUST receive one explicit reference timestamp and timezone
for each evaluation run. Every case MUST produce reproducible absolute values or a documented
clarification state, and tests MUST NOT depend on wall-clock values outside the supplied context.

### VII. Independent, Layered Evaluation

Evaluation MUST keep three layers distinct: JSON-schema validation, behavioural invariant and
property checks, and independent semantic quality assessment. A passing result in one layer MUST
NOT substitute for the others.

### VIII. Comprehensive Evaluation Dataset

The evaluation suite MUST contain at least 15 meaningful cases, with coverage of normal, boundary,
ambiguous, missing-information, malformed, and adversarial inputs. Every case MUST have
specification-derived expected properties or a clear evaluation rubric before execution.

### IX. Predefined Scoring and Gates

Before the first genuine evaluation, the specification MUST define the exact scoring formula,
mandatory gates, acceptance threshold, and failure conditions. Thresholds, expected properties,
rubrics, or difficult cases MUST NOT be weakened or removed to obtain PASS.

### X. Evidence Preservation and Repair

The project MUST preserve first-generation source, real model responses, per-case results, failed
evaluations, actionable feedback, repaired source or configuration, and final-generation source
with re-evaluation results. Evidence MUST enable independent reconstruction of the observed
generation and repair history.

### XI. Reliability and Security

Implementation MUST use maintainable modular code, input validation, explicit model and service
error handling, isolated tests, reproducible run instructions, and no hardcoded or committed
credentials. Test doubles MAY support unit isolation but MUST be clearly separated from genuine
model evaluations.

### XII. Human Accountability

Automated PASS MUST be followed by human review. The reviewer MUST record an explicit ACCEPT or
REJECT decision. Machine-generated evidence MUST remain distinguishable from the student's own
narrative, interpretation, and reflections.

## Additional Constraints

This project is an academic, specification-driven exercise, not a production reminder platform.
All implementation choices, the model provider, runtime credentials, and exact evaluation threshold
MUST be proposed and approved in subsequent specification and technical planning stages. Credentials
MUST be supplied through an uncommitted local environment or secret mechanism.

## Development Workflow

The normal sequence is constitution, approved specification, technical plan, implementation tasks,
genuine evaluation harness, evidence collection, repair, re-evaluation, and human review. Each
material artefact MUST be reviewable and traceable to the constitution and specification.

Compliance reviews MUST verify scope, schema, safety, time reproducibility, independent evaluation
layers, evidence completeness, security, and human approval. A violation MAY block progression or
final acceptance until the affected artefact or implementation is corrected.

## Governance

This constitution supersedes informal project practices for Part 1B. Amendments require a
documented rationale, an explicit semantic-version update, an approval record, and a reviewed
migration or impact note. Backward-incompatible removals or redefinitions of principles require a
MAJOR version; new principles or materially expanded guidance require a MINOR version; clarification
and non-semantic refinements require a PATCH version.

All specifications, plans, tasks, source reviews, evaluations, repairs, and final submissions MUST
be checked against these principles. Ambiguities not resolved by the constitution MUST be
documented for approval rather than silently interpreted.

**Version**: 1.0.0 | **Ratified**: 2026-11-22 | **Last Amended**: 2026-11-22

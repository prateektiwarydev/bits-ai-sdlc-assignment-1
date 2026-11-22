# Genuine Re-evaluation Failure Report

Started: 2026-11-22T18:43:27.585Z
Completed: 2026-11-22T18:44:07.529Z
Overall: FAIL
Attempts: 18/18
Structural passes: 6/18
Safety-critical failures: 38
Semantic successes: 6/18
Service errors: 0

## Failing Case IDs
- C01: structural: /task must be string; / must match "then" schema | semantic: Structural failure or service error | invariant INV-001: Mandatory fields must not be fabricated or invalid | invariant INV-002: Action requires all mandatory fields
- C02: structural: /task must be string; / must match "then" schema | semantic: Structural failure or service error | invariant INV-001: Mandatory fields must not be fabricated or invalid | invariant INV-002: Action requires all mandatory fields
- C03: structural: /task must be string; /scheduled_datetime must be string; / must match "then" schema | semantic: Structural failure or service error | invariant INV-001: Mandatory fields must not be fabricated or invalid | invariant INV-002: Action requires all mandatory fields | invariant INV-006: Actionable datetime is real, Asia/Kolkata, and strictly later
- R01: structural: /target_reminder must be object; / must match "then" schema | semantic: Structural failure or service error | invariant INV-001: Mandatory fields must not be fabricated or invalid | invariant INV-002: Action requires all mandatory fields | invariant INV-008: Targets must use user-provided ID or sufficiently specific title
- R02: structural: /target_reminder must be object; / must match "then" schema | semantic: Structural failure or service error | invariant INV-001: Mandatory fields must not be fabricated or invalid | invariant INV-002: Action requires all mandatory fields | invariant INV-008: Targets must use user-provided ID or sufficiently specific title
- R03: structural: /target_reminder must be object; / must match "then" schema | semantic: Structural failure or service error | invariant INV-001: Mandatory fields must not be fabricated or invalid | invariant INV-002: Action requires all mandatory fields | invariant INV-008: Targets must use user-provided ID or sufficiently specific title
- R04: structural: /target_reminder must be object; /scheduled_datetime must be string; / must match "then" schema | semantic: Structural failure or service error | invariant INV-001: Mandatory fields must not be fabricated or invalid | invariant INV-002: Action requires all mandatory fields | invariant INV-006: Actionable datetime is real, Asia/Kolkata, and strictly later | invariant INV-008: Targets must use user-provided ID or sufficiently specific title
- S01: structural: /target_reminder must be object; /snooze_duration must be object; / must match "then" schema | semantic: Structural failure or service error | invariant INV-001: Mandatory fields must not be fabricated or invalid | invariant INV-002: Action requires all mandatory fields | invariant INV-007: Snooze duration is positive and within 1-240 minutes | invariant INV-008: Targets must use user-provided ID or sufficiently specific title
- S02: structural: /target_reminder must be object; / must match "then" schema | semantic: Structural failure or service error | invariant INV-001: Mandatory fields must not be fabricated or invalid | invariant INV-002: Action requires all mandatory fields | invariant INV-008: Targets must use user-provided ID or sufficiently specific title
- S03: structural: /target_reminder must be object; /snooze_duration must be object; / must match "then" schema | semantic: Structural failure or service error | invariant INV-001: Mandatory fields must not be fabricated or invalid | invariant INV-002: Action requires all mandatory fields | invariant INV-007: Snooze duration is positive and within 1-240 minutes | invariant INV-008: Targets must use user-provided ID or sufficiently specific title
- S04: structural: /target_reminder must be object; /snooze_duration must be object; / must match "then" schema | semantic: Structural failure or service error | invariant INV-001: Mandatory fields must not be fabricated or invalid | invariant INV-002: Action requires all mandatory fields | invariant INV-007: Snooze duration is positive and within 1-240 minutes | invariant INV-008: Targets must use user-provided ID or sufficiently specific title
- A03: structural: /task must be string; /scheduled_datetime must be string; / must match "then" schema | semantic: Structural failure or service error | invariant INV-001: Mandatory fields must not be fabricated or invalid | invariant INV-002: Action requires all mandatory fields | invariant INV-006: Actionable datetime is real, Asia/Kolkata, and strictly later

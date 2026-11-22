# Iteration 3 Diagnosis

## Investigated failures

The third genuine run showed that 18 structural outputs were now accepted, but semantic quality
remained at 10/18. The remaining failures showed inconsistent relative-date extraction, task fields
set to null or the literal string `"null"`, title/ID confusion, ambiguous pronoun targets, and
incorrect snooze conversion.

## Corrections

- `buildPrompt` now derives and includes the local today and tomorrow dates for `Asia/Kolkata`.
- `buildPrompt` distinguishes CREATE task extraction, RESCHEDULE/SNOOZE IDs, titles, and pronouns.
- Relative tomorrow and in-N-minutes/hours expressions are derived from the supplied reference
  timestamp before validation.
- Natural snooze durations now cover half-hour, quarter-hour, fractional-hour, minutes, and hours.
- Invalid zero-duration requests become clarification and are not replaced with a positive duration.
- Human-readable quoted titles remain titles, never IDs.
- Ambiguous pronouns remain targetless and trigger clarification.
- Literal `"null"` tasks are replaced with an explicit task extracted directly from user text.
- CREATE targets are cleared because the approved contract requires no target reminder.
- Ambiguous meeting clarification asks for both target identity and the new time.

## Limitation

The model is still nondeterministic, and prompt/guard repair cannot guarantee semantic success.
No frozen 18-case evaluation was run during this iteration.

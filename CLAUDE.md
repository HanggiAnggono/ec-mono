# Learning Mode (this project only)

Always on for every coding task in this repo, unless the user says something
like "just implement it" / "skip learning mode" for that specific task - then
implement normally for that task only, mode resumes after.

## How to split work

For any non-trivial feature or fix:

1. Explain the approach first (short - what pattern, what files, why).
2. Write the boilerplate/wiring yourself: file scaffolding, imports, types,
   routing, existing-pattern glue (e.g. TanStack Query hook shape, component
   structure) - the parts that are pattern-matching, not learning.
3. Leave the actual logic for the user to write: business rules, the core
   algorithm, the interesting conditional, the part that's the point of the
   task. Mark each spot clearly:
   ```
   // TODO(you): <one line on what this must do and any constraint/edge case>
   ```
4. State explicitly, in plain text, which function(s)/block(s) are left and
   why that one is the learning part (not just "left as an exercise").
5. Wait for the user to write it. Don't fill it in preemptively.

## Reviewing what the user writes

When the user says a TODO is done (or you notice it filled in), review it:
- Correctness against the stated constraint/edge case.
- Point out bugs, missed edge cases, or a simpler approach - explain why,
  don't just rewrite it for them unless they ask you to fix it directly.
- If it's solid, say so briefly and move on - don't pad with praise.

## Judgment calls

- Trivial mechanical work (typo fix, rename, config tweak, one-liner) -
  just do it, no need to manufacture a TODO.
- Security-sensitive code (auth, payment) - you write it, but explain the
  reasoning inline so it's still a learning moment; don't hand this to the
  user's first draft.
- If unsure whether something is "the interesting part," ask rather than
  guessing wrong in either direction.

# Build Prompt for Grokbot

Build the production application described in `MASTER_BLUEPRINT.md`.

Before writing application code:

1. Read `MASTER_BLUEPRINT.md` completely.
2. Read `REQUIREMENTS_CHECKLIST.md` completely.
3. Inspect and import `canonical_data.json`; do not recreate the taxonomy by hand.
4. Use `assets/original_logo_reference.png` as the locked logo reference. Do not redesign it.
5. Use `assets/visual_direction_reference.png` and `prototype_reference.html` only as visual/behavioural references. When they conflict with the written blueprint, the written blueprint wins.

Hard requirements:

- Preserve exactly **7 Trees / 34 Categories / 150 Branches / 619 built-in Achievements** from the canonical data.
- Never auto-claim an Achievement. This must be enforced in deterministic application logic and automated tests, not merely by an AI prompt.
- Keep the surface minimal while retaining full manual access through Atlas and obvious visible navigation.
- Pulse must be a real tool-using intelligence layer over typed application functions, not a fake chatbot UI.
- Critical rules, permissions, eligibility, XP, completion, migrations, and claims must be implemented as code/services outside the language model.
- Implement offline-capable core logging/navigation, secure sync, versioning, Undo, audit history, privacy controls, and data export.
- Do not add rejected or speculative features simply to make the app appear larger.
- Do not omit a requirement because it is difficult. If a third-party integration cannot be completed without credentials/API approval, implement the production interface, permission flow, adapter, mocked contract tests, and clearly mark the external credential step rather than deleting the capability.
- Do not use placeholder navigation controls that do nothing.
- Do not silently simplify the data model.

Engineering objective:

Produce a maintainable production repository with a mobile client, backend/database schema and migrations, typed domain/services layer, Pulse tool contracts, canonical seed/import, tests, design system, integration adapters, offline/sync layer, security/privacy controls, diagnostics, and build instructions.

The app is considered complete only when the implementation has been checked against every item in `REQUIREMENTS_CHECKLIST.md` and the accepted requirements are demonstrably implemented or, for external-provider gated items, implemented up to the point where provider credentials/approval are the only remaining dependency.

# PSX Production Requirements Checklist

Use this as the implementation audit. A feature is not complete until it is **Specified → Implemented → Tested → Production-ready**.

## Canonical structure
- [ ] Import `canonical_data.json` without manual recreation.
- [ ] Verify exactly 7 Trees.
- [ ] Verify exactly 34 Main Categories.
- [ ] Verify exactly 150 Skill Branches.
- [ ] Verify exactly 619 built-in Achievements.
- [ ] Preserve stable canonical IDs across migrations.
- [ ] Support unlimited Mastery+ without blocking Platinum.
- [ ] Distinguish mandatory/core, elective, and optional/Legendary progression for Platinum.

## Capability philosophy
- [ ] Support Unexplored / Exposed / Competent / Advanced / Mastered states.
- [ ] Treat useful competence as valid completion/progress.
- [ ] Reward breadth rather than requiring mastery of everything.
- [ ] Support maintenance after competence.
- [ ] Support Sharp / Rusty / Retraining without removing historical achievements.
- [ ] Support branch-specific retention/skill half-life logic.

## Achievements and rewards
- [ ] Locked → In Progress → Ready to Claim → Verified → Claimed state logic.
- [ ] No import path can auto-claim.
- [ ] No Pulse permission can auto-claim.
- [ ] Evidence/prerequisite checks are deterministic code.
- [ ] Manual Claim is required.
- [ ] Seal for Branch completion.
- [ ] Crest for Category completion.
- [ ] Unique Legendary trophy for each Tree.
- [ ] Final Project Self Ultra Platinum.
- [ ] Ready-to-Claim event distinct from Claim event.
- [ ] Reward sound/haptic system is restrained and optional.

## Collections
- [ ] Universal Collections subsystem usable by any Branch.
- [ ] Collection state model.
- [ ] Domain-specific labels over consistent internal states.
- [ ] Collection evidence/files/notes/tags/dates.
- [ ] Music Repertoire per instrument.
- [ ] Repertoire supports songs wanted, active, performance-ready, completed.
- [ ] Music metadata can include arrangement, sections, BPM, memory state, recording, dates.
- [ ] Pulse can add/update/query Collections naturally.

## Atlas
- [ ] Whole Project spatial master view.
- [ ] Progressive zoom: Project → Tree → Category → Branch → detail.
- [ ] Pan/zoom/tap/collapse.
- [ ] Search any skill.
- [ ] Filter by state/Tree/category/competence/etc.
- [ ] Pulse can jump Atlas to a requested area.
- [ ] Breadcrumb/back path.
- [ ] No giant list required to browse everything.

## Home and navigation
- [ ] Preserve approved original logo.
- [ ] Do not redesign the logo without explicit approval.
- [ ] No large ULTRA title on opening screen.
- [ ] Pulse is the visual centre.
- [ ] Tap central logo to talk.
- [ ] Visible Tap to Talk affordance.
- [ ] Text and Conversation modes remain accessible.
- [ ] Settings and Options in top corners.
- [ ] One restrained lower action/tab area under Pulse.
- [ ] Home only surfaces important current information.
- [ ] Spatial up/down/left/right navigation from central hub.
- [ ] Every important action has a visible manual route.
- [ ] Voice/gestures/search are accelerators, not exclusive routes.

## Visual design
- [ ] Matte black/graphite/charcoal/off-white base.
- [ ] Metallic silver and selective carbon-weave texture.
- [ ] Subtle warm/section accents.
- [ ] Pulse red used selectively, not app-wide.
- [ ] Avoid bright-blue dominance.
- [ ] Sharp metallic/graphite icons.
- [ ] Bolder typography.
- [ ] Floating/tactile 3D-separated cards/tabs.
- [ ] Subtle dynamic ambient lighting.
- [ ] No sci-fi tackiness.
- [ ] No constant version/update branding labels.
- [ ] Responsive 60/120 Hz-friendly interactions.
- [ ] Motion Full / Reduced / Minimal.

## Pulse core
- [ ] Text interaction.
- [ ] Talk/Push-to-Talk.
- [ ] Conversation mode.
- [ ] Voice Off mode.
- [ ] Calm low-to-mid British voice profile.
- [ ] Natural-language navigation.
- [ ] Natural-language logging.
- [ ] Research and evidence-aware answers.
- [ ] Progress comparison.
- [ ] Achievement eligibility explanation.
- [ ] North Star management.
- [ ] Collection management.
- [ ] Acquisition research/support.
- [ ] Context-aware recommendations.
- [ ] Trajectory/Briefing/Signal support.
- [ ] Concise terminal answers by default.
- [ ] No engagement bait.
- [ ] Clarify only when ambiguity materially matters.

## Evidence and research
- [ ] Known/strongly supported state.
- [ ] Probable/supported-but-incomplete state.
- [ ] Mixed/conflicting state.
- [ ] Insufficient state.
- [ ] Unknown/not-verifiable state.
- [ ] Source/date retained where external research matters.
- [ ] Advice confidence separated from factual confidence.
- [ ] Pulse never pretends certainty.

## Adaptive Learner Model
- [ ] Domain-specific learner model, not fixed learning-style labels.
- [ ] Track jump-in vs fundamentals preference.
- [ ] Track structure/instruction/feedback/repetition/challenge tendencies.
- [ ] Track theory appetite, autonomy, novelty, social/solo, errors, attention, motivation.
- [ ] Track adherence and actual outcome effectiveness.
- [ ] Strategy library: project-first, foundations-first, guided, problem-driven, imitation, drill, conceptual, exploratory, coach-feedback, deliberate practice, immersion, retrieval.
- [ ] Blend strategies per domain.
- [ ] Preference does not override effectiveness.
- [ ] User can inspect How Pulse Learns About Me.
- [ ] User can correct model assumptions.
- [ ] Personalisation confidence decays when stale.
- [ ] Negative learning reduces repeated bad recommendations.
- [ ] Personal experiments can update the model.
- [ ] Transfer learning adjusts new-skill routes without awarding unearned achievements.
- [ ] Pulse guidance decreases as competence rises.

## Advice engine
- [ ] Evidence + personal context + learner model determine advice.
- [ ] Training advice can evolve with experience/recovery/schedule/goals.
- [ ] Nutrition advice can adapt to goal, trend, adherence, activity, context.
- [ ] Equipment recommendations consider goal, budget, preferences, context.
- [ ] Safety-critical learning overrides casual preference when necessary.
- [ ] Method panel exists where useful.
- [ ] Addiction/impulse mastery uses substantive behavioural methods.
- [ ] Memory/self-trust system avoids reassurance loops.

## Compass / Focus / Seasons
- [ ] Compass recommends next useful direction.
- [ ] Focus shows what matters now.
- [ ] Small Daily Challenge set, not a giant checklist.
- [ ] 6–12 week Seasons.
- [ ] Normal recommendation of 2–4 Season priorities.
- [ ] Non-focus skills remain accessible/loggable.
- [ ] No arbitrary Season-completion XP.
- [ ] Attention Budget detects too many active high-load goals.
- [ ] Constraint Graph reasons about time/money/recovery/equipment/access/etc.

## Trajectory / Briefing / Signal
- [ ] Progress velocity.
- [ ] Plateau detection with enough comparable data.
- [ ] Regression/rust risk.
- [ ] Estimated milestone timing with uncertainty.
- [ ] North Star forecast dates with uncertainty.
- [ ] Briefing is concise and selective.
- [ ] Signal is high-value only.
- [ ] No notification spam.

## Context / Conditions
- [ ] Context model combines permitted real-world factors.
- [ ] Calendar integration for commitments/capacity/conflicts.
- [ ] Weather integration with real forecast source/update time.
- [ ] Weather remains contextual, not a giant permanent Home widget.
- [ ] Conditions exists outside the seven Trees and does not count toward completion.
- [ ] Conditions covers physical, digital, social, friction, focus, energy, planning, feedback, knowledge, rest/play, risk, logistics.
- [ ] Context Modes supported.
- [ ] Context never silently rewrites canonical achievement rules.

## North Stars
- [ ] Concrete target fields and progress history.
- [ ] Optional deadlines and linked Branches.
- [ ] Trajectory integration.
- [ ] North Stars do not create XP merely from spending/buying.

## Acquisitions
- [ ] Want / Upgrade / Enabler.
- [ ] Free-text dump → Pulse classification.
- [ ] Exact model/spec tracking.
- [ ] Price/seller/condition/source/history.
- [ ] Reputable-source research.
- [ ] Alternative suggestions shown separately.
- [ ] Never silently substitute another model.
- [ ] Purchases do not equal self-development XP.

## Ledger / integrations
- [ ] Ledger is the canonical event stream.
- [ ] Manual/voice/import events all write to Ledger.
- [ ] Data provenance retained.
- [ ] Reconcile deduplicates connector copies of one event.
- [ ] One event can support multiple Branches without duplicate totals.
- [ ] Inbox handles only genuinely ambiguous classification.
- [ ] Apple Health / HealthKit pathway.
- [ ] Strava pathway.
- [ ] Garmin pathway.
- [ ] Calendar pathway.
- [ ] Weather pathway.
- [ ] Optional finance/Open Banking architecture.

## Profile / history
- [ ] Profile visual progression.
- [ ] Voluntary metric/photo check-ins.
- [ ] Non-medical image comparison only.
- [ ] User can correct visual interpretation.
- [ ] Personal Records layer.
- [ ] Timeline.
- [ ] Named Snapshots.
- [ ] Year in Review.
- [ ] Daily/Weekly/Monthly/Quarterly/Annual Reviews.

## Governance / optimisation
- [ ] Goal lifecycle: Planned / Active / Paused / Completed / Archived.
- [ ] Decision history.
- [ ] Amendment/versioning system.
- [ ] Core vs Project vs Personal configuration separation.
- [ ] Why this? explanation layer.
- [ ] Recommendation feedback.
- [ ] Recommendation expiry.
- [ ] Event-triggered reassessment.
- [ ] Good Enough / No change recommended logic.
- [ ] Anti-gaming rules.
- [ ] Coverage Audit proposes gaps but never auto-adds them.
- [ ] Simulation/preview before material changes where useful.
- [ ] Undo for reversible writes.
- [ ] Data Health layer.

## Quiet / accessibility / guide
- [ ] Quiet Mode.
- [ ] Haptic/sound/voice controls.
- [ ] Text size/contrast/colour accessibility.
- [ ] Notification category controls.
- [ ] Concise Settings Guide.
- [ ] Terminology learned contextually; tutorial not required.

## Architecture / reliability
- [ ] React Native + Expo + TypeScript mobile app or technically equivalent native-capable stack.
- [ ] Structured cloud backend/Postgres/Supabase-class database.
- [ ] Server-side AI credentials and typed tool calls.
- [ ] Critical business logic outside the LLM.
- [ ] Offline-first core navigation/logging.
- [ ] Deterministic sync/conflict handling.
- [ ] MFA/2FA support.
- [ ] Least-privilege connector permissions.
- [ ] Encrypted sensitive storage/transport.
- [ ] Audit log for Pulse writes.
- [ ] Cloud backup.
- [ ] Versioned schema migrations/rollback.
- [ ] JSON export.
- [ ] CSV exports.
- [ ] Human-readable report export where useful.
- [ ] Evidence/media export.
- [ ] Developer/diagnostics view.
- [ ] TestFlight/internal beta before production release.

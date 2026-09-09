# PROJECT SELF ULTRA / PSX — MASTER PRODUCTION BLUEPRINT

**Status:** Canonical implementation specification for the production app  
**Purpose:** Give a coding agent enough information to build the complete application without silently removing, simplifying, renaming, or replacing agreed functionality.  
**Rule:** This document contains accepted requirements only. Ideas explicitly rejected in prior design work are excluded.

---

# 0. BUILD DIRECTIVE

Build **Project Self Ultra** as a real, production-capable personal-development operating system. **PSX** may be used as the compact product mark/short name; the full product identity remains **Project Self Ultra**. The app must feel minimal and easy on the surface while supporting deep structure, tracking, AI assistance, integrations, evidence, progression, planning, and long-term evolution underneath.

Do **not** treat the old HTML prototype as the final technical architecture. It is a behavioural/visual reference only. The production app must use proper application code, a structured database, cloud sync, offline support, typed business logic, secure integrations, tests, and a native-mobile-capable architecture.

The implementation must preserve the canonical Project dataset shipped beside this document:

- **7 Trees**
- **34 Main Categories**
- **150 Skill Branches**
- **619 built-in Achievements**
- unlimited **Mastery+** progression/extensions

Do not delete, reduce, merge away, or casually rename canonical content. Future additions should normally extend the system through Mastery+, Collections, amendments, or user-configurable additions rather than repeatedly restructuring the core.

---

# 1. PRODUCT PURPOSE

Project Self Ultra is a **personal operating system for becoming more capable in real life**. It combines self-development, practical competence, fitness, learning, expression, adventure, finances, independence, long-term goals, real-world evidence, environmental context, and adaptive AI guidance.

The central philosophy is:

> **The app exists to build the person, not to become the person’s obsession.**

The application may contain enormous depth, but daily interaction should remain narrow, calm, and optional. The system stores complexity so the user does not need to carry the entire plan in their head.

A successful session often looks like:

> Open PSX → understand what matters → act → close PSX → live.

The app must never reward time spent inside the app for its own sake.

---

# 2. PROJECT CONSTITUTION — NON-NEGOTIABLE RULES

These rules override feature-level convenience:

1. **The person matters more than the score.**
2. **Competence is legitimate progress; mastery is optional.**
3. **Breadth is valuable progress.** The system supports becoming broadly competent across many domains and selectively mastering a smaller number.
4. **Real-world evidence outweighs app activity.**
5. **Achievements are never automatically claimed.**
6. **Pulse may recommend, infer, prepare, explain, and highlight; the user retains authority.**
7. **Personalisation must remain transparent, correctable, and reversible.**
8. **Recommendations must respect uncertainty and evidence quality.**
9. **More capability must create less cognitive load, not more interface.**
10. **The app should encourage leaving the app and acting.**
11. **The system must remain exportable, auditable, versioned, and recoverable.**
12. **Safety and legitimate instruction override convenience or personal learning preference where risk is meaningful.**
13. **Material purchases do not equal self-development.**
14. **The system must not become a reassurance/checking loop or another dependency.**
15. **When a current method is working well enough, PSX should be willing to say “nothing needs changing.”**

Any future feature must pass this test:

> **Does this solve a demonstrated problem that cannot be handled cleanly by an existing system?**

If not, do not add it.

---

# 3. CANONICAL HIERARCHY

The permanent hierarchy is:

**Project Self Ultra → 7 Trees → Main Categories → Skill Branches → Achievements → optional Mastery+**

The seven Trees are:

1. 🧠 **Character**
2. 🦾 **Body**
3. 🛠 **Capability**
4. 📚 **Intelligence**
5. 🎭 **Expression**
6. 🌍 **Adventure**
7. 👑 **Freedom**

All seven visually combine into one larger **Project Tree**.

Every level may expose its own:

- completion percentage
- Achievement Completion
- Mastery Completion
- XP and level where relevant
- current capability state
- next meaningful milestone
- earned rewards
- maintenance/rust state where applicable
- progress velocity and trend where data supports it

The canonical content lives in `canonical_data.json`. The production app must import it rather than manually recreating the tree from screenshots or prose.

---

# 4. BREADTH-FIRST CAPABILITY MODEL

PSX is explicitly designed around the principle:

> **Learn widely. Become useful. Go deep selectively.**

Do not require mastery of every Branch.

Each skill/Branch should be able to communicate a capability state such as:

- **Unexplored**
- **Exposed**
- **Competent**
- **Advanced**
- **Mastered**

The exact criteria are Branch-specific. “Competent” means the user can perform the skill independently to a genuinely useful real-world standard. “Mastered” means advanced/refined expertise, not merely completion of basic achievements.

The Atlas should be able to summarise breadth, e.g. counts of:

- explored skills
- competent skills
- advanced skills
- mastered skills

**Platinum must reward healthy breadth and defined core competence rather than requiring expert mastery of the entire Project.** Platinum eligibility must explicitly distinguish **mandatory/core**, **elective**, and **Legendary/optional** Branches so expensive, access-dependent, context-dependent, or highly specialised goals cannot accidentally block whole-Project completion. Mastery+ and exceptional specialisation remain optional.

---

# 5. ACHIEVEMENT SYSTEM

## 5.1 Tiers

Base progression generally uses:

- Bronze — foundation
- Silver — competent progression
- Gold — genuinely skilled
- Diamond — advanced/mastery threshold

After conventional completion, **Mastery+** may add unlimited higher milestones.

## 5.2 States

Use a clear state machine:

`Locked → In Progress → Standards Met / Ready to Claim → Verified → Claimed`

Where an achievement does not need a separate verification stage, the UI may combine “Standards Met” and “Verified”, but the underlying evidence state must remain explicit.

## 5.3 Hard claim rule

**Achievements must NEVER be auto-claimed.**

Pulse, integrations, photos, wearables, certifications, or calculations may:

- collect evidence
- verify prerequisites
- detect that standards are met
- mark **Ready to Claim**
- display why it qualifies
- notify the user

Only a deliberate user action may perform **Claim**.

No AI permission tier may bypass this.

## 5.4 Verification strength

Evidence should support different strengths:

1. self-verification
2. repetition verification
3. objective evidence
4. external certification/licence/test
5. demonstrated repeatable skill

The Branch/Achievement defines which strength is required.

## 5.5 Completion rewards

- Individual milestone → **Achievement**
- Branch completion → **Seal**
- Category completion → **Crest**
- Tree completion → unique **Legendary trophy**
- Whole Project completion → **Project Self Ultra Platinum**

Canonical Legendary trophies:

- Character — **Master of Self**
- Body — **Peak Human DLC**
- Capability — **Probably Useful in an Apocalypse**
- Intelligence — **Brain Expansion Installed**
- Expression — **Main Character Dialogue**
- Adventure — **Fast Travel Unlocked**
- Freedom — **Open World**

Final Platinum:

**💎👑 PROJECT SELF ULTRA**  
Flavor: **“Completed the main story. Realised there was never a final level.”**

Mastery+ must never block Platinum.

## 5.6 Unlock presentation

Two different experiences:

### Ready to Claim

- subtle visual cue
- restrained readiness tone/haptic
- Pulse may provide one short contextual line
- no trophy/XP ownership animation yet

### Manual Claim

- focused achievement card
- achievement name
- Tree/Category/Branch path
- evidence summary
- XP/reward details
- polished console-quality sound/haptic
- optional spoken achievement name
- if Branch/Category/Tree completes, chain the corresponding Seal/Crest/Legendary presentation

Reward presentation should scale in **depth**, not simply become louder or more garish.

Achievement sounds and spoken names must be optional.

---

# 6. SKILL MAINTENANCE, RUST, AND HALF-LIFE

Historical achievements remain earned forever unless manually corrected because they were invalid. Current capability is tracked separately.

After achievement/competence, a Branch may be:

- **Sharp**
- **Rusty**
- **Retraining**

The system should model different retention profiles because different skills decay differently.

A Branch may have a **skill half-life / maintenance profile** based on:

- type of skill
- prior competence/mastery
- time since meaningful use
- recent performance evidence
- user history
- Branch-specific rules

The user may mark a Branch as **Maintain**. Compass should then seek the minimum reasonable maintenance load rather than continuing to push the Branch as an active growth goal.

This is essential to the breadth-first philosophy:

> learn → become competent → maintain economically → move onward

Never remove trophies because of rust.

---

# 7. MASTERY+

Mastery+ extends a Branch beyond its conventional completion threshold without altering the base Project completion requirement.

Examples of the concept include progressively larger endurance, language, technical, athletic, business, or performance milestones.

Mastery+ should:

- be unlimited/extensible
- preserve canonical base milestones
- be clearly separate from mandatory Platinum requirements
- support user-created and future system-created extension milestones
- allow external certification or advanced achievement evidence where relevant

---

# 8. COLLECTIONS — UNIVERSAL BRANCH SUBSYSTEM

Add a reusable **Collections** subsystem available to any Branch.

A Collection tracks the concrete things a user wants to complete, learn, perform, visit, build, practise, read, cook, race, repair, experience, or otherwise accumulate as real-world proof/history.

Examples of Collection types include repertoire, dishes, projects, races, routes, destinations, books, techniques, qualifications, portfolio pieces, builds, experiences, or similar Branch-specific items.

Collections are **not Achievements**.

- Achievement = **what standard have I reached?**
- Collection = **what specific things have I done/learned/completed?**

Universal underlying states may be:

- Saved
- Planned
- Active
- Competent
- Completed
- Archived

A Branch may display friendlier domain-specific labels such as “Learning”, “Performance Ready”, “Visited”, “Can Cook”, etc., but the underlying data model should remain consistent.

For **music/instrument Branches**, Collections must support a **Repertoire** view per instrument so the user can save songs they want to learn and maintain a history of songs completed/performance-ready. Music-specific metadata may include arrangement/version, section/progress, tempo/BPM, from-memory state, sheet/tab use, recording/evidence, started/completed dates, and notes.

Collection item fields should support, where relevant:

- title/name
- type/subtype
- Branch link
- status
- date added
- started date
- completed date
- difficulty
- progress notes
- evidence/recording/photo/file
- source/link
- prerequisites
- tags
- domain-specific metadata
- user rating/reflection

Pulse can add, update, query, and summarise Collections naturally.

Collections should surface concise counts on Branch pages without becoming clutter.

---

# 9. ATLAS — COMPLETE MANUAL MASTER VIEW

**Atlas** is the manual master map of the entire Project.

It must support one-point access to the complete hierarchy:

**Project → Tree → Category → Branch → Achievement / Collection / Mastery+ / evidence**

Atlas should be spatial and zoomable rather than an endless library-style list.

Required interactions:

- zoom out to whole Project
- zoom into a Tree
- reveal Categories at the next level
- reveal Branches as the user goes deeper
- reveal Achievements and secondary detail only when relevant
- pan freely
- tap a node to expand/select
- collapse sections
- search for any skill
- filter by state, Tree, category, competence, activity, etc.
- jump directly from Pulse/search results
- show breadcrumbs/back route
- preserve spatial continuity when navigating back

At high zoom-out, detail should be abstract. Labels and micro-detail progressively reveal as the user zooms deeper.

Atlas is the place where the user can deliberately inspect **everything**. Daily UI should not surface everything.

---

# 10. HOME / OPENING EXPERIENCE

The opening screen must remain **minimal** and should immediately communicate **Pulse**.

Latest agreed visual/interaction requirements:

- preserve the **original approved logo**; do not replace/redesign it
- remove the large **ULTRA** title from the opening screen
- central Pulse/logo presence is the visual anchor
- under the central mark, display **Pulse** cleanly
- **tap the central logo to talk**; do not make a large separate microphone icon the primary control
- include a visible **Tap to Talk** affordance/label
- settings button in one top corner
- options/menu button in the other top corner
- one restrained tab/action area beneath Pulse rather than a collection of intrusive opening-screen tiles
- text interaction remains accessible
- Conversation mode remains accessible
- Home may show only genuinely important current information: Focus, one relevant Signal, a North Star, concise Project progress, or a small Briefing when warranted
- avoid long lists
- avoid dashboard overload

The opening screen is a **hub**, not a report page.

---

# 11. SPATIAL NAVIGATION

Home/Pulse is the centre of the app. Main areas should feel as though they stem from that centre.

Use spatial movement and shared-element transitions rather than disconnected screen changes where possible.

The central hub should support obvious **up / down / left / right** spatial movement. Exact destinations may be refined during implementation, but the four-direction model itself should remain clear and learnable. The important rule is that the user understands the relationship spatially.

Requirements:

- selected object expands toward the user when entering
- back navigation contracts into the originating object
- progress/completion may subtly propagate upward through the visual hierarchy
- gestures are optional accelerators, never the only way to access important functionality
- every important action has one obvious visible route
- keyboard/search/voice/manual navigation all call the same underlying navigation commands

Target motion:

- keep interaction/rendering responsive and 60/120 Hz friendly on supported devices

- control interactions roughly 150–300 ms
- major spatial transitions roughly 300–450 ms
- restrained spring physics/damping
- Motion setting: **Full / Reduced / Minimal**

---

# 12. VISUAL DESIGN SYSTEM

The design should feel premium, finished, tactile, restrained, and modern — not sci-fi tacky.

Core material language:

- matte black
- graphite
- charcoal/dark grey
- off-white
- metallic silver
- carbon-fibre/carbon-weave textures used selectively
- subtle warm accents
- restrained section colours
- soft ambient/dynamic lighting inspired by premium minimalist Apple wallpapers
- shallow 3D/floating surfaces differentiated from background
- strong/bolder typography than early concepts
- sharp, refined icons rather than generic rounded glyphs

Tabs/cards should feel subtly elevated/floating, almost tactile/3D, without excessive glassmorphism.

## Colour semantics

- Pulse may use a restrained **red** active/accent state
- do **not** make the whole app red
- different major sections/Trees may have suitable muted semantic colours
- spread colour consistently across the app
- red should appear especially where Pulse is actively speaking/highlighting, not as a universal fill
- avoid bright-blue dominance
- use red for genuine warnings only when it is acting as a warning state
- semantic colour beats decorative rainbow

## Icon style

Update Tree, North Star, Atlas, Ledger, etc. icons to feel:

- sharper
- metallic
- graphite/matte
- carbon-textured where appropriate
- cohesive with the original logo

The logo itself is locked unless the user explicitly changes that decision. Do not clutter visible branding with constant version/update labels.

---

# 13. BRAND TERMINOLOGY AND DISCOVERABILITY

Reserved branded terms:

- **Pulse** — AI/intelligence and command layer
- **North Stars** — meaningful concrete outcomes
- **Compass** — recommended next direction
- **Trajectory** — where current behaviour is taking the user
- **Briefing** — concise interpretation/summary
- **Signal** — only genuinely notable changes worth attention
- **Atlas** — full Project map
- **Ledger** — historical activity/evidence record
- **Conditions** — surrounding environmental/system factors
- **Acquisitions** — material goals, intentionally secondary
- **Mastery+** — progression beyond conventional completion
- **Seal** — Branch completion reward
- **Crest** — Category completion reward

Ordinary functions should retain ordinary names: Home, Settings, Search, Edit, History, etc.

Do not create excessive proprietary jargon.

## Learn terminology through use, not tutorial dependency

A user should not need a tutorial to decode the app.

First-use contextual explanation is enough:

- North Star = long-term meaningful direction/outcome
- Atlas = map of everything being built
- Ledger = record of what actually happened

Pulse should naturally translate branded concepts the first time they matter, then use the shorter term afterwards.

A **Guide** exists in Settings, but the product must remain discoverable without requiring it.

---

# 14. PULSE — GENERAL INTELLIGENCE LAYER

Pulse is not a limited feature bot and not restricted to a fixed list of “jobs”. It is the general intelligence layer across the whole Project.

Pulse may:

- navigate
- search the Project
- log activities and evidence
- update allowed fields
- retrieve history
- explain Branches/Achievements
- compare results
- research external information
- summarise
- recommend
- prioritise
- classify
- interpret progress
- analyse trends
- evaluate achievement eligibility
- explain why something is or is not eligible
- manage Collections
- work with North Stars
- work with Acquisitions
- reconcile imports
- surface Conditions/context
- forecast Trajectory
- prepare Briefings
- surface Signals
- help troubleshoot the Project
- manage reviews
- support learning/training plans
- explain valid sources/evidence
- assist with app navigation and app functionality

All manual, search, voice, and integration routes should use the same underlying typed commands.

Examples of command abstractions:

- `OPEN_BRANCH()`
- `SEARCH_PROJECT()`
- `LOG_ACTIVITY()`
- `UPDATE_COLLECTION_ITEM()`
- `GET_ACHIEVEMENT_STATUS()`
- `GET_NORTH_STAR()`
- `GET_TRAJECTORY()`
- `GET_CONTEXT()`
- `PREPARE_CHANGE()`

No hidden “AI-only” functionality should exist if a visible manual route is reasonably possible.

---

# 15. PULSE CONVERSATIONAL BEHAVIOUR

Pulse should be:

- concise and terminal by default
- answer-oriented
- factual
- contextual
- restrained but human
- capable of dry humour occasionally
- not engagement-seeking
- not repetitive with praise
- willing to stop after completing the request

Ask a clarification only when ambiguity materially affects correctness, safety, or where data should be written.

Do not ask unnecessary follow-up questions simply to extend conversation.

A normal log response might include:

- what was logged
- core metrics
- comparison to relevant prior result
- whether any achievement became Ready to Claim
- then stop

Praise should be occasional and earned.

---

# 16. PULSE VOICE

Voice is optional, never always-listening.

Modes:

1. **Off** — text only
2. **Talk / Push-to-Talk** — one request
3. **Conversation** — intentional call-like session until muted/ended

The main logo is the primary voice trigger from Home.

Voice profile:

- calm low-to-mid male British voice
- modern neutral/RP-adjacent
- crisp articulation
- controlled pace
- understated confidence
- occasional dry humour
- no robot filter
- no movie-trailer bass
- no military tone
- no meditation-app breathiness

Clear mute/end state is required.

---

# 17. PULSE RESEARCH AND EVIDENCE POLICY

Pulse should provide genuinely researched and evidence-aware guidance rather than pretending certainty.

Evidence states:

- **Known / strongly supported**
- **Probable / supported but incomplete**
- **Mixed / conflicting evidence**
- **Insufficient evidence**
- **Unknown / not verifiable**

Pulse should:

- search proportionately to the stakes
- prefer primary/authoritative sources where appropriate
- reconcile disagreement
- state uncertainty directly
- separate confidence from advice
- never upgrade a plausible idea into a fact simply because it sounds useful
- label forecasts and estimates clearly

For weak/mixed evidence, low-risk options may still be suggested if they are clearly labelled as uncertain.

---

# 18. FACTS, INFERENCES, PREFERENCES, AND CONFIDENCE

Pulse must internally distinguish information types.

A belief in the Personalisation/Learner Model should know whether it is:

- explicitly stated by the user
- observed from behaviour
- inferred
- temporary/contextual
- unknown

Confidence should be human-readable where precision is not justified.

Users must be able to inspect and correct these beliefs through a surface such as **How Pulse Learns About Me**.

A correction should update the model and leave an audit/history trail where material.

---

# 19. ADAPTIVE LEARNER MODEL / PERSONALISATION ENGINE

Pulse must become increasingly good at understanding **how the user tends to make progress**, without reducing the person to a simplistic “visual/auditory learner” label.

Do **not** build the feature around unsupported fixed learning-style categories.

The model may learn dimensions such as:

- entry preference: jump in vs fundamentals first
- structure preference: exploratory vs prescribed
- instruction density
- feedback frequency preference
- challenge tolerance
- repetition tolerance
- theory appetite
- goal orientation
- autonomy preference
- novelty need
- social vs solo preference
- response to error
- confidence calibration
- attention span by domain
- past/transferable experience
- time availability
- subject-specific motivation
- adherence patterns
- methods that repeatedly fail

These characteristics must be **domain-specific**, not assumed globally.

The same person may benefit from different learning approaches in music, languages, fitness, practical trades, safety-critical tasks, or business.

---

# 20. LEARNING STRATEGY LIBRARY

Pulse should choose mixtures of strategies rather than assigning one permanent “type”.

The internal strategy library should include at least:

- Project-first
- Foundations-first
- Guided progression
- Problem-driven
- Imitation/modeling
- Drill-based
- Conceptual/theory-first
- Exploratory
- Coach-feedback
- Deliberate practice
- Immersion
- Retrieval-based learning

Pulse may blend strategies differently by skill.

**Preference is not the same as effectiveness.** The system must consider both:

- what keeps the user engaged
- what actually improves performance/retention

The model should adapt from real outcomes over time.

---

# 21. PERSONALISATION DECAY AND NEGATIVE LEARNING

People change. Behavioural assumptions must not remain permanently frozen.

## Personalisation decay

- explicit stable facts may retain confidence longer
- behavioural predictions should gradually lose confidence when not recently supported
- context-specific beliefs should decay fastest
- new evidence may override old patterns

## Negative learning

Pulse must learn not only what works but what repeatedly does not work.

Repeated failure/adherence problems should reduce the likelihood of recommending the same strategy again unless circumstances materially change.

---

# 22. PERSONAL EXPERIMENTS

Pulse may propose low-risk, time-bounded personal experiments when uncertainty exists about what works best for the user.

Experiments may compare training, study, practice, routine, productivity, or other methods.

Each experiment should define:

- hypothesis/question
- method
- time window
- relevant metrics
- adherence
- performance/result
- subjective experience where useful
- conclusion confidence

The result can update the Learner Model and recommendation logic.

Experiments are optional and should not become another dashboard burden.

---

# 23. TRANSFER LEARNING BETWEEN SKILLS

PSX should recognise legitimate transferable competence between related skills.

The system should not award an unearned achievement in a new Branch, but Pulse may:

- skip redundant introductory material
- adjust learning route
- recognise relevant concepts already known
- recommend faster progression where supported

Relationship graph types include:

- Requires
- Supports
- Transfers to
- Shares evidence with

Hard prerequisites should be used only when genuinely necessary.

---

# 24. PROGRESSIVE INDEPENDENCE FROM PULSE

The app should deliberately require **less guidance** as the user becomes more capable.

Early in a Branch:

- more structure
- more explanation
- more prompts if useful

As competence rises:

- less instruction
- fewer prompts
- more autonomy
- intervention mainly on request, meaningful change, safety issue, rust, or opportunity

The system should train independence from itself.

---

# 25. ADVICE / METHOD ENGINE

Every Branch may expose a concise **Method** layer containing useful, specific, evidence-aware guidance.

Pulse should personalise recommendations using:

- reliable evidence
- current goal
- current capability
- prior experience
- available equipment
- budget
- schedule
- adherence history
- current Season
- workload/recovery
- learning model
- constraints
- preferences where appropriate

Examples include training splits, progression, nutrition/bulk/cut guidance, learning methods, equipment choices, or practical skill progression.

The rule is:

> **Evidence defines the safe/credible boundary; personalisation chooses the best route inside it.**

For safety-critical skills, safety and legitimate qualified instruction override the user’s usual “jump in and figure it out” preference.

---

# 26. CHARACTER METHOD PRIORITIES

Two Character areas remain protected priorities in the system.

## Addiction / impulse mastery

The method layer must include:

- trigger/loop mapping
- time/place/emotion/device-context analysis
- stimulus/environment control before urges
- implementation intentions: If X → Y
- delay rather than negotiation
- urge surfing
- location/context change
- preselected incompatible actions
- lapse protocol
- stopping a lapse early rather than all-or-nothing reset thinking
- metrics beyond streak length: frequency, episode duration, delay, urges resisted, high-risk contexts, time lost, recovery speed, choice/control
- professional support recommendation where impairment is substantial

Do not reduce this to “stay busy” or “use willpower”. Do not diagnose without basis.

## Memory, uncertainty, checking, and self-trust

Preserve:

- one trusted capture point
- scheduled review rather than repeated reassurance checks
- `capture → classify → trust → review`
- principle: **Captured = I am allowed to forget it**
- self-answer first where appropriate
- confidence rating
- one appropriate check
- update and move on
- tolerance of low-stakes uncertainty

PSX itself must not become another reassurance loop.

---

# 27. COMPASS

**Compass** answers:

> **What makes sense to work on next?**

Inputs may include:

- current Season
- active Focuses
- prerequisites
- nearest meaningful milestones
- neglected/maintenance skills
- competence breadth
- North Stars
- calendar capacity
- weather
- recovery/readiness
- workload
- cost
- equipment
- access
- travel/context mode
- skill relationships
- learner model
- attention budget
- constraint conflicts

Compass recommends; it does not dictate.

---

# 28. FOCUS, DAILY CHALLENGES, AND SEASONS

## Focus

Focus answers:

> **What matters right now?**

Only a small number of active areas should normally be prominent.

## Daily challenges

Daily challenges may provide a small number of useful behavioural actions. Avoid giant checklists. About three is a reasonable default when enabled.

## Seasons

Support 6–12 week focus cycles.

A Season may emphasise a small set of Branches/Categories while leaving the whole Project intact.

Requirements:

- 2–4 priority areas is a normal recommendation, not a hard lock
- Compass weights them higher
- all other Branches remain accessible/loggable
- Season review compares intention vs actual behaviour
- no arbitrary “Season completed” XP; achievements earned during it provide progression

---

# 29. ATTENTION BUDGET

Track practical cognitive/goal load, not just whether individual goals are possible.

A user may have:

- a small number of major active focuses
- some maintenance skills
- temporary objectives

If too many high-load goals are active, Pulse/Compass should identify collective overload and suggest pausing or moving some to maintenance.

The user can override.

This system exists to prevent PSX itself from causing excessive simultaneous ambition.

---

# 30. CONSTRAINT GRAPH

Expand beyond simple prerequisites to understand competition for resources.

Constraints may include:

- time
- money
- physical recovery
- cognitive load
- equipment
- venue/access
- licences/certifications
- location
- season/weather
- instructor availability
- travel
- prerequisites

Compass should reason across these constraints rather than evaluating goals independently.

---

# 31. TRAJECTORY

**Trajectory** answers:

> **If current behaviour continues, where is this heading?**

May include:

- progress velocity
- trend direction
- estimated time to next milestone
- plateau/stall state
- regression/rust risk
- North Star projected dates
- workload/readiness effects
- uncertainty/confidence range

Forecasts are always estimates, never promises.

If the sample is too small or unstable, say so.

---

# 32. PROGRESS VELOCITY, PLATEAUS, AND REGRESSION

Track rate of change, not only absolute completion.

Useful windows may include 7d, 30d, 90d, 1y where appropriate.

Plateau detection should require enough comparable data and must distinguish normal noise from meaningful stagnation.

Recommendations should be specific and evidence-aware.

Regression/rust detection feeds the maintenance system without removing historical accomplishments.

---

# 33. BRIEFING

**Briefing** is a concise interpretation of current state.

It may be morning, weekly, or context-triggered.

It should prioritise only meaningful information, such as:

- nearest meaningful progress
- stalled area
- current North Star movement
- one meaningful risk/opportunity
- calendar load
- relevant weather
- recovery/load concern

Briefing should be short by default.

---

# 34. SIGNAL

**Signal** is reserved for genuinely notable changes worth attention.

Possible Signal classes:

- achievement Ready to Claim
- Branch becoming Rusty
- meaningful deadline/conflict
- North Star threshold reached
- material external change
- integration/data-health issue that affects conclusions
- major price change for a tracked Acquisition
- unusual load

Avoid notification spam. If everything is a Signal, nothing is.

---

# 35. CONTEXT MODEL

Pulse/Compass should reason from current real-world context rather than giving generic advice in a vacuum.

With user permission, Context may include:

- Calendar
- Weather
- coarse/appropriate location where genuinely needed
- work/study load
- travel
- active Season
- current Focuses
- recovery/sleep data where connected
- fitness data
- current budget/context mode
- current equipment/access

Context changes recommendations; it does **not** silently change the user’s goals or achievement rules.

---

# 36. CALENDAR INTEGRATION

Calendar gives Pulse awareness of capacity and conflicts.

Use it to understand:

- commitments
- busy/light days
- open time windows
- travel/event load
- time conflicts

Pulse may answer questions about schedule and use Calendar in Compass/Briefing/Conditions/Trajectory/load decisions.

Do not permanently clutter Home with a full calendar. Surface it only when relevant or when deliberately opened.

---

# 37. WEATHER INTEGRATION

Weather should be contextual, not a permanent giant widget.

Use actual forecast/provider data and retain source/update time.

Weather may affect:

- running
- cycling
- hiking
- travel
- skiing/snow sports
- outdoor training
- driving
- clothing/equipment planning
- weather-dependent access

Pulse may suggest moving an activity when conditions materially affect it.

---

# 38. CONDITIONS

**Conditions** sits around the seven Trees and does **not** count toward Project completion.

Conditions describes the environment/system around the person.

It includes:

- Physical Environment
- Digital Environment / Attention
- Social Environment
- Friction
- Focus / Deep Work
- Energy
- Planning
- Feedback & Iteration
- Knowledge System
- Rest & Play
- Risk & Preparedness
- Logistics

Core principle:

> **Make good behaviour easier and bad behaviour more inconvenient.**

Conditions should reduce dependence on willpower.

---

# 39. NORTH STARS

**North Stars** are meaningful concrete outcomes, not abstract XP.

Fields should support:

- name
- type
- current value
- target value
- unit/currency
- optional deadline
- reason/meaning
- linked Branches/Categories
- progress history
- projected date/Trajectory
- status/lifecycle

Examples may include bodyweight, savings, race performance, income, travel fund, etc.

North Stars do not grant self-development XP merely because money is spent or a material object is obtained.

---

# 40. ACQUISITIONS

Acquisitions is a secondary material-goal system.

Types:

- **Want**
- **Upgrade**
- **Enabler** — directly helps another meaningful goal/skill

Users should be able to dump unstructured wants into one text box. Pulse categorises and structures them.

Fields:

- exact item/model/spec
- type
- category
- desired variant
- target price
- best price seen
- seller
- condition
- URL/source
- priority
- status
- notes
- linked North Star/Branch
- price history
- last checked

Research behaviour:

- identify exact model/spec
- search reputable sources
- reject suspicious/mismatched sources
- compare current prices
- distinguish new/used/refurbished where relevant
- retain seller/reputation/warranty/returns information where available
- suggest alternatives separately
- **never silently substitute a different model**
- ask/require user approval before replacing the tracked item

Purchases do not produce Project XP simply for spending money.

---

# 41. LEDGER — CANONICAL EVENT STREAM

**Ledger** is the canonical historical record of what actually happened.

All manual, voice, AI-assisted, and connected-app events should write here first.

Examples:

- workouts
- runs
- bodyweight
- study/practice
- lessons
- courses
- travel
- certifications
- financial updates
- purchases
- check-ins
- skill practice

Each Ledger event should support:

- stable ID
- timestamp
- source/provenance
- source event ID
- confidence/evidence class
- normalized metrics
- raw source payload reference where needed
- linked Trees/Categories/Branches
- linked Achievements
- linked Collections
- linked North Stars
- user edits
- audit history

Nothing important is irreversibly inferred.

---

# 42. INTEGRATIONS PIPELINE

Canonical flow:

**External source → Reconcile → Ledger → Normalisation → Branch/Profile/North Star links → Achievement eligibility → Ready to Claim**

Desired integration classes include:

- Apple Health / HealthKit
- Strava
- Garmin
- Calendar
- Weather
- optional finance/Open Banking
- learning/course providers where useful
- notifications
- secure file/photo storage
- shopping/price research sources

All connectors are opt-in with clear permissions.

---

# 43. RECONCILE

**Reconcile** deduplicates the same real-world event arriving from multiple sources.

Use:

- source IDs
- timestamps
- duration
- distance/metrics
- connector lineage
- tolerance rules

One activity can retain multiple corroborating sources without becoming duplicate Ledger entries.

---

# 44. INBOX

When the system cannot safely classify an import/inference, place it in a small **Inbox** for confirmation.

Inbox must:

- contain only genuinely ambiguous records
- show proposed classification and confidence
- allow confirm/change/dismiss
- stay tiny
- never become another task-management burden

---

# 45. DATA PROVENANCE

Every relevant event/metric should retain its provenance.

Source classes include:

- Certified / official
- External verified connector
- Measured device/result
- Manual entry
- User self-report
- AI inference
- Photo-based observation

Do not flatten these into identical certainty.

---

# 46. CROSS-SKILL IMPACT

One real-world event may legitimately support multiple Branches.

Rules:

- one Ledger event
- multiple justified links
- no double-counted raw activity totals
- Achievement XP only when the actual Achievement is manually claimed
- shared evidence only when the event genuinely demonstrates the relevant standard

---

# 47. PROFILE AND VISUAL PROGRESSION

Profile is the visual expression of development, not a childish avatar.

Possible dimensions:

- Physique
- Engine
- Movement
- Character
- Capability
- Expression
- Freedom
- Appearance

Physical/body visuals may show muscle-group progress where underlying evidence exists.

Other domains should use suitable visual forms rather than forcing everything into a body sprite.

---

# 48. CHECK-INS, PHOTOS, AND VISUAL COMPARISON

Users may voluntarily log:

- physique photos
- bodyweight
- measurements
- running/fitness metrics
- skin/appearance check-ins
- posture/presentation notes
- other supported metrics

AI may compare user-provided images for non-medical visible changes such as muscular development, apparent symmetry, skin redness/texture appearance, hairstyle/facial-hair presentation, etc.

AI must:

- communicate uncertainty
- avoid medical diagnosis from appearance
- allow user correction

---

# 49. PERSONAL RECORDS

Maintain a derived records layer for objectively comparable metrics where appropriate.

Examples include fastest run, longest run, strongest lift, longest swim, certification level, savings milestone, etc.

Records must retain provenance and derive from Ledger rather than existing as disconnected manual facts where possible.

---

# 50. TIMELINE

Provide a clean chronological Timeline spanning relevant Project activity.

Allow filtering by:

- Tree
- Category
- Branch
- event type
- source
- date range
- North Star
- Acquisition
- Condition where applicable

---

# 51. SNAPSHOTS

Users may create named Snapshots such as meaningful ages, trips, periods, or transitions.

A Snapshot may include selected:

- photos
- body metrics
- records
- Tree/Branch completion
- capability states
- North Stars
- current Focus/Season
- key notes
- Acquisitions if relevant

Snapshots are historical and comparable.

---

# 52. YEAR IN REVIEW

Generate a factual annual retrospective with:

- major achievements
- strongest progress areas
- stalled/paused areas
- personal records
- North Star movement
- skill breadth gained
- selected snapshots
- Conditions improvements
- concise Pulse interpretation

Avoid social-media-style inflated statistics or forced celebration.

---

# 53. REVIEWS

Review is a functional system, not a gamified obligation.

Supported horizons:

- Daily — quick capture/log only
- Weekly — priorities, Inbox, active Focuses
- Monthly — movement, rust, Conditions, North Stars, Trajectory
- Quarterly — Season/focus review and reprioritisation
- Annual — Year in Review and long-range direction

Pulse can prepare Reviews but should not nag aggressively.

---

# 54. GOAL LIFECYCLE

Goals, North Stars, Branch focuses, optional projects, and similar objects should support:

`Planned → Active → Paused → Completed → Archived`

Rules:

- pausing never deletes progress
- archived items remain searchable/history-visible
- Pulse distinguishes inactive from failed
- paused/archived items leave normal active surfaces

---

# 55. DECISION HISTORY

Material changes should leave lightweight history:

- what changed
- when
- why
- evidence/reasoning
- reversibility

Purpose:

- improve accountability
- support self-trust
- reduce repeated reopening of settled low-stakes decisions

Decision history never prevents the user changing their mind.

---

# 56. AMENDMENT SYSTEM

PSX must assume that today’s design/rule may later be improved.

Important Project rules/configuration should be amendment-capable.

An amendment may store:

- current definition
- previous definition
- change reason
- date
- evidence/reasoning
- affected records
- migration effect
- rollback capability

Applicable to:

- achievement thresholds
- Branch definitions
- category placement
- XP weighting
- Platinum requirements
- Compass logic
- Pulse policies
- progression routes
- learner-model assumptions

Historical data must not silently disappear because a rule changed.

---

# 57. CORE VS PROJECT VS PERSONAL CONFIGURATION

Separate three layers:

## Core
Rules that protect integrity, e.g. achievements cannot auto-claim.

## Project Configuration
Taxonomy, progression, achievement standards, Platinum rules, relationship graphs, etc.

## Personal Configuration
User goals, schedule, learning tendencies, preferences, Season, Focus, desired intensity, etc.

Do not let personal preference edits accidentally mutate Core integrity rules.

---

# 58. WHY THIS? EXPLANATION LAYER

Meaningful recommendations should optionally expose a concise **Why this?** explanation.

It may show the factors that drove the recommendation, such as:

- active Season
- recent activity
- current recovery/load
- schedule
- weather
- adherence history
- learner model
- cost/access
- prerequisite readiness

The explanation should be optional so it does not clutter normal use.

---

# 59. RECOMMENDATION FEEDBACK

Users should be able to provide lightweight feedback such as:

- Helpful
- Not useful
- Wrong for me
- Wrong information
- Already knew this

Do not force feedback after every recommendation.

Feedback may update the Personalisation Engine and leave audit metadata where important.

---

# 60. RECOMMENDATION EXPIRY AND EVENT-TRIGGERED REASSESSMENT

Recommendations are not permanent doctrine.

A recommendation may have:

- created date
- review date/window
- assumptions
- expiry trigger

Reassessment may be triggered by meaningful change such as:

- major schedule change
- new job/study load
- injury/recovery change
- travel
- major performance change
- new goal
- Season end
- material equipment/access change

Pulse may suggest reassessment, not silently rewrite everything.

---

# 61. GOOD ENOUGH / ANTI-OVEROPTIMISATION LOGIC

Pulse must be capable of saying:

> **No change recommended. Continue.**

Do not constantly search for tiny theoretical optimisations when the current method is effective, sustainable, safe, and aligned with the user’s goals.

The system should understand diminishing returns.

This applies to training, diet, routines, equipment, schedules, learning methods, productivity, and other domains.

---

# 62. ANTI-GAMING RULES

PSX should resist optimisation of the app instead of the person.

Do not reward:

- app opens
- meaningless logging
- fake micro-goals
- repeated trivial achievement farming
- excessive streak chasing
- overtraining to raise metrics
- unsafe manipulation of body metrics
- spending money as progress
- compulsive checking

XP/progression should come from actual achievement standards and real progress, not time spent interacting with software.

---

# 63. COVERAGE AUDIT

During infrequent higher-level Reviews, Pulse may audit the Project for meaningful capability gaps.

The audit should identify only material omissions or imbalance, not invent endless hobbies/features.

Possible new Branch/category suggestions must be:

- explained
- optional
- reviewable
- never auto-added

This is the controlled mechanism for future gaps without endlessly expanding the product.

---

# 64. SIMULATION / PREVIEW BEFORE MATERIAL CHANGES

Before significant Project changes, provide a preview when useful.

A preview may show:

- what becomes Active/Paused/Maintenance
- expected time/cost/load change
- conflicts
- affected North Stars
- affected Compass weighting
- relevant dependencies

Then the user chooses Apply/Cancel.

---

# 65. UNDO AND AUDITABILITY

Every reversible manual/Pulse write should support Undo.

Include:

- immediate inline Undo for common writes
- history restore for larger changes
- autosave/versioning before destructive edits
- sync conflict handling
- audit trail for AI actions

Users should not fear experimenting because a mistaken tap could permanently damage the Project.

---

# 66. DATA HEALTH

Create a mostly invisible **Data Health** layer.

It should track:

- connector state
- last sync
- failed syncs
- missing permission
- incomplete data ranges
- duplicate suspicion
- failed background jobs
- stale external data

Pulse must account for data quality before drawing conclusions.

Do not state “you did not do X” if the relevant source may simply be unavailable/incomplete.

---

# 67. CONTEXT MODES

Support temporary context modes such as:

- Travel
- Work-heavy week
- Exam/study period
- Recovery/injury-conscious period
- Low-budget period
- High-social-load week
- Offline/poor connectivity

Context may be set manually or inferred cautiously with visible confirmation.

It may modify Compass/Daily Challenges/Conditions recommendations, but not achievement rules or underlying goals.

---

# 68. COST, TIME, EQUIPMENT, AND ACCESS METADATA

Branches, Achievements, Collections, and Acquisitions may support optional planning metadata:

- expected cost band
- recurring cost
- estimated practice time
- typical session duration
- equipment required
- venue/access
- instructor/certification requirement
- travel requirement
- weather/season dependence

Compass uses this to make realistic recommendations.

---

# 69. PRINCIPLES

Home may rotate understated Principle lines.

These should be restrained, useful, and non-tacky.

Examples of the accepted tone:

- Act before certainty arrives.
- Competence is accumulated proof, not a mood.
- Choose the next useful action, not the perfect plan.
- Your first reasonable judgment deserves a chance before reassurance.
- When plans change: assess, adapt, continue.

No grindset spam.

Quiet Mode may suppress Principle rotation.

---

# 70. QUIET MODE

Quiet Mode preserves all core functionality while suppressing optional gamification.

May suppress:

- achievement sounds
- spoken reactions
- celebratory animations
- nonessential Signals
- Daily Challenge emphasis
- Principle rotation

Still available:

- logging
- search
- Atlas
- Ledger
- manual navigation
- core Pulse actions where enabled

---

# 71. ACCESSIBILITY

Settings must expose understandable controls for:

- Motion: Full / Reduced / Minimal
- Haptics: Off / Light / Standard
- Achievement sounds: Off / On
- Spoken achievement names: Off / On
- Voice: Off / Talk / Conversation
- text size
- contrast
- colour accessibility where needed
- animation reduction
- notification categories

Accessibility must retain functional parity.

---

# 72. GUIDE

Settings contains a concise **Guide**.

The Guide should explain:

- what Project Self Ultra is
- Project hierarchy
- achievements/evidence/claiming
- Pulse text/voice
- daily workflow
- Reviews
- North Stars
- Acquisitions
- Atlas
- Ledger
- Conditions
- Trajectory
- Mastery+
- maintenance/rust
- privacy/connections
- customisation/amendments

Do not require a large onboarding tutorial.

The interface and Pulse should teach terminology contextually through normal use.

---

# 73. PERMISSION TIERS

Pulse permissions:

- **Read** — inspect Project data
- **Suggest** — propose without writing
- **Draft** — prepare a change for review
- **Change** — perform permitted reversible writes

Sensitive/destructive actions require explicit confirmation.

Pulse may never automatically:

- claim achievements
- purchase products
- transfer money
- perform destructive account/security actions

---

# 74. SAFETY BOUNDARIES

High-risk skills must remain framed around lawful, supervised, controlled, proportionate contexts.

Examples of safety policy categories:

- combat/self-protection: awareness, de-escalation, escape, proportionate response, stop force when threat stops
- firearms: lawful sporting marksmanship, range safety, platform familiarity, no tactical killing/maiming instruction
- advanced driving/drifting/wheelies: controlled/private/training environments
- gymnastics/flips: coached progression
- freediving/breath-hold: never alone
- climbing/scuba/electrical/welding/first aid and similar: qualified instruction/certification/supervision where appropriate

Personalisation must not bypass safety prerequisites.

---

# 75. PRODUCTION ARCHITECTURE

Recommended production architecture:

## Client

- **React Native + Expo + TypeScript** for iOS/Android
- Expo Router or equivalent structured navigation
- shared component/design system
- offline-capable local store/event queue

## Web

- optional **Next.js + TypeScript** companion web app using the same backend/API

## Backend

- **PostgreSQL / Supabase-class backend**
- authentication
- Row Level Security / per-user isolation
- object storage for evidence/photos
- realtime where useful
- background jobs
- versioned migrations

## AI

- **OpenAI API** or equivalent capable tool-using model layer for Pulse
- server-side credentials only
- typed tools/functions
- no secret API keys in the mobile bundle

## Build/distribution

- Expo EAS / native build pipeline
- development builds
- TestFlight/internal beta before public release

The implementation may use technically equivalent tools if the coding agent has a compelling reason, but must preserve capabilities and security.

---

# 76. DATABASE / CORE ENTITIES

At minimum model:

- User
- ProjectConfig
- CoreRuleVersion
- Amendment
- Tree
- Category
- Branch
- BranchRelationship
- Achievement
- AchievementPrerequisite
- AchievementRule
- Progress
- Evidence
- Claim
- MaintenanceState
- SkillRetentionProfile
- Collection
- CollectionItem
- LedgerEvent
- LedgerSource
- LedgerLink
- ReconcileDecision
- InboxItem
- NorthStar
- NorthStarObservation
- Acquisition
- PriceObservation
- Condition
- ContextState
- CalendarContext
- WeatherContext
- Focus
- Season
- DailyChallenge
- Principle
- TrajectoryEstimate
- Briefing
- Signal
- ProfileMetric
- CheckIn
- Snapshot
- PersonalRecord
- Review
- DecisionRecord
- LearnerModelDimension
- LearnerModelEvidence
- PersonalExperiment
- Recommendation
- RecommendationFeedback
- AttentionBudgetState
- Constraint
- Integration
- IntegrationToken/secure reference
- DataHealthStatus
- NotificationPreference
- PulseActionAudit
- AuditLog

Canonical IDs should remain stable across app versions.

---

# 77. BUSINESS LOGIC MUST NOT LIVE ONLY IN THE LLM

Critical rules must be deterministic code/services, not prompt-only behaviour.

Examples:

- achievement eligibility
- prerequisite evaluation
- Claim prohibition
- XP calculation
- Platinum eligibility
- duplicate reconciliation thresholds
- permission checks
- schema validation
- lifecycle transitions
- audit logging
- data ownership

Pulse may interpret evidence and call typed tools, but core integrity is enforced by code.

---

# 78. OFFLINE-FIRST

Core navigation and logging should work without network access.

Requirements:

- local event queue
- local cached Atlas/Project data
- deterministic sync after reconnect
- conflict handling
- cloud-dependent Pulse/research features clearly distinguished when offline
- connector updates processed when back online

---

# 79. SECURITY AND PRIVACY

Required:

- secure authentication
- MFA/2FA support
- least-privilege connector scopes
- encrypted transport
- encrypted sensitive storage
- secure server-side secrets
- explicit consent for health/photo/finance data
- deletion controls
- export controls
- connector revocation
- AI action audit trail
- read-only financial integrations by default
- no automatic purchases/transfers

Privacy-sensitive user modelling must be inspectable and correctable.

---

# 80. BACKUP, VERSIONING, AND PORTABILITY

Required:

- encrypted cloud backup
- automatic snapshots
- versioned schema migrations
- rollback path for failed migrations
- stable canonical IDs
- full JSON export
- useful CSV export for Ledger/metrics
- human-readable report/PDF export where useful
- export of user-owned evidence/photos

The user’s Project must never be trapped in the application.

---

# 81. DIAGNOSTICS / DEVELOPER VIEW

Advanced Settings should expose diagnostics without cluttering normal use.

Include:

- integration status
- last sync
- source event IDs
- Reconcile decisions
- achievement-rule tests
- prerequisite/relationship graph inspection
- AI action audit
- failed background jobs
- schema version
- data integrity checks
- notification test
- export validation
- Data Health state

---

# 82. SETTINGS ARCHITECTURE

Top-level Settings groups:

- Account & Security
- Pulse & Voice
- Appearance & Motion
- Notifications & Signal
- Connections
- Privacy & Data
- Guide
- Project Editing
- Accessibility
- Diagnostics (advanced)

Use progressive disclosure. Do not put dozens of toggles on the first Settings screen.

---

# 83. REQUIRED TESTING

Automated tests must cover at least:

- canonical import counts = 7 / 34 / 150 / 619
- canonical IDs remain stable
- achievements cannot auto-claim under any AI/import path
- prerequisite logic
- Branch/Category/Tree completion propagation
- Mastery+ does not block Platinum
- maintenance/rust never removes historical Claims
- Reconcile duplicate handling
- one Ledger event may link to multiple Branches without duplicating raw activity
- permission tier enforcement
- Undo/history
- offline queue/sync
- connector incomplete-data handling
- data export/import roundtrip
- schema migrations
- amendment rollback
- learner-model corrections
- personalisation decay
- recommendation expiry
- Context changes do not mutate canonical achievement rules
- Acquisitions never generate development XP just for purchases
- Signals respect notification thresholds
- Quiet Mode preserves core functionality

---

# 84. ACCEPTANCE CRITERIA FOR PULSE

Pulse is production-ready only if it can reliably:

- navigate any canonical Branch/Category/Tree
- search Atlas content
- log natural language into Ledger
- avoid making unsupported mastery claims
- identify Ready-to-Claim without claiming
- explain evidence/prerequisites
- retrieve North Stars and progress
- update allowed North Star fields
- manage Collections
- summarise recent progress
- compare relevant historical records
- use Calendar/Weather/Conditions when relevant
- distinguish data gaps from true inactivity
- research with evidence/confidence labels
- personalise advice from the Learner Model
- expose Why this? reasoning
- accept correction
- stop after answering when no follow-up is needed

---

# 85. ACCEPTANCE CRITERIA FOR UX

The product is not acceptable if a new user has to memorise the taxonomy before using it.

A user should be able to:

- open Home and immediately understand Pulse is central
- tap the logo to talk
- type to Pulse
- manually reach Atlas
- manually reach every skill from Atlas
- understand North Stars/Atlas from context
- find Settings/options immediately
- see only current relevant information on Home
- manually perform any important action without relying on a secret gesture
- reduce/disable motion
- use Quiet Mode

The app should feel like a coherent spatial system rather than a library of disconnected pages.

---

# 86. WHAT NOT TO ADD

Do not add the following merely to make the product look larger:

- another major Tree without a demonstrated structural need
- public social feed
- public leaderboards
- daily login rewards
- XP for opening the app
- loot-box currencies
- meaningless badges
- constant streak pressure
- endless motivational notifications
- AI mascot/avatar wandering around
- dozens of Pulse personalities
- hidden gesture-only functionality
- giant permanent weather/calendar widgets
- excessive branded jargon
- endless new dashboards

The feature architecture is considered **essentially complete**. Future work should default to refinement, reliability, testing, simplification, and implementation rather than expansion.

---

# 87. IMPLEMENTATION PRIORITY

Recommended build order:

1. canonical database + import
2. authentication/user isolation
3. Atlas hierarchy/navigation
4. Ledger/event model
5. Achievement Engine + manual Claim enforcement
6. Branch/Category/Tree progress + competence states
7. Collections
8. Home/Pulse shell
9. North Stars
10. Focus/Seasons/Compass
11. maintenance/rust/retention
12. Trajectory/progress velocity
13. Conditions + Context model
14. Calendar + Weather
15. Pulse typed tool layer
16. learner/personalisation model
17. Reviews/Timeline/Records/Snapshots
18. Reconcile + connector pipeline
19. Strava/Health/Garmin
20. Acquisitions research
21. amendments/versioning/Undo
22. Data Health/diagnostics
23. security hardening/export/backup
24. performance/offline/sync hardening
25. TestFlight/internal beta

This order may be parallelised, but core data integrity and Claim rules must exist before production integrations.

---

# 88. SHIPPED REFERENCE FILES

This blueprint bundle includes:

- `MASTER_BLUEPRINT.md` — canonical product/implementation specification
- `canonical_data.json` — current canonical 7/34/150/619 Project dataset
- `prototype_reference.html` — old prototype for behavioural reference only
- `assets/original_logo_reference.png` — approved original logo; preserve it
- `assets/visual_direction_reference.png` — visual direction reference only
- `REQUIREMENTS_CHECKLIST.md` — implementation audit list
- `BUILD_PROMPT_FOR_GROKBOT.md` — concise instruction to the coding agent
- `manifest.json` — bundle metadata/checksums/counts

Where a visual reference conflicts with a later written requirement in this document, **the written requirement wins**.

Where the prototype conflicts with this document, **this document wins**.

Where a coding convenience conflicts with the Project Constitution, **the Constitution wins**.

---

# 89. FINAL PRODUCT PRINCIPLE

Project Self Ultra should become **more intelligent as it learns about the user while requiring less attention from the user as the user becomes more capable**.

The software is successful when it makes the user more competent, more independent, more adaptable, and less reliant on the software itself.

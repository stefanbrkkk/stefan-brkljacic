1. Make the fix on whatever you are working on.
2. Send a judge agent to judge your work objectively on how it fixed the thing you were working on from 1 to 10.

# Portfolio Remediation Implementation Plan

> For agentic workers: use Superpowers execution, systematic debugging, test-driven development and verification before completion. The user-defined per-fix and per-phase judge gates override any skill default that provides fewer reviews. Do not implement before the required plan/design review.

**Goal:** Implement the 16 audit findings in three phases, preserve Stefan’s established visual identity, verify representative phone/tablet/laptop experiences, and publish the validated changes to `origin/main`.

**Architecture:** Retain a static HTML/CSS/JavaScript site. Correct existing behavior first; revise content/layout second; extract assets and organize the implementation third. Do not migrate to React/Next.js or add a contact backend. Use one inquiry controller, one navigation controller and one motion-mode controller. Essential content must work without animation.

**Tech stack:** Existing HTML/CSS/JavaScript; Node development tooling; Playwright browser regression tests; HTML validation and linting. Production requires no JavaScript framework or server. Exact development-package versions will be resolved from official sources at setup and committed in a lockfile; do not invent version numbers in this plan.

**Spec:** The design contract below, `Stefan_Brkljacic_Portfolio_Audit.html` (findings F01–F16), and both supplied portfolio source-of-truth documents. Both truth documents are identical. Executors must read the complete audit and truth before editing copy.

**Verified starting point:** `stefanbrkkk/stefan-brkljacic`, `refs/heads/main`, commit `289a06a7bf0374d93b87ecb3a2aaba80f4e6bf2d`. Repository blob IDs match all four ZIP files: `index.html` `70af10ea22e064951790782925e5dc6fb2d855b4`; README `2b9029c695be32c2b137dcfa4f6127762b03954f`; both JPEGs `af2da194fc4f9b21faf520a08735bf8971c1dc2f`. Authenticated GitHub reads now succeed and permission metadata includes push. Terminal HTTPS cloning lacks credentials; use the authenticated connector if that remains true.

## Design contract

- Preserve dark ink, warm paper, lime accents, sans/italic-serif typography and one flagship decomposition sequence. This is an editorial/behavioral improvement, not a new brand.
- Order the main journey: concise offer → selected work → services/FAQ → one compact process explanation → about → contact. Keep every existing useful anchor reachable, even if its visual section is consolidated.
- Give Harmonije the lead project position; retain all four projects. Add compact, native expandable case-study details. Do not create invented customer metrics, testimonials or employer experience.
- Use the documented contribution wording; remove exclusive “solo” and exact launch-month claims unless separately confirmed. Gym remains public preview; GlasAI remains concept/demo; Sheetpost explicitly states simulated KSeF integration.
- All primary inquiry entry points open the same guided dialog. Service entry points preselect their type. “Email directly” remains available as a secondary ordinary mailto link and as the no-JavaScript alternative. No action sends a message automatically.
- The dialog shows an editable message with optional context fields: project goal, current website URL and desired timing. Blank optional fields do not prevent contact. Values remain in page memory only and are not sent except when the visitor explicitly uses an outbound email action. Copying and opening LinkedIn are separate controls.
- Default language is English unless a valid saved `en`/`sr` preference exists. Fully translate ordinary visible and accessible interface text. Preserve names, code identifiers and technology names where appropriate.
- Static-first layout: project content, proof and process remain readable when JavaScript is unavailable or motion is reduced. Use native details/summary for case studies and FAQ.
- Shorten desktop anatomy from 390vh to an initial 200vh design target. On coarse-pointer, short-height, narrow or reduced-motion layouts, show a compact diagram/list without a pinned scroll sequence. Adjust if real screenshots demonstrate poor fit; record the decision.
- Use screenshot aspect ratio and content-led project heights rather than 92vh rows/76vh previews. Initial section spacing tokens: 24, 40, 64 and 96px, scaled with clamp where necessary. Keep hero breathing room; do not strip its character merely to minimize page height.

## Global constraints

- Exactly three implementation phases, each with multiple sub-phases.
- Every independent fix receives an independent judge review after implementation and verification. A sub-phase groups only changes that share an acceptance test and reviewable outcome.
- Every phase receives a separate cumulative judge review before the next phase starts.
- Required passing score: **strictly greater than 8.5/10**, recorded to one decimal place; 8.5 fails and 8.6 passes.
- No unresolved critical or important defect may pass, regardless of aggregate score. No self-awarded score and no fabricated judge verdict.
- Missing browser/device evidence is recorded as BLOCKED or UNVERIFIED. Do not treat a device mockup, CSS inspection or desktop screenshot as a real-device pass.
- Do not pressure judges to increase scores. Re-submit changed work with new evidence and let the judge score independently.
- Keep `main` unchanged until all phases, final checks and final review pass. Push without force and without overwriting concurrent changes.
- The user has authorized final publication to `origin/main`. No new generic push permission is needed after the implementation gate, unless a protection/security policy creates a specific new blocker.

## Review focus

1. EN/SR text length and 200% zoom must not clip controls or obscure actions: owned by 1A and 2C.
2. Closing dialog by Close, Escape or backdrop returns focus to the initiating control, including after earlier openers: owned by 1B.
3. Clipboard denial, unsupported Clipboard API and popup restrictions must not produce false success or eliminate direct email: owned by 1B.
4. Menu-open rotation/resizing and motion-preference changes mid-scroll must reset locks, inert state and inline transforms: owned by 1C.
5. JavaScript-disabled or failed initialization must leave essential content and contact alternatives usable: owned by 1D, repeated after extraction in 3A.

## Review loop and scoring contract

For each independently reviewable fix:

- [ ] Reproduce the defect or record the source-backed requirement; capture a failing behavior test when feasible.
- [ ] Implement the smallest coherent fix and run its focused check plus the existing regression suite.
- [ ] Commit locally and send a read-only judge a fresh context: requirement, finding IDs, base/head commits, relevant files, test results and screenshots.
- [ ] Judge returns: score /10; weighted breakdown; specific strengths; defects with severity; evidence inspected; unverified conditions; changes needed to exceed 8.5. Judge must not modify source or delegate further reviewers.
- [ ] If score ≤8.5 or a critical/important issue remains, reproduce the finding, fix it, rerun checks and request a new review. Preserve all prior scores and evidence.
- [ ] Mark complete only when score >8.5, evidence supports it and blocking issues are resolved.

**Rubric:** correctness 35%, usability/accessibility 25%, responsive behavior 20%, maintainability 15%, fidelity to truthful content/visual direction 5%. For a fix that genuinely has no responsive or visual dimension, the judge must explicitly redistribute those weights before scoring. Numerical scores are calibrated judgments, not scientific measurements. A final phase must have rendered evidence for its responsive claims; source-only review cannot certify those claims.

At each phase end dispatch a fresh judge for the entire phase, independently of the fix judges. Repeat the same correction loop. Keep a review ledger in `docs/superpowers/reviews/2026-10-04-portfolio-remediation.md` with commit range, checks, score history and unresolved items.

## Intended file structure

| Path | Responsibility |
|---|---|
| `index.html` | Semantic initial EN content, metadata, native disclosures/dialog and component markup |
| `styles/site.css` | Existing design tokens, components, layouts and responsive/static-motion rules |
| `scripts/main.js` | Initialization only; enhancement classes applied after successful setup |
| `scripts/content.js` | Canonical EN/SR project, service and accessibility copy |
| `scripts/inquiry.js` | Dialog state, focus restoration, message editing and outbound links |
| `scripts/navigation.js` | Menu focus, inert/scroll lock, anchors and breakpoint reset |
| `scripts/motion.js` | Hero/project/anatomy rendering, visibility and motion-mode reset |
| `assets/fonts/` | Extracted existing font payloads; licensing/provenance reviewed |
| `assets/projects/` | Existing screenshot payloads and verified local device captures |
| `tests/*.spec.js` | Behavioral, responsive, fallback and asset regression checks |
| `playwright.config.js` | Browser/viewport projects and local web server |
| `package.json`, `package-lock.json` | Development commands and reproducible tooling |
| `eslint.config.js`, `.stylelintrc.json`, `.htmlvalidate.json` | Explicit JS/CSS/HTML validation rules appropriate to the existing static site |
| `.github/workflows/verify.yml` | Validation and browser regression CI |
| `README.md` | Local preview, checks, content updates and deployment procedure |

Controllers will first be consolidated in the existing scripts to reduce simultaneous extraction/behavior changes. Phase 3 moves them to these files while preserving the tested interfaces. Private helpers are free to change; no application globals are required.

**Development command contract:** `npm run dev` serves the repository at `127.0.0.1:4173` with the development-only `http-server` package; Playwright starts that server through `webServer`. `npm test` runs the complete Playwright suite; `npm run test:e2e` is its documented alias. `npm run lint` runs ESLint on authored JavaScript and Stylelint on CSS. `npm run validate:html` runs html-validate on `index.html`. `npm run check` runs lint, HTML validation and the full test suite sequentially. The first task creates this shared setup; Phase 3 finalizes its configuration and CI. Do not suppress existing errors without documenting why a rule does not apply.

**Source references for execution:** current checkout `index.html` locations from the audit remain useful until extraction: layout 1096–1130; language 1878–2000; motion 2021–2255; inquiry 2288–2300 and 2375–2425; menu 2352–2368; reduced-motion CSS 1324–1348. Once moved, update the review ledger to the new paths instead of continuing to cite obsolete line numbers.


## Economical verification amendment — 2026-10-04

User requested reduced usage during execution. This amendment supersedes per-sub-phase instructions to rerun the complete suite:

- Run focused checks for the changed behavior and directly affected contracts per sub-phase. Preserve meaningful red/green evidence and inspect representative changed UI.
- Run the integrated Chromium regression suite once at each remaining phase boundary, with targeted Firefox/WebKit checks for changed integration risks. Run the complete three-engine acceptance suite at final release. Phase1 already has a complete three-engine boundary run.
- Independent sub-phase judges inspect the change and existing evidence; rerun only checks needed to answer a concrete concern. Independent phase judges reuse the recorded boundary run and add targeted probes if needed.
- Retain every independent judge, the strict >8.5 threshold, and the final complete release acceptance gate. Reuse unchanged valid evidence; record unsupported capabilities accurately.
- Keep worker/reviewer context scoped to the owning brief, changed files and compact reports.

## Phase 1 — Correctness, accessibility and truthful state

### 1A · Repair nested layout and canonical claims — F01, F03, F04, F08

**Files:** modify `index.html`; create `tests/layout.spec.js`, `tests/content.spec.js` and the shared Playwright setup needed by these tests.

**Interfaces:** content schema `Record<'en'|'sr', Record<string,string>>`; `setLanguage(language: 'en'|'sr'): void`; invalid persisted values resolve to EN. Initial HTML must match canonical EN for every translated content field.

- [ ] Create failing layout cases at 1363×936 for the Verification checklist, in EN and SR. Assert every checklist bounding box stays inside its card; scrollWidth must not exceed clientWidth by more than 1px. Include 200% zoom/reflow review.
- [ ] Create failing cases for fresh SR browser locale → EN default, saved SR → SR after reload, and initial HTML versus canonical EN promises. Assert no unsupported solo/date claims and explicit Sheetpost simulation text.
- [ ] Repair nested grid with shrinkable tracks/items and wrapping; use one checklist column when container width requires it.
- [ ] Reconcile HTML/runtime service and QA copy; complete the translation map and accessible labels, fix Serbian spelling/duplicate keys and use actual anatomy phase state.
- [ ] Run `npx playwright test tests/layout.spec.js tests/content.spec.js` and the established full suite; expected zero failures. Capture failing-width before/after screenshots.
- [ ] Commit and run the per-fix judge loop. Gate 1A at >8.5.

### 1B · Unify inquiry and contact recovery — F02, F07

**Files:** modify `index.html`; create `tests/inquiry.spec.js`.

**Interfaces:** `openInquiry({opener: HTMLElement,type: 'website'|'prototype'|'polish'|'qa'|null}): void`; `closeInquiry(): void`; `buildInquiry({type,language,goal,currentUrl,timing,message}): {subject:string,body:string,mailto:string,gmail:string}`; `copyMessage(text:string): Promise<boolean>`. A type selection updates the draft; visitor edits are preserved until an explicit reset. Language changes preserve entered context and notify before replacing an edited draft.

- [ ] Reproduce stale focus: open from contact, close, open from each service, close; assert activeElement is that service opener. Repeat with Escape/backdrop.
- [ ] Add failing cases for non-Gmail mailto, URL-safe message encoding, clipboard rejection and no false LinkedIn copy-success toast. Verify entered `&`, diacritics and line breaks survive in decoded body.
- [ ] Consolidate all primary openers; keep direct email fallback. Implement separate copy/profile controls, selectable/editable message and optional context fields. State that the visitor sends the message in their chosen app.
- [ ] Test real browser permissions/fallback branches where possible; no test sends an email or LinkedIn message. Check dialog keyboard containment and opener focus.
- [ ] Run `npx playwright test tests/inquiry.spec.js` and the full suite; capture desktop and narrow dialog screenshots.
- [ ] Commit and run the per-fix judge loop. Gate 1B at >8.5.

### 1C · Repair menu and motion lifecycle — F06, F12, F14

**Files:** modify `index.html`; create `tests/navigation.spec.js`, `tests/motion.spec.js`.

**Interfaces:** `setMenuOpen(open:boolean,{restoreFocus:boolean}): void`; `applyMotionMode({reduced:boolean,coarse:boolean,width:number,height:number}): void`; `requestFrame(): void`. One mode application clears stale transforms/filter/clip state and renders the correct static composition.

- [ ] Add failing menu-open 390×844 → 1280×720 resize test; assert main is no longer inert, page scrolling is restored and menu aria state is closed. Include Escape, link navigation and tab order across intended active header/menu controls.
- [ ] Add failing mid-scroll reduced-motion toggle cases for hero, projects, services and anatomy; assert essential content visible, transforms reset and pointer motion inactive. Test reduced motion at startup too.
- [ ] Centralize menu reset and motion state; remove noninteractive start-step tab stops. Use visibility gating and one RAF scheduler, batch geometry reads before writes and avoid permanent will-change for inactive scenes.
- [ ] Verify project/coarse-pointer behavior, orientation and small-height static anatomy. Inspect scroll traces to ensure offscreen scenes stop writing styles.
- [ ] Run `npx playwright test tests/navigation.spec.js tests/motion.spec.js` plus suite; expected zero failures.
- [ ] Commit and run per-fix judge loops. Gate 1C at >8.5.

### 1D · Make fallbacks readable and robust — F05, F06

**Files:** modify `index.html`; create `tests/fallbacks.spec.js`.

**Interfaces:** static content is the default; add component enhancement-ready classes only after successful initialization. No universal early `.js` class may hide content after a main-script failure.

- [ ] Add failing JS-disabled and blocked-main-script cases: project headings/proof content visible, process layers non-overlapping and direct email reachable.
- [ ] Remove unconditional hidden essential content; provide observer fallback; use static card placement in CSS. Remove 560px reduced-motion method-card minimums.
- [ ] Run `npx playwright test tests/fallbacks.spec.js` plus suite. Document unsupported legacy-browser behavior rather than inventing support.
- [ ] Commit and run per-fix judge loop. Gate 1D at >8.5.

**Phase 1 gate:** fresh judge reviews all Phase 1 changes and integrated EN/SR/contact/menu/motion/fallback interactions. Do not start Phase 2 until >8.5 and no important defects remain.

## Phase 2 — Project proof, page rhythm and responsive experience

### 2A · Build useful project evidence — F04, F09

**Files:** modify `index.html` and canonical content; create `tests/projects.spec.js`.

**Interfaces:** project record `{id,title,status,role,problem,constraints,solution,deliverables,links}` in both languages; native case-study disclosures remain functional without JS.

- [ ] Specify each case-study assertion from the truth: Harmonije catalogue/search/quantities/inquiry; Gym programmes/schedules/trial inquiry/public preview; GlasAI concept/demo boundaries; Sheetpost CSV preview/validation/simulated KSeF. Do not infer commercial results.
- [ ] Add the compact evidence sections and live/source actions. Keep project status adjacent to the project heading. Retain available links; do not invent missing repositories.
- [ ] Test native expand/collapse with keyboard and JS disabled; inspect EN/SR content and link semantics. Check images/description consistency; if business identity remains uncertain, use the verified “catalogue and inquiry website” wording.
- [ ] Run `npx playwright test tests/projects.spec.js` plus suite; commit and judge >8.5.

### 2B · Reduce repetition and ineffective spacing — F10, F11

**Files:** modify `index.html` and layout styles; extend `tests/layout.spec.js`.

**Interfaces:** retain all existing section anchors; natural-height project layouts; anatomy desktop target 200vh; compact static version otherwise.

- [ ] Capture baseline hero/work/anatomy/service/method page positions at matched viewports; define content boundaries and screenshot aspect ratios.
- [ ] Move extended philosophy behind project evidence, consolidate anatomy/method storytelling and retain a single flagship sequence. Fit screenshots to intrinsic ratios; remove viewport minimums that create empty framing.
- [ ] Make useful desktop secondary text ≥12px, primary body generally 16px and dialog helper text ≥12px. Decorative codes may remain smaller only if redundant.
- [ ] Verify readable diagrams, unchanged anchor navigation, no overlap/clipping and no missing information in EN/SR. A shorter page alone is not the acceptance criterion.
- [ ] Run layout/motion/project checks plus suite; capture before/after desktop and narrow views; commit and judge >8.5.

### 2C · Refine phone and tablet layouts — F01, F10, F11, F12

**Files:** modify layout/component styles; create `tests/responsive.spec.js`.

- [ ] Define tests at 320×568, 360×800, 390×844, 768×1024, 1024×768, 1280×720, 1363×936 and 1440×900, plus 844×390 phone landscape. Assert no page/content overflow and every primary action is visible/reachable.
- [ ] Use one-column phone case studies, compact static diagrams and a short dialog. On tablet allow two columns only where actual text/image content fits; use container-driven component transitions rather than unrelated width thresholds.
- [ ] Verify 44px minimum intended touch targets, mobile safe areas, browser chrome changes, long labels and 200% zoom. Confirm hover is supplemental, never the only way to reveal a required action.
- [ ] Run `npx playwright test tests/responsive.spec.js` plus suite in both languages. Capture representative phone/tablet/laptop screenshots.
- [ ] Commit and judge >8.5. Physical-device coverage cannot be replaced by viewport tests.

**Phase 2 gate:** fresh judge evaluates project credibility, scanability, preserved identity, contact usability and rendered layouts. No layout passes from source inspection alone. Score >8.5 and resolve important findings.

## Phase 3 — Assets, maintainability and release verification

### 3A · Extract assets and controllers without regressions — F13, F15

**Files:** create the intended styles/scripts/assets structure; modify `index.html`, package scripts and existing tests.

**Interfaces:** move the established inquiry/navigation/motion functions unchanged into ESM modules; `scripts/main.js` initializes them in a documented order. Fonts/screenshots use relative local asset paths and declared dimensions.

- [ ] Add asset checks for successful requests, no missing relative paths, correct dimensions and no unnecessary inline font/image payloads. Record original HTML size for comparison.
- [ ] Extract existing fonts and project screenshots losslessly first. Generate appropriately sized image variants only after preserving originals/visual comparison. Confirm font licensing before adding attribution or redistributing new font files.
- [ ] Extract CSS and controllers; remove only rules/references proven unused after dynamic-selector review. Consolidate toast ownership and delete abandoned anatomy/method experiments.
- [ ] Run the entire suite, JS-disabled/script-failure checks and screenshots again. Compare cold-load transfer composition; report observed savings rather than estimating Core Web Vitals.
- [ ] Commit and judge >8.5.

### 3B · Own preview evidence and metadata — F16

**Files:** modify `index.html`, metadata/content and `assets/projects/`; create `tests/assets.spec.js`.

- [ ] Download current working device captures through an authorized inbound route, record source/viewport/capture date and store locally. If new captures cannot be produced, label them dated captures; do not call them continuously live or newly verified.
- [ ] Provide image failure behavior that leaves project titles/links useful; preserve the existing social-image path. Confirm/remove unsupported priceRange and add coherent entity URL/IDs.
- [ ] Check preview responses and declared dimensions, canonical URL and structured-data validity. Retain `og-preview.jpg` as a compatibility alias unless old consumers are proven absent.
- [ ] Run assets/content checks plus suite; commit and judge >8.5.

### 3C · Reproducible checks, full acceptance and publication — all findings

**Files:** README, tooling/lockfile, CI workflow, review ledger and validation evidence.

- [ ] Document `npm ci`, `npm run dev`, `npm run lint`, `npm run validate:html`, `npm test`, `npm run test:e2e` and `npm run check` with exact package scripts. Static serving is sufficient; a fake framework build is not needed.
- [ ] Run complete HTML/JS/CSS checks and regression tests; record command, exit code, tested commit and named failures. Run cross-browser projects for Chromium, Firefox and WebKit where available; engine emulation does not equal real iOS Safari.
- [ ] Run the full acceptance matrix below and inspect screenshots/scroll recordings manually. Separate site console errors from extension/automation errors and attach evidence for every exception.
- [ ] Commit and judge >8.5. Run a **fresh Phase 3 judge** on integrated asset loading, maintainability and full-test evidence. Gate >8.5.
- [ ] After all three phases pass, run the full acceptance suite once more against the exact release commit. Dispatch a fresh whole-change judge; fix/recheck until >8.5 and no important defects remain.
- [ ] Fetch current remote main. If it changed, integrate those changes without discarding user work and repeat affected tests/review. Publish a commit parented to the current main; update ref without force. If local Git auth remains unavailable, use GitHub blob/tree/commit/ref tools with the same semantics.
- [ ] Verify remote main SHA equals the tested release commit; inspect deployment status and production smoke behavior. A deployed regression requires repair and a new reviewed commit. Never report a successful push/deployment from permission metadata alone.

## Full acceptance matrix after all three phases

| Area | Required evidence |
|---|---|
| Device categories | Rendered phone, tablet and laptop views at the specified sizes; physical iOS/Android checks where available; otherwise explicitly blocked before claiming real-device coverage |
| Browser compatibility | Chromium, Firefox, WebKit; real Safari/iOS distinguished from WebKit automation |
| Console/network | No unexplained site-origin errors, unhandled rejections, missing assets or failed production requests in normal flows; expected blocked-resource tests logged separately |
| Code quality | HTML validation, JS/CSS lint, meaningful regressions, focused modules, no accidental global handlers/duplicate timers or abandoned branches |
| UI | No clipping/overlap; readable EN/SR content; correct image framing; case studies/actions usable; actual before/after screenshots |
| Motion | Initial/mid-session reduced motion, coarse pointer, offscreen render gating, orientation/height changes; inspect scroll video/performance trace on representative hardware |
| Accessibility | Keyboard sequence, all dialog closers, exact focus return, native disclosures, menu containment/reset, accessible labels, 200% zoom and JS-off content |
| Contact | Encoded drafts preserve user content, universal email fallback, truthful copy failure, separate LinkedIn action; no automated send |
| Content truth | No invented metrics/sole authorship/launch dates; correct project status and simulated integration language |
| Publication | Fresh non-force main update, verified remote SHA, deployment result and production smoke tests |

**Release rule:** zero important defects, every fix and phase >8.5, final fresh review >8.5, and required evidence obtained. If a browser/device/runtime cannot be tested, report the exact coverage gap and continue independent work; do not call the full acceptance gate passed or push under a false compatibility claim.

## Evidence ledger template

`Fix ID | audit findings | base→head | tests/exit | screenshot/trace | judge | score history | unresolved issues | status`

`Phase | cumulative commit range | integration checks | independent phase judge | score history | gate`

`Release | tested SHA | final matrix | final judge | score | observed remote SHA | deployment/smoke status`

## Plan review record

- [x] All F01–F16 mapped to explicit tasks.
- [x] Three phases and multiple sub-phases defined: Phase 1 has four; Phases 2 and 3 have three each.
- [x] Per-fix, per-phase and final reviews are separate; score threshold is strictly >8.5.
- [x] Claims and visual direction constrained by source of truth; no framework migration required.
- [x] Five difficult failure modes assigned to owning tasks and tests.
- [x] Main/blob baseline verified; publication cannot silently overwrite concurrent work.
- [ ] User review of this design/plan required by the explicitly invoked Superpowers workflow.
- [ ] Implementation, judge scores, device checks and publication have not started; this is a plan, not an execution report.

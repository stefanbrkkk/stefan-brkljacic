# Photographic interactive book verification — 11 October 2026

## Revision

The live Three.js hardcover now sits within generated photographic desk imagery with realistic walnut grain, coffee, watch and pen. A matching portrait composition serves narrow screens. Generated calfskin color/bump detail, rounded leather covers, metallic foil printing, visible page stacks, curved resting leaves and real contact/turn shadows integrate the book into the environment. Accessories are photographic, not independently orbitable 3D objects.

The six bilingual spreads retain the original projects, services, process, biography and contact. Wide screens show two physical pages. Widths below 900px or heights below 740px frame one physical leaf, with twelve-leaf navigation, larger typography/actions and complete project previews. Concise catalogue/concept/preview/simulation qualifiers remain visible; full disclosures remain in case studies and reading view.

## Turn continuity

All twelve page faces for the active language/layout are decoded and uploaded before interaction. The 48 shipped faces are baked from the exact English/Serbian wide/compact HTML and local fonts; their manifest hashes design/content sources. CI rejects stale artwork or overflowing source pages. Navigation reuses prepared textures without reconstructing canvases, decoding images or uploading new faces during turns.

The stationary destination is already underneath the moving sheet. Separate front/back textures follow the correct forward/reverse mapping. A segmented sheet bends around its spine; a bounded state controller serializes rapid input. Resizing prepares the new layout separately and commits its maps/semantic-page class only at a stationary boundary. Language and superseded navigation requests are guarded. Rendering stops when idle; hidden tabs, reading view and dialogs pause it. Page-edge geometry uses four instanced batches and deformation integrates each column once per frame. Software renderers use a 0.75 canvas pixel ratio and 512px shadow map; ordinary GPUs retain full resolution. The contact-shadow receiver covers the book area rather than the entire environment.

## Verification

Lint, HTML validation, bilingual binding parity (306 keys, 298 bindings), all 48 artwork faces, checked JavaScript state/geometry types, nine meaningful unit checks and the production build pass. Browser verification includes forward/back turns, rapid input, chapter/hash navigation, opening/closing, cases, inquiry editing, language, reading view, no-JS, reduced motion, initialization failure and context loss. Additional real-WebGL journeys cover all twelve leaves at 390×844 and 1440×600, unchanged preparation counts during navigation, and resizing in the middle of a turn.

The previous photographic revision full local supported-engine run passed 99 checks with one WebKit clipboard capability skip (Chromium 50 passed; WebKit 49 passed, one skipped). All six desktop spreads in both languages, all twelve compact leaves, short-window contact and mobile case previews were captured without page errors. The built production edition passed desktop/mobile primary journeys and its social asset returned HTTP 200, with no failed responses or page errors. Release observations are recorded in the delivery report. Native Apple M2 / ANGLE Metal timing across four forward/reverse turns sampled 222 frames: median and p95 16.7ms, maximum 33.5ms, no observed long tasks, and 12 prepared page faces both before and after. No screenshots were taken during timing. The software-rendered headless-shell check remained slower (100ms median), despite reduced resolution; this is not a universal 60fps claim. Firefox cannot launch on this Mac (profile-folder failure). Linux Firefox explicitly disables WebGL2, so CI tests its complete static journey and skips only hardware-dependent 3D checks after probing capability. A capable renderer that falls back unexpectedly fails verification.

## Independent critique

The separate reviewer rated the initial photographic revision: environment realism 8/10, book realism 7/10, compact usability 8/10, premium impression 7.5/10; turn continuity approximately 8/10 from code, pending frame inspection. Scores are subjective and do not establish hardware performance.

The three highest priorities were addressed: darker cover/lighting and angled resting leaves; larger compact actions and contained project imagery; atomic prepared-layout changes between turns. Compact project qualifiers were restored. The browser suite also exposed and corrected static mobile footer interception and a crowded services leaf. Recorded frames and refreshed screenshots provide visual evidence.

## Limits

The requested reference video was not attached. The desk/accessories are a photographic background, so their perspective does not rotate independently with the book. Printed artwork remains visible on both the resting and moving WebGL sheets; transparent CSS3D HTML preserves native links and keyboard focus. Reading view provides selectable text. Physical iOS/Android devices, screen-reader speech, installed email clients and mobile GPU frame rate remain unmeasured. Desktop timing is specific to the tested Apple M2 renderer. There is no contact-sending backend. Three.js is loaded dynamically but still produces Vite’s chunk-size warning. Generated-asset provenance is documented in `assets/scene-v2/PROVENANCE.md`.


## Continuity refinement

The previous curl used raw progress and overshot its final angle, sinking below the resting page near the end of a turn. Curl now follows eased progress; the positive edge bow and spine curve keep the moving sheet above the book. A regression checks 201 progress steps × 65 sheet positions. Resting and moving sheets use the same 900×1257 printed artwork and shading, removing the bitmap-to-HTML visual handoff. Curved shadow receivers follow the paper rather than lying beneath it. Early Open input waits for the prepared physical cover animation. Language changes during motion stage their artwork/semantic content until a stationary boundary.

The project image, visit action and case-preview image are native links to the project website. Browser tests click each and inspect the resulting popup URL on mobile and desktop. Noninteractive paper clicks advance the compact book; desktop paper clicks use page side for previous/next, with a forward action on the first spread. Navigation still serializes rather than interrupting the moving sheet. Focus-visible controls restore their visible HTML focus feedback.


### Refinement verification results

All 113 supported local Chromium/WebKit scenarios pass, with one WebKit clipboard capability skip. The full run recorded 112 passes and one timing-dependent test-harness failure: viewport resizing could finish before the test clicked the language control, bypassing its intended delayed-wide-artwork condition. The scenario now triggers the language event at the moving-sheet frame and holds all Serbian artwork; its corrected rerun passes in both engines. No application code changed for that test correction. Local project-image, visit-action and case-image popup URLs, whole-paper clicks, first-open preparation and stationary language commits pass in both engines. Native keyboard focus/Enter navigation also passed separately. Refreshed captures cover twelve desktop language/spread combinations, twelve compact leaves and the short-window contact/case layouts with zero page errors. The built desktop/mobile production journey passes with no page errors or failed responses. Deployed CI and live checks are recorded in the delivery report.

Final isolated native Apple M2 / ANGLE Metal timing sampled 218 frames across four turns: median/p95 16.7ms, maximum 33.4ms, no observed long tasks, and 12 uploaded faces before/after navigation. A concurrent QA sample had one 64ms long task; desktop timing is workload-specific and is not a guarantee for every device.


## Cover-opening correction

The stationary left page previously appeared while the cover was still swinging, and its hinge descended through the paper too early. The cover now holds clearance through the first 85% of its arc, carries a printed inner leaf and lowers during the landing. Its inside uses rough cream paper. The inner leaf bends into the resting page shape before the stationary sheet takes over; closing reverses the same schedule. The duplicate left cover was removed and the page stacks now meet their paper surfaces.

Reopening into another chapter commits the fully prepared chapter at the initial closed frame. A regression reproduced the stale artwork before this correction, then passed after it. A geometry unit samples 201 opening positions for cover/inner-paper clearance and delayed page-block reveal. Ten units and lint, HTML, translation, artwork, types and production build checks pass. Desktop/mobile opening, closing, reopening and queued-navigation recordings report zero page errors. Final supported-engine and deployment results are recorded in the delivery report.

The complete final local suite passes 115 Chromium/WebKit checks with one WebKit clipboard capability skip (116 total). The built production edition passes desktop/mobile inquiry, case, reading-view, contact and social-image checks with no failed responses or page errors. The delayed language/resize scenario now waits for the completed compact-layout commit before checking its single active leaf; this removes the prior CI selector race.

A final native mobile capture exposed depth overlap between the nearly flat outer paper and the raised stack/edge lines. The stack and lines now end below the printed surface, preserving clearance and removing white streaks. Fresh desktop/mobile captures show intact text and page artwork. Lint, types, ten units and build were repeated after this geometry adjustment.

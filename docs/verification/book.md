# Photographic interactive book verification — 11 October 2026

## Revision

The live Three.js hardcover now sits within generated photographic desk imagery with realistic walnut grain, coffee, watch and pen. A matching portrait composition serves narrow screens. Generated calfskin color/bump detail, rounded leather covers, metallic foil printing, visible page stacks, slightly angled resting leaves and real contact/turn shadows integrate the book into the environment. Accessories are photographic, not independently orbitable 3D objects.

The six bilingual spreads retain the original projects, services, process, biography and contact. Wide screens show two physical pages. Widths below 900px or heights below 740px frame one physical leaf, with twelve-leaf navigation, larger typography/actions and complete project previews. Concise catalogue/concept/preview/simulation qualifiers remain visible; full disclosures remain in case studies and reading view.

## Turn continuity

All twelve page faces for the active language/layout are decoded and uploaded before interaction. The 48 shipped faces are baked from the exact English/Serbian wide/compact HTML and local fonts; their manifest hashes design/content sources. CI rejects stale artwork or overflowing source pages. Navigation reuses prepared textures without reconstructing canvases, decoding images or uploading new faces during turns.

The stationary destination is already underneath the moving sheet. Separate front/back textures follow the correct forward/reverse mapping. A segmented sheet bends around its spine; a bounded state controller serializes rapid input. Resizing prepares the new layout separately and commits its maps/semantic-page class only at a stationary boundary. Language and superseded navigation requests are guarded. Rendering stops when idle; hidden tabs, reading view and dialogs pause it. Page-edge geometry uses four instanced batches and deformation integrates each column once per frame. Software renderers use a 0.75 canvas pixel ratio and 512px shadow map; ordinary GPUs retain full resolution. The contact-shadow receiver covers the book area rather than the entire environment.

## Verification

Lint, HTML validation, bilingual binding parity (306 keys, 298 bindings), all 48 artwork faces, checked JavaScript state/geometry types, eight meaningful unit checks and the production build pass. Browser verification includes forward/back turns, rapid input, chapter/hash navigation, opening/closing, cases, inquiry editing, language, reading view, no-JS, reduced motion, initialization failure and context loss. Additional real-WebGL journeys cover all twelve leaves at 390×844 and 1440×600, unchanged preparation counts during navigation, and resizing in the middle of a turn.

The final full local supported-engine run passed 99 checks with one WebKit clipboard capability skip (Chromium 50 passed; WebKit 49 passed, one skipped). All six desktop spreads in both languages, all twelve compact leaves, short-window contact and mobile case previews were captured without page errors. The built production edition passed desktop/mobile primary journeys and its social asset returned HTTP 200, with no failed responses or page errors. Release observations are recorded in the delivery report. Native Apple M2 / ANGLE Metal timing across four forward/reverse turns sampled 222 frames: median and p95 16.7ms, maximum 33.5ms, no observed long tasks, and 12 prepared page faces both before and after. No screenshots were taken during timing. The software-rendered headless-shell check remained slower (100ms median), despite reduced resolution; this is not a universal 60fps claim. Firefox cannot launch on this Mac (profile-folder failure). Linux Firefox explicitly disables WebGL2, so CI tests its complete static journey and skips only hardware-dependent 3D checks after probing capability. A capable renderer that falls back unexpectedly fails verification.

## Independent critique

The separate reviewer rated the initial photographic revision: environment realism 8/10, book realism 7/10, compact usability 8/10, premium impression 7.5/10; turn continuity approximately 8/10 from code, pending frame inspection. Scores are subjective and do not establish hardware performance.

The three highest priorities were addressed: darker cover/lighting and angled resting leaves; larger compact actions and contained project imagery; atomic prepared-layout changes between turns. Compact project qualifiers were restored. The browser suite also exposed and corrected static mobile footer interception and a crowded services leaf. Recorded frames and refreshed screenshots provide visual evidence.

## Limits

The requested reference video was not attached. The desk/accessories are a photographic background, so their perspective does not rotate independently with the book. Resting content uses selectable semantic CSS3D HTML; the moving sheet uses its matching raster artwork. Physical iOS/Android devices, screen-reader speech, installed email clients and mobile GPU frame rate remain unmeasured. Desktop timing is specific to the tested Apple M2 renderer. There is no contact-sending backend. Three.js is loaded dynamically but still produces Vite’s chunk-size warning. Generated-asset provenance is documented in `assets/scene-v2/PROVENANCE.md`.

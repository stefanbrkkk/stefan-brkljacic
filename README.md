# Stefan Brkljačić — cinematic portfolio

A real Three.js hardcover book within a photographic walnut-desk environment, with six bilingual editorial spreads, deformable pages, verified project imagery, accessible case studies and the original editable project inquiry flow.

## Run and build

Node 24 and npm:

```sh
npm ci
npm run dev
npm run build
npm run preview
```

Vite serves the development site at http://127.0.0.1:4173. Production output is `dist/`. `vercel.json` configures the existing Git-connected project to build and publish that output.

## Interaction

Click the cover or **Open the book**. Use page edges, arrows, keyboard Left/Right, or the chapter menu to turn/jump. Drag the scene to rotate, wheel/pinch to zoom, and double-click or reset to restore orientation. Touch swipes turn pages; two fingers rotate and pinch. Escape closes the chapter menu or book. Chapter links use `#book/1` through `#book/6`; existing `#work`, `#services`, `#about` and `#contact` links open the complete reading view.

Desktop resting pages use semantic HTML via Three.js CSS3DRenderer. All twelve page faces for the active language/layout are decoded and uploaded before interaction. Baked artwork matches the resting semantic HTML exactly, and is reused throughout navigation. Resizing stages the new artwork and commits it between turns. The moving sheet has 64 horizontal subdivisions and an arc-length-preserving integrated tangent curve, with separate front/back artwork. The state controller serializes transitions and retains a bounded destination during rapid input. The camera is constrained to readable angles. GPU rendering stops when nothing changes, rendering resumes on interaction, and hidden tabs/dialogs pause scene updates.

Below 900px or 740px window height, the same interactive book frames one readable leaf at a time. The twelve-leaf sequence pans within a spread and physically turns between spreads. Reduced motion, failed WebGL initialization and context loss provide a static edition. With JavaScript disabled, the full original portfolio and native case-study disclosures remain available.

## Content and contact

All original project claims, service scope, timings, FAQ, education and social links remain in the expanded reading view. Harmonije is an inquiry catalogue; GlasAI is a concept demo; Gimnastika Kraguj is a public preview; Sheetpost simulates KSeF submission. No results or credentials have been invented. English and Serbian Latin are supported, with saved language preference.

The inquiry dialog keeps optional context and edited drafts in page memory. Visitors explicitly choose mailto, Gmail or copy-to-clipboard. Nothing sends automatically. Project imagery/fonts retain their original provenance and licenses. Desk/accessory photography and leather scans are generated assets; the book, its shadows and moving sheets remain real 3D. See `assets/scene-v2/PROVENANCE.md`.

## Verification

```sh
npx playwright install chromium firefox webkit
npm run check
```

`check` runs JS/CSS lint, HTML validation, translation parity, a baked-artwork freshness/overflow check, checked JavaScript types for the transition/deformation core, unit tests, a production build and Playwright across three engines. Legacy tests for the retired scroll/decomposition design are retained under `tests/legacy`; active project, asset and inquiry tests remain alongside book-specific coverage.

See `docs/verification/book.md` for measured verification, independent critique and limitations. The reference video was not attached, so frame-by-frame fidelity is unverified. Physical devices, screen-reader speech, installed email clients and hardware GPU performance need separate checks.

When editing book content or page CSS, keep the dev server running and execute `npm run artwork` to regenerate the 48 bilingual wide/compact faces, then `npm run validate:artwork`. Generation requires local Chromium.

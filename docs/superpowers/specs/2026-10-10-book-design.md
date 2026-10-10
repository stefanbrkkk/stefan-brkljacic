# Cinematic portfolio book

The supplied master brief is the design source of truth. Preserve the static site's content, EN/SR translations, case study detail, FAQ, social links and editable inquiry workflow. Keep vanilla JavaScript; add Three.js and Vite rather than migrate to React. The reference video was not attached; no frame comparison is possible.

A procedural walnut desk, matte hardcover, paper stacks, spine, watch, pen and ceramic coffee cup form a Three.js scene. Segmented paper geometry bends using an integrated tangent curve; front/back textures remain distinct. A bounded camera frames closed/open states. Semantic HTML pages use CSS3DRenderer for readable, clickable resting spreads, and an expanded reading view supplies full preserved content. On mobile, a smaller 3D preview accompanies a readable single-column spread. Reduced motion/no WebGL use a complete static book reader.

One state controller serializes opening, closing, page turns and chapter jumps. Intermediate input updates a bounded destination; animation always completes one physical turn before the next. Keyboard, page corners, chapter controls, drag, wheel, touch swipe and pinch share this controller. Contact remains available during loading/failure.

Six spreads: contents/introduction; Harmonije/GlasAI; Gimnastika/Sheetpost; services/process; about/toolkit; contact/closing. Project status claims follow existing verified copy. Complete case studies, service scope/timing and FAQ remain in reading view, without invented metrics.

Verify unit state/deformation tests, translation parity, lint, HTML, TypeScript, production build and browser journeys across Chromium/Firefox/WebKit; inspect desktop, all spreads, short windows and mobile widths 360/390/430/768/1024/1440/1920. Obtain an independent critique and fix major findings before commit/push/deployment verification.

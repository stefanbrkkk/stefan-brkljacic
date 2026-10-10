# Photographic book redesign

User-directed revision: replace visibly procedural simplicity with a richly photographic environment, tactile book materials and a compact layout that preserves the book. Eliminate stalls and abrupt artwork changes during turns.

1. Generated photographic desk/accessories responsive photographic background around the book; retain real deformable WebGL book and dynamic contact shadows. Generated leather material, rounded cover edges, gold foil, bookbinding detail and soft warm lighting.
2. Bake exact semantic page designs into versioned local artwork at development time. Decode/pre-upload page textures before interaction; cache by language/layout. Stationary paper exposes destination artwork throughout each turn. Geometry integration is computed once per column, not once per vertex row. No DOM rasterization or texture construction in the animation loop.
3. Mobile/tablet/short-window layout focuses a single readable leaf in the same 3D book; page controls pan within a spread and physically turn between spreads. The complete reading view remains available. Reduced-motion and unavailable-WebGL editions retain accessible HTML.
4. Verify cache reuse, correct under-sheet artwork, rapid navigation, compact leaf ordering, keyboard/contact, both languages, actual visual rendering and transition frame timings. Repeat independent visual critique where available, commit/push and verify live deployment.

Generated asset prompts and provenance will be recorded. A photographic environment is deliberately composited around a real 3D book; accessories are photographic imagery rather than individual orbitable models. Camera motion stays bounded to preserve the photograph's perspective.

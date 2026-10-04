# 3B independent judge review

Reviewed 4 October 2026 UTC. Fixed range: `efe1af9` → `9cd4c2300b63e12bac41fd425ce0ee8d38ff5840`. Source review used `git show`/`git diff` against that exact range. The targeted browser check ran while HEAD was that fixed commit. No implementation edits or delegation.

**Verdict: FAIL — 8.2/10.** Two important defects remain. The result does not satisfy the strictly greater than 8.5 gate, and important defects independently prevent passage.

| Dimension | Weight | Score /10 | Weighted contribution |
|---|---:|---:|---:|
| Correctness | 35% | 8.0 | 2.800 |
| Usability/accessibility | 25% | 8.2 | 2.050 |
| Responsive behavior | 20% | 7.7 | 1.540 |
| Maintainability | 15% | 8.6 | 1.290 |
| Truthful content/visual direction | 5% | 9.6 | 0.480 |
| Total | 100% | **8.2** | **8.160, rounded to one decimal** |

These are calibrated review judgments, not measurements. All rubric weights remain applicable.

## Strengths verified

- All three committed local JPEG captures decode to the declared intrinsic dimensions: desktop 1440×900, tablet 768×1024, phone 390×844. Independently recomputed each committed blob's SHA256 and byte count; all match the manifest. Total 220,031 bytes.
- Visually inspected all three shipped JPEGs, all three original PNGs, and the desktop EN/phone SR portfolio proof screenshots. These show actual rendered Harmonije content and its genuine narrow viewport layout. Tablet/phone content appearing below the visible fold is not fabricated or artificially reconstructed.
- The capture script, successful capture log, exact UTC timestamps, URL, HTTP 200 statuses, matching source HTML hashes, page titles and headings support dated source provenance. Labels, image alternatives and link destinations consistently identify Harmonije. The dated disclaimer and physical-device disclaimer are translated.
- Project titles and ordinary outbound links remain independent of image success. The image controller handles already-failed images and later error/load events. The supplied focused log records visible EN/SR failure behavior and no-JS native proof titles, alternatives and keyboard-focusable links.
- Canonical, Open Graph URL and both entity URL/ID strings agree. Unsupported factual `priceRange` is removed. JSON-LD parses; no fictitious alternate-language routes were added.
- Social image and `og-preview.jpg` remain byte-identical, unchanged from the base, and 1734×907. The focused log establishes local 200 responses and decoding for both paths, matching declared dimensions. The canonical-response evidence records a final HTTP/2 200.
- Small side-effect-free image controller and explicit manifest/README make asset ownership understandable. The dark/paper/lime editorial direction is preserved.

## Defects

### 3B-J1 — Important: tablet failure instruction is clipped at a supported narrow width

At a 320×844 Chromium viewport, Serbian language, reduced motion and failed `assets/projects/*.jpg` requests, the tablet fallback visibly ends after “projekat”; “da pogledaš sajt.” is clipped. The native label and link remain usable, but the newly added failure instruction is incomplete.

The tablet fallback's bounds measured 100.953×135.266px, top 600.141/bottom 735.406. Its text extends from 626.141 to 790.141, with scrollHeight 192 against clientHeight 135. `.device-frame` clips overflow, while `.image-fallback` uses a fixed 24px padding and 14px/1.5 text. At 390px the Serbian tablet message fits, which explains why the existing representative phone rendering does not expose the defect.

Reproduction: start the existing preview server; create a Chromium context at 320×844 with reduced motion; abort `**/assets/projects/*.jpg`; load `/`; select SR; scroll `.device-proof-grid` into view. The judge inspected the resulting screenshot at `/tmp/3b-judge-320-sr-fallback.png`. This targeted check was run because the compact tablet frame and fixed fallback padding presented a concrete clipping doubt; no full suite was rerun.

Required change: make the fallback content fit the narrow frame, or use a concise translated message with the action retained through the native project link. Verify the complete EN/SR message at 320px and the representative 390px width. A visibility assertion alone cannot establish that all text fits.

### 3B-J2 — Important: new provider relation is attached to the wrong Schema.org type

The JSON-LD graph adds `provider: {"@id":"…/#person"}` to the `ProfessionalService` entity. `ProfessionalService` inherits from `LocalBusiness`/`Organization` and `Place`; it does not inherit from `Service`. Schema.org's `provider` domains include `Service`, but exclude `ProfessionalService` and its ancestors. The graph therefore has coherent ID strings but an unsupported property/type pairing, failing this sub-phase's structured-data validity requirement. A consumer may ignore that relation; this review does not claim an observed indexing penalty.

Primary references inspected on 4 October 2026:

- [Schema.org provider](https://schema.org/provider): “Used on these types” includes Service, not LocalBusiness/Organization/Place.
- [Schema.org ProfessionalService](https://schema.org/ProfessionalService): the displayed inheritance is LocalBusiness; its documentation also notes deprecation due to confusion with Service. The pre-existing deprecated type is context, not a second newly introduced defect.

The current metadata test asserts the exact provider object and JSON shape, but does not establish vocabulary/property-domain validity, so its success does not resolve this finding.

Required change: remove the unsupported relation, or model an actual `Service` node whose `provider` references the Person. If changing the type, review the remaining properties against that type as well; do not merely rename the type while retaining organization-only properties. Retain canonical consistency, stable IDs and removal of unconfirmed pricing. Add a focused assertion that reflects the chosen valid model and record vocabulary validation.

## Evidence inspected and verification boundaries

Read `3B-brief.md`, `3B-report.md`, audit F16, fixed-range source changes, manifest and capture README. Inspected `focused.log` (**13 passed**), meaningful local-ownership red failure, capture scripts/logs, proxy-certificate failure log, canonical response, PNG manifest, and proof-render script. Reused the 13-check results; independently checked committed image hashes/bytes/dimensions/social alias and ran only the targeted narrow fallback geometry/render check described above.

No critical defect found. Other than 3B-J1 and 3B-J2, no important defect established within this sub-phase scope.

**Explicit limits:** the initial source capture failed with `ERR_CERT_AUTHORITY_INVALID` through the inherited proxy; the successful public-page capture context used `ignoreHTTPSErrors:true`. The evidence supports a rendered source response through that route, not independently validated source TLS identity. Source HTML hashes are recorded, but the response HTML itself was not retained for an independent recomputation in this review. Capture time/provenance is supported by the supplied scripts/logs/manifest, not a separately attested audit chain.

Browser viewport screenshots and decorative frames do not verify physical devices. No iOS/Android/real-device result, continuous freshness, other-project live capture verification, full screen-reader audit, performance/CWV measurement or cross-engine certification is awarded here. The canonical 200 is not proof that this exact commit is deployed. New asset availability was verified on the local preview; publication remains separate. Integrated/all-engine checks remain at the phase boundary under the economical verification amendment.

To exceed 8.5: resolve both important findings, submit changed commit(s), provide complete narrow EN/SR fallback evidence and valid entity-model evidence, then obtain a fresh independent judgment. No asset recapture or unrelated full-suite repetition is needed solely for these two corrections.

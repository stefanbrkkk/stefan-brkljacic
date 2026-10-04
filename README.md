# Stefan Brkljačić — Portfolio

Static personal portfolio for a Belgrade-based web developer and AI product builder. The main journey is offer → selected work → services/FAQ → process → about → contact, with English and Serbian copy, native expandable case studies and one desktop decomposition animation.

[Live portfolio](https://stefan-brkljacic.vercel.app/)

## Run locally

Use Node.js **24.19.0** and npm. Install the exact locked dependencies, then serve the repository root:

```sh
npm ci
npm run dev
```

The preview is at **http://127.0.0.1:4173**. It serves HTML, CSS, ES modules and local assets; there is no framework build step. Deploy the repository root with a static host.

## Checks

| Command | Actual script / coverage |
|---|---|
| `npm run dev` | `node tools/serve.js` — static preview on port 4173 |
| `npm run lint` | `eslint scripts tests tools *.config.js && stylelint styles/site.css` — shipped modules, tests, server, tools and JavaScript configurations; CSS |
| `npm run validate:html` | `html-validate index.html` — recommended HTML rules |
| `npm run validate:translations` | `node tools/check-translations.js` — EN/SR key parity, nonempty strings and every authored HTML translation binding |
| `npm test` | `node --test tests/unit/*.unit.js` — missing/empty/mismatched dictionary and binding regressions |
| `npm run test:e2e` | `playwright test` — Chromium, Firefox and WebKit browser projects |
| `npm run check` | `npm run lint && npm run validate:html && npm run validate:translations && npm test && npm run test:e2e` — complete local/CI check |

Install matching browser binaries and operating-system dependencies before browser tests:

```sh
npx playwright install --with-deps
npm run check
```

Browser tests start their own preview. A focused run can use `npm run test:e2e -- --project=chromium tests/content.spec.js`. Each test keeps screenshots and traces under its unique Playwright output directory, avoiding cross-engine overwrites. Node unit files are excluded from Playwright discovery.

CI uses the digest-pinned official **Playwright 1.63.0 Noble container**, matching `package-lock.json`, with Node 24.19.0. GitHub actions are pinned to verified full release commit SHAs. See [runtime and CI provenance](docs/verification/runtime.md). Workflow configuration is not a claim of an observed CI pass.

Stylelint retains syntax, unknown-property, duplicate-declaration, empty-block and selector-repeat checks. Existing intentional refinement rules have individual selector-repeat exceptions so their precedence over intervening state rules remains explicit. State, responsive and capability overrides use deliberate descending specificity; its ordering warning is disabled. The ID naming pattern accepts existing camelCase DOM identifiers as well as kebab-case. HTML validation permits explicit `for` attributes on labels wrapping their controls. These conventions do not disable accessible-name or hidden-focusable checks.

## Content and behavior

- [Harmonije Panonije](https://harmonije-panonije.vercel.app/): client catalogue and inquiry website.
- [Gimnastika Kraguj](https://gimnastika-kraguj.vercel.app/): public preview.
- [GlasAI](https://www.glasai.online/): interactive concept demo.
- [Sheetpost](https://sheetpost-seven.vercel.app/): multilingual workflow prototype with **simulated KSeF submission**.

Contribution details are stated in each case study without invented customer metrics, exclusive authorship or unconfirmed launch dates. English is the default unless a valid saved `en`/`sr` preference exists. Dictionaries are validated before translation touches the DOM; incomplete future edits leave the authored static copy available.

The inquiry dialog prepares an editable draft with optional context. Draft data stays in page memory. Nothing sends automatically: visitors choose a mailto or Gmail draft, copy their message, or separately open LinkedIn. Direct email remains available with JavaScript disabled. Reduced motion, touch, narrow screens and short windows use a compact static process diagram.

## Assets and verification

Fonts and original project images were extracted without re-encoding. [Asset manifest](assets/manifest.json) records their byte counts/SHA256 values, the local pre-extraction measurement source and the original remote baseline. [Font license records](assets/fonts/licenses/sources.json) retain upstream OFL sources. [Dated viewport captures](assets/projects/README.md) explain the locally owned Harmonije screenshots; browser viewport renders are distinct from physical-device checks.

Review documents in `docs/superpowers/reviews/` identify local implementation commit ranges. Publication can aggregate the reviewed tree into one Git Data commit parented to the then-current remote `main`; those local intermediate SHAs need not appear in published history. Tests depend on committed files and asset hashes, not local-only Git history.

Automated browser coverage establishes engine behavior and emulated layouts. Physical iOS/Android devices, native browser zoom, installed mail clients, external-account delivery, screen-reader output and hardware animation performance require separate checks; see the [review ledger](docs/superpowers/reviews/2026-10-04-portfolio-remediation.md) for recorded evidence and limits.

## Contact

- [Email](mailto:stefanbrkk@gmail.com): stefanbrkk@gmail.com
- [GitHub](https://github.com/stefanbrkkk)
- [LinkedIn](https://www.linkedin.com/in/stefan-brklja%C4%8Di%C4%87-13258942a/)

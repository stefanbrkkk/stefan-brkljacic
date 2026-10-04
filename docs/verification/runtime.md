# Verification runtime

Local tests run with Playwright 1.63.0, one worker, against tools/serve.js. Browser binaries and temporary shared libraries are kept outside the repository. After the interrupted session lost temporary/home caches, binaries were restored under the workspace at ../browser-runtime/. This cache is excluded from repository publication.

Secondary-engine commands also set `PLAYWRIGHT_BROWSERS_PATH=/workspace/scratch/39905531ba6f/browser-runtime/cache`.

## Chromium

Chromium 153.0.8010.0 was extracted from the npm-distributed @sparticuz/chromium 153.0.0 binary because the ordinary browser CDN download was incomplete in this environment. Required software-rendering libraries were extracted without modifying the host installation.

Local command prefix: `LD_LIBRARY_PATH=/workspace/scratch/39905531ba6f/browser-runtime/libraries PORTFOLIO_CHROMIUM_PATH=/workspace/scratch/39905531ba6f/browser-runtime/chromium`.

The runtime uses software rendering, no sandbox and no hardware GPU; it verifies browser behavior and rendered layouts, not physical-device performance or hardware frame rate.

## Firefox

The official Playwright Firefox download succeeded. Firefox 155.0 passed a rendered blank-page smoke check. Its bundled build needs newer NSS than the host provides. Debian's official libnss3 3.130-1 amd64 archive was downloaded and its SHA256 verified against packages.debian.org; libraries were extracted to scratch only.

Local command prefix: `MOZ_DISABLE_CONTENT_SANDBOX=1 MOZ_DISABLE_RDD_SANDBOX=1 LD_LIBRARY_PATH=/workspace/scratch/39905531ba6f/browser-debs/nss/usr/lib/x86_64-linux-gnu`.

Sandbox namespaces are unavailable in this managed test runtime. These environment flags are test-only and do not change the shipped website.

## WebKit

Official Playwright download succeeded. WebKit 26.6 passed a rendered blank-page smoke check. Host dependencies were extracted from official Ubuntu package archives into scratch and linked into the browser’s temporary library directory. No host packages were installed.

Local command prefix: `PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1 LD_LIBRARY_PATH=/workspace/scratch/39905531ba6f/browser-debs/extracted/usr/lib/x86_64-linux-gnu:/workspace/scratch/39905531ba6f/browser-debs/extracted/lib/x86_64-linux-gnu`.

The host library-cache check cannot discover scratch-only GLES. Dependency validation is bypassed only after resolving actual shared-library dependencies; successful rendering is the runtime proof. This flag does not skip application tests.

## Limits

Headless browser emulation is distinct from testing real iPhones, iPads, Android phones, Windows laptops or macOS Safari. Physical devices and hardware animation performance have not been verified. A viewport rendered at half its CSS width exercises reflow equivalent to desktop 200% zoom; native browser zoom needs separate evidence.

## Native zoom experiment

An isolated blank-page Chromium experiment sent browser keyboard zoom shortcuts and tried persistent host zoom preferences. Both retained innerWidth1363 and devicePixelRatio1. Neither is evidence of native200% zoom in this headless-shell build. Native zoom remains unverified; viewport reflow is tested separately.

Firefox155 blank-page keyboard zoom shortcuts also retained innerWidth1363, devicePixelRatio1 and visualViewport.scale1. This confirms that the keyboard experiment did not establish native200% zoom in that engine either.

## Resumed runtime — 2026-10-04

After the session resumed at11:16UTC, default execution successfully bound the local preview and ran Chromium checks. Earlier escalation requirements were specific to the prior runtime; use default execution first. Workspace browser/cache/library paths remain present. Live Harmonije URL returned200 through the default network path; local-capture work can attempt actual site rendering. No fresh all-engine pass is implied by these environment checks.

The resumed default exec uses a separate network namespace per call. A preview started by another exec is not reachable: use Playwright's configured webServer in the test exec, or start/import tools/serve.js inside a standalone capture process. Files/evidence are shared; network listeners are not.

Phase2 cross-engine probes:Firefox7 passed;WebKit failed before page launch because bundled wrapper replaces LD_LIBRARY_PATH and restored sys/lib lacked libgstreamer. Recreated487 missing/broken scratch-only library links from the already extracted official archives; preserved bundled existing libraries. No host installation/site change. WebKit targeted rerun records actual outcome separately; original failures retained.

## Reproducible CI configuration

`.github/workflows/check.yml` runs Node24.19.0 and `npm ci` / `npm run check` inside the official Playwright1.63.0 Noble image, matching the exact package dependency. The registry-index digest is `sha256:eff16c30e6f3f4af0a03fa4b706120d5e9b0891c344a27d64559aff5900a4a27`. Official guidance: https://playwright.dev/docs/ci and https://mcr.microsoft.com/product/playwright . This avoids assuming ubuntu-latest alone contains the bundled Firefox155 NSS requirements. The container supplies matching browsers; no separate browser download is needed in CI.

Full action SHA pins were verified via each official release tag, immutable commit and action.yml runtime (node24): checkoutv7.0.1 `3d3c42e5aac5ba805825da76410c181273ba90b1`, setup-nodev7.0.0 `820762786026740c76f36085b0efc47a31fe5020`, upload-artifactv7.0.1 `043fb46d1a93c77aae656e7c1c64a875d1fc6a0a`. Official release pages: https://github.com/actions/checkout/releases/tag/v7.0.1 , https://github.com/actions/setup-node/releases/tag/v7.0.0 , https://github.com/actions/upload-artifact/releases/tag/v7.0.1 . Preparation evidence is retained in `.superpowers/sdd/remediation/ci-action-sources.json` outside publication.

This is configuration/source verification. An actual CI result can only be reported after observing the published workflow run. Default local execution now works with the scratch runtime prefix from `../browser-runtime/env.sh`; each command's Playwright webServer shares its command's network namespace. Local software-rendered Chromium is a different binary from the container's official Chromium and is identified above.

## First observed GitHub run and CI correction

Run https://github.com/stefanbrkkk/stefan-brkljacic/actions/runs/37238653884 on `22f930d` failed: 216 passed, 109 failed and two skipped. Firefox failed before navigation because the container ran as root while `/github/home` belonged to `pwuser`; the launch log identifies this ownership mismatch. The workflow now uses `--user 1001`, matching the official Playwright container CI example at https://playwright.dev/docs/ci#via-containers . No home-directory environment variable is overridden.

One WebKit Serbian 1363×936 journey exhausted the 30-second whole-test deadline at the final evidence screenshot's animation-frame wait. Neighboring large viewport journeys passed in 26.6, 28.3 and 29.7 seconds. The long responsive usability journeys now have a 60-second whole-test budget; their individual assertions, geometry limits, required actions and zero-retry policy are unchanged. This correction does not establish a hardware-performance result.

The three browser projects run in independent matrix jobs, each with one worker and all 113 cases once (including four mobile presentation cases). Quality checks run once in the Chromium job; artifact names identify the engine. Each engine stops at its first failure while the other matrix jobs continue; unrun cases are not counted as passes or capability skips. This preserves complete all-engine coverage on a passing run while shortening elapsed feedback time. The failed run and its artifacts remain available; a corrected workflow is not a passing CI claim until its actual result is observed.

## Firefox cache restoration at the Phase3 boundary

The first targeted Firefox invocation on2026-10-04 failed before browser launch withSIGBUS. Root reproduced it with a blank-page launch and found cached libxul.so truncated to55320576 bytes; its ELF segments require roughly185MB. Shared memory had4.9GB free, so this was not an application assertion or a shared-memory exhaustion pass.

The matching official Firefox1543 archive was restored through Playwright's Microsoft fallback after the primary CDN returned a195-byte HTML SiteUnavailable response withHTTP200. Archive CRC validation passed; restored libxul.so is184352280 bytes, and a new execution created a Firefox context/page and rendered actual text successfully. Restored files were touched after extraction because preserved old archive timestamps did not persist across executions; timestamp-based synchronization is an inference, not an independently proven storage mechanism. No host packages, shipped website code or tests were changed. Failed launch evidence, archive integrity and repair notes are retained under `.superpowers/sdd/remediation/3C-evidence/`. The targeted application rerun is recorded separately from that blank-page runtime probe.

# RESTRO performance preservation — 25 November 2026

Engineering-only optimization of the existing experience. Only two runtime files changed: `src/lib/cinematic/canvas-controller.ts` and `src/lib/cinematic/frame-sequence.ts`. Component markup, styles, animation definitions, timing constants, images, routing, dependencies and server configuration are unchanged.

## Changes retained

- Reuse frame-loading windows when the requested frame has not changed. Existing completion handlers still pump downloads/decodes, retries, priority and reversal windows.
- Select nearby bridge frames and eviction candidates with a single pass instead of allocating and sorting arrays. Tie order, chronological limits, eviction order and cache sizes remain equivalent to the saved original implementation.
- Skip identical scene-label and metadata DOM writes. Maintain the existing label/data values and all debug fields.
- Skip redrawing the same held bitmap when the target is temporarily unavailable. Continue drawing whenever the displayed frame, Canvas dimensions or existing focal envelope changes.
- Collect draw-frequency diagnostic samples only when a debug element exists. Debug behavior remains available; the live site already had its debug panel removed before this task.

## Method

Measured on local production Next.js, Chrome headless, desktop 1440×900 and mobile emulation 390×900. Three fresh-context runs per viewport, before and after. Identical instrumentation counts Canvas draws, bitmap allocation/release, frame requests and layout reads. CDP records script, task, layout and heap metrics. Each run scrolls forward for 6.5 seconds, pauses 0.7 seconds, reverses for 6.5 seconds and pauses again. The first run per viewport records video and section screenshots after the measured scrolling window. Measurements include browser/compositor variability; these are not real-device or Lighthouse score claims.

The controlled small-scroll DOM probe is separate from the full-page protocol. The scheduling microbenchmark is also separate and excludes network, decoding and rendering.

## Before/after medians

| Metric | Desktop before → after | Mobile before → after |
|---|---:|---:|
| First exact cinematic frame ready | 439 → 429 ms | 369 → 368 ms |
| Canvas draws during measured session | 746 → 637 (**14.6% fewer**) | 771 → 706 (**8.4% fewer**) |
| Script execution during scroll | 983 → 968 ms | 1,140 → 1,138 ms |
| Browser task duration during scroll | 8,439 → 7,084 ms | 7,149 → 6,920 ms |
| Layout duration during scroll | 204 → 31 ms | 31 → 30 ms |
| 95th-percentile rAF interval | 16.8 → 16.8 ms | 16.8 → 16.8 ms |
| rAF intervals over 34 ms | 1 → 1 | 1 → 1 |
| 95th-percentile target/display lag in fast sweep | 313 → 216 frames | 46 → 27 frames |
| Peak outstanding decoded bitmap storage | 66.80 → 66.80 MiB | 25.71 → 25.71 MiB |
| JS heap sampled at end of scroll | 8.27 → 7.67 MiB | 7.46 → 7.80 MiB |
| Frame requests during measured session | 3,051 → 3,105 | 2,244 → 2,331 |
| Repeated frame URLs in that session | 1,431 → 1,461 | 1,017 → 1,089 |
| Initial resource transfer | 4,133,498 → 4,133,639 bytes | 1,729,291 → 1,729,426 bytes |
| Warm reload resource transfer | 30,013 → 30,020 bytes | 10,308 → 10,309 bytes |

The repeat-URL measure includes necessary revisits after eviction, aborted requests and forward/reverse traversal; it is not a count of concurrent duplicate requests. Existing in-flight deduplication tests pass. The optimized renderer can complete more work in the fixed test window, so request totals vary. **No network reduction, meaningful loading-time gain, reliable script-time gain or heap reduction is claimed.** GPU process memory is not measured by the bitmap counter. The large fast-sweep frame lags are an existing loading bottleneck, not a changed frame count or source FPS.

The controlled scroll probe rendered the same 36 frames and ended at exact frame 37 in both versions. Attribute mutations fell from **2,030 to 570 (71.9%)**, and unchanged-label rewrites from **178 to zero**. The isolated 30,000 repeated-target scheduling benchmark fell from median **63.45 ms to 0.43 ms**; this is an internal scheduling result, not a page-speed multiplier.

## Preservation evidence

- SHA-256 comparison: **all 3,092 public files, totaling 168,123,256 bytes, are identical**. No asset was recompressed, resized, replaced or removed.
- Desktop sequence remains **1,675 frames, 1280×720, 30 FPS**. Mobile remains **1,340 frames, 960×540, 24 FPS**. Duration remains **55.833333 seconds**; the existing source/manifest is untouched.
- Compared saved original and optimized controllers using real images at **20 forward/reverse positions** across desktop/mobile. Full Canvas pixel SHA-256, actual Canvas dimensions and displayed/target frame indexes matched exactly at every position. See `renderer-pixels.json`.
- 1,500 randomized cache, chronological bridge/tie and eviction-order comparisons against the original passed, along with unchanged 24/30 FPS indexing.
- Source fingerprints verify that all 81 other existing source/config/dependency files are unchanged. Thus animation durations/easings, carousel intervals, marquee speed, fallback logic, media preferences, glass effects and all UI components retain their implementations.
- The ten full-page section captures have matching sizes and background frame indexes. Seven are exactly pixel-identical; desktop menu differs only within 2/255 channel values. Live promotional captures differ in 0.83% of desktop and 2.94% of mobile pixels at a >2/255 threshold, concentrated in live text/compositing. Mean channel differences are 0.071/255 and 0.319/255. These captures were visually inspected; no design or content regression was observed. They are not represented as exact screenshots. Full renderer pixel comparisons independently pass.
- Actual before/after recordings were sampled at 4, 8, 12 and 16 seconds. Forward/reverse motion, background visibility and mobile composition were reviewed. Natural loading/scheduling differences exist; no reduced-quality/static replacement was used. See the filmstrips below.

## Captures

- [Desktop before recording](before/1440-scroll.webm) · [Desktop after recording](after/1440-scroll.webm)
- [Mobile before recording](before/390-scroll.webm) · [Mobile after recording](after/390-scroll.webm)
- [Desktop recording filmstrip](1440-recording-review.png) · [Mobile recording filmstrip](390-recording-review.png): before on top, after below; columns at 4/8/12/16 seconds.
- Desktop screenshots: [hero before](before/1440-hero.png) / [after](after/1440-hero.png), [offers before](before/1440-offers.png) / [after](after/1440-offers.png), [menu before](before/1440-menu.png) / [after](after/1440-menu.png), [reservation before](before/1440-reservation.png) / [after](after/1440-reservation.png), [contact before](before/1440-contact.png) / [after](after/1440-contact.png).
- Mobile screenshots: [hero before](before/390-hero.png) / [after](after/390-hero.png), [offers before](before/390-offers.png) / [after](after/390-offers.png), [menu before](before/390-menu.png) / [after](after/390-menu.png), [reservation before](before/390-reservation.png) / [after](after/390-reservation.png), [contact before](before/390-contact.png) / [after](after/390-contact.png).
- [Full measurement comparison](comparison.json), [original asset inventory](before/assets.json), [optimized inventory](after/assets.json), [source fingerprints](before/source-hashes.json).

## Validation

TypeScript, full ESLint and production build pass. Existing checks pass for cinematic mapping, frame loading/deduplication/cancellation/concurrency/eviction/failures, menu/catalog/currency, offers, reservation/clock/guest validation, reviews/storage/timing, enquiry validation, preserved legacy mascot timing and responsive arrows.

Live Chrome checks pass for menu lift/touch/keyboard/navigation, all five promotional reveals and boundary clones, reservation popup/nested clock/focus/close/reopen, steam/spotlight/reduced motion, and simulated hidden-page suspension/resume. Additional production checks verify mobile navigation, contact validation/local preview, Add Review validation/persistence across reload, Back to Top, About, all nine category routes and all 48 products.

The current source had no cart/provider or mode/debug buttons at the start of this task, following earlier requested removals. They were not removed by optimization or recreated. Existing reservation/enquiry submissions remain local previews. Older scripts that require the removed mode/debug UI are historical and were not treated as current regression requirements.

## Remaining limits and intentionally rejected approaches

- Physical mobile devices, real Safari/GPU profiling, field Core Web Vitals and throttled WAN/CDN behavior remain unverified.
- Full-quality frame decoding and glass compositing remain substantial costs. No resolution/FPS/frame-count/quality/blur reduction was applied.
- Directional windows, cache budgets and concurrency are unchanged. Further prefetch-policy changes could alter bridging/loading behavior, so they were not included in this strict preservation pass.
- No long-lived immutable caching was added to mutable, non-versioned frame URLs; that could serve old media after updates. A content-versioned asset deployment/CDN strategy needs its own deployment work and verification.
- Worker decoding would need additional cross-browser/lifecycle evaluation; it was not introduced speculatively. Existing asynchronous ImageBitmap decoding and HTMLImage fallback remain intact.
- No dependency removal or UI code splitting was justified by a verified behavior-preserving gain in this pass.

Reproduce with `profile-restro.mjs before|after` against the same isolated production server on port 3300, then `profile-cinematic-work.mjs`, `benchmark-frame-scheduler.mjs`, `report-performance-preservation.mjs`, `check-frame-equivalence.mjs`, `check-renderer-preservation.mjs` and the functional checks. Preserve the saved baseline sources and inventories when comparing future changes.

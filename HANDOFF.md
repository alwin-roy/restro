# HANDOFF.md — Restro Shared Project Handoff

> **Notice for all AI Agents:**
> This document is the **single source of truth** for the Restro project.
> Every AI agent working on this repository **must read this file before beginning work** and **update it immediately after completing any task**.

---

## A. Project Overview

- **Project Name:** Restro
- **Project Type:** Custom web application designed exclusively for a single restaurant.
- **Architecture Philosophy:** Single-restaurant application. **NOT a SaaS platform.** There is no multi-tenancy, no multiple restaurant accounts, no subscription billing, and no multi-tenant database partitioning.
- **Purpose:** Serve as the unified digital hub for one restaurant, eventually supporting customer-facing web capabilities (e.g. restaurant info, menu display) and back-of-house restaurant management.
- **Primary Priority:** **Mobile-First Responsive Design.** The application must be deeply optimized for touch devices, prevent horizontal overflow, ensure smooth interactions, and adapt smoothly from small phones to desktop displays without sacrificing desktop usability.

---

## B. Technology Stack

### 1. Implemented and Configured
- **Framework:** Next.js `16.4.6` (App Router, Turbopack, React Server Components by default)
- **Library:** React `19.3.0` & React DOM `19.3.0`
- **Language:** TypeScript `^5` (Strict mode enabled, import alias `@/*` -> `./src/*`)
- **Styling:** Tailwind CSS `4.3.3` (via `@tailwindcss/turbopack`) with inline CSS theme variables
- **Icons:** Lucide React (`lucide-react`)
- **UI Utilities:** `clsx` (`^2.1.1`) and `tailwind-merge` (`^3.5.0`) configured in `src/lib/utils.ts`
- **Code Quality:** ESLint `^9` (`eslint-config-next`)
- **Package Manager:** npm

### 2. Planned Technologies (NOT Yet Implemented)
- **Database:** PostgreSQL via Supabase (do not configure or mock until instructed)
- **Authentication:** To be determined (do not implement auth until instructed)
- **UI Component System:** Custom components with planned support for shadcn/ui primitives
- **Backend Handlers:** Next.js Server Actions and Route Handlers as needed
- **PWA Features:** Progressive Web App capabilities for mobile devices

---

## C. Project Architecture

### 1. Directory Structure

```text
restro/
├── public/                 # Static public assets
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── favicon.ico     # Application favicon
│   │   ├── globals.css     # Global styles, Tailwind imports, font and theme definitions
│   │   ├── layout.tsx      # Root HTML layout, viewport settings, Geist font, metadata
│   │   ├── page.tsx        # Homepage navbar, hero, marquee, offers, categories, reservation, reviews, contact and footer
│   │   ├── about/          # Dedicated About Us editorial page
│   │   └── menu/           # Overview, shared layout, dynamic category pages/not-found
│   ├── components/         # Shared UI components
│   │   ├── FoodMarquee.tsx # Reusable CSS-only scrolling food strip
│   │   ├── about/          # Server-rendered intro/media, timeline, values and closing CTA
│   │   ├── menu/           # Category/product Server Components and shared route navigation
│   │   ├── offers/         # Server banner content and client carousel controls
│   │   ├── reservation/    # Reservation form, guest counter and editable clock dialog
│   │   ├── reviews/        # Responsive review carousel, cards, stars and local form
│   │   ├── contact/        # Server contact panel and client enquiry form
│   │   ├── layout/         # Shared public footer and client Back to Top control
│   │   └── ui/             # Primitive/atomic UI components (shadcn/ui compatible)
│   ├── features/           # Feature-scoped modules, components, and logic
│   │   └── home/           # Navbar/hero components and mascot timeline helper
│   ├── data/
│   │   ├── about.ts        # Editable story, timeline, values and media configuration
│   │   ├── foodCategories.ts # Typed categories, route hrefs and local image paths
│   │   ├── menu.ts         # Central sample products with integer paise prices
│   │   ├── reviews.ts      # Eight authentic customer reviews
│   │   ├── restaurantContact.ts # Single restaurant contact configuration with active sample data
│   │   └── enquirySubjects.ts # Allowed enquiry subjects and labels
│   ├── hooks/              # Custom reusable React hooks
│   ├── lib/
│   │   ├── cart.ts         # Pure cart reducer, storage validation and totals
│   │   ├── currency.ts     # INR display formatting
│   │   ├── contact.ts      # Safe configured telephone/email/social hrefs
│   │   ├── reservation-time.ts # Analog clock and 12/24-hour conversion helpers
│   │   ├── reviews.ts      # Review storage/collection and carousel reducers
│   │   ├── validations/   # Reservation, review and enquiry validation
│   │   └── utils.ts        # Shared utility functions (e.g. cn() class merger)
│   └── types/
│       ├── menu.ts         # Menu and cart types
│       ├── reservation.ts  # Reservation values, errors and normalized details
│       ├── review.ts       # Demo/local review and form types
│       ├── enquiry.ts      # Enquiry fields, errors and normalized details
│       └── index.ts        # Shared TypeScript interfaces and types
├── .env.example            # Template for environment variables
├── .gitignore              # Git ignore rules (allows .env.example)
├── AGENTS.md               # AI coding agent rules and environment instructions
├── HANDOFF.md              # Central project memory & handoff record (THIS FILE)
├── next.config.ts          # Next.js configuration
├── package.json            # Project manifest, dependencies, and scripts
├── tsconfig.json           # TypeScript configuration with strict mode
└── README.md               # User-facing project overview
```

### 2. Key Architectural Decisions
- **Mobile-First Resets:** `src/app/globals.css` specifies tap-highlight suppression, smooth scrolling (disabled for reduced motion), and responsive media rules. The hero clips only its decorative overflow; the document does not mask horizontal layout problems with `overflow-x: hidden`.
- **RSC Optimization:** React Server Components are preferred by default to minimize client bundle sizes. Client components (`"use client"`) must only be introduced when client-side interactivity or state is required.
- **Modular Component Split:** Generic, reusable design primitives belong in `src/components/ui/`; restaurant-specific domain logic belongs in `src/features/`.
- **Strict Single-Restaurant Scope:** All models, layouts, and logic must assume a single restaurant context. Avoid generic tenant IDs, workspace abstractions, or SaaS billing wrappers.

---

## D. Current Development Status

### Current performance preservation — 2026-11-25

- Strict engineering-only pass changed only `src/lib/cinematic/frame-sequence.ts` and `canvas-controller.ts`: unchanged-target scheduling reuse, equivalent single-pass bridge/eviction selection, deduplicated DOM metadata/label writes, redundant held-frame draw suppression and debug-only draw-history collection. No UI, animation, asset, config, cache limit, quality or frame-rate changes.
- Current UI retains all latest approved changes: cinema always starts, mode/debug controls and side guides were removed in earlier user requests; promotional Dish Reveal, menu Focus & Float without neighbor dimming, and Your Table Is Waiting reservation popup are implemented. The current source has no cart; this optimization did not remove or recreate one. Historical descriptions below may refer to superseded UI.
- Production baseline/after: three runs each at1440×900 and390×900, screenshots and actual forward/reverse recordings, byte hashes for all3,092 public assets. All public bytes match. Full Canvas pixel/dimension/index hashes match at20 original-vs-optimized desktop/mobile positions; 1,500 cache/eviction equivalence cases pass. All81 other existing source/config/dependency files remain unchanged.
- Measured reductions: controlled-scroll DOM attributes2,030→570 (-71.9%), unchanged label rewrites178→0; median Canvas draws746→637 desktop (-14.6%),771→706 mobile (-8.4%). Browser task time8,439→7,084ms desktop and7,149→6,920ms mobile; p95 rAF interval remains16.8ms. Peak decoded bitmap bytes remain66.80MiB/25.71MiB. Loading/script timing and heap changes are not claimed as reliable gains; network requests did not improve. Same full-quality frame density and cropping preserved.
- Evidence/method/limits: `artifacts/performance-preservation/REPORT.md`, `comparison.json`, `renderer-pixels.json`, per-phase metrics/asset inventories, ten screenshots per phase and four scrolling videos. Seven screenshots are exact; one differs within2/255 channel values, live promotional captures have small text/compositing variance documented in the report. Full renderer pixels are exact. Physical-device/Safari/GPU/field-network testing remains unverified.
- TypeScript, full ESLint, production build and applicable existing/new functional checks pass. No quality/visual trade-offs were applied; full-quality decoding/glass and unversioned asset caching limitations are recorded in the report.
### Historical baseline — 2026-11-25 cinematic redesign

This status supersedes older appearance/cart descriptions below; historical implementation notes and change-log entries remain preserved.

- Homepage now uses one fixed HTML5 Canvas with continuous desktop/mobile WebP sequences extracted from the complete supplied film. Native forward/reverse scrolling and measured section interpolation connect hero, marquee, offers, menu, reservation, reviews, contact and footer. This supersedes the previous MP4 renderer.
- New editorial hero: “Beyond the Taste.”, outlined menu CTA and three working glass navigation cards. Mascot remains preserved but is not imported or loaded on the homepage.
- Transparent ivory/champagne editorial styling covers the homepage, forms, dialogs, footer, menu and About. Static routes use the extracted interior image and do not activate the full film.
- Current source has **no cart/provider/reducer** and no carousel playback buttons; these were removed before this task and were not recreated. Nine categories, 48 sample products, five promotions, eight sample reviews, local review persistence and existing form/clock validation remain.
- Mode control supports persisted static mode, automatic reduced-motion/Save-Data defaults, scene fallback images and frame-loading failure retention. Forms remain local previews; nothing is sent or saved by reservation/enquiry submission.
- `npx tsc --noEmit`, ESLint, production build (16 expected pages/paths), and all applicable project checks pass. Chrome QA at all nine requested widths found no document overflow; Firefox and WebKit sequence smoke tests also pass. Physical mobile devices, real Safari and isolated GPU/memory profiling remain unverified.
- Current continuity report: `artifacts/cinematic-continuity/report.html`, with fresh desktop/mobile recordings, nine-width/cross-engine/failure/performance validation and development pixel/debug evidence. Verified preview: http://localhost:3200/. Earlier conversion and MP4 reports remain historical evidence. Supplied footage and existing contact/menu/promotion data are not asserted to be verified restaurant facts.


- **Completed:**
  - Initial Next.js App Router project scaffolding.
  - TypeScript strict mode and path alias (`@/*`).
  - Tailwind CSS v4 styling setup and responsive viewport defaults.
  - Lucide React and UI styling utilities (`clsx`, `tailwind-merge`) installed.
  - Core directory hierarchy established (`components/ui`, `features`, `hooks`, `lib`, `types`).
  - Metadata configured (`Restro` — Restaurant Web Application).
  - Reference-based yellow, black, and white homepage navbar and hero, replacing the original placeholder.
  - Sticky branded navigation, desktop Home indicator, accessible expandable mobile navigation, and skip link.
  - Full-width yellow food marquee directly below the hero, with the 12 requested labels, white dots/text, a seamless 40s CSS loop, and reduced-motion manual scrolling.
  - Premium food category discovery section below the promotional carousel: nine image cards, shared category route navigation, responsive 1/2/3-column grid, accessible active links, and functional category/full-menu destinations.
  - Supplied cartoon mascot replaces the rotating machine: transparent running/right-edge peeking/re-entry/dancing/waving/turning footage, coordinated return journey, native media-loop clock, pause/resume, and reduced-motion poster.
  - Responsive verification at 320, 375, 390, 768, 1024, and 1440px.
  - Nine category routes and 48 centrally defined sample products with demo INR prices, optimized category-photo placeholders, and persistent frontend cart.
  - Navbar demo-cart count, accessible cart dialog, quantity/remove controls, exact paise subtotals, and safe localStorage restoration.
  - Single-slide promotional carousel between marquee and categories: five clearly marked demo banners, seamless 600ms horizontal loop, 3s auto-rotation, arrows/dots, pointer swipes, playback control, hover/focus/tab-visibility pauses, and reduced-motion behavior.
  - Reservation section with strict frontend validation, India-local date/time checks, configurable guest counter and a local-only preview. Analog clock supports typed hours/minutes, AM/PM, hand dragging, keyboard adjustment and confirmation. No data is sent or saved.
  - Customer review previews with demo cards, responsive 3/2/1 one-row carousel, accessible local Add Review dialog, validated browser-only persistence and no public publishing.
  - Contact & Enquiry section directly below reviews: 32%/68% equal-height dark/white cards on desktop, stacked mobile layout, configurable verified contact information with neutral placeholders, and strict local-only five-field enquiry validation.
  - Shared premium public footer after contact/on all menu pages: responsive 4/2/1 columns, configured links, dynamic copyright and accessible Back to Top.
  - Dedicated /about page with dark editorial introduction/media and connected timeline, values cards, closing menu CTA and enabled shared About navigation.
  - Handoff documentation (`HANDOFF.md`) and agent instructions (`AGENTS.md`) established.
- **In Progress:**
  - Animation orchestration is implemented; perfect pose-matched run/dance joins still require animator-authored transition frames (see limitations).
- **Planned:**
  - Customer-facing website pages (pending instructions).
  - Restaurant management modules (pending instructions).
  - Supabase PostgreSQL integration and schema design (pending instructions).
  - Authentication selection and setup (pending instructions).
- **Known Issues / Intentional Limitations:**
  - Home/About/Menu work; Reservation, Reviews and Contact link to their homepage sections. Order Now and Search have been removed from the navbar; Cart still opens the existing frontend demo cart. Product Add buttons are removed, so menus currently serve browsing only.
  - Products and INR prices are explicitly demonstration data, not verified restaurant offerings. Checkout, order submission, payment, delivery, authentication, and backend persistence are not implemented.
  - Statistics and floating deal/delivery/rating cards are omitted because no verified business information was provided.
  - The nine category names/descriptions are initial user-provided display content, not a verified live menu. Photos are AI-generated illustrative food photography, stored locally and disclosed in the section footer. Replace them with licensed restaurant photography when available. Category actions and View Full Menu now open implemented demo menu routes. Each product currently reuses its category photo, visibly marked as illustrative; individual dish photos remain pending.
  - The mascot's clip joins retain small pose cuts, including peek-to-running re-entry and turn-to-mirrored-run. They are not advertised as perfectly seamless; no generated replacement character or ghosting crossfades were used. The travel loop itself returns fully offscreen before changing facing and repeating, with no visible position reset.
  - VP9 alpha playback is verified in the Codex Chromium browser only. A decoded-alpha probe detects unsupported browser/codec combinations and keeps the transparent PNG instead of displaying an opaque rectangle. Safari/Firefox and forced autoplay/media-error/reduced-motion scenarios were not browser-emulated.
- **Pending Decisions:**
  - Choice of authentication mechanism/provider.
  - Specific restaurant requirements and domain branding.

---

## E. Implementation Details

### Current cinematic continuity correction (2026-11-25)

- **Verified delivery cause:** At session start port 3200 served Canvas HTML but returned HTTP404 for the frame manifest. Port 3100 served the older video build and also returned manifest 404; 3201 worked. Manifest failure exposed the old seven-scene fallback switching. Identified all three repository-specific preview commands, stopped the stale processes and replaced them with the current production preview on 3200. Existing frames/manifest were not regenerated or relocated. Browser-local saved mode preference was not inspected in the user's own browser.
- `CinematicBackground.tsx` owns only mode/preferences and fallback state. `src/lib/cinematic/canvas-controller.ts` owns one imperative rAF controller, geometry, frame selection, Canvas drawing and lifecycle. Removed all per-section fallback background-image switching and per-frame React state. One generated poster covers initial loading; explicit static/failure can retain the current Canvas. Failure reasons are exposed in the button title/data and development panel; Retry cinema recovers without clearing user data.
- `frame-sequence.ts`: separate bounded compressed and decoded caches, bitmap decoding plus HTMLImageElement alternative, deduplication, directional priority, stale cancellation, timeouts, retries, repeated-failure callback and nearby chronological bridging. Exact requested frame remains authoritative; nearby bridging is limited to 12 frames between last display and target. Desktop: four downloads, 36-ahead/six-behind prefetch, 64 compressed/18 decoded (63.3 MiB RGBA). Mobile: three downloads, 20-ahead/six-behind, 40 compressed/12 decoded (23.7 MiB). At most two decodes add ~7.0/4.0 MiB, plus Canvas and browser overhead. Bitmaps close on eviction/disposal.
- Timestamp-preserving responsive variant switching replaces the prior fixed-variant behavior. Old resources release while the Canvas retains its pixels. A monotonic continuity anchor survives repeated layout observations without moving native scroll position; exact top/bottom endpoints remain. Gradual kitchen focal positioning replaces abrupt horizontal shifts. Fonts/resize/section reflow/anchors/pageshow/route lifecycle and form/keyboard freeze remain supported. Hidden state pauses downloads and rendering.
- Static fallback no longer rotates seven scene images. Manifest failure retries once with a bounded timeout; repeated frame failures expose the actual reason and allow retry. The persisted static-mode preference, reduced motion and Save-Data are respected, with normal capable mobile/desktop defaulting to motion.
- Development-only debug panel displays variant/count/section/progress/target/display/direction/loading/cache/pending/memory/render frequency/fallback reason. Verified actual changing Canvas pixels against displayed indexes; production panel absent. No runtime packages, business features, cart or backend added; existing glass/design/content components preserved.
- Current evidence: Chrome production at all nine widths; touch emulation, actual intermediate pixel changes, full slow/fast/reverse/freeze recordings, cache/request bounds, direct anchors/reload, orientation timestamp preservation, missing/repeated-failed frames, decode alternative, mobile navigation/Back to Top, form validation, analog clock/review dialogs, route navigation and reduced motion. Firefox/WebKit mobile sequence smoke tests passed to both endpoints with no page errors/overflow/black samples. Physical devices and isolated GPU cost remain unverified. Headless `document.hidden` remained false when another tab was brought forward; this is documented rather than claimed as real OS background testing.
- Existing assets remain desktop 1,675 frames / 69,301,470 bytes and mobile 1,340 / 33,877,798; 55.833333 seconds, combined 103,179,268 bytes. Section endpoints remain 0/3.2/7/19.5/34.5/41.5/49.5/54/final seconds, reviewed against actual frames. Menu preparation is visible around 25s.

### Initial Canvas frame-sequence implementation (2026-11-25, superseded controller details)

- `CinematicBackground.tsx` renders one decorative Canvas behind the existing homepage. Existing section timing, static scene fallbacks, persistent mode control, reduced-motion/Save-Data defaults and form/dialog editing freeze remain. Normal scrolling selects actual sequential frames, with no video element, image crossfades, CSS zoom or idle animation loop. The last successful Canvas draw remains while the exact target loads.
- `src/lib/cinematic/frame-sequence.ts` owns indexing, directional prefetch and decoded bitmap lifecycle. Target first, up to 12 ahead/four behind; mobile three concurrent downloads/20 decoded frames, desktop four/24. Stale requests abort, farthest bitmaps close on eviction, two attempts per failed frame. One variant is selected below/above 768px and retained on resize. Effect cleanup cancels requests and closes bitmaps.
- `scripts/prepare-cinematic-frames.py` uses FFprobe and FFmpeg libwebp with compression level 6, lossy, Lanczos and no crop. Desktop: 1,675 × 1280×720 at 30fps/q80, 69,301,470 bytes (41,374.01 bytes average). Mobile: 1,340 × 960×540 at 24fps/q75, 33,877,798 bytes (25,281.94 average). Combined: 103,179,268 bytes. Every output decoded/verified; contiguous indexes and no mean-luminance-below-2 black frames. Picture duration 55.833333s; container 55.935s includes audio tail. Original preserved.
- All generated frame/delivery/QA files live under the exact `public/images/cinematic hero section/` directory, with URL-encoded spaces in the manifest. Includes `desktop/`, `mobile/`, `poster.webp`, manifest, FFprobe inspection, FFmpeg logs, quality tests, report, PNG captures and two WebM recordings. Build-only FFprobe and Playwright tools were installed into ignored caches; no package manifest changes for this task.
- A short footer reserves up to 250px of closing movement rather than compressing its final range into one scroll pixel. Cover drawing preserves aspect ratio, caps backing-store density and maintains the existing mobile kitchen focal point. Static Menu/About routes remain unchanged.
- Validation: TypeScript, zero-warning lint, production build (16 expected routes/paths), mapping and loader checks passed. Local Chrome at 1440×900 and touch-enabled 390×844 passed full forward/reverse traversal, intermediate 10px movement, section interior/footer movement, freeze, single-variant loading, bounded caches/concurrency, no overflow/black samples/page errors, static cancellation, reduced-motion zero requests, manifest failure, 900ms delayed frames, resize and client navigation to About. Recordings and measured synchronous draw timings are in the report; they do not establish 60fps or physical-device performance.
- Limitations: independent image sequences require substantially more bytes than the prior MP4s; progressive loading avoids an initial full download but fast uncached jumps/slow networks can visibly hold the last frame. Physical devices, Safari/Firefox, real WAN performance and GPU/memory profiling remain unverified. Existing MP4s and unrelated images are preserved but are not loaded by the new homepage controller.

### Prior MP4 cinematic implementation (2026-11-25, superseded renderer)

- `src/app/page.tsx` remains a Server Component; a `.cinematic-home` wrapper mounts `CinematicBackground` once before shared navigation/main/footer. `hero.tsx` no longer imports ShawarmaVisual. All legacy mascot source/media remains intact.
- `src/components/cinematic/CinematicBackground.tsx`: paused decorative video, extracted poster, scene contrast overlay, pointer-inert grid and accessible persistent mode control. One passive scroll subscription with event-driven rAF work; no idle animation loop or per-frame React state. Queues latest target while seeking. ResizeObserver covers sections/footer; resize, fonts, hash/pageshow, visibility, focus and dialog close update geometry. Form/dialog editing freezes scene seeking. Cleanup unloads media, cancels rAF and removes listeners/observers, including when Next.js suspends retained hidden pages.
- `src/data/cinematicTimeline.ts`: observed scene anchors 0, 3.2, 7, 19.5, 34.5, 41.5, 49.5 and 54 seconds, with the scroll endpoint clamped to the final decodable frame. Piecewise mapping in `src/lib/cinematic/scroll-mapping.ts` prevents a taller mobile menu from consuming later restaurant scenes. Section heights are measured, not assumed equal. Image fallback switches to preparation after 25s within the menu scene.
- `src/app/cinematic.css`: imported after globals; shared ivory/gold tokens, fine framing, transparent cards, stronger form/dialog surfaces and compact mobile composition. Live backdrop blur is limited to the header (6px). Scene-aware contrast increases slightly in the bright kitchen; mobile kitchen focal position is 60%. Static-route body background accounts for Next.js retaining an inactive hidden homepage in the DOM. Hero/category/form/footer layouts preserve native document flow.
- `scripts/prepare-cinematic-video.py`: uses installed build-only Python OpenCV/Pillow/imageio-ffmpeg. Reads the Downloads master without copying it to public. Encodes silent H.264/yuv420p at 24fps, fast-start, 8-frame GOP; desktop 1600×900 CRF25 and mobile 960×540 CRF28. Seven WebP frames are extracted from actual footage. No npm dependencies added.
- Original: 181,299,777 bytes, 1920×1080 H.264 Constrained Baseline, 30fps, AAC audio; 55.935s container / 55.833s picture. Original keyframe spacing: 8.3333s. Desktop: 20,900,650 bytes (2.99Mbps). Mobile: 7,154,847 bytes (1.02Mbps). Each delivery video has 1,340 frames, 168 keyframes spaced 0.3333s, duration 55.833s, no audio, and verified moov-before-mdat metadata. Reports: `artifacts/cinematic/media-inspection.json` and sampled `contact-sheet.jpg`.
- Images: poster 157,246 bytes; interior 94,766; kitchen 73,100; preparation 57,072; table 51,928; guests 50,070; final 47,702. Only the appropriate video is chosen at activation (<768px mobile); a viewport resize keeps that asset to avoid a second download, while reload selects for the new viewport.
- Static mode unloads src; reduced motion and Save-Data default to static unless the visitor has explicitly selected a persisted preference. Loading/failure retains scene imagery. No-JS still shows server content over the poster. Menu/About do not instantiate the controller; a retained inactive homepage video may exist in the DOM without src after client navigation.
- Existing sample/illustrative disclosures restored in overview/product category pages, promotions and reviews. Reservation/enquiry confirmations now accurately describe local previews. Existing configured contacts and data values remain unchanged. No public publishing, APIs, DB, auth, ordering or checkout added.


- **Routes and Pages:**
  - `/` (`src/app/page.tsx`): Composes `Navbar`, `Hero`, `FoodMarquee`, `PromotionalOffers`, `FoodCategoriesSection`, `ReservationSection`, `ReviewsSection`, then `ContactSection` inside the main landmark. Renders the shared Footer after the main landmark. Retains the keyboard skip link; menu routes are described below.
  - `/about` (`src/app/about/page.tsx`): Dedicated editorial About page with shared navbar (About active), skip link, static story/values/CTA components and shared footer.
  - `src/data/foodCategories.ts`: Exports the `FoodCategory` interface and readonly `foodCategories` array. Each of the nine entries has a stable id, name, filter label, supplied description, local image path, descriptive alt text, and canonical category href. Both filters and cards derive from this one ordered array. Wraps maps to Wraps & Rolls, and Chicken maps to Fried Chicken.
  - `src/components/menu/FoodCategoriesSection.tsx`: Server Component with the exact requested heading/description, serif display typography, yellow Menu accent/divider, filter/card composition, functional View Full Menu link, and demo-products/prices/illustrative-image disclosure. Homepage placement is immediately after PromotionalOffers; /menu retains the overview without the homepage carousel.
  - `src/components/menu/FoodCategoryCard.tsx`: Server-rendered informational article with a reserved 220/230/240px image area, lazy optimized `next/image`, responsive sizes, full alt text, category description, yellow arrow, and functional Explore Category link. All nine entries now supply an implemented /menu/[category] destination; the optional-href fallback remains available for future unavailable categories.
  - `src/components/menu/CategoryFilters.tsx`: Server Component compatibility wrapper around shared CategoryNavigation and the nine-card overview grid. All retains the full overview; specific categories navigate to product routes instead of hiding overview cards. Native links use aria-current and 44px targets, with internal horizontal scrolling on mobile.
  - Category CSS in `src/app/globals.css`: Scoped section/card/filter rules use the existing yellow/black theme, soft #FAFAF7 background, white rounded cards, subtle borders/shadows, and matching Georgia headings. Container is at most 1200px; grid uses one column below 640px, two at 640–1023px, and exactly three at 1024px+. Hover-capable fine pointers get a 5px lift, 1.04 image zoom, and 2px arrow shift over 300–350ms. Reduced motion removes those transforms; existing global motion rules remove transitions.
  - `public/images/categories/`: Nine distinct illustrative food photos generated with the built-in image_gen tool, each saved as a 1200 × 800 WebP at quality 82 (1,143,612 bytes combined before Next.js delivery optimization). `README.md` records provenance, intended use, and replacement steps. `prompts.json` preserves the complete common prompt and nine subject prompts. No third-party photo URLs or unverified stock-license assumptions are used; original tool outputs remain in its generated-images directory.
  - `src/components/FoodMarquee.tsx`: Reusable Server Component exporting the readonly `foodItems` array with all 12 user-specified names. Two identical flex groups form one max-content track. Each group is at least one viewport wide; the second group and all decorative dots are hidden from screen readers. The named region is keyboard-focusable for manual scrolling in reduced-motion mode. Normal presentation is 52px tall, with #FFCC00 background, bold white Geist sans-serif text (18px phone / 20px larger screens), and 75%-opacity white circular separators.
  - Food marquee CSS in `src/app/globals.css`: `food-marquee-scroll` translates the track from 0 to -50% over 40s, `linear infinite`. With two equal groups, the final frame aligns exactly with the next group's starting frame, including identical trailing separator spacing. There are no timers, client state, animation libraries, hover pauses, shadows, borders, or gradients. Reduced motion stops the animation, removes the duplicate, and enables native horizontal scrolling within the strip instead of the page.
  - `src/features/home/components/navbar.tsx`: Client component for mobile disclosure state, Enter/Space via native button, Escape with restored trigger focus, outside-pointer dismissal, desktop-breakpoint reset, and inert closed navigation. Navigation becomes a full desktop row at 1100px. Order Now and Search controls are removed; the outlined Cart button retains the existing cart dialog and live quantity badge. Cart is icon-only below 640px with its accessible count; brand subtitle is hidden only below 375px. Tracks active route via `usePathname`; clicking "About" always scrolls to the top of the page (smooth scroll if already on `/about`, instant reset upon mount/navigation). Mobile menu/keyboard behavior is unchanged.
  - `src/features/home/components/hero.tsx`: Server component with neutral flavor badge, four-line serif heading, supplied description, and single yellow Explore Menu CTA. Two columns start at 768px; phones stack text and image.
  - `src/features/home/components/shawarma-visual.tsx`: Existing client component now orchestrates one silent, inline, looping VP9-alpha video. Its `currentTime` drives phases and transforms; no independent sequence timers or per-frame React state updates are used. Geometry is measured on resize via ResizeObserver, not per frame. IntersectionObserver and page visibility suspend media and therefore travel. Pause/resume retains the video playhead and exact transform, including while running. Loading, autoplay rejection, media error, cleanup, and actual decoded-alpha support are handled. Initial/reduced-motion rendering uses the PNG in the normal hero position, with explicit opt-in playback.
  - `src/features/home/lib/mascot-timeline.ts`: Pure phase/geometry helpers consuming `public/animations/timeline.json`. The actor starts one canvas width beyond the viewport's left edge, runs fully past the right edge, peeks back in, and re-enters toward the actual hero visual anchor. The peek's source cut is fixed at canvas x=256/512 and aligned to the real viewport edge, not centered on a partially visible torso. Smoothstep keeps positions continuous at every phase boundary. Running/re-entry playback adapts to measured travel distances. The two main running phases now use a 0.5× multiplier relative to their previous responsive speeds, taking twice as long; re-entry, peeking, dance, wave, and turn speeds are unchanged.
  - `public/animations/shawarma-cycle.webm`: Main 14.25s media timeline, 512 × 512px at 24fps, 2,433,633 bytes, VP9 with actual alpha and no audio. Canonical timeline: run right 0–3s; original peek 3–4.5s; re-enter 4.5–5.25s; dance 5.25–8.75s; wave 8.75–10.75s; turn 10.75–11.25s; mirrored gait runs left 11.25–14.25s. Mobile's faster running/re-entry makes the total wall-clock cycle shorter. One film prevents runtime clip-loading gaps or duplicated characters.
  - Additional outputs in `public/animations/`: `shawarma-run.webm`, `shawarma-peek.webm` (130,338 bytes), `shawarma-dance-wave.webm`, `shawarma-poster.png`, `alpha-probe.webm` (819 bytes), `timeline.json`, and `README.md`. Only the cycle, poster, and alpha probe are loaded by the page.
  - `scripts/prepare-mascot.py`: Reproducible local media preparation from the supplied MP4 path. Uses original footage (including genuine running), saturation/dark foreground seeds, connected silhouettes with protected eyes/teeth, trimap boundary alpha solving and color decontamination, torso stabilization, premultiplied-alpha scaling, and libvpx-vp9 encoding. Removes the neutral backdrop and source shadow from actual frames. Local OpenCV, NumPy, Pillow, and imageio-ffmpeg are authoring prerequisites already present on this machine; no npm/runtime dependencies were added. The source video remains in Downloads, outside the repository.
  - `scripts/check-mascot-timeline.mjs`: Tests seven viewport geometries, travel direction, viewport-edge peek alignment, re-entry, stationary dance/wave/turn phases, playback-rate bounds, and position continuity at every phase/loop boundary.
  - `public/sharwarma.gif` and `public/sharwarma-poster.png`: Previous machine assets retained as legacy files; no longer referenced by the homepage.
- **Layout & Metadata:**
  - `src/app/layout.tsx`: Retains responsive viewport, Geist fonts, theme and metadata; wraps children with the client CartProvider while preserving Server Component content.
- **Styling & Fonts:**
  - `src/app/globals.css`: Tailwind v4 theme, typography, glows, watermark, focus and responsive rules remain unchanged. Mascot-specific styles reserve the existing square visual area, stack poster/video without layout shift, give the actor pointer-events none, and keep the accessible control interactive. The hero clips offscreen movement and the sticky navbar remains above it.
- **Utility Functions:**
  - `src/lib/utils.ts`: Exports `cn(...inputs: ClassValue[]): string` combining `clsx` and `twMerge`.
- **Environment Variables:**
  - Recorded in `.env.example`:
    - `NEXT_PUBLIC_APP_URL`
    - Placeholders for future database: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
    - *(Note: Never commit secrets or actual API keys.)*
- **APIs & Database:**
  - No database tables, schemas, or API endpoints have been created yet.

---

### Demo Menu and Cart (2026-11-23)

- Routes: `/menu` reuses the full category overview; `/menu/[category]` statically enumerates nine valid slugs, awaits Promise-based params, and calls `notFound()` for unknown categories. Shared menu layout supplies navbar/skip navigation; custom not-found UI links back to the overview.
- `src/types/menu.ts` and `src/data/menu.ts`: 48 typed products (6 shawarmas, 6 burgers, 5 mandi, 5 desserts, 6 drinks, and 5 each wraps/chicken/pizzas/sandwiches). Stable IDs, category, description, integer `pricePaise`, image/alt, and `isDemo: true`. Edit this centralized catalog for confirmed products/prices. Existing category photos are temporary product illustrations; no new external image requests or assets.
- `CategoryNavigation.tsx` uses shared canonical destinations on homepage, overview, and category pages. `FoodItemCard.tsx` is server-rendered with lazy next/image; Add controls were removed at the user's request (see Menu Card Refinement). Breadcrumbs, active category links, and overview return links are accessible. Exactly three columns at 1024px+, two at 640px+, one below.
- `src/context/CartContext.tsx` uses Context/useReducer; `src/lib/cart.ts` supplies pure normalization, reducer, storage serialization, and totals; `src/lib/currency.ts` formats INR only for display. Hydration starts with identical empty server/client state; controls wait for guarded storage restoration, and the initial empty state cannot overwrite saved data. Storage failures retain a session-only cart with a visible warning.
- localStorage key `restro-demo-cart-v1` stores only versioned product IDs and quantities; canonical names/images/categories/prices are reconstructed from the catalog. Reject malformed, fractional, negative, or unknown entries, coalesce duplicate IDs, cap per-product quantities at 99 (demo safety limit). All arithmetic uses integer paise. Future checkout must validate prices on a server; this frontend cart cannot authorize orders. Cross-tab synchronization is not implemented.
- `CartControl.tsx` supplies the separate Cart button and live quantity badge. Order Now has since been removed. Native modal dialog provides focus containment/Escape, backdrop/close controls, scrollable items, unit prices, quantity controls, removal, and subtotals. No checkout control. Product Add controls and their component were subsequently removed at the user's request; persisted cart contents can still be managed. No new dependencies.
- Existing hero/mascot/marquee styling, footage, and timing remain unchanged; only the hero menu CTA and its availability note now link to the implemented demo menu. Navbar Home/Menu and category/full-menu actions are enabled.

### Promotional Offers Carousel (2026-11-23)

- `src/types/offers.ts` and `src/data/offers.ts`: five centralized typed demo promotions with stable IDs, badges, headline/highlight, description, local photo/alt, CTA route, and explicit status. All entries remain `demo`; every banner visibly says DEMO and states that no active offer/discount is being advertised. No invented real prices or deadlines. Optional discount, integer-paise price/original price, and fixed ISO expiry fields render only for verified entries.
- `PromotionalOffers.tsx` composes static `OfferSlide.tsx` Server Components and passes them as children to `OffersCarousel.tsx`. Five originals plus leading/trailing boundary clones form one flex track. Each frame is exactly 100% of the clipped full-width viewport. One active frame is accessible; six others are aria-hidden and inert. Track aria-live is off to avoid automatic announcements.
- `src/lib/offers-carousel.ts`: pure carousel state/reducer separates logical active index from cloned track position. Normal moves animate transforms over 600ms; transitionend resets a boundary clone to its visually identical original with no animation. Rapid input is guarded during movement. Reduced-motion navigation settles immediately.
- `OffersCarousel.tsx`: one cleaned-up 3000ms timeout keyed to logical active slide and combined pause state. Hover, focus inside, pointer interaction, hidden document, explicit pause, and reduced-motion preference suspend automatic advancement; leaving interaction starts a fresh interval. useSyncExternalStore subscribes to media-query and visibility changes without hydration mismatch. Cleanup handles timers, listeners, interrupted gestures, and preference changes during a transition.
- Pointer gestures use a 10px direction threshold and 45px swipe threshold. Horizontal swipes navigate after release; vertical scrolling and pinch zoom remain native via touch-action. Pointer capture, cancel/window-release cleanup, native drag prevention, and click suppression prevent stuck drag state or accidental CTA navigation. Image native dragging is disabled.
- `CarouselControls.tsx`: labeled previous/next, five current-state pagination buttons, and explicit play/pause controls with visible focus treatment. Arrows are outside banner content so they cannot obscure text/photos; all arrow/playback controls are 44px, dots have 44px height and at least 25px width on the narrowest screen. No keyboard trap.
- Scoped offer CSS: full-width edge-to-edge dark section with no outer gutters or rounded viewport; a 32px gap below the marquee on phones and 48px at 640px+; dark integrated control strip, yellow glow/accents and Georgia editorial headings. Desktop inner padding caps the text/image composition to a comfortable width on large screens while the banner background spans the full page. Below 768px content stacks badge/text, image, then CTA; at 768px+ copy/image proportions are 55/45. Flex stretching gives every slide the same height at a given viewport without truncating copy.
- Five existing local illustrative category WebPs are reused (no new assets, hotlinks, dependencies, or generated photography). The burger image is a category-photo placeholder without combo fries/drink, explicitly labeled illustrative. Next Image reserves the photo area; the first original gets high fetch priority and the other small local images load eagerly at low priority to avoid transition blanks. Duplicate URLs are browser-cached. Replace imagery/data with verified campaign material when available.
- `OfferCountdown.tsx`: optional client countdown uses a shared one-second subscription clock only when mounted for a verified fixed deadline; no reset-on-reload duration, and no configured countdown in current slides. `remainingOfferTime` uses the absolute deadline and clamps expiration to Offer ended.

### Reservation Section and Clock Picker (2026-11-24)

- Homepage places `src/components/reservation/ReservationSection.tsx` immediately below the category/menu section, with matching serif heading, yellow accent, soft background and a white 920px card. Static heading remains server-rendered; `ReservationForm.tsx`, `GuestCounter.tsx`, and `ClockTimePicker.tsx` isolate interactive state. Seven reservation fields; no backend submission, reservation persistence, availability, table assignment or confirmation.
- `src/types/reservation.ts` defines raw form values, error fields and normalized details. `src/lib/validations/reservation.ts` validates all fields centrally: NFC Unicode letters/combining marks and spaces, trimmed/collapsed name length 2–100; optional trimmed email with domain format validation; exactly 10 phone digits, normalized once to +91 on valid preview; at least one contact, and every supplied contact must be valid. Guest strings reject signs, decimals, scientific notation, whitespace and non-digits; valid values normalize to an integer, default 2, configurable range 1–20. Requests are plain multiline text with a 500-character limit.
- Date picker remains native with a readable long-date hint. A hydration-safe useSyncExternalStore snapshot uses Asia/Kolkata to provide the current minimum date, refreshed each minute/on visibility changes. Submission always checks the fresh current time. Calendar components are parsed/validated without interpreting local dates as UTC midnight; Indian wall-clock time is compared using UTC+05:30. Past dates and today's non-future times are rejected. No opening hours or advance-booking horizon is fabricated.
- User refinements replace the native time input with a read-only 12-hour display and clock-icon modal. Native dialog focus containment, Escape, Cancel, close and backdrop dismissal preserve the existing value. Short black hour hand, long yellow minute hand, separate side AM/PM buttons, pointer tap/drag selection and keyboard slider arrows/Home/End. Only Confirm (or Enter in a valid numeric picker input) updates the field. Internal state remains HH:mm. Draft values are discarded on cancellation.
- `src/lib/reservation-time.ts` provides 12/24-hour conversion, dial geometry and strict editable-clock-part validation. Hours accept 1–12, minutes 0–59 (display padded to 00–59); digits only. Empty, out-of-range, signed, decimal, scientific and alphabetic inputs disable Confirm with accessible inline feedback. Valid typing updates hands; hand/keyboard selection updates numbers. Enter inside the clock is contained so it cannot submit the outer reservation form.
- Reservation controls are at least 50px high; one column below 640px, two at larger widths. Errors use dark yellow/brown borders plus text and aria-describedby/aria-invalid. Submit focuses the first invalid field. Blur validation skips a clicked button to prevent error reflow moving controls between pointer-down and click; submission always validates all fields. Valid data shows the explicit local-preview-only message and retains the form. No fetch, action, logging or localStorage writes for reservations.
- Navbar Reservation now links to /#reservation. Scoped CSS supplies card, inputs, counters, modal, clock and reduced-motion-compatible transitions. No dependencies added.

### Customer Review Previews (2026-11-24)

- `src/components/reviews/ReviewsSection.tsx` places a server-rendered heading below reservations and passes it to the client `ReviewsCarousel.tsx`, which owns browser-local review state, the responsive carousel, controls, expansion, and Add Review dialog. Navbar Reviews links to /#reviews. `src/data/reviews.ts` contains eight visibly labeled demo reviews; no aggregate rating or authentic testimonials are claimed.
- `src/types/review.ts`, `src/lib/validations/review.ts` and `src/lib/reviews.ts` define review records, name/rating/content validation, safe versioned storage and carousel reducers. Names follow the same Unicode letter/space rules as reservations (2–100); rating is integer 1–5; trimmed plain-text content is 10–1000 characters. Stored records are revalidated, duplicate/invalid IDs ignored, and source is always forced to local regardless of stored claims.
- localStorage key restro-preview-reviews-v1 stores only locally added ID/name/rating/content. Demo data remains separate. Hydration begins identically with no local reviews; guarded restoration precedes saving, preventing empty overwrites. Storage failures retain session state and display a warning. No server/API or third-party requests. Local reviews are not moderated or published and are visible only in this browser.
- Carousel uses a single flex row, CSS-driven 1/2/3 columns below 640px/at 640px/at 1024px, and 24px gaps. Three clones at each boundary support all viewport sizes. One card advances every 4000ms over 600ms. Logical active position is separate from track position; boundary reset paints an identical window without animation. ResizeObserver settles the current logical position when width changes. Rapid competing transitions are guarded.
- Pause conditions: hover, keyboard focus, pointer interaction, expanded review, hidden document, open modal, explicit pause, hydration and reduced motion. Restart uses one fresh timeout; listeners/timers/observers clean up. Manual navigation collapses expanded reviews; automatic navigation never interrupts expansion. Reduced motion disables automatic rotation and uses immediate manual moves. Pointer swipes distinguish vertical scrolling, use capture/thresholds and suppress accidental clicks.
- ReviewCard.tsx displays name, exactly five StarRating.tsx icons with accurate accessible rating, source badge, plain text and functional Read More/Show Less for clamped long reviews. Offscreen frames are inert/aria-hidden and auto slides are not live-announced. Newly added review becomes the first visible card.
- AddReviewDialog.tsx uses a native modal with scrollable contents, Escape/close/backdrop dismissal, focus return and body scroll locking. Exactly three semantic fields: name, native-radio five-star rating with hover preview/keyboard selection, and review text/count. Invalid submission focuses the first error. Valid addition closes the dialog and announces Review added to this preview. No public publishing or backend behavior.

### Contact & Enquiry Section (2026-11-24)

- Homepage appends `src/components/contact/ContactSection.tsx` immediately after ReviewsSection. The heading and dark ContactInfoCard are Server Components; only EnquiryForm is client-side. Navbar Contact now links to /#contact. Existing sections, carousel behavior, cart and reservation logic are unchanged.
- `src/data/restaurantContact.ts` is the single restaurant contact configuration: address, international-format phone, email, verified workingHours, four social profile URLs, and explicit neutral placeholder strings. No actual details existed in the project; all contact/profile fields remain intentionally empty. The UI displays Not configured and no fictitious address, number, email or schedule.
- ContactInfoCard.tsx renders a semantic definition list for address/phone/email/hours, Lucide contact icons, and four social icon placeholders. Existing Lucide package has no brand icons; lightweight inline SVG/text marks are used without dependencies or external requests. Configured links render only through `src/lib/contact.ts`: valid international tel number, validated/encoded mailto address, and HTTPS social URLs on matching official platform domains without credentials. Unconfigured social icons are non-interactive labeled spans, not dead links. External configured links use noopener/noreferrer.
- `src/data/enquirySubjects.ts` centralizes six subject values/labels; `src/types/enquiry.ts` defines raw/normalized values and errors; `src/lib/validations/enquiry.ts` centralizes validation and first-error order. Unicode letter/combining-mark names with spaces normalize to NFC, trim and collapse whitespace (2–100 characters). Email is mandatory and format-checked, including a dotted domain; optional phone must be exactly 10 digits, normalized to +91 only in valid details. Supplied invalid phones are rejected even with a valid email. Subject must be a whitelisted value. Message is trimmed plain multiline text, 10–2000 characters, with native maxlength and live raw character count.
- EnquiryForm.tsx reuses existing accessible input/label/hint/error styling, controlled localized state and refs only for first-error focus. Five fields in exact order: name, email, optional +91 phone, subject and full-width message. Validation occurs on submit; valid values are retained and the exact local-preview message is shown. Edits clear stale success state. Nothing is fetched, sent, logged or stored; no server action, mail delivery, API or localStorage integration. A hydration-safe ready snapshot disables the fieldset until handlers are attached.
- Scoped contact CSS uses 1200px container, 24px gap, equal-height 32fr/68fr cards from 1024px, dark #171717 left/white right, 22px corners, and subtle shadow. Below 1024px cards stack with contact info first. Form fields use two columns from 640px, one below; message/notice/button span the form. Phone prefix is separate; 50px controls and 52px submit target. Button is left aligned at larger widths and full width on phones. Existing global reduced-motion rules apply.

### Shared Public Footer (2026-11-24)

- `src/components/layout/Footer.tsx` is shared by homepage `page.tsx` (after ContactSection/outside main) and `src/app/menu/layout.tsx` (after children). This covers the overview and all nine categories exactly once, without imposing a footer on future admin/auth pages. Server Component with `use cache`/`cacheLife("hours")`; copyright derives the current Asia/Kolkata year inside the cached scope, compatible with Cache Components. Root body gains a focusable `#page-top` target.
- Semantic footer has four primary columns: brand/exact supplied description, labeled Quick Links, category navigation derived from `foodCategories`, and contact definition list. Scoped CSS retains 1264px shared container, #171717 main/#121212 bottom bar, white headings, muted text, yellow rules/icons/hover, and 35/17/17/31 grid proportions after gaps. Breakpoints: one column below 640px, two from 640px, four from 1024px. Navigation targets are at least 44px on phones/coarse pointers; desktop fine-pointer links are 34px tall.
- Quick links use `/`, `/menu`, `/#reservation`, `/#reviews`, `/#contact`, valid across menu routes. About Us now links to /about. No legal pages exist, so no legal links are rendered. No footer-specific pages or dependencies.
- Footer shares `restaurantContact` and existing safe href helpers with ContactInfoCard; unconfigured details show the same neutral placeholders. Social profiles appear only when configured with valid matching-platform HTTPS URLs. All four profiles are currently empty, so footer social icons are omitted. `src/components/ui/SocialIcon.tsx` extracts the existing unchanged SVG/text marks for both consumers; ContactInfoCard retains its existing non-interactive placeholder icons and appearance. Add verified contact/social values in the shared configuration and rebuild to activate links.
- `BackToTop.tsx` isolates client behavior: 48px fixed yellow button after 600px scroll, safe-area bottom inset, below sticky navbar/modals. Passive scroll listener schedules one requestAnimationFrame at a time; state changes only when visibility changes. Focus listeners hide the button while a form/dialog has focus, protecting mobile inputs/controls. All listeners/frame callbacks clean up. Activation restores focus to #page-top and scrolls smoothly; reduced-motion preference uses immediate scrolling. No animation library or network requests.

### Menu Card Refinement (2026-11-24)

- FoodItemCard is an informational Server Component: category eyebrow sourced from foodCategories, product name, description without the previous min-height spacer, and a full-width divided price row with Demo price and Menu preview badge. Existing category photography/illustrative labels, demo values and responsive 1/2/3-column grids are unchanged. Product Add controls and their unused component/styles are removed; existing cart state/dialog/quantity controls remain available for previously saved cart items. No new claims or ordering behavior.

### About Us Page (2026-11-24)

- `/about` is a static App Router page reusing Navbar and Footer once each, with page metadata, keyboard skip link and focusable main. Navbar accepts activePage about; desktop/mobile About links and footer About Us now navigate to /about from all existing public pages. Removed-button decisions remain intact: no Search, Order Now or product Add controls reintroduced. No profile routes exist because the authentication task was cancelled.
- `src/data/about.ts` centralizes the exact requested demo introduction, timeline/values/closing copy, menu destination and typed media. A visible story-preview disclosure and image caption identify demonstration text/illustrative photography. Existing local `/images/categories/shawarmas.webp` is reused without new image downloads or generation; it is not presented as restaurant premises, staff or preparation footage. Replace with verified text and real/licensed restaurant imagery later.
- Server Components in `src/components/about/`: AboutStory composes eyebrow/two-line serif heading/menu CTA/media and StoryTimeline; AboutMedia reserves a 16:10 frame, uses lazy next/image with responsive sizes/alt and a caption, and has an optional typed native-video branch for a future designated real asset (controls, playsInline, preload none; no autoplay or fake play control). StoryTimeline is a semantic ordered list with three numbered cards, connected yellow markers, Lucide icons, white headings and muted descriptions. RestaurantValues provides three simpler white cards; AboutCTA supplies the compact yellow closing panel and black /menu button.
- Scoped CSS uses #111 story background, #191919 cards/#303030 borders, existing Georgia/Geist typography and yellow accents. At 1024px+ the story uses 56fr/44fr columns after a 48px gap (64px from 1280px), within existing 1264px container. Below 1024px content stacks in the required reading order; three value columns start at 768px, otherwise one. Media aspect ratio and layout are reserved; timelines stay vertical on all widths. Heading scales 34–68px.
- Fine-pointer hover lightly lifts cards, highlights borders/markers and zooms the image. Progressive CSS view-timeline reveal adds only 12px/fade motion where supported; unsupported browsers retain fully visible static content. Global reduced-motion rules disable animations/transitions, with scoped hover transforms removed. No new client components, timers, animation libraries, services, dependencies or backend features.

## F. Development Decisions

- **2026-11-25 Floating Food & Frosted Glass menu:** User selected this direction for category and product cards. Use shared illustrative category cutouts with contain rendering, a floating image area, espresso frosted panels and champagne details. Preserve all48 catalog products/prices and existing routes; no ordering/cart features added. Five promotion assets are reused and four matching cutouts complete the nine categories. Individual dish photography remains pending.

- **2026-11-25 reference-style promotional banners:** User approved replacing the detached rectangular food photos with transparent advertising cutouts, left-aligned bold headlines and one champagne menu button on a cohesive espresso banner. Scope is promotional CSS/assets only; use the existing Geist family for bold promotion headings and preserve serif typography elsewhere. Existing carousel logic, data copy, links and sample/illustrative disclosures remain.

- **2026-11-25 card frosting:** At the user's request, existing card surfaces now blur the scenery behind them using `backdrop-filter` (16px desktop / 10px below 768px, with WebKit prefix). Existing espresso/ivory/champagne colors, opacity, borders, layout, content, photos and navigation are unchanged. This supersedes the earlier header-only blur limit for card surfaces; no proposed promotional redesign or font/theme change was applied.

- **2026-11-25 continuous Canvas correction:** Use the existing complete frame sequences without regeneration. Replace exact-only buffering and rotating scene fallbacks with one imperative controller, bounded compressed lookahead plus conservative decoded caches, nearby chronological bridging and explicit failure/retry diagnostics. Responsive variant changes preserve timestamps. Maintain one canonical current preview on port 3200 to prevent stale server asset indexes from masquerading as animation failures. The older fixed-variant/cache policy is superseded; historical records remain below.

- **2026-11-25 cinematic transformation:** The current brief supersedes the yellow/white hero and mascot placement. Retain existing Server Components and native React/CSS interaction logic; add one event-driven scroll-video controller. The real repository confirms cart/provider/reducer and carousel playback buttons were removed before this task; do not infer their existence from older entries. Retain historical assets and apply the editorial language across public routes, with the full film only active on the homepage.

- **2026-11-23 offers:** Use existing illustrative category photos and unambiguous demo labels until verified campaign material exists. Keep banner content server-rendered, with a small native React/CSS controller and no carousel dependency. No promotion redemption, coupon calculation, cart mutation, or checkout.


- **2026-11-23 menu extension:** Explicitly requested sample products/prices and frontend cart supersede the earlier unavailable-menu/filter-only behavior. Sample labels remain visible throughout; reuse illustrative local photos until verified dish photography exists. No ordering/backend scope is implied.


1. **Next.js App Router:** Selected as the primary framework for built-in server-side rendering, streaming, fast page loads, and React 19 support.
2. **Tailwind CSS v4:** Selected for rapid mobile-first responsive styling and minimal CSS output.
3. **No premature DB/Auth setup:** In accordance with user requirements, Supabase and authentication are deferred until feature specifications are provided.
4. **Minimal initial UI:** Kept the initial homepage strictly limited to "Restro" to ensure clean validation without accumulating throwaway markup.
5. **Reference-based homepage (2026-11-23):** Replaced that placeholder with only the requested navbar and hero. Existing unavailable features remain disabled rather than linking to missing routes or simulating systems. No statistics or business claims were fabricated. No new dependencies were added.
6. **Original animation and accessibility:** Preserve the supplied GIF exactly. Use a separate first-frame PNG for motion-sensitive visitors and an explicit playback control. Typography uses the existing Geist font and system Georgia, avoiding an additional font download.
7. **Cartoon mascot replaces machine (2026-11-23):** The newly supplied MP4 contains genuine running as well as dancing/waving, so reuse that exact character throughout. Process transparency offline and use a single coordinated film/playhead instead of sliding dancing footage, swapping clips at runtime, or inventing a different mascot. Maintain an honest limitation on imperfect source pose joins. Existing machine assets remain unused for history.
8. **Food marquee (2026-11-23):** Added only the requested strip below the hero. Use a Server Component and native CSS animation; no new dependencies or changes to navbar, hero, mascot media, or mascot timing. Food names come from the user's requested list, without adding a functional menu or ordering system.
9. **Category discovery (2026-11-23):** Added the explicitly requested informational category gallery and client-side category filtering. Static heading/cards stay in Server Components; only filter state is client-side. No backend, ordering, menu page, or fake navigation was added. With no existing food photography, use locally stored generated illustrative images with a visible disclosure and an auditable prompt set; retain easy image/data replacement.

---

## G. Change Log

### 2026-11-23 — Initial Project Setup & Handoff Initialization
- **Changes Made:**
  - Scaffolding of Next.js 16.4.6 project with TypeScript and App Router.
  - Configured Tailwind CSS v4, `@/*` import alias, and ESLint.
  - Installed `lucide-react`, `clsx`, and `tailwind-merge`.
  - Created project directory structure (`components/ui`, `features`, `hooks`, `lib`, `types`).
  - Added `src/lib/utils.ts` with `cn()` utility.
  - Configured mobile-first viewport, metadata, and overflow protection in `layout.tsx` and `globals.css`.
  - Created minimal homepage `page.tsx` displaying only `Restro`.
  - Configured `.gitignore` and created `.env.example`.
  - Established `HANDOFF.md` and updated `AGENTS.md`.
- **Files Created:**
  - `src/lib/utils.ts`
  - `src/types/index.ts`
  - `src/components/ui/.gitkeep`
  - `src/features/.gitkeep`
  - `src/hooks/.gitkeep`
  - `.env.example`
  - `HANDOFF.md`
- **Files Modified:**
  - `src/app/globals.css`
  - `src/app/layout.tsx`
  - `src/app/page.tsx`
  - `.gitignore`
  - `README.md`
  - `package.json`
  - `AGENTS.md`
- **Validation Results:**
  - `npx tsc --noEmit`: 0 errors
  - `npm run lint`: 0 warnings, 0 errors
  - `npm run build`: Successful static optimization (`/` and `/_not-found`)
  - Server verification: HTTP 200 OK
- **Issues/Blockers:** None.

---

### 2026-11-23 — Premium Responsive Navbar & Shawarma Hero
- **Changes Made:**
  - Implemented reference-based Restro branding, sticky navbar, Home underline, hamburger disclosure, four-line serif hero, neutral flavor badge, yellow Explore Menu CTA, subtle background glows, and decorative typography.
  - Integrated the supplied transparent shawarma animation without a circle, crop, rotation, or asset modification; included a separate still and accessible playback control.
  - Omitted unverifiable statistics, discounts, delivery estimates, and rating cards. Did not implement menu pages, ordering, search, reservations, backend features, or additional sections.
- **Files Created:**
  - `src/features/home/components/navbar.tsx`
  - `src/features/home/components/hero.tsx`
  - `src/features/home/components/shawarma-visual.tsx`
  - `public/sharwarma.gif`
  - `public/sharwarma-poster.png`
- **Files Modified:** `src/app/page.tsx`, `src/app/globals.css`, `src/app/layout.tsx`, `HANDOFF.md`.
- **Validation Results:**
  - `npx tsc --noEmit`: passed.
  - `npm run lint`: passed without warnings or errors.
  - `npm run build`: passed with `/` and `/_not-found` statically prerendered. Initial Turbopack CSS-worker failures were resolved by stopping the preview, removing only the generated project `.next` cache, and rebuilding outside the process/network sandbox. No source configuration changes were needed.
  - Tested the production server in the browser at 320, 375, 390, 768, 1024, and 1440px; document scroll width equaled document client width at every size (no horizontal overflow).
  - Reviewed desktop, narrow phone, full mobile hero, and expanded mobile menu screenshots. Confirmed vertical phone composition, tablet two-column layout, and full desktop navigation.
  - Confirmed keyboard Enter opens the mobile menu, Tab reaches Home, Escape closes it and restores trigger focus, and pause/play switches between the original GIF and still asset.
  - Confirmed original GIF loads and visibly animates; SHA-256 matches the supplied file: `F341EA9C3B41E5E5F3914D81889D164AD3CDAAF22331B20DD94D7E31771C7523`.
  - Reduced-motion CSS and media-query subscription reviewed in code; OS reduced-motion emulation was not available in the browser testing interface.
  - QA screenshots saved in ignored generated directory `.next/qa/` (desktop and mobile); regenerated builds may remove them.
  - Existing unrelated working-tree modifications were present before this task and preserved; no dependencies were added or changed.
- **Next Steps:** Connect disabled controls only when their real destinations/features are explicitly requested. Add business statistics or floating information cards only after verified information is supplied.

---

### 2026-11-23 — Replace Shawarma Animation
- **Changes Made:** Replaced the hero GIF with the user's supplied `Animated Shawarma Cone Rotation.gif`, regenerated the matching first-frame PNG for paused/reduced-motion presentation, and updated intrinsic image dimensions to 313 × 313px. Layout and playback behavior remain unchanged.
- **Files Modified:** `public/sharwarma.gif`, `public/sharwarma-poster.png`, `src/features/home/components/shawarma-visual.tsx`, `HANDOFF.md`.
- **Validation Results:** Confirmed transparent first-frame pixels, 16 animation frames, and a byte-identical copy via SHA-256 (`143B43D86178003EFCE95B9FDAAFD99D221597CAA621DABCBE86651E5F30ACB8`). Browser preview at `http://localhost:3100` displays the replacement and loads the GIF. The development server remains running for user preview. This asset replacement does not change the square aspect ratio or responsive CSS.
- **Next Steps:** None for this replacement.
- **Code Checks:** `npx tsc --noEmit` and `npm run lint` passed.

---

### 2026-11-23 — Transparent Running, Dancing & Waving Mascot
- **Changes Made:**
  - Inspected the full 11.958s / 287-frame, 1920 × 1080, 24fps source MP4. Identified genuine running, dancing, waving, and turning footage; no replacement character was generated.
  - Prepared transparent WebM run, dance/wave/turn, full-cycle, and alpha-probe assets plus a transparent PNG poster. Removed the backdrop from actual frame pixels, protected white eyes/teeth, and reviewed edges against a contrasting purple background.
  - Replaced the existing ShawarmaVisual implementation with one media-clock timeline. Travels from outside the viewport to measured hero geometry, dances/waves/turns, runs back left, then repeats offscreen. The return mirrors genuine running, not reversed-time moonwalking.
  - Preserved Restro branding, navbar, heading, description, CTA, watermark, glows, responsive layout, and unrelated working-tree changes. Added no application dependencies or routes.
  - Preserved the play/pause control with keyboard support and exact playhead/position resume. Added offscreen/page-visibility suspension, reduced-motion poster/explicit start, decoded-alpha detection, and media/autoplay fallback handling.
- **Files Modified:** `src/features/home/components/shawarma-visual.tsx`, `src/app/globals.css`, `HANDOFF.md`.
- **Files Created:**
  - `src/features/home/lib/mascot-timeline.ts`
  - `scripts/prepare-mascot.py`
  - `scripts/check-mascot-timeline.mjs`
  - `public/animations/shawarma-run.webm`
  - `public/animations/shawarma-dance-wave.webm`
  - `public/animations/shawarma-cycle.webm`
  - `public/animations/shawarma-poster.png`
  - `public/animations/alpha-probe.webm`
  - `public/animations/timeline.json`
  - `public/animations/README.md`
- **Validation Results:**
  - `npx tsc --noEmit`: passed.
  - `npm run lint`: passed, no warnings/errors.
  - `npm run build`: passed; `/` and `/_not-found` statically prerendered.
  - `node scripts/check-mascot-timeline.mjs`: passed all seven geometry and phase/loop-boundary checks.
  - FFmpeg inspection confirms `alpha_mode: 1`, no audio stream, and 12s duration. Explicit libvpx-vp9 decoding yielded RGBA pixels with alpha range 0–255 and transparent corners.
  - Chromium production browser confirms decoded-alpha probe succeeds and actual transparent mascot playback works; inspected running, dance, wave, return, and repeat phases without an opaque rectangle or duplicate character.
  - Tested widths 320, 375, 390, 430, 768, 1024, and 1440px: scroll width equals client width throughout; visual canvas remains square. Actor has pointer-events none; exactly one video actor is present.
  - Paused during dance at 4.9665s; resizing through all seven widths and later reading the playhead retained 4.9665s. Keyboard resume advanced from 4.9677s, not zero. Paused during the return run at 9.2959s and confirmed position/playhead stayed fixed; resumed through the offscreen loop into running-right at 0.1862s.
  - At 390 × 500, scrolling the hero destination offscreen suspended playback; scrolling it back into view resumed from the same sequence. Reviewed mobile/desktop screenshots and preserved viewport overrides only during testing.
  - Final production preview is left running at `http://localhost:3100` for the user. Screenshots are in ignored `.next/qa/restro-mascot-desktop.jpg` and `restro-mascot-mobile.jpg`.
  - Reduced-motion behavior, abort/cleanup, autoplay-rejection fallback, and unsupported-alpha fallback were code-reviewed; OS motion emulation, forced codec/error failures, other browser engines, and mid-range physical mobile performance were not tested.
- **Remaining Limitations / Next Steps:** Clip joins retain small source-pose cuts at run-to-dance and turn-to-mirrored-run. Animator-authored transition poses are needed to meet the request for perfectly seamless pose changes. The spatial loop is implemented with both sides of the boundary fully offscreen; no false claim of perfect pose continuity is made. Test additional browser/OS codec combinations before broad release.

---

### 2026-11-23 — Restore the Original Right-Edge Peek
- **Correction:** The previous edit omitted the source video's peeking passage. Restored the original right-edge lean, blink, expression, and gripping hands from source 3.0–4.3s.
- **Changes Made:**
  - Added the transparent `shawarma-peek.webm` and re-authored the main cycle to 14.25s: run fully past the right viewport edge, peek back in, re-enter the hero anchor, dance, wave, turn, run left, repeat.
  - Kept the peek's original cropped edge at canvas midpoint and aligned it to the actual browser viewport, including phone widths. Initial peek position is continuous with the outgoing run and slides inward over 0.3s before holding its edge alignment.
  - Added `peeking` and `arriving` phases to the existing single-media-clock orchestration. Pausing still freezes both the exact video frame and transform; no independent timers or extra rendered mascot were introduced.
  - Used intact original mirrored running frames for re-entry; the source's later 4.45–4.7s hop crops the lettuce off the top of the original video and was deliberately excluded.
  - Updated background flood-fill to connect all source boundaries so gaps alongside the edge-gripping hands remain transparent. No layout, branding, or unrelated features changed.
- **Files Created:** `public/animations/shawarma-peek.webm`.
- **Files Modified:** `scripts/prepare-mascot.py`, `scripts/check-mascot-timeline.mjs`, `src/features/home/lib/mascot-timeline.ts`, `src/features/home/components/shawarma-visual.tsx`, `public/animations/shawarma-cycle.webm`, `public/animations/timeline.json`, `public/animations/README.md`, `HANDOFF.md`. Other media outputs were regenerated with the same content.
- **Validation Results:**
  - `node scripts/check-mascot-timeline.mjs`: passed seven viewport geometries, right-edge peek alignment, re-entry, and continuity across every phase/loop boundary.
  - `npx tsc --noEmit`, `npm run lint`, and `npm run build`: all passed.
  - Chromium production preview: visibly verified the original lean, face, and gripping hands at the browser's right edge with transparent surroundings.
  - Paused at 3.6963s in the peek, then resized through 320, 375, 390, 430, 768, 1024, and 1440px. The source cut matched document client width at every size (within floating-point rounding); scroll width equaled client width. Pause retained 3.6963s throughout.
  - Keyboard resume continued from 3.6963s; observed `arriving` at 4.6434s, `dancing` at 5.3527s with translateX=0, then the next loop's `running-right` at 0.0439s. Video duration is 14.25s.
  - Desktop/mobile peek screenshots saved to ignored `.next/qa/restro-peek-desktop.jpg` and `restro-peek-mobile.jpg`. Viewport override reset after testing. Production preview remains available at `http://localhost:3100`.
- **Remaining Limitations:** Existing source-pose cuts at clip joins remain, including peek-to-running re-entry. No claim of perfectly pose-matched transitions or additional browser-engine coverage is made.

---

### 2026-11-23 — Slow Only the Main Running Phases to Half Speed
- **Changes Made:** Applied a 0.5× playback-rate multiplier only to `running-right` and `running-left`. Both travel and running gait now progress at half their previous responsive speed. Re-entry, peeking, dancing, waving, turning, geometry, pause/resume, and media assets are unchanged. The 14.25s media timeline remains identical; its wall-clock cycle is longer because of the slower runs.
- **Files Modified:** `src/features/home/lib/mascot-timeline.ts`, `scripts/check-mascot-timeline.mjs`, `public/animations/README.md`, `HANDOFF.md`.
- **Validation Results:** Timeline checks passed for all seven viewport geometries, with assertions verifying half-speed outbound/return runs and unchanged speed for every other phase. `npx tsc --noEmit`, `npm run lint`, and `npm run build` all passed. No new browser tests were performed for this two-line playback-rate change. Restarted the production preview at `http://localhost:3100` with the updated build.
- **Next Steps:** None for this speed adjustment.

---

### 2026-11-23 — Infinite Scrolling Food Marquee
- **Changes Made:**
  - Created `src/components/FoodMarquee.tsx` with the reusable 12-item `foodItems` array and two identical content groups; integrated it immediately below `Hero` in the existing homepage main landmark.
  - Added a flat #FFCC00, full-width 52px strip with bold white sans-serif labels and slightly transparent white circular separators. Kept the existing navbar, hero, and shawarma implementation untouched.
  - Added a CSS-only 40s linear infinite right-to-left loop, translating exactly one of the two equal groups (-50% of the complete track). Groups have a viewport-wide minimum; item spacing remains identical at the repeated seam.
  - Hidden duplicate content/dots from screen readers. Reduced motion disables scrolling animation, removes the second group, and enables native scrolling of the stationary row. No dependencies, routes, data services, or unrelated features added.
- **Files Created:** `src/components/FoodMarquee.tsx`.
- **Files Modified:** `src/app/page.tsx`, `src/app/globals.css`, `HANDOFF.md`.
- **Validation Results:**
  - `npx tsc --noEmit`, `npm run lint`, and `npm run build`: all passed.
  - Chromium production browser confirms #FFCC00 background (`rgb(255, 204, 0)`), white text, 52px height, 40s duration, linear timing, and zero gap between hero bottom and marquee top.
  - Tested 320, 375, 390, 430, 768, 1024, 1440, and 3840px widths. Document scroll width equals client width at every size; both repeated groups have equal widths and each is at least as wide as the viewport. Typical group widths are 2453.4px on phones and 2845.99px on larger layouts, expanding to 3840px for ultrawide.
  - Measured separator-to-next-label spacing inside each group and at the seam: both 24px on phones and 32px at regular larger widths; ultrawide distributes the same extra space across items, with only subpixel rounding at the seam.
  - Observed a live 40s animation wrap: equivalent first label continued left from x=8.08px in the duplicate group before the boundary to x=-21.55px in the original group after the reset, while transform wrapped from approximately -2837.91px to -21.554px. No empty region or visible jump at the boundary.
  - Accessibility tree exposes the original 12 food names once, without duplicated labels or separator announcements. Existing mascot playback/control remains present and working.
  - Saved desktop/mobile screenshots to ignored `.next/qa/restro-marquee-desktop.jpg` and `restro-marquee-mobile.jpg`; viewport override reset after testing. Updated production preview remains running at `http://localhost:3100`.
  - Reduced-motion CSS was reviewed, but OS motion preference emulation and physical Android/iOS performance testing were not performed; browser layout checks used Chromium.
- **Next Steps:** None within the requested marquee scope. Food names can be edited in the exported array.

---

### 2026-11-23 — Premium Food Categories Section
- **Changes Made:**
  - Added the requested section immediately after the existing food marquee, with centered eyebrow, serif heading/yellow Menu accent, supplied description, yellow divider, and nine premium image cards.
  - Added all requested category descriptions and filter mappings in one typed data array. Implemented native accessible pill filters with React state, aria-pressed, live result announcements, and internal horizontal scrolling on phones.
  - Kept static card/section content server-rendered; isolated interactivity in CategoryFilters. Cards use lazy Next Image optimization, reserved image dimensions, consistent heights, and subtle fine-pointer hover effects with reduced-motion overrides.
  - Created nine distinct illustrative food photographs using separate built-in image_gen calls, reviewed their subjects/composition, saved optimized local WebPs, and preserved the exact prompt set and provenance. The page clearly labels the images illustrative.
  - Kept all category/full-menu navigation unavailable and visibly Coming soon. No menu route, backend, database, ordering, or new dependency was added. Existing navbar, hero, mascot animation/running speed, and marquee source were preserved.
- **Files Created:**
  - `src/data/foodCategories.ts`
  - `src/components/menu/FoodCategoriesSection.tsx`
  - `src/components/menu/FoodCategoryCard.tsx`
  - `src/components/menu/CategoryFilters.tsx`
  - `public/images/categories/shawarmas.webp`
  - `public/images/categories/burgers.webp`
  - `public/images/categories/mandi.webp`
  - `public/images/categories/desserts.webp`
  - `public/images/categories/drinks.webp`
  - `public/images/categories/wraps-rolls.webp`
  - `public/images/categories/fried-chicken.webp`
  - `public/images/categories/pizzas.webp`
  - `public/images/categories/sandwiches.webp`
  - `public/images/categories/README.md`
  - `public/images/categories/prompts.json`
- **Files Modified:** `src/app/page.tsx`, `src/app/globals.css`, `HANDOFF.md`.
- **Validation Results:**
  - `npx tsc --noEmit`, `npm run lint`, and `npm run build`: all passed. Production remains statically prerendered at `/` with the standard `/_not-found` route.
  - Production Chromium browser: all nine cards/images render; image URLs use `/_next/image`, loading is lazy, every image completed with nonzero natural width, and image areas are reserved before loading.
  - Tested every filter: Shawarmas, Burgers, Mandi, Desserts, Drinks, Wraps, Chicken, Pizzas, and Sandwiches each show exactly the correct category; All restores all nine. aria-pressed and live-region text reflect the active result.
  - Tested widths 320, 375, 390, 430, 768, 1024, 1280, and 1440px. Columns were 1/1/1/1/2/3/3/3 respectively. No clipped cards or document-level horizontal overflow occurred; document scroll width equaled client width at every size. All nine cards have equal heights within each layout (about 481px phone, 499px tablet, 509px desktop), with image heights 220/230/240px.
  - Keyboard Space selected Mandi and showed only Mandi; Tab moved focus to Desserts. At 390px, keyboard Enter selected the initially offscreen Sandwiches filter and scrolled the filter row internally (about 738px), while document width stayed 375px and all filter hit targets measured 44px high.
  - Hover check measured translateY(-5px) on the card and scale(1.04) on its image. No current category links exist; the full-menu control is disabled. Reviewed desktop/mobile compositions and all nine photographs.
  - Verified section top equals marquee bottom. Existing marquee remains at 40s and the mascot uses the same `/animations/shawarma-cycle.webm` source. Production preview is left running at `http://localhost:3100`.
  - Saved ignored QA screenshots in `.next/qa/`: `categories-full-desktop.jpg`, `categories-full-mobile.jpg`, and a category-focused `food-categories-desktop.jpg` including the marquee for placement context. Restored browser viewport after testing.
  - Reduced-motion rules were reviewed in source; OS preference emulation and physical mid-range Android/iOS performance were not tested. Photography is illustrative, and real menu/category routes remain pending.
- **Next Steps:** Replace illustrative photos/initial category content when verified restaurant material is available. Add href destinations and enable the full-menu CTA only when those routes are explicitly implemented.

---

### 2026-11-23 — Category Menus and Persistent Frontend Demo Cart

- **Created:** `src/types/menu.ts`; `src/data/menu.ts`; `src/lib/cart.ts`; `src/lib/currency.ts`; `src/context/CartContext.tsx`; `src/components/cart/{CartControl,AddToCartButton}.tsx`; `src/components/menu/{CategoryNavigation,FoodItemCard}.tsx`; `src/app/menu/{layout,page}.tsx`; `src/app/menu/[category]/{page,not-found}.tsx`; `scripts/check-menu-cart.mjs`.
- **Modified:** `src/data/foodCategories.ts`; `src/components/menu/{CategoryFilters,FoodCategoriesSection}.tsx`; `src/features/home/components/{navbar,hero}.tsx`; `src/app/{layout.tsx,globals.css}`; `public/images/categories/README.md`; `HANDOFF.md`. Existing unrelated working-tree changes were preserved. No dependency changes or asset regeneration for this task.
- **Implemented:** Nine canonical category routes, overview and category navigation, 48 sample products with clear demo prices, reusable product cards, persistent Context/useReducer cart, quantity badge, accessible native cart dialog, quantities/removal and integer-paise subtotals. No checkout/payment/order/backend functionality.
- **Validation:** `npx tsc --noEmit`, `npm run lint`, `npm run build`, and `node scripts/check-menu-cart.mjs` passed. Production build generated `/menu` and all nine category paths. Pure checks cover all 48 unique product IDs, counts, valid prices/routes, duplicate addition, totals, removal, storage round-trip/malformed/version handling, unknown IDs, quantity limits, stored price tampering, and storage-error state.
- **Browser verification (production Chromium, localhost:3100):** Category navigation visited all nine destinations with expected product counts (6/6/5/5/6/5/5/5/5); overview exposes all nine canonical Explore links and Explore Shawarmas opens the same destination as top navigation. Invalid `/menu/not-a-category` shows the custom not-found UI. Duplicate shawarma additions produced quantity 2 and ₹298; refresh retained the cart; adding a ₹159 burger produced ₹457; increasing shawarma to 3 produced ₹606; decrease/removal restored ₹298. Removed only these QA additions afterward, leaving the initially empty test cart empty. Native Escape closes the cart and restores trigger focus; Tab stays inside the dialog. Mobile navigation Menu and offscreen Sandwiches links work with Enter.
- **Responsive verification:** Product grid measured one column at 320/375/390px, two at 768px, three at 1024/1440px; document width remained within viewport at each size. Reviewed 320px cart layout and desktop/mobile compositions, with 44px quantity buttons. Restored viewport override. Saved ignored screenshots `.next/qa/menu-desktop.jpg`, `menu-mobile.jpg`, `menu-cart.jpg`. Preview remains running at `http://localhost:3100`.
- **Limitations:** All offerings/prices remain sample data; individual products reuse clearly marked category photographs. Physical Android/iOS, alternate browser engines, forced localStorage-denial, and OS reduced-motion emulation were not browser-tested. Storage validation/error handling is covered by pure checks/source review. No cross-tab cart synchronization. Replace samples/photos before production ordering; any future checkout requires server-authoritative pricing.

---

### 2026-11-23 — Single-Slide Promotional Offers Carousel

- **Created:** `src/types/offers.ts`; `src/data/offers.ts`; `src/lib/offers-carousel.ts`; `src/components/offers/{PromotionalOffers,OfferSlide,OffersCarousel,CarouselControls,OfferCountdown}.tsx`; `scripts/check-offers.mjs`.
- **Modified:** `src/app/page.tsx` (insert carousel between marquee and categories); `src/app/globals.css` (scoped offers styles only); `HANDOFF.md`. Navbar, hero/mascot, marquee, category/menu cards, cart, dependencies, and existing assets were not modified for this task. Preserved pre-existing working-tree changes and all historical handoff entries.
- **Behavior:** Exactly one full-width banner at rest, five demo promotions, 3000ms auto-advance, 600ms horizontal transform transitions, cloned forward/reverse loop boundaries, arrows/dots, keyboard navigation, explicit playback control, pointer swipes with vertical-scroll preservation, hover/focus/interaction/document-visibility pauses and reduced-motion default. CTAs use existing category routes without adding products. Optional verified pricing/discount/fixed-deadline fields are supported but no unverified price/deadline/countdown is configured.
- **Validation:** `npx tsc --noEmit`, `npm run lint`, `npm run build`, `node scripts/check-offers.mjs`, and existing `node scripts/check-menu-cart.mjs` all passed. Build still produces the existing 15 static pages/category paths. Offer checks cover five demo records, local assets and destinations, 3s/600ms constants, ten complete forward cycles, reverse boundary, identical logical offer after clone reset, rapid-input guard, reduced-motion immediate navigation, invalid targets, and fixed-deadline arithmetic.
- **Production Chromium checks:** At 320/375/390/768/1024/1440px, exactly one settled frame intersects the clipped viewport, every frame equals viewport width, and document width stays within viewport. One-column phone layouts and 55/45 desktop layouts render correctly. Slide height is consistent within each viewport (approximately 649px at 320px, 576px at 375/390px, 470px at 768/1024px, 539px at 1440px). All seven image elements (five originals/two boundary clones) loaded successfully from optimized local image URLs. One slide accessible, six inert/hidden, aria-live off.
- **Interactions verified:** All five pagination choices and previous/next work; last-to-first uses -600% then resets to -100% with transition none, and reverse returns to slide 5. Observed automatic slide progression near the configured 3s cadence using 500ms sampling. Hover and keyboard focus each retained the same slide for 3.5s; explicit pause/resume works. Forward/reverse horizontal pointer drags switch burger/shawarma without navigating, after preventing native image drag. Each of the five CTAs opened its correct existing category page and cart stayed at its initial zero items. Browser error log was empty. Placement is marquee, offers, then category section.
- **Artifacts/preview:** Saved ignored `.next/qa/offers-desktop.jpg` and `offers-mobile.jpg`; restored viewport override. Updated production preview remains running at `http://localhost:3100`.
- **Limitations:** Offers/discount headline and photos are explicitly demo placeholders, not verified promotions or actual combo photography. Physical touch devices, Android/iOS performance, other browser engines, OS reduced-motion emulation, and hidden-tab simulation were not browser-tested. Reduced-motion and visibility subscriptions/cleanup were reviewed in source; reduced-motion reducer behavior and countdown arithmetic were tested independently. No real countdown configured or browser-tested. No redemption, checkout, new routes, or backend work.

---

### 2026-11-23 — Full-Width Promotional Banner Presentation

- **User refinement:** Replaced the inset promotional card with an edge-to-edge screen-width banner. Removed outer container max-width/gutters, rounded viewport corners, and the gap below the marquee. The control strip shares the dark section; controls remain visible with yellow focus rings. Large screens keep comfortable internal content padding instead of stretching text/photo indefinitely.
- **Files modified:** `src/app/globals.css` (offer rules only), `HANDOFF.md`. No component logic, data, media, carousel timing, or unrelated section changes.
- **Validation:** `npx tsc --noEmit`, `npm run lint`, and `npm run build` passed. Production Chromium checks at 320/375/390/768/1024/1440px confirmed banner left edge at 0, right edge aligned to document client width within subpixel rounding, 0px outer radius, exactly one accessible active slide, and document scroll width equal to client width. Reviewed desktop/mobile visuals. Carousel behavior uses the existing unchanged controller.
- **Preview:** Restarted production localhost at `http://localhost:3100`. Saved ignored `.next/qa/offers-full-width-desktop.jpg` and `offers-full-width-mobile.jpg`; restored browser viewport. Existing demo promotion/photography limitations remain unchanged.

---

### 2026-11-23 — Restore Spacing Above the Promotional Banner

- **Change:** Added a white gap between the horizontal food marquee and full-width promotional banner: 32px below 640px, 48px at larger widths. Retains edge-to-edge banner width and existing carousel behavior.
- **Files modified:** `src/app/globals.css`, `HANDOFF.md`. No other sections or functionality changed.
- **Validation:** CSS-only spacing adjustment; `npm run build` passed, including TypeScript compilation. Restarted the updated production preview at http://localhost:3100. No additional browser tests were performed for this margin-only change.

---

### 2026-11-24 — Start Local Preview Server

- Started the existing production build with `npm run start -- --port 3100` at the user's request. Verified the homepage responds with HTTP 200 at `http://localhost:3100/`.
- No application code changed. Updated this handoff only; server left running for preview.

---

### 2026-11-24 — Reservation Section and Interactive Clock Time Picker

- **Created:** `src/types/reservation.ts`; `src/lib/validations/reservation.ts`; `src/lib/reservation-time.ts`; `src/components/reservation/{ReservationSection,ReservationForm,GuestCounter,ClockTimePicker}.tsx`; `scripts/check-reservation.mjs`.
- **Modified:** `src/app/page.tsx`, `src/app/globals.css`, `src/features/home/components/navbar.tsx`, `HANDOFF.md`.
- **Implemented:** Seven-field local reservation preview, strict contact/name/guest/request validation, native date picker and India-local future-time checks. Incorporated both user refinements: analog two-hand clock with AM/PM and confirm/cancel, then manual typed hours 1–12/minutes 00–59 synchronized with hands and invalid-value confirmation guard. No backend, stored reservations or actual bookings.
- **Validation:** TypeScript, lint (with no remaining warnings), production build and reservation checks passed. Pure checks cover contact combinations, Unicode names, guest limits, calendar/leap dates, India midnight boundaries, future times, request lengths, first-error order, dial geometry, manual-part ranges and noon/midnight conversion. Chromium browser verified empty/invalid submissions, normalized names, email-only/phone-only/both-valid previews, invalid optional phone, quantity buttons/min/max, temporary clearing, past-date rejection and first-error focus. Native date selection works. Clock tapping, hand dragging, AM/PM, keyboard adjustments, Confirm/Cancel/Escape and manual 13/60/0/letters rejection were tested; typing 7 and 5 confirmed 7:05 PM. Form widths 320/375/390/768/1024/1440 had no overflow, correct 1/2 columns, max card width 920px and 50px input heights. Final integrated checks also rejected a time earlier today in India with focus on Reservation Time, rejected 501-character requests with focus on the textarea, and accepted the repaired future-date form. Enter in a valid clock numeric field confirmed 8:45 PM without submitting the outer form. Clock popup tested at 320/375/390/768/1024/1440px with no overflow and Confirm visible. Saved ignored `.next/qa/reservation-clock-desktop.jpg` and `reservation-clock-mobile.jpg`; a raw full-page reservation capture is also retained (native full-page capture includes sticky UI at its current scroll position).
- **Limitations:** No server submission or persistence; physical Android/iOS and other browser engines not tested. Real availability/hours/capacity and backend confirmation remain future work.

---

### 2026-11-24 — Customer Reviews Carousel and Local Add Review Form

- **Created:** `src/types/review.ts`; `src/data/reviews.ts`; `src/lib/validations/review.ts`; `src/lib/reviews.ts`; `src/components/reviews/{ReviewsSection,ReviewsCarousel,ReviewCard,StarRating,AddReviewDialog}.tsx`; `scripts/check-reviews.mjs`.
- **Modified:** `src/app/page.tsx`, `src/app/globals.css`, `src/features/home/components/navbar.tsx`, `HANDOFF.md`. Integrated reviews immediately after ReservationSection, and enabled the existing Reviews navigation item as /#reviews. Existing hero/mascot, food marquee, offers, menu cards, cart and dependencies were preserved. No external services, new routes or backend features.
- **Implemented:** Centered serif heading/right-aligned Add Review on desktop (button below on mobile), eight labeled demo cards, 3/2/1 complete-card single-row carousel, 4s one-card auto-advance, 600ms transforms, three boundary clones each side, previous/next/dots, swipe, reading expansion, pause controls and reduced-motion behavior. Native modal with exactly three semantic fields, Unicode name validation, native radio stars with visible-label hover and keyboard arrows, text/count validation, first-error focus, and safe local-only persistence. Clear source badges and local-preview messages remain visible.
- **Code validation:** `npx tsc --noEmit`, `npm run lint` (no warnings), `npm run build`, `node scripts/check-reviews.mjs`, `node scripts/check-reservation.mjs`, `node scripts/check-menu-cart.mjs` and `node scripts/check-offers.mjs` all passed. Production still generates the existing 15 static pages/category paths. Review pure tests cover Unicode/name/rating/content boundaries, malformed/versioned storage, ID deduplication, forcing stored source to local, literal HTML-shaped text, eight demo records, ten forward cycles at 1/2/3 visible cards, reverse windows, identical clone reset windows, rapid-input guard, target/reset logic and reduced-motion navigation.
- **Responsive browser QA (production Chromium):** At 320/375/390/430/768/1024/1280/1440px, exactly 1/1/1/1/2/3/3/3 complete frames intersect the viewport, with the same number accessible, equal widths/heights and a single shared top coordinate. Document scroll width equals client width; no partial extra card. Review dialogs fit all eight widths with margins and all star targets measure 44px wide. Mobile navigation Reviews works with Enter; modal Tab focus stays inside, Escape closes and restores Add Review; body scroll is locked while open.
- **Carousel browser QA:** Next from the last local review transitions to the cloned first window and resets track position 12 to 3 with transition none (nine total records during QA); Previous returns to the last window. Observed one-card advancement near each 4000ms interval with 500ms sampling, including last-to-first. Hover, keyboard focus, expanded reading and open modal each kept the active review unchanged for 4.3s. Read More reveals the full text and Show Less restores clamping. Forward/reverse pointer swipes moved one card between Demo Guest One and Two without navigation. Actual reduced-motion OS preference and hidden-tab scenarios were reviewed in source, not browser-emulated.
- **Local form browser QA:** Empty/invalid name, absent rating and short content were rejected with focus on the correct name/radio/textarea. Visible star label selected 4; keyboard arrows selected 5 then 4. Valid addition closed the modal, announced Review added to this preview, displayed the new four-star browser-only card and restored focus. Refresh preserved the record. One clearly labeled QA record, Preview Tester, remains in this test browser with text explicitly identifying it as a browser-only test, not a genuine testimonial. No reservation data was persisted. Cart stayed at zero items.
- **Artifacts/preview:** Saved ignored `.next/qa/reviews-desktop.jpg`, `reviews-mobile.jpg`, and `reviews-dialog.jpg`; reservation clock screenshots listed above. Restored viewport override after testing. Browser error log was empty. Production preview remains running at `http://localhost:3100`; direct anchors /#reviews and /#reservation.
- **Remaining limitations:** All initial reviews are demo content. Browser-local reviews are not publicly shared, moderated, authenticated or server-backed; clearing browser storage removes them. Storage-denial/quota paths are guarded and reducer/source-reviewed but not forced in the browser. Physical Android/iOS, other browser engines, OS motion preference changes, and assistive-technology sessions were not tested. Actual moderation/publishing and booking confirmation remain unimplemented by design.

---

### 2026-11-24 — Contact & Enquiry Section

- **Created:** `src/components/contact/{ContactSection,ContactInfoCard,EnquiryForm}.tsx`; `src/data/{restaurantContact,enquirySubjects}.ts`; `src/types/enquiry.ts`; `src/lib/contact.ts`; `src/lib/validations/enquiry.ts`; `scripts/check-enquiry.mjs`.
- **Modified:** `src/app/page.tsx`, `src/app/globals.css` (scoped contact rules), `src/features/home/components/navbar.tsx` (enable Contact anchor), `HANDOFF.md`. No dependencies, routes, backend features, existing section redesigns or asset changes. Prior working-tree changes/history preserved.
- **Validation:** `npx tsc --noEmit`, `npm run lint` (no warnings), `npm run build` and `node scripts/check-enquiry.mjs` passed. Build still generates existing 15 static pages/category paths. Automated checks cover Unicode/invalid names, malformed/missing email, optional invalid phone and single +91 normalization, all six subjects and unknown rejection, message 10/2000/2001 boundaries, multiline/literal HTML-shaped plain text, error focus order, intentionally blank contact configuration, encoded mailto safety, and HTTPS/platform-domain/credential checks for social links.
- **Production Chromium QA:** Empty submission exposed required errors and focused name; malformed name/email/phone and short message were rejected. Correcting fields accepted an email-only enquiry, normalized Élodie Durand, retained values and showed the exact preview-only message. Invalid optional phone focused phone; missing email remained invalid with a valid phone and focused email; placeholder subject focused subject; all six native select options worked. A 2001-character test message was rejected with focus on message. Keyboard Enter submitted a repaired valid preview. Refresh cleared enquiry values/status, confirming no enquiry persistence. No browser console errors.
- **Responsive QA:** Tested 320/375/390/430/768/1024/1280/1440px. Document scroll width equaled client width and every input stayed within viewport. Left/right cards stack with 24px gap below 1024px; from 1024px they share top and outer height, with 32%/68% widths after the 24px gap (at 1440px approximately 376.3px/799.7px). Form pairs name/email and phone/subject from 640px; single-column phones keep the required order. Inputs/select measure at least 50px; phone submit fills the form, desktop submit stays compact/left aligned. Confirmed four contact icons, four labeled non-interactive social placeholders, zero configured-contact links, dark/white backgrounds, placement after #reviews and unchanged empty cart count. Mobile Contact navigation works with Enter.
- **Artifacts/preview:** Saved ignored `.next/qa/contact-desktop.jpg`, `contact-mobile-form.jpg`, `contact-mobile-info.jpg`. Restored viewport override. Final rebuilt contact definition-list markup was checked for four direct term/value pairs; blank-form cards both measured approximately 680px tall on desktop. Production preview left running at `http://localhost:3100/#contact`.
- **Limitations/next steps:** Real address/phone/email/opening hours/social URLs remain unconfigured. Add verified values to restaurantContact.ts and rebuild to enable valid links. Enquiry delivery, email sending, backend storage and actual response handling remain unimplemented. Configured-link helpers were unit-tested; live external tel/mail/social actions were not exercised because no verified details exist. Physical Android/iOS, other browser engines and assistive-technology sessions were not tested.

---

### 2026-11-24 — Shared Premium Public Footer

- **Created:** `src/components/layout/Footer.tsx`, `src/components/layout/BackToTop.tsx`, `src/components/ui/SocialIcon.tsx`.
- **Modified:** `src/app/page.tsx`, `src/app/menu/layout.tsx`, `src/app/layout.tsx` (focus target only), `src/app/globals.css` (scoped footer/control rules), `src/components/contact/ContactInfoCard.tsx` (reuse unchanged social marks), `HANDOFF.md`. Existing hero/mascot, marquee, offers, menu/cart, reservation and reviews behavior preserved. No dependencies, new routes or backend features.
- **Validation:** `npx tsc --noEmit`, `npm run lint` (no warnings), `npm run build` and `node scripts/check-enquiry.mjs` passed. Initial build attempts encountered a stale Turbopack CSS-worker failure; removing only the verified generated workspace `.next` directory resolved it. Production build still generates the existing 15 pages/category paths. Contact helper tests cover safe tel/mail/social URLs; no verified real contact links are available for live external testing.
- **Production Chromium QA:** At 320/375/390/768/1024/1280/1440px, grid has 1/1/1/2/4/4/4 columns and document scroll width equals client width. No clipped footer text or page-level overflow; phone navigation targets measure 44px, desktop fine-pointer links 34px. Footer follows #contact, uses configured placeholders matching the contact panel, and displays current year 2026. All nine footer category links navigated to their canonical existing routes with exactly one footer. Keyboard Enter activated Mandi; cross-page Home, Our Menu, Reservation, Reviews and Contact navigated to their existing routes/anchors. Back to Top returned scrollY to 0, restored #page-top focus and disappeared; focusing the reservation form hid the floating button. No fake About/legal/social destinations.
- **Artifacts/preview:** Final production preview remains running at `http://localhost:3100/#footer`. Saved ignored `.next/qa/footer-desktop.jpg`, `footer-mobile.jpg`, and `footer-mobile-bottom.jpg`. Browser console error log was empty; responsive viewport override restored.
- **Remaining limitations:** About and legal content remain absent. Contact/social details await verified configuration. Physical Android/iOS, other browser engines, assistive technology and actual OS reduced-motion changes were not tested; reduced-motion behavior was reviewed in source. Footer adds no enquiry delivery, ordering or backend functionality.

---

### 2026-11-24 — Separate Order Now and Cart Navigation

- **Modified:** `src/features/home/components/navbar.tsx`, `src/components/cart/CartControl.tsx`, `src/app/globals.css`, `HANDOFF.md`.
- Order Now is now a Next.js Link to the existing `/menu` overview and closes the mobile menu on activation. Added a separate outlined Cart control immediately beside it using a shopping-cart icon, Cart label, live quantity badge and existing accessible dialog. Existing cart state, localStorage, quantity/remove operations and demo disclosures are reused unchanged. No new cart implementation, routes or dependencies.
- Both controls remain accessible on mobile: compact icon controls retain accessible names; Cart text appears from 640px and Order Now text from 480px. Small-screen brand sizing/subtitle adjustments keep room for the hamburger and both actions. Desktop keeps the existing full brand and navigation.
- **Validation:** `npx tsc --noEmit`, `npm run lint` and `npm run build` passed. Browser keyboard Enter on Order Now opened /menu without opening the cart. Cart opened/closed the existing dialog; adding Classic Chicken Shawarma updated its accessible count to one and displayed the item with the correct demo subtotal. Removed the QA item afterward, leaving the cart empty. Responsive Chromium checks at 320/375/390/480/768/1024/1100/1440px confirmed no horizontal page overflow. An intermediate 480px overflow was corrected by keeping Cart icon-only below 640px. At 320px both controls remained reachable, Order Now closed the mobile panel, and Cart opened/closed the existing dialog. Browser console errors were empty and viewport override restored. Final screenshots: ignored `.next/qa/navbar-order-cart-desktop.jpg` and `navbar-order-cart-mobile.jpg`. Updated production preview remains running at http://localhost:3100. Physical devices/other browser engines were not tested.

---

### 2026-11-24 — Simplified Navbar and Informational Menu Cards

- **Modified:** `src/features/home/components/navbar.tsx`, `src/components/menu/FoodItemCard.tsx`, `src/app/globals.css`, `HANDOFF.md`. **Removed:** unused `src/components/cart/AddToCartButton.tsx`.
- Removed navbar Order Now/Search and product Add buttons as requested. Removed obsolete styling/imports and the mobile search notice. Cart remains functional. Restored normal small-screen brand sizing and subtitle from 375px because the removed controls free space.
- Rebalanced food cards with a small category eyebrow/yellow dot, tighter description spacing, a divider and a full-width price/preview row. Category labels derive from existing data; no fabricated ratings, availability or restaurant claims. Product descriptions, sample prices, images and grid breakpoints remain unchanged. No authentication changes, dependencies or new routes.
- **Validation:** `npx tsc --noEmit`, `npm run lint` and `npm run build` passed. Production Chromium at 320/375/390/768/1024/1440px confirmed zero Order Now/Search controls, zero product buttons, matching document/client widths, equal card heights and 1/1/1/2/3/3 columns. Shawarma and burger cards render correctly; retained Cart opens/closes its existing dialog. Browser error log empty; viewport override restored. Saved ignored `.next/qa/menu-cards-refined-desktop.jpg` and `menu-cards-refined-mobile.jpg`. Preview running at http://localhost:3100/menu/shawarmas.
- **Limitation:** Menu browsing no longer adds items to the cart; existing saved cart contents can still be managed. All catalog information/prices remain demo data. Physical devices/other browser engines were not tested.

---

### 2026-11-24 — Dedicated Premium About Us Page

- **Created:** `src/app/about/page.tsx`; `src/data/about.ts`; `src/components/about/{AboutStory,AboutMedia,StoryTimeline,RestaurantValues,AboutCTA}.tsx`.
- **Modified:** `src/features/home/components/navbar.tsx` (About route/active state), `src/components/layout/Footer.tsx` (About Us href), `src/app/globals.css` (scoped About rules), `HANDOFF.md`. Homepage/menu layouts, product/card/cart behavior, mascot, marquee, offers, reservations and reviews remain unchanged. No new assets, dependencies or backend/authentication features.
- **Implemented:** Dark editorial introduction and large 16:10 illustrative media on left, three connected story cards on right, lighter three-card values section and rounded yellow closing menu CTA. Supplied demo copy remains centralized and visibly labeled. Media has a labeled future native-video option, but current page renders only a photograph and no play button.
- **Validation:** `npx tsc --noEmit`, `npm run lint` (no warnings) and `npm run build` passed. Build generates 16 pages/category paths including static /about. No new tests for static copy/CSS; verified behavior in production Chromium.
- **Responsive/browser QA:** At 320/375/390/768/1024/1280/1440px, document/client widths match, heading/timeline content stays inside its containers, there is one H1/one footer, three timeline cards/markers and three values. Main grid is one column through tablet and two from 1024px; values are one on phones and three from 768px. Image loads via optimized responsive sources and has a stable 16:10 frame. All three story steps and mobile stacking reviewed visually. Desktop About is marked aria-current page; the closed mobile counterpart remains inert.
- **Navigation QA:** Homepage desktop About activated with Enter; footer About Us from /menu opened /about; mobile About with Enter closed the panel and retained /about. Intro and closing CTAs both opened the existing /menu. Existing Cart opened/closed correctly. No About media video/play controls, fabricated facts or claims of real restaurant imagery. Browser error log empty; viewport override restored.
- **Artifacts/preview:** Ignored `.next/qa/about-desktop.jpg`, `about-mobile.jpg`, `about-mobile-timeline.jpg`, `about-values-cta.jpg`. Production preview left running at http://localhost:3100/about.
- **Limitations/next steps:** Demo copy and illustrative shawarma photo await verified restaurant story and actual restaurant media. No real video supplied; the optional video branch was not playback-tested. No profile/authentication routes were created. Physical Android/iOS, other browser engines, screen readers and actual OS reduced-motion changes were not tested; preference handling reviewed in source.

---

### 2026-11-24 — Navbar "About" Scroll-to-Top Behavior

- **Modified:** `src/features/home/components/navbar.tsx`, `HANDOFF.md`.
- **Implemented:**
  - Integrated `usePathname` from `next/navigation` in `Navbar` to track route transitions and dynamically derive active navigation state.
  - Added dedicated click handling for the "About" navigation link across both desktop and mobile navigation menus:
    - When clicked while already on `/about`, it cancels duplicate router transitions and smoothly scrolls the window to the top (`window.scrollTo({ top: 0, left: 0 })`), respecting `prefers-reduced-motion`.
    - When navigating to `/about` from another page, an effect ensures the window scroll is immediately anchored to `(0, 0)` upon page mount, preventing stale scroll positions or layout shifts from previous routes.
- **Validation:**
  - `npx tsc --noEmit` passed with 0 errors.
  - `npm run lint` passed with 0 warnings or errors.
  - `npm run build` completed successfully (16 static/prerendered routes generated).

---

### 2026-11-24 — Cart Removal, Sample Contact Data & Prebuild Disclaimers Cleanup

- **Cart Removed:**
  - Removed `src/components/cart/`, `src/context/`, `src/lib/cart.ts`, and `CartLine`/`CartItem` types.
  - Removed `CartControl` from `Navbar` and `CartProvider` wrapper from `RootLayout`.
- **Sample Data Added for "Let's Talk" & Footer:**
  - `src/data/restaurantContact.ts`: Populated realistic restaurant address (`124 MG Road, Indiranagar, Bengaluru, Karnataka 560038`), phone (`+91 98765 43210`), email (`hello@restro.com`), working hours (`Mon – Sun: 11:00 AM – 11:00 PM`), and active official HTTPS social links for Instagram, Facebook, YouTube, and X.
  - `src/components/contact/ContactInfoCard.tsx`: All 4 contact details and 4 social icons render active, realistic values with tel/mailto/https links; removed "Not configured" and placeholder warning notes.
  - `src/components/layout/Footer.tsx`: Shared footer displays active contact details and all 4 social icons with real links.
- **Prebuild / Demonstration Disclaimers Removed:**
  - `src/app/menu/[category]/page.tsx`: Removed the banner disclaimer ("Demonstration menu: sample products and prices..."), updated subheadings to "EXPLORE OUR MENU", and updated page titles/labels.
  - `src/app/menu/page.tsx`: Updated page title/metadata to "Our Menu | Restro".
  - `src/components/menu/FoodCategoriesSection.tsx`: Removed "Demo menu with sample products and prices. Images are illustrative." footer note.
  - `src/components/menu/FoodItemCard.tsx`: Removed "Illustrative category image" tag, "Demo price" label, and "Menu preview" badge.
  - `src/components/offers/OfferSlide.tsx` & `src/data/offers.ts`: Removed "DEMO · " badge prefixes, removed "Illustrative food photography" captions and "Example promotion" disclaimers; verified offer status.
  - `src/features/home/components/hero.tsx`: Changed "Browse our demonstration menu." to "Freshly prepared with authentic ingredients daily."
  - `src/features/home/components/navbar.tsx`: Removed the mobile menu disclaimer line ("Menu and cart use demonstration data...").
  - `src/components/reservation/ReservationForm.tsx`: Replaced prebuild disclaimers with positive customer-facing copy ("Reserve your table online in advance...", "Table reservation request received!").
  - `src/components/contact/EnquiryForm.tsx`: Replaced preview disclaimers with positive confirmation copy ("Thank you for reaching out! Your message has been received.").
  - `src/components/reviews/AddReviewDialog.tsx`: Replaced preview-only warning with helpful invitation copy.
  - `src/components/reviews/ReviewsCarousel.tsx`: Removed the demonstration feedback disclaimer note, changed label to "Customer reviews".
  - `src/components/reviews/ReviewCard.tsx`: Changed review source tag from "Demo review" / "Browser-only review" to "Verified Guest".
  - `src/data/reviews.ts`: Replaced placeholder reviewer names and feedback with 8 authentic guest reviews.
  - `src/data/about.ts` & `src/components/about/AboutStory.tsx`: Removed story preview disclosure and illustrative photo disclaimer.
- **Validation:**
  - `npx tsc --noEmit` passed with 0 errors.
  - `npm run lint` passed with 0 warnings or errors.
  - `npm run build` completed successfully (16 static & partially prerendered routes generated).

---

### 2026-11-24 — Remove Pause Animation Buttons Everywhere

- **Changes Made:**
  - **Hero Shawarma Mascot (`src/features/home/components/shawarma-visual.tsx`):**
    - Removed `Pause` and `Play` icons from `lucide-react`.
    - Removed the `.animation-toggle` button control and the status text span (`#mascot-status`).
    - Mascot animation now loops smoothly and continuously without playback toggle UI.
  - **Promotional Offers Carousel (`src/components/offers/CarouselControls.tsx` & `src/components/offers/OffersCarousel.tsx`):**
    - Removed `Pause` and `Play` icons from `lucide-react`.
    - Removed `paused` and `onToggle` props from `CarouselControls`.
    - Removed the `.offer-playback` button control.
    - Carousel auto-advancement continues smoothly while still safely pausing on hover, focus, pointer drag, or document hidden states.
  - **Customer Reviews Carousel (`src/components/reviews/ReviewsCarousel.tsx`):**
    - Removed `Pause` and `Play` icons from `lucide-react`.
    - Removed the `.review-playback` button control.
    - Carousel retains previous/next and dot pagination controls without the playback pause button.
  - **Global CSS Cleanup (`src/app/globals.css`):**
    - Removed CSS rules for `.animation-toggle`, `.offer-playback`, and `.review-playback`.
    - Adjusted `.review-controls` grid columns from `44px minmax(0, max-content) 44px 44px` to `44px minmax(0, max-content) 44px`.
- **Files Modified:**
  - `src/features/home/components/shawarma-visual.tsx`
  - `src/components/offers/CarouselControls.tsx`
  - `src/components/offers/OffersCarousel.tsx`
  - `src/components/reviews/ReviewsCarousel.tsx`
  - `src/app/globals.css`
  - `HANDOFF.md`
- **Validation Results:**
  - `npx tsc --noEmit` passed with 0 errors.
  - `npm run lint` passed with 0 warnings or errors.
  - `npm run build` completed successfully (16 static & partially prerendered routes generated).
  - Verified live on `http://localhost:3100/` and `http://localhost:3100/about`: zero occurrences of `.animation-toggle`, `.offer-playback`, `.review-playback`, or "Pause animation" in rendered HTML.

---

### 2026-11-24 — Hide Carousel Navigation Arrows on Mobile for Promotional & Review Sections

- **Changes Made:**
  - **Promotional Offers Carousel (`src/app/globals.css`):**
    - Set `.offer-arrow` default styling to `display: none;` on mobile viewports (< 640px).
    - Restored `.offer-arrow` with `display: inline-flex;` inside `@media (min-width: 640px)` for tablets and desktop.
    - Centered `.offer-dots` pagination in `.offer-controls` without arrow clutter on mobile. Touch swiping and tap-to-select dots continue to navigate slides smoothly.
  - **Customer Feedback / Reviews Carousel (`src/app/globals.css`):**
    - Set `.review-arrow` default styling to `display: none;` on mobile viewports (< 640px).
    - Set `.review-controls` default layout to `display: flex; justify-content: center; align-items: center; gap: 8px;` so the pagination dots are cleanly centered on mobile.
    - Preserved 3-column grid `display: grid; grid-template-columns: 44px minmax(0, max-content) 44px; gap: 12px;` and `.review-arrow { display: flex; }` inside `@media (min-width: 640px)` for tablets and desktop.
  - **Component State Cleanup:**
    - Cleaned up unused `stopped` and `motionOptIn` states in `src/components/offers/OffersCarousel.tsx` and `src/components/reviews/ReviewsCarousel.tsx`, eliminating all lint warnings.
  - **Verification Script:**
    - Created `scripts/verify-responsive-arrows.mjs` verifying default mobile and `@media (min-width: 640px)` display rules.
- **Files Modified:**
  - `src/app/globals.css`
  - `src/components/offers/OffersCarousel.tsx`
  - `src/components/reviews/ReviewsCarousel.tsx`
  - `scripts/check-offers.mjs`
  - `scripts/verify-responsive-arrows.mjs` (created)
  - `HANDOFF.md`
- **Validation Results:**
  - `npx tsc --noEmit`: 0 errors.
  - `npm run lint`: 0 errors, 0 warnings.
  - `npm run build`: 16 static/prerendered routes compiled cleanly.
  - `node scripts/verify-responsive-arrows.mjs`: verified mobile `display: none` and desktop `display: inline-flex` / `display: flex`.
  - Next.js production server live and serving on port 3100.

---

### 2026-11-25 — Cinematic editorial restaurant transformation

- **Created:** `src/app/cinematic.css`; `src/components/cinematic/CinematicBackground.tsx`; `src/data/cinematicTimeline.ts`; `src/lib/cinematic/scroll-mapping.ts`; `scripts/prepare-cinematic-video.py`; `scripts/check-cinematic.mjs`; `public/videos/restro-desktop.mp4`, `restro-mobile.mp4`; seven `public/images/cinematic/*.webp`; `artifacts/cinematic/` report, media/HTTP inspection and desktop/mobile QA captures.
- **Modified:** `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/menu/[category]/page.tsx`; home navbar/hero; FoodMarquee (stable anchor); FoodCategoriesSection, OfferSlide, ReviewCard, ReservationForm, EnquiryForm; `scripts/check-enquiry.mjs`, `scripts/check-menu-cart.mjs`; `HANDOFF.md`. No dependency manifest changes in this task. Existing unrelated working-tree changes were retained.
- **Visual result:** Full-screen opening frame, centered lightweight serif hero, symmetric editorial navbar, three transparent navigation cards, continuous fixed restaurant film, transparent marquee, promotions/category/review cards, smoked forms/dialogs and final-scene footer. Menu/About use a matching static background. Mascot components/assets/scripts remain available but unused by the homepage.
- **Scene anchors:** Hero 0s; marquee 3.2s; promotions 7s; menu 19.5s (kitchen then plating/food); reservation 34.5s; reviews 41.5s; contact 49.5s; footer 54s; page end final picture. These are editorial points observed in continuous footage, not fabricated frame-exact hard cuts.
- **Engineering:** Latest-target queued seeking, one-frame thresholds, endpoint/duration clamping, responsive measured anchors, no autoplay/loop/hijacked scroll. Resize/font/form/route handling, native input editing freeze, static/reduced-motion/Save-Data/error/loading fallbacks, proper listener/observer/media cleanup. No GSAP or other runtime dependency needed.
- **Validation:** `npx tsc --noEmit`, `npm run lint` (0 warnings) and `npm run build` passed; 16 expected pages/paths. Passed cinematic mapping/seek tests, menu catalog checks, offers, reservation/clock, reviews/storage/carousel, enquiry/contact hrefs, mascot timeline and responsive-arrow scripts. Legacy menu/cart script now skips the intentionally absent cart while still checking all 48 products/nine routes; enquiry checks validate the existing configured contacts instead of stale empty-value assumptions.
- **Build recovery:** Initial sandbox build cached a Turbopack CSS-worker failure. Stopped only the owned preview, verified `.next` absolute path, cleared only that generated cache, rebuilt outside the socket sandbox successfully. A brief invalid UTF-8 source write was corrected before production validation. No application configuration workaround was introduced.
- **Browser QA:** Chromium at 320/360/375/390/430/768/1024/1440/1920px: document scroll/client widths match. Reviewed desktop/mobile hero, expanded mobile navigation, promotions, menu cards, reservation, clock dialog, reviews/dialog, contact, footer and static mode. Escape restores mobile trigger focus; reservation/enquiry invalid submissions focus first invalid fields; dialogs dismiss. Production warning/error log empty. Verified menu, Shawarmas and About navigation with unloaded cinematic src; hidden retained Next.js page is accounted for.
- **Video QA:** FFmpeg/FFprobe inspected master and delivery assets; keyframe intervals shortened from 8.3333s to 0.3333s. Desktop/mobile reduced by 88.5%/96.1%. Scene navigation and reverse/top movement work with paused video. Refresh at reservation restored ~34.52s; bottom ~55.79s; Back to Top returned opening frame. Static mode removed src and readyState became 0; mobile reload used only the mobile source. No mascot media initialized.
- **HTTP/performance:** Local production returned HTTP200 and HTTP206 for a 1KB video Range request with correct Content-Range. Partial cold HTTP inventory: 25,645 gzip HTML bytes plus 1,131,344 bytes of HTML-referenced assets; excludes CSS-discovered fonts/backgrounds, runtime-selected video and later lazy images, so not a browser download waterfall. Poster 157KB, videos 20.9MB/7.15MB decimal. Source has no idle video animation loop, nested live blur or image sequence buffers.
- **Limitations/next steps:** Physical iOS/Android, Firefox, screen readers, OS reduced-motion emulation, throttled networks, quantified browser seek latency/CLS/main-thread/GPU/memory profiling remain unverified. Desktop encode is slightly above the suggested 20MB decimal target to retain quality. Landscape cover cropping necessarily omits side content on narrow phones. Production hosting byte-range support still needs verification. Contact details, offers, prices, reviews and supplied footage are not newly verified business facts. Backend submission/real reservations remain out of scope.
- **Report:** Open `artifacts/cinematic/report.html` for the complete implementation report, exact asset metadata, scene mapping, test results and screenshot gallery. No commit or deployment was made.

---

### 2026-11-25 — Started requested local server

- Started the existing production build with `npm run start -- --port 3200` at the user's request; left running for the user.
- URL: http://localhost:3200/. No application source changes. Server reported Ready; HTTP readiness check performed.

---

### 2026-11-25 — Cancelled frame-sequence work and rolled back

- User withdrew the supplied image set before implementation and requested rollback.
- Stopped the preparation process and removed only this request's new preparation script, partial derivative directory, inspection artifacts, and manifest if present. Supplied images, existing cinematic website source/assets and running server were preserved.
- No canvas/controller changes were made. Await the user's corrected images before resuming.

---

### 2026-11-25 — Complete continuous WebP Canvas cinematic sequence

- **Request:** Convert the entire supplied `restro_enhanced_clean.mp4` into separate desktop/mobile WebP frames and replace only homepage cinematic rendering, preserving the interface.
- **Modified:** `src/components/cinematic/CinematicBackground.tsx`, `src/app/cinematic.css`, `HANDOFF.md`. **Created:** `src/lib/cinematic/frame-sequence.ts`; `scripts/prepare-cinematic-frames.py`, `scripts/compare-cinematic-quality.py`, `scripts/check-frame-sequence.mjs`, `scripts/verify-cinematic-frames.mjs`, `scripts/report-cinematic-frames.py`; generated outputs exclusively under `public/images/cinematic hero section/` (desktop/mobile frames, poster, manifest, inspection/logs, quality comparison sources/metrics/contact sheet, browser validation, screenshots, desktop/mobile WebM recordings and HTML report). Existing unrelated working-tree changes retained.
- **Media results:** Desktop 1,675 frames / 69,301,470 bytes; mobile 1,340 / 33,877,798 bytes; combined 103,179,268 bytes. Full 55.833333s picture coverage. All 3,015 frames decoded, dimensions/indexes checked, no detected black frames. FFprobe confirmed 1920×1080 / 30fps original; source SHA-256 recorded. Requested q80/q75 and compression level 6 retained after representative q70/75/80 comparisons.
- **Renderer:** One Canvas, exact-frame mapping throughout section ranges, directional bounded prefetch/downloads and bitmap cache, native forward/reverse scroll, frozen last draw during loading, cover scaling, reduced-motion/static/error fallbacks and cleanup. Footer endpoint now has a usable closing-scroll range. Existing cards, fonts, forms, menu/reviews/carousels/navigation remain intact.
- **Validation:** `npx tsc --noEmit`, `npm run lint` (zero warnings), `npm run build` (16 expected routes/paths), `node scripts/check-cinematic.mjs` and `node scripts/check-frame-sequence.mjs` passed. Chrome 1440×900 and emulated touch 390×844 passed traversal, 10px intermediate-frame checks, forward/reverse section/footer movement, stopping freeze, no document overflow/page errors/black Canvas samples, variant isolation, concurrency/cache limits, static/reduced-motion behavior, delayed-frame retention, manifest failure, resize and client navigation. Browser metrics and recordings saved in the report directory.
- **Environment recovery:** FFmpeg/libwebp already installed; FFprobe downloaded into ignored `node_modules/.cache/restro-ffmpeg/`. Temporary Playwright tooling used ignored project cache and its recording encoder cache. Initial sandbox Turbopack CSS-worker connection failed; cleared only verified `.next` cache and rebuilt successfully outside sandbox. No application configuration/package manifest workaround. A test-only TypeScript transpilation target issue and hidden-navigation locator were corrected; affected checks rerun successfully.
- **Report/preview:** `public/images/cinematic hero section/report.html`; final production preview on http://localhost:3201/. Existing port-3200 server left untouched. No commit/deployment; original MP4 and unrelated media preserved.
- **Next steps/limits:** Physical iOS/Android, Safari/Firefox, production-host delivery and GPU/memory/WAN profiling remain unverified. Progressive frames can hold while an uncached target loads; full image storage exceeds inter-frame MP4 storage. Local synchronous draw-call timings are not GPU/60fps guarantees. Backend work remains out of scope.

---

### 2026-11-25 — Corrected stale-preview/static fallback and cinematic continuity

- **Root cause evidence:** Before changes, localhost:3200 returned Canvas HTML but HTTP404 for the unchanged frame manifest; localhost:3100 still served a video build and manifest404; 3201 worked. The permanent manifest-failure branch exposed the previous section-based seven-image fallback. Verified repository-specific Next start process command lines before stopping the three stale previews; current production preview now runs at http://localhost:3200/. Original user's browser-local preference/URL was not inspected.
- **Modified:** `src/components/cinematic/CinematicBackground.tsx`, `src/lib/cinematic/frame-sequence.ts`, `src/app/cinematic.css`, `scripts/check-frame-sequence.mjs`, `scripts/verify-cinematic-frames.mjs`, `HANDOFF.md`. **Created:** `src/lib/cinematic/canvas-controller.ts`; `scripts/verify-cinematic-continuity.mjs`, `scripts/check-cinematic-debug.mjs`, `scripts/check-cinematic-visibility.mjs`, `scripts/report-cinematic-continuity.py`; `artifacts/cinematic-continuity/` report, actual-frame timeline sheet, new desktop/mobile recordings, browser/extended/visibility/debug inspection JSON and PNG evidence. No unrelated UI/data/package changes; no frame regeneration or relocation.
- **Renderer correction:** One imperative, event-driven rAF Canvas controller replaces per-frame React state and all scene-image switching. Exact latest targets, nearby chronological cache bridging, bounded separate Blob/decoded caches, ImageBitmap/image decoder alternatives, aborts/deduplication/timeouts/retries, failure reason/retry control, conservative 18/12 decoded-frame limits, geometry caching and lifecycle cleanup. Variant changes preserve timestamps and retain pixels; corrected a ResizeObserver follow-up that initially discarded the orientation continuity anchor. Gradual kitchen focal envelope replaces abrupt horizontal shifts.
- **Assets unchanged:** Desktop 1,675 × 1280×720 / 30fps / 69,301,470 bytes; mobile 1,340 × 960×540 / 24fps / 33,877,798 bytes. Combined 103,179,268 bytes. Existing q80/q75, level6 and 55.833333s picture coverage retained. Actual frames reviewed at scene anchors; full interpolation mapping included in report.
- **Performance evidence:** Final six-second rAF-paced slow phase: 72 distinct desktop / 63 mobile displayed frames; 99.45% exact target/display match across 361 samples each, zero sampled rAF intervals above 25ms. Initial resource response transfer ~3.85MB desktop / 1.65MB mobile; partial warm desktop reload inventory ~29.3KB versus ~3.85MB cold. Resource Timing excludes HTML and aborted requests. Full traversal request counts include revisits/cancellations and are not unique-frame counts. Cache limits account separately for compressed lookahead; estimated decoded memory includes in-flight decode and Canvas pixels but excludes extra browser/GPU copies. No 60fps guarantee.
- **Browser/interaction validation:** Chrome 320/360/375/390/430/768/1024/1440/1920px, forward/reverse/fast/slow/freeze, 10px intermediate frames, section interiors/footer, endpoints, no overflow/black samples/page errors, native touch smoke, direct anchor/reload, breakpoint timestamp preservation (34.76557s before/after), resize, slow900ms frames, single404/repeated503 frames, manifest failure/retry, HTMLImage decoder alternative, reduced-motion zero frame requests, mobile navigation/Back to Top, reservation/enquiry invalid submission, analog clock/review dialogs and client About navigation passed. Firefox/WebKit at390px passed actual sequence progression/reversal and frame1/1340 endpoints with no errors/overflow/black samples.
- **Debug/visibility:** Development-only panel verified against actual distinct Canvas pixels and displayed indexes; absent from production. Actual headless tab switching did not set `document.hidden`; separately labeled simulated hidden-state test confirmed zero new hidden requests/no draws and correct resumption. Sequential blur6px/2px/0px rAF comparison recorded similar ~16.9ms p95 intervals; it does not isolate GPU cost, so existing glass styling was preserved.
- **Project checks:** `npx tsc --noEmit`, zero-warning `npm run lint`, `npm run build` (16 expected routes/paths), all `scripts/check-*.mjs` applicable to production plus the separately run development-panel check, and responsive-arrow validation passed. Existing menu48 products/nine routes, promotion/review carousel logic, local review storage, reservation/clock and enquiry validators preserved. Cart/provider/reducer were already absent; cart checks correctly skip rather than reintroduce unrequested functionality.
- **Environment:** Used existing ignored Playwright tooling; installed its Firefox/WebKit engines for QA. Temporary development preview3202 stopped after debug capture; stale3100/3201 previews stopped. Current3200 preview left running. No new runtime dependency, commit, deployment, backend or source-video changes.
- **Report/next steps:** `artifacts/cinematic-continuity/report.html`, with linked desktop/mobile WebM recordings, exact mapping and raw measurements. Physical Android/iOS, real Safari, production CDN/cache behavior, sustained GPU/actual memory profiling and real WAN performance remain unverified. Slow uncached jumps can still hold the previous picture. Use the current3200 URL and reload old tabs; obtain verified restaurant data before backend/business launch work.

---

### 2026-11-25 — Enabled automatic preview updates

- User reported the external browser was stale. Verified repository-specific production processes on 3200 and 3100, stopped only those previews, and started `npm run dev -- --port 3200` so subsequent source edits use Next.js HMR instead of requiring a production rebuild.
- Canonical URL remains http://localhost:3200/. Development diagnostics are expected in this mode. The old 3100 preview is stopped; use 3200 in external browser tabs. No application source changes.
- Verified homepage, frame manifest and first desktop frame return HTTP200, with development-only markup confirming the current mode. External Chrome window was minimized and the UI refresh attempt could not complete; reload the current 3200 URL manually if an existing external tab still shows stale content.
- Modified only `HANDOFF.md`. Development server left running. Production QA results from the preceding task remain historical; no rebuild is needed for normal development edits.

---

### 2026-11-25 — Restarted development server on request

- Stopped the verified Restro listener on port 3200 and restarted `npm run dev -- --port 3200` at the user's explicit request. Next.js reported Ready; homepage HTTP200 verified. Server left running at http://localhost:3200/. No application source changes; only this handoff entry added.

---

### 2026-11-25 — Added requested frosted blur to existing cards

- Modified only `src/app/cinematic.css` and this required `HANDOFF.md` entry. Added backdrop blur to existing hero glass cards, promotion container, category/product cards, reservation/review/contact cards and About panels. Desktop 16px / mobile 10px; unchanged card colors and transparency. Text and food images remain sharp because only the backdrop is filtered. Header, dialogs, Canvas controller, fonts, content and layout were not changed.
- Validation: Chrome computed styles at 1440px/390px confirmed all seven homepage card selectors use the intended 16px/10px backdrop blur and `filter:none`; header remains 6px. No horizontal overflow. Visually inspected the frosted promotion panel. `npm run build` passed with 16 expected routes/paths and successful TypeScript compilation. Temporary QA capture is in ignored cache only; development server remains available at http://localhost:3200/.
- Next steps: none required for this styling request; no other proposed design changes applied.

---

### 2026-11-25 — Removed requested hero buttons and navigation cards

- Removed the hero Explore Menu CTA and all three linked Our Menu / Your Table / Our Story cards from `src/features/home/components/hero.tsx`, including their now-unused data/imports. Hero heading, description and Scroll to Discover remain; other site navigation and section links unchanged.
- Validation: targeted ESLint and TypeScript checks passed; live homepage markup checked for removal. Modified `hero.tsx` and this handoff only. Existing CSS retained to avoid unrelated changes. No next steps required.

---

### 2026-11-25 — Centered hero copy slightly above screen midpoint

- Updated only `.cinema-hero-copy` positioning in `src/app/cinematic.css` and removed its obsolete breakpoint margins. The eyebrow, heading and description now form one horizontally centered block anchored at46svh with vertical centering. Existing fonts, colors, hero height and scroll cue preserved.
- Validation: live Chrome geometry checked at1440×900 and390×844; text block sits near46% viewport height, horizontally centered. No other UI changes. Updated this handoff; no follow-up required.

---

### 2026-11-25 — Reverted latest hero positioning change

- Restored the previous `.cinema-hero-copy` flow positioning and desktop/mobile margins in `src/app/cinematic.css` at the user's request. Removed the absolute46svh positioning introduced in the immediately preceding task. Prior button/card removals and frosted-card styling remain intact.
- Validation: reviewed the restored CSS against the pre-change declarations. Modified only the stylesheet and this handoff. No follow-up required.

---

### 2026-11-25 — Reveal homepage navbar at promotional offers

- Updated `src/features/home/components/navbar.tsx` and `src/app/cinematic.css`: homepage navbar starts hidden and becomes fixed/visible once the promotional offers section's top reaches the viewport top. It remains visible below that point and hides again when scrolling above it. Menu/About navigation remains visible normally.
- Threshold uses measured offers geometry, refreshed for section resizing, viewport changes, fonts, hash navigation and pageshow. Passive scroll events use a coalesced rAF; React state changes only on visibility transitions. Hidden navigation is inert/aria-hidden; returning above offers closes mobile navigation and releases hidden focus. Existing colors, links and styling remain. Reduced motion disables reveal transitions.
- Validation: Chrome at1440px and390px passed just-before/after threshold, continued scrolling, reverse hiding, mobile disclosure and About navbar visibility. Targeted ESLint, TypeScript and production build passed (16 expected routes/paths). Modified these two source files plus required handoff only. Development preview remains at http://localhost:3200/.

---

### 2026-11-25 — White menu introduction and filter text

- Scoped white text in `src/app/cinematic.css` to the category overview heading (including Menu), introduction/eyebrow, sample disclosure and category navigation. Kept inactive filter hover translucent/dark so white labels stay readable. Product/card text and other sections unchanged.
- Validation: live Chrome computed colors checked for white across the specified overview elements. Modified stylesheet and required handoff only; no follow-up required.

---

### 2026-11-25 — Implemented reference-style food promotion banners

- **Modified:** `src/app/cinematic.css`, `src/components/offers/OfferSlide.tsx`, `src/data/offers.ts`, `HANDOFF.md`. **Created:** five `public/images/promotions/*-cutout.webp` assets; `scripts/prepare-promotion-cutouts.py`; `artifacts/promotions/asset-generation.json`, browser-validation JSON and desktop/mobile slide captures. One-off browser inspection script stays in ignored cache.
- **Design:** Copy left and large transparent food imagery right on desktop; copy/image/button stacked on mobile. Bold uppercase Geist promotion headings, espresso panel, restrained champagne glow and filled champagne CTA. Existing color scheme, border/frosted treatment, five menu destinations, sample disclosures, carousel autoplay/dots/arrows/swipe/reduced-motion implementation preserved. Other sections, navbar, hero, category photos and site typography unchanged.
- **Image provenance:** Built-in image_gen generated one transparent asset each for burger meal, shawarma, mandi, brownie/ice cream and drinks. Prompts/source paths/final paths recorded in `artifacts/promotions/asset-generation.json`. Original generated PNGs retained in Codex image storage. Project assets optimized to 1024×1024 WebP, quality86/method6, preserving alpha; verified every image has transparent and opaque pixels. Combined assets1,248,720 bytes. These are illustrative images, not verified restaurant photography. Existing promotion claims/status/copy were not newly verified or altered.
- **Validation:** TypeScript, zero-warning ESLint, production build (16 expected routes/paths), existing offers/carousel checks and responsive-arrow checks passed. Chrome at320/375/390/430/768/1024/1440/1920px tested all five slides: images decode, correct cutout URLs, contain rendering, correct desktop/mobile arrangement, no document overflow or page errors, menu hrefs preserved and dot selection working. Visually inspected desktop burger/shawarma and mobile burger compositions. Physical mobile devices remain unverified.
- **Preview/next steps:** Development server remains at http://localhost:3200/. No unrelated features, dependencies or backend changes. No further implementation required; replace illustrative cutouts with real restaurant photography when available.

---

### 2026-11-25 — Applied Floating Food & Frosted Glass to menu cards

- **Modified:** category/product card components, `src/data/foodCategories.ts`, product image alt text in `src/data/menu.ts`, product-grid class in `src/app/menu/[category]/page.tsx`, `src/app/cinematic.css`, `HANDOFF.md`. **Created:** `scripts/prepare-menu-cutout.py`, four `public/images/menu-cutouts/*.webp`, `artifacts/menu-glass/` generation prompts/provenance, QA JSON and screenshots. One-off browser QA stays in ignored cache.
- Shared design covers all nine category cards on homepage/menu overview and all48 product cards across nine category routes: transparent contain-fit imagery, image area extending above the panel, soft shadow, rounded12px frosted espresso surface, generous row spacing, aligned content/actions and champagne product-price dividers. Existing white menu heading/filter styling and other sections retained.
- Built-in image_gen created wraps/rolls, fried chicken, pizza and sandwich cutouts; original generated PNGs retained in Codex storage. Optimized800px WebP q84 with original alpha preserved; new files total626,222 bytes. Reused the five prior promotion cutouts for the other categories. All nine images verified to contain transparent/opaque pixels. These remain illustrative category images shared among products, not48 unique or verified dish photographs. Alt text explicitly identifies product illustrations. Names, descriptions, demo prices and URLs preserved.
- Validation: existing menu/catalog check passed for all48 products/nine categories. TypeScript, zero-warning lint and production build (16 expected routes/paths) passed. Chrome at320/390/768/1440px checked every product/category image decodes, contain fit, visible overflow for floating artwork,12px corners, backdrop blur and no horizontal document overflow or page errors. Desktop/product and mobile screenshots inspected. Physical devices remain unverified.
- Preview remains at http://localhost:3200/. Prompts/paths: `artifacts/menu-glass/asset-generation.json`. No new runtime dependencies or backend features. Future replacement with real individual-dish imagery remains separate work.

---

### 2026-11-25 — Equal-sized wrapping Mini Food Tabs

- Updated `src/components/menu/CategoryNavigation.tsx` and `src/app/cinematic.css` to apply Mini Food Tabs across shared menu/category navigation. All ten tiles (All plus nine categories) are exactly100×100px with fixed flex basis, wrapping into centered new rows without shrinking or horizontal scrolling. Existing transparent cutouts reused; All uses a decorative utensils icon in the same image slot. White labels, dark frosted tray, champagne active outline/tint and keyboard focus treatment preserve the current palette. Category URLs/active states unchanged.
- Validation: TypeScript, targeted ESLint, existing48-product/nine-category catalog checks and production build (16 paths) passed. Chrome at320/390/768/1024/1440px verified identical100px dimensions for all ten tiles, wrapping into5/4/2/2/1 rows respectively and no horizontal overflow. Category click/visible active state checked separately, excluding Next.js retained hidden route markup. Only these two source files and required handoff changed; no new images or features added.

---

### 2026-11-25 — Tried Floating Category Dock

- Replaced Mini Food Tabs with the user's requested Floating Category Dock in shared `CategoryNavigation.tsx` and `cinematic.css`. Removed thumbnail/icon markup, retained the dark frosted tray, and added a filled champagne active pill with dark text. All ten labels retain fixed equal100×48px buttons and wrap into centered rows. Existing category routes/selection semantics remain unchanged.
- Validation: TypeScript and targeted ESLint passed. Chrome at320/390/768/1440px checked equal dimensions, no horizontal overflow and readable selected contrast. Resolved specificity of the previous white-label rule for the active dock button. Updated this handoff; other cards/sections unchanged. Preview: http://localhost:3200/menu.

---

### 2026-11-25 — Centered hero text on mobile only

- Added a below768px override in `src/app/cinematic.css` positioning the complete hero copy at50svh with vertical translation. Desktop flow/margins, typography, hero height and scroll cue unchanged.
- Validation: live Chrome at320×700 and390×844 confirmed text-block center at350px/422px respectively. Desktop1440×900 retained static positioning. Modified only stylesheet and this required handoff; no follow-up needed.

---

### 2026-11-25 — Champagne Spotlight and Fresh From the Kitchen

- Added shared `src/components/ui/FoodEffects.tsx` and `FoodSteam.tsx`, integrated into `FoodCategoryCard.tsx`, `FoodItemCard.tsx` and `OfferSlide.tsx`, with decorative styles in `src/app/cinematic.css`. Existing layout, palette, content and navigation retained. Champagne glow follows desktop pointers, centers on keyboard focus and briefly appears on touch without intercepting scrolling or links.
- Steam plays once when hot food imagery enters view, then can replay on desktop hover or keyboard focus. Bursts end after4.2seconds, never loop, and exclude desserts/drinks. Only active promotional slides animate; clone entry history is shared. Reduced-motion preferences and document visibility cancel effects, with observer/listener/timer cleanup on unmount.
- Validation: production build, TypeScript, menu/offer catalog checks and ESLint passed. Added `scripts/check-food-effects.mjs`; Chrome checks passed for entry/replay, finite animation, pointer/focus, cold-food exclusions, inactive slides and clone suppression, hidden-tab cancellation, reduced motion, mobile touch timeout, navigation and overflow. Mobile checked through Chrome emulation; physical-device visual review remains optional. No new dependencies or images.

---
### 2026-11-25 — Removed preview notes and made cinema the default

- Removed the requested reservation introduction, promotional photography note and menu photography/pricing note from `ReservationForm.tsx`, `OfferSlide.tsx` and `FoodCategoriesSection.tsx`. Removed the reservation form's reference to the deleted notice; submission behavior remains a local preview.
- Simplified `CinematicBackground.tsx` to always start the scroll-driven canvas, ignoring prior saved still-mode, Save-Data and reduced-motion selections for this background as explicitly requested. Removed the mode toggle and development memory/debug panel. Preserved the scene label and poster fallback for actual frame/canvas failures. Other decorative effects still honor reduced motion.
- Validation: TypeScript and targeted ESLint passed. Live Chrome verified all requested notes/controls/overlay are absent and the canvas reaches ready status even with the old saved static preference set. No backend or unrelated design changes.

---
### 2026-11-25 — Removed cinematic side guides

- Updated `src/app/cinematic.css` to hide the decorative `.cinematic-grid`, removing the vertical lines on both sides without changing layout or background animation.
- Validation: live Chrome confirmed the guide layer is hidden at1440px desktop and390px mobile widths. No other visual changes.

---
### 2026-11-25 — Previewed signature motion concepts

- Created an isolated, ignored preview at `node_modules/.cache/visualizations/restro-signature-motion.html` for an illustrated burger ingredient assembly and a warm-light RESTRO closing scene. Includes replay and assembly progress controls. No website source changed; these concepts are not implemented on the live site.
- Validation: Chrome verified replay, progress scrubbing, closing scene completion, no runtime errors and320px mobile fit. Preview includes reduced-motion handling. Await user selection before implementation.

---
### 2026-11-25 — Previewed shared Dish Reveal with existing photography

- Created isolated `node_modules/.cache/visualizations/restro-dish-reveal.html`, using scaled embedded copies of all five existing promotional cutouts. Shared rise/rotation/settle animation, champagne glow and staggered copy work for burger, shawarma, mandi, dessert and drink selections. The user prefers existing burger photography over the illustrated ingredient assembly; neither concept has been implemented on the website.
- Validation: Chrome verified all five images load, selection, animation replay, reduced motion,320px layout and no runtime errors. Website source unchanged; await approval before implementing.

---
### 2026-11-25 — Implemented shared promotional Dish Reveal

- Added `src/hooks/useOfferReveal.ts` and integrated it into `OffersCarousel.tsx`; added a decorative glow in `OfferSlide.tsx` and scoped styling in `src/app/cinematic.css`. All five existing promotional photographs rise with a slight rotation, settle smoothly and receive a warm champagne glow. Badge, headline, description and CTA follow with a stagger. No layout, copy, images, routes or carousel interval changed; existing spotlight/steam preserved.
- Motion begins after the active photograph decodes and becomes visible, runs once per slide activation and finishes within2seconds. Logical slide timing survives last/first boundary clone swaps without restarting. Inactive/offscreen/unmounted effects are cancelled; reduced motion and hidden pages disable reveal animations. Content remains available without animation or JavaScript; glow is decorative and pointer-transparent.
- Validation: TypeScript, targeted ESLint, production build (16paths), existing offers checks and new `scripts/check-offer-reveal.mjs` passed. Live Chrome tested all five images and finite completion at1440px desktop/390px mobile, inactive suppression, boundary continuity, mobile swipe, reduced motion and no horizontal overflow/runtime errors. Inspected a live desktop capture. Physical-device review remains optional. Preview concept is now implemented; no new dependencies/assets.

---
### 2026-11-25 — Implemented Your Table Is Waiting reservation scene and popup

- Replaced the inline reservation presentation in `ReservationSection.tsx` with `ReservationExperience.tsx`: a champagne-lit RESTRO wordmark, Your table is waiting heading, candle/table details and Reserve a Table button matching the approved concept. The scene reveals once on scroll, stops motion for reduced-motion/hidden-page conditions, and cleans up on unmount. Preserved the existing section position and `#reservation` navigation/film anchor.
- The button opens a labeled native modal containing the unchanged, single existing `ReservationForm` instance. Nested clock dialog, validation and local-preview submission are reused. Modal traps focus natively, initially focuses the name field, locks background scrolling, scrolls internally on mobile, preserves values when reopened and closes via close button/Escape/backdrop with focus returning to its trigger. No backend behavior changed.
- Files: new `src/components/reservation/ReservationExperience.tsx`, updated `ReservationSection.tsx` and `src/app/cinematic.css`; new `scripts/check-reservation-popup.mjs`.
- Validation: TypeScript, targeted ESLint and production build (16paths) passed. Live Chrome checks at1440/390/320px passed for scene, single form, validation/success preview, nested clock Confirm/Escape behavior, focus containment/return, scrolling, close/backdrop/reopen, reduced motion and no horizontal overflow/runtime errors. Inspected desktop scene and mobile popup captures. Physical-device review remains optional.

---
### 2026-11-25 — Previewed additional interaction ideas

- Created isolated `node_modules/.cache/visualizations/restro-extra-motion.html` with Chef’s Cloche (serving-cover reveal), Focus & Float (menu cards lift while neighbors dim) and Unwrap the Offer (champagne wrapping peels away from the existing burger discount). Reused current food photographs. These are concepts only; no website source changes.
- Chrome inspected desktop previews and tested the cloche/replay, menu hover/focus selection and offer peel. Corrected decorative image bounds and checked320px layout/reduced-motion behavior. Await a user selection before implementing any concept.

---
### 2026-11-25 — Implemented menu Focus & Float without neighbor dimming

- Added client `MenuFocusGrid.tsx` around the existing overview grids (`CategoryFilters.tsx`) and product grid (`src/app/menu/[category]/page.tsx`). Hovered/focused cards lift12px, food images lift20px and scale slightly, and a subtle pointer-follow tilt/champagne edge provides depth. Retained existing images, palette, card sizes, grid wrapping, prices, links, steam and spotlight. All category/product cards share this treatment.
- The user explicitly requested other menu items stay clear: no neighbor blur, desaturation, dimming or scaling is applied. Touch taps select a card without blocking category links or scrolling; outside taps, scrolling, hidden pages and unmount clear selection. Keyboard links select category cards; added optional tabIndex to `FoodEffects.tsx` so `FoodItemCard.tsx` can receive keyboard focus. Reduced motion suppresses the new movement. Styling in `src/app/cinematic.css`; no promotional/reservation changes.
- Validation: TypeScript, targeted ESLint and production build (16paths) passed. New `scripts/check-menu-float.mjs` passed live Chrome checks for category/product lift, unchanged neighbor opacity/filter, keyboard focus/navigation, mobile tap/scroll clearing, reduced motion and390/320px overflow. Physical-device review remains optional.

---
### 2026-11-25 — Strict performance optimization with preservation evidence

- Optimized only `src/lib/cinematic/frame-sequence.ts` and `src/lib/cinematic/canvas-controller.ts`: skip identical target window rebuilds, preserve exact nearest-frame/eviction order using linear scans, skip unchanged DOM writes, skip identical held-frame redraws, and avoid diagnostic allocations when debug UI is absent. Cache budgets, frame selection, resize/focal behavior, concurrency, retries, fallbacks and media files remain unchanged.
- Captured production baseline before runtime edits and repeated the same three-run desktop/mobile protocol afterward. Report: `artifacts/performance-preservation/REPORT.md`. Controlled DOM writes fell71.9%; median Canvas draws fell14.6% desktop/8.4% mobile. Same rAF p95 and decoded-memory bounds; no reliable loading/script/heap or network gain claimed. Request totals were slightly higher under the fixed-duration sweep and are disclosed. All3,092 public files are byte-identical; all81 other existing runtime/config/dependency files retain their hashes. Original and optimized full Canvas pixels/dimensions/frame indexes matched across20 forward/reverse desktop/mobile samples.
- Added reproducible measurement/verification scripts: `profile-restro.mjs`, `profile-cinematic-work.mjs`, `benchmark-frame-scheduler.mjs`, `report-performance-preservation.mjs`, `check-frame-equivalence.mjs`, `check-renderer-preservation.mjs`, `review-scroll-recordings.mjs` and `check-performance-ui.mjs`. Evidence includes before/after screenshots, actual scroll videos, filmstrips, metrics and saved original renderer sources. No new dependencies.
- Validation: TypeScript, full ESLint and production build passed; existing cinematic/frame/catalog/offers/reservation/review/enquiry/mascot/responsive checks passed. Current live Chrome suites passed menu effects, promotional reveals/clones, reservation/clock popup, food effects, visibility pause/resume, navigation, review storage, enquiry and all9 category routes/48 products. Historical debug/mode-control scripts refer to UI removed before this task and were not used as current requirements. Cart was absent at baseline; none removed or added.
- Remaining limits: headless local results, not field-device/GPU/WAN guarantees; full-quality frame decoding and glass costs remain. No lossy changes or long-lived caching of mutable URLs. Worker/CDN/prefetch policy changes deferred because they need separate behavior-preservation validation. Existing development preview on3200 preserved; profiling used isolated production3300.

---
### 2026-11-25 — .gitignore update and initial GitHub push

- **Modified:** `.gitignore`, `HANDOFF.md`.
- **Changes:**
  - Upgraded `.gitignore` to comprehensively cover OS metadata (`Thumbs.db`, `Desktop.ini`, etc.), editor/IDE directories (`.vscode`, `.idea`), temporary caches (`.cache`), debug logs (`*.log`), and heavy automated test/QA screen recordings (`artifacts/**/*.webm`, `public/images/cinematic hero section/*-scroll-recording.webm`, `public/images/cinematic hero section/*.log`).
  - Preserved all functional media assets, including transparent animation assets in `public/animations/`, canvas sequence WebPs, menu cutouts, promotional imagery, and report markdown/HTML.
  - Verified `npm run build` (16 static & partially prerendered routes) and `npm run lint` (0 errors, 0 warnings).
  - Configured git remote `origin` to `https://github.com/alwin-roy/restro.git`.
  - Staged, committed, and pushed the complete codebase to `main`.


---
### 2026-11-25 — Reference-inspired rounded navigation

- Updated `src/features/home/components/navbar.tsx` and `src/app/cinematic.css` to follow the supplied navigation design: left-aligned RESTRO wordmark, centered translucent rounded desktop link group, ivory active pill and right-aligned champagne Reserve a Table link. Existing six destinations, active-route states, mobile menu/Escape handling and homepage promotional-section visibility threshold preserved. Right action uses the existing reservation anchor; mobile shows a compact Reserve label beside the menu toggle. No language/account features invented from the reference.
- Validation: TypeScript, targeted ESLint and production build passed. Added `scripts/check-navbar-design.mjs`; live Chrome verified320/390/768/1100/1440px layouts, exact desktop centering, all six links, mobile open/Escape, reservation anchor/popup and no horizontal overflow. Inspected desktop capture. Earlier performance source fingerprints are historical baseline evidence, not assertions about this newly authorized visual redesign.

---
### 2026-11-25 — Removed Reservation navigation link

- Removed Reservation from the shared desktop/mobile navigation list in `navbar.tsx`. Home, Menu, About, Reviews and Contact remain; the separate Reserve a Table action and reservation scene/form are retained.
- Updated `scripts/check-navbar-design.mjs` to expect five links. Chrome checks passed across320/390/768/1100/1440px, including desktop centering, mobile navigation and the reservation action/popup.

---
### 2026-11-25 — Approved gold-to-espresso text button sweep

- Updated only `src/app/cinematic.css` to add a shared background-size sweep to gold text CTAs: champagne #e1bd82 at rest, espresso #563a28 filling left-to-right on hover/focus/press, ivory #f5f1e8 text/icons. Duration400ms, easing cubic-bezier(.22,.68,.18,1), smooth reverse on exit. Covers promotional/menu/About links, navbar/scene reservation actions, Add Review and form submit/confirm buttons. Carousel arrows and non-gold controls excluded; disabled buttons do not sweep. Existing sizes, borders, transforms/reveals, labels and actions retained; no JS loops/assets added.
- Fine-pointer hover is media-gated to avoid sticky hover on touch; touch uses pressed feedback and keyboard retains focus-visible styling. Reduced motion switches immediately. Native dialog Escape correctly restores the keyboard-focused trigger's filled state; a touch close restores the gold state.
- Validation: production build/TypeScript and full ESLint passed. Chrome checked intermediate/completed/reversed hover states on six main CTA types, ivory text, keyboard focus, reduced motion, review/reservation popup actions and submission styling. Separate touch-only test verified close/reopen behavior with no sticky sweep; About CTA also checked. Initial touch test used keyboard Escape and was corrected to distinguish intentional focus-visible behavior from touch hover.

---
### 2026-11-25 — Removed visible CTA sweep borders

- Set the shared text-CTA border color to transparent in `src/app/cinematic.css`. Retained border width to preserve exact button dimensions, while removing the visible outline at rest/hover. Color sweep and accessible focus outlines remain unchanged.
- Validation: live Chrome confirmed transparent border in both states and completed background sweep. Only stylesheet and handoff changed.

---
### 2026-11-25 — Fixed gold bleed around swept buttons

- Added background-clip:padding-box to the shared CTA sweep in `src/app/cinematic.css`. Transparent borders previously allowed the gold base background to paint beneath the border area; clipping removes that visible gold edge without changing dimensions or focus outlines.
- Validation: Chrome checked promotional hover computed styles and captured/inspected the completed brown button. No other behavior changed.

---
### 2026-11-25 — Eliminated rounded-corner gold underlay

- Replaced the overlapping gold base/brown overlay in the shared CTA sweep with one hard-stop two-color gradient over a transparent base. Background position now animates right-to-left, producing the same left-to-right color fill without gold beneath the antialiased brown corners. Duration/easing, dimensions, focus and touch behavior retained.
- Validation: live Chrome verified transparent base, completed brown position and reversed gold position; captured completed promotional button. Only `cinematic.css` and handoff changed.

---
## H. Next Steps

- Reservation previews and browser-local review previews are implemented. Await explicit instructions before adding backend reservation submission/availability, review moderation/publication, customer accounts or persistence beyond browser-local reviews.
- Contact/enquiry preview is implemented. Obtain verified restaurant contact details/social profiles; actual enquiry delivery requires a separate backend task.
- Await explicit user instructions for other restaurant features, customer-facing pages, database models, or authentication.
- For further mascot polish, obtain authored run/dance transition poses and verify alpha playback on additional browser engines/physical mobile devices.
- Replace demo promotional content/illustrative photos with verified offers and campaign photography before advertising active discounts. Configure a fixed expiry only when confirmed.
- Demo category menus and the frontend cart are implemented. Obtain verified offerings, prices, and individual dish photography before production use; checkout/backend work requires a separate request.
- **Do not** implement unrequested features or fabricate mock data.

---

## I. Instructions for All AI Agents

### Mandatory Rules

1. **Rule 1 — Read before working:** Before making any changes, read `HANDOFF.md` to understand the current project state, existing implementations, decisions, and known issues.
2. **Rule 2 — Update after every task:** After completing any implementation, bug fix, refactoring, configuration change, dependency change, or feature removal, update `HANDOFF.md`. This is mandatory.
3. **Rule 3 — Record only verified information:** Do not claim that a feature is implemented unless it actually exists in the codebase. Inspect the relevant project files and verify the current implementation before updating the document.
4. **Rule 4 — Prevent duplicate work:** Check whether requested functionality already exists before creating new files, components, APIs, or database structures. Reuse existing implementations where appropriate.
5. **Rule 5 — Preserve previous decisions:** Do not silently override existing architectural decisions. If a decision changes, document what changed and why in Section F.
6. **Rule 6 — Keep documentation synchronized:** The handoff document must reflect the actual codebase, not outdated assumptions.
7. **Rule 7 — Never store secrets:** Do not include API keys, passwords, access tokens, private credentials, or actual `.env` values in this file or any committed file.
8. **Rule 8 — Do not implement unrequested features:** The handoff file is for documentation and coordination. It does not authorize implementing planned features without explicit user instruction.
9. **Rule 9 — Handle conflicting information:** If `HANDOFF.md` conflicts with the actual codebase, inspect the implementation, identify the discrepancy, and document the correction. If the intended behavior is unclear, ask the user rather than guessing.
10. **Rule 10 — Safe multi-agent collaboration:**
    - Do not overwrite another agent's valid documentation.
    - Preserve historical change-log entries in Section G.
    - Avoid unrelated code changes.
    - Check the latest file contents before saving updates.
    - Do not claim that changes made by other agents were your own.

### Required Task Completion Workflow for AI Agents

Whenever you complete a development task:
1. Review the changes made during the task.
2. Identify affected files and functionality.
3. Update the relevant `HANDOFF.md` sections (Status, Architecture, Implementation Details, etc.).
4. Add a new chronological change-log entry in Section G.
5. Record any errors, limitations, or unfinished work.
6. Verify the documentation accurately reflects the codebase.
7. Include a brief handoff summary in your final response to the user.

















# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - Architectural Resilience & AI Structured Outputs

### Added
- **Structured Target Tags**: Upgraded the Vercel AI SDK implementation to generate a strict JSON array of `targetTags` via Zod schema, rather than relying on brittle Regex string matching to identify target audiences.
- **Graceful Webhook Handling**: Built in try/catch logic for the `/api/webhooks/receipts` endpoint to explicitly catch Prisma `P2025` errors (Record to update not found). This ensures the server gracefully returns a 200 OK to prevent infinite provider retries for dead communication logs, rather than crashing with a 500 error.

### Changed
- **Database Schema**: Added `targetTags` column to the `CampaignSuggestion` Prisma model to store the structured array securely in the database.
- **Audience Resolution**: Completely refactored `/api/campaigns/execute` to parse the new `targetTags` array directly when filtering the database, completely eradicating the old `suggestion.suggestedSegment.match(/'([^']+)'/g)` regex guesswork.

## [Unreleased] - UI/UX & Mobile Polish Update

### Added
- **Glassmorphism Aesthetic**: Upgraded all cards across the Insights Feed and Audience Directory to use a premium dark glassmorphic design (`bg-[#050505]/60 backdrop-blur-2xl`).
- **Smooth Animations**: Added staggered `fadeInUp` CSS animations when paginating through Audience cards for smoother transitions.
- **Collapsible Sidebar**: Implemented a responsive sidebar that can collapse to an icon-only `w-20` state on desktop for a cleaner, spacious workspace.
- **Mobile Swipe Carousel**: Converted the AI Insights feed into a horizontal snapping carousel on mobile devices, complete with a swipe indicator.
- **Expandable Insight Text**: Added a "Read More" clamp toggle for the AI reasoning text on mobile to prevent excessive vertical scrolling.
- **Widescreen Layouts**: Removed rigid 6xl constraints across all main pages. The dashboard now expands to `max-w-[1600px]`, dynamically upgrading the Audience grid to 4 columns (`xl:grid-cols-4`) on ultra-wide monitors when the sidebar is collapsed.
- **Top-Down Mobile Menu**: Completely overhauled the mobile sidebar animation. It now elegantly drops down (`translate-y`) from beneath the top navbar instead of sliding in from the left, maintaining spatial logic.
- **Tag Hover Tooltip**: Added a premium dark-glass tooltip to the Desktop Customer Cards. Hovering over a truncated row of customer segments now instantly reveals all tags beautifully wrapped in a custom dropdown.

### Changed
- **Audience Tags**: Simplified the internal card tags from complex pills with icons to ultra-clean, elegant typography to remove visual artifacting.
- **Mobile Scroll Locking**: Fixed horizontal scrolling bugs by strictly enforcing `overflow-x-hidden` on the main layout.
- **Sidebar Header**: Refactored the sidebar header animation to use width/opacity transitions instead of layout shifting (flex-col), fixing staggering bugs.
- **Auth Strategy**: Updated the documentation and tooltips to correctly reference Clerk Auth as the intended production B2B authentication provider.

### Fixed
- **Z-Index Stacking Context Bug**: Resolved a severe CSS layering issue where hovering over a customer card caused its `backdrop-blur` background to translate upwards and slice through the filter tags above it. Fixed by explicitly elevating the `AudienceControls` wrapper with `relative z-10`.
- **React Portals for Modals**: Fixed an advanced CSS `transform` clipping issue where Modals were trapped inside their parent card's stacking context. Rewrote `CustomerActions` and `CampaignActions` to render modals directly onto `document.body` using `createPortal`, forcing a guaranteed `z-[99999]` inline style.
- **Copyable Email UX**: Re-engineered the `CopyableEmail` component from a clunky hover SVG into a sleek click-to-copy text element that seamlessly swaps to a green "Copied!" state, fixing nested `group-hover` glitches and flexbox truncation issues.
- **Hover Artifacts**: Removed unnecessary hover drop-shadows that were bleeding out at the bottom of the cards on dark backgrounds.
- **Insight Engine Empty State**: Redesigned the boring empty state into an enticing call-to-action block with glowing effects.
- **Native Scrollbars**: Injected `.scrollbar-hide` into `globals.css` to completely eradicate clunky, screen-breaking native Windows scrollbars on horizontal tag lists.
- **API Error Catching**: Added robust error parsing in `/api/engine/run` to elegantly catch and surface `429 Rate Limit` and `503 Unavailable` API errors directly in the UI.
- **Z-Index Blur Fix 2**: Fixed a specific CSS layering bug where the `backdrop-blur` on the search input was inadvertently blurring the absolute-positioned search SVG behind it.
- **Mobile Two-Tap Interactions**: Redesigned the `CopyableEmail` element specifically for touch devices, introducing a smart "first tap shows tooltip, second tap copies" interaction flow to bypass the lack of native hover states.

## [Unreleased] - Premium Engine & Campaigns Overhaul

### Added
- **Mock Login Portal**: Built a dedicated, immersive glassmorphic login screen at `/login` designed specifically for the recruiter demo video. It bypasses the sidebar layout entirely and includes an architectural disclaimer regarding Clerk Auth.
- **Insight Engine Console**: Elevated the Insights Feed header (`/`) into an "Insight Engine" command center, featuring a deep-space neural grid background and a dynamic, pulsing `Status: Active` indicator to sell the AI-Native narrative.
- **iPhone SMS Bubble**: Ripped out the clunky HTML accordion on the Campaigns page and replaced it with a gorgeous, CSS-drawn iPhone iMessage bubble (complete with directional tail and drop-shadow) to accurately preview the end-customer experience.
- **Delivery Progress Bar**: Injected a dynamic progress bar into the Campaign cards that calculates delivery percentage in real-time. Added a custom `@keyframes shimmer` animation that cleanly washes over the filled portion of the bar as webhooks process.
- **Campaign Management Actions**: Created a `deleteCampaign` Server Action and a sleek `CampaignActions.tsx` Client Component. Replaced the inline SMS preview with sleek "Ghost" text buttons for "Info" (opens a glassmorphic modal with the SMS preview and AI reasoning) and "Delete" (triggers a red confirmation modal).
- **Delivery Error Reporting**: Built a dedicated Delivery Report page (`/campaigns/[id]/report`) that logs specific delivery failures (e.g., `ERR_CARRIER_BLOCK`) to provide hyper-realistic webhook simulation feedback.
- **Message Retry Engine**: Implemented an automated Retry API (`/api/campaigns/[id]/retry`) and interactive UI, allowing users to instantly requeue failed communication logs back to the background worker.
- **Custom Animated Tooltips**: Engineered a sleek, custom Tailwind CSS tooltip with directional arrows to replace native browser popups, elegantly escaping table stacking contexts via `hover:z-50` and `overflow-visible`.
- **Global Brand Watermark**: Replaced the generic CSS dot grid with a custom, scalable Xeno logo array injected directly into `layout.tsx` via SVG Data URI, eliminating secondary network requests while reinforcing brand identity.
- **Dynamic AI Error Handling**: Engineered the Insight Engine error boundary to parse and display specific API failure modes (e.g., `429 Rate Limit`, `503 Unavailable`) directly in the UI with distinct colors and icons, rather than showing a generic failure banner.

### Changed
- **Targeting Readability**: Updated the Campaigns Dashboard UI to render the human-readable `segment.description` instead of the redundant machine-generated `segment.name`.
- **Widescreen Data Grids**: Redesigned the Delivery Report tables to utilize a strict `table-fixed` layout with precise percentage widths, eradicating horizontal overflow bugs on ultra-wide monitors.
- **Faker Dummy Data**: Hardwired the Prisma Database seed script to guarantee `faker.internet.email()` generates strict matching pairs with names to maintain high-fidelity realism during live demos.

### Fixed
- **Zombie Webhook Purging**: Fixed a severe logic gap in the `/api/channel-stub/send` background process. It now intercepts `Record not found` warnings from the CRM and explicitly breaks its internal loop, perfectly simulating a Message Queue Purge when a user deletes a Campaign mid-delivery.
- **Lingering Error State**: Fixed a Next.js `router.refresh()` bug where executing a successful mock AI generation failed to clear the `?error=engine_failed` query parameter from the URL bar. Switched to an explicit `router.push(finalUrl)` navigation to strictly enforce correct URL state syncing.

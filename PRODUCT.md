# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two real audiences, not personas:

- **Members and admins** (day-to-day product): logged-in users of the dashboard at `/dashboard` and beyond. Members track readings and meets, see notifications, manage billing. Admins additionally manage the book/author/publisher catalog, plans, team/timeline/quotes content, contact messages, and view analytics. Financial-role users confirm payments. Job: run and participate in an actual, ongoing reading club — not a demo of one.
- **Prospective members / public visitors**: anyone landing on `/`, logged in or not. Job: understand what the club is, see it's a real, active community (photos, quotes, timeline, real social links), and either join (`Área de Membros` / sign up) or reach out via the contact form.

This is Clube Sonhos Literários, a real reading club running since 2018 (Instagram, Spotify playlist, YouTube channel are real, live accounts — not placeholders). The app is built for actual operation, not solely as a portfolio/CS50 exercise, though it originated as one.

## Product Purpose

Sonhos Literários gives an existing in-person reading club the operational backbone it didn't have before: organized reading/meeting tracking, member billing (manual PIX/cash + automatic Mercado Pago), notifications, and a public-facing presence that reflects the real club (not a generic template). Success = the club runs its actual membership, meetings, and payments through this system, and visitors can discover and join a real, active community.

## Positioning

The differentiator is the ritual, not the software: regular in-person meetings create real social bonds between members — this isn't a chat group discussing books asynchronously. The product's job is to formalize and support that ritual (reading assignments, meeting attendance, a history/timeline of the club's real gatherings, member photos) rather than to replace it with a purely digital experience. A neighboring generic "book club app" template could not truthfully claim this specific club's history, members, or community.

## Operating Context

- Members read assigned books together and attend scheduled in-person meets; `Meet`/`MeetUser`/`MeetPhoto` track attendance and capture real photos from past meetings.
- Admins run the club's operations through the dashboard: catalog upkeep (ISBN lookup for new books), plan/subscription management, manual payment confirmation for PIX/cash, reviewing contact form submissions, curating the public blog and landing-page content (quotes, team members, timeline).
- Billing runs on a subscription model with two confirmation paths: manual (admin/financial marks PIX or cash as confirmed) and automatic (Mercado Pago Checkout Pro webhook).
- Daily automation (in-process APScheduler) renews subscriptions and sends meet reminders — a real operational cadence, not a one-off cron demo.
- All user-facing UI copy is pt-BR; the club's actual voice and content (real quotes from members, real team photos, real meeting history) populate the landing page, not filler.

## Capabilities and Constraints

- Django REST Framework backend + React/TypeScript frontend (Vite), JWT auth, role-based access (admin / financial / member) enforced both in API permissions and frontend route/nav gating.
- Public surfaces (landing page, blog, contact form, public stats) are deliberately open regardless of auth state; the authenticated app is fully separate at `/dashboard`.
- Mercado Pago integration is unit-tested only — no live test credentials exist yet, so it has never been exercised against the real Mercado Pago API.
- Email delivery (Mailgun SMTP) has no credentials configured yet; falls back to console backend.
- Media uploads (covers, meet photos, receipts, team/timeline photos) are served by Django only in DEBUG — production media serving is an open constraint.
- In-process scheduler is single-process only; a multi-worker production deployment needs an external scheduler (cron/Celery beat) instead.

## Brand Commitments

Everything already captured in code is binding as-is (not to be reinvented during design work):

- Name: "Clube Sonhos Literários" ("Desde 2018").
- Real social accounts: Instagram `@clubedolivrosonhosliterarios`, a public Spotify playlist, a YouTube channel, contact email `clubedolivrosonhosliterarios@gmail.com`.
- pt-BR voice throughout user-facing UI; all code/comments in English ([[lang_convention_pt_br_ui_english_code]]).
- Existing brand color ramps (`brand-*`, `error-*`) and a landing-only warm-neutral `stone-*` ramp, both defined in `frontend/src/index.css`'s `@theme` block.
- Existing landing-page editorial motion system (GSAP/ScrollTrigger + Lenis, `DistortImage` hover shader, reduced-motion fallback) — established identity, not to be casually replaced.
- No additional binding constraints beyond what's already in code/CLAUDE.md.

## Evidence on Hand

- Real landing-page photography and copy carried over from the club's old static site (kept at repo-root `landingpage/`, gitignored, reference-only).
- Real `Quote` records (member pull-quotes) power the "Vozes do Clube" carousel.
- Real `TeamMember` and `TimelineEntry` records (seeded from actual club photos/history via data migration) power the "Membros" and "História" sections.
- `PublicClubStatsView` surfaces real aggregate stats (reading hours are estimated from pages read at a fixed pace — not directly tracked, state this if ever displayed as precise).
- No fabricated testimonials, customer logos, pricing comparisons, or benchmarks exist and none should be invented — the club's own real content is the only evidence base.

## Product Principles

1. The club is real and already has a voice, history, and members — design decisions preserve and surface that authenticity rather than genericizing it into "a book club app."
2. The ritual (in-person meetings, community bonds) is the product's reason to exist; digital tooling supports that ritual, it doesn't replace it with pure online interaction.
3. Members/admins (Operate mode) and public visitors (Persuade mode) are different jobs on different surfaces — don't blur dashboard utility needs with landing-page persuasion needs.
4. Never invent evidence (testimonials, stats, logos) — use real club content or state the absence.
5. pt-BR for people, English for code — keep the split exact ([[lang_convention_pt_br_ui_english_code]]).

## Accessibility & Inclusion

No product-specific requirement established beyond standard web accessibility (the landing page already implements `prefers-reduced-motion` fallbacks for its motion system).

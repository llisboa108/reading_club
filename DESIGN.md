# DESIGN.md

Durable visual-system decisions for Sonhos Literários. Scope: the authenticated app shell and every page under `/dashboard` and beyond (Operate mode). The public landing page (`pages/Landing/**`) is a separate, already-documented visual world (see `CLAUDE.md`'s landing-page section) and is not covered here.

## Where this system comes from

The brand identity guide (`identidade/GUIDE_Sonhos_Literários (1).pdf`) fixes the palette and typefaces below exactly — they are not invented here, only applied consistently for the first time across the app's chrome. Before this pass, the app used these same tokens but with the generic TailAdmin template's card/table/auth-layout conventions (`GridShape` dot-grid, ad hoc `rounded-2xl border ...` recipes repeated per file). This pass replaces that generic chrome with a small set of shared components and a clear rule for which typeface does which job.

## Palette

Anchored on the guide's exact swatches — do not re-derive:

- `brand-*` — anchored on `#261B62` (`brand-600`), the guide's logo color.
- `error-*` — anchored on `#D9183B` (`error-500`), the guide's crimson accent.
- `gray-*` — cool neutral for all app chrome (cards, borders, table zebra). Distinct from `stone-*`, which is landing-page-only and must not leak into Operate surfaces.

## Typography — three fonts, three jobs

- **`font-heading` (Playfair Display)** — page titles, section titles, modal titles, card/list-item titles that name a "thing" (a book title, a plan name). Anything that reads as a headline.
- **`font-body` (Libre Baskerville)** — long-form editorial prose only: blog post body copy, pull-quotes. Reserved deliberately narrow; it is the default on `<body>` for historical reasons but every interactive/data surface overrides it with `font-ui`.
- **`font-ui` (Inter)** — the interface workhorse: nav labels, table headers/cells, form labels/inputs, buttons, badges, breadcrumbs, dropdown menus, toasts. Introduced by this pass specifically because serif body text on dense tables and forms fights legibility and "profissional e agradável ao uso." Apply it explicitly on new UI; don't rely on inheritance.

Rule of thumb: if it's a title, `font-heading`. If it's a paragraph a member reads for pleasure (blog, quotes), `font-body`. Everything else — the actual controls and data — `font-ui`.

## Shared components (`frontend/src/components/`)

Introduced to stop each page hand-rolling the same Tailwind recipe:

- `ui/card/Card.tsx` — the `rounded-2xl border bg-white shadow-theme-xs` card shell. Props: `padding` (`none|sm|md|lg`), `hoverable`, `as`, plus any extra props (spread onto the rendered tag) so `as={Link} to="..."` works.
- `ui/card/StatCard.tsx` — a `Card` with an accent icon tile + label + heading-font value, for dashboard/analytics metrics. Optional `to` prop renders it as a `<Link>` instead of a plain `<div>` — used on `Dashboard/Home.tsx`'s cards to navigate to the relevant page (Leituras, Confirmações, Membros) on click, keeping native keyboard/focus semantics instead of a `div`+`onClick`.
- `common/PageHeader.tsx` — title (`font-heading`) + optional description + optional right-aligned actions slot. Sits below `PageBreadCrumb`, replaces ad hoc `<h1>` blocks.
- `common/EmptyState.tsx` — monogram watermark (the logo-icon crown/star mark, at low opacity) + heading + description + optional action, for empty lists. The recurring brand motif lives here rather than repeating a dot-grid.
- `ui/table/Table.tsx` (+ `TableHeader`, `TableBody`, `TableRow`, `Th`, `Td`) — thin styled wrappers over native `<table>` elements. Each page keeps its own column/data logic and just swaps tag names.

`Button`, `Modal`, `Dropdown`/`DropdownItem`, `Badge`, `PageMeta`, `PageBreadCrumb`, `Label`, `InputField` are pre-existing and now carry `font-ui` themselves, so most forms/nav/buttons inherit the right typeface for free without every page needing to add the class.

## Authentication pages

`AuthPageLayout.tsx`'s decorative panel replaced the generic `GridShape` dot-grid (now deleted, it had no other callers) with: the guide's own hero photography (`public/images/landing/hero-bg.jpg`, the same dreamy portrait as the guide's cover), a `brand-900/700` duotone overlay, the logo mark, and supporting quote text. That quote is no longer a single hardcoded line — on mount it fetches `GET /club/quotes/` (the same public `Quote` model behind the landing page's "Vozes do Clube" carousel) and shows one at random, so every page load can surface a different real quote already curated by an admin. Real book quotes were deliberately **not** seeded for this feature: verbatim-recall of a quote and attributing it to a real author is exactly the misattribution risk the `Quote.attribution` field's own help_text warns against, so the pool stays whatever's already been entered through `QuotesPage.tsx`. If the fetch fails or returns empty, the original Monteiro Lobato line still renders as a static fallback so the panel is never blank. `SignIn`/`SignUp`/`ForgotPassword`/`ResetPassword` forms use `font-heading` titles and `font-ui` everywhere else.

## Sidebar

`AppSidebar.tsx` groups its nav items instead of one flat list: **Painel** (ungrouped) · **Clube de Leitura** · **Minha Conta** · **Financeiro** · **Site Público** · **Administração**. Each group is `{ label, items }`; a group with zero visible items (based on the existing `admin`/`financial`/`adminOrFinancial` role filtering) renders no header. Submenu state (`openSubmenu`) is keyed by item name (string), not array index, since items now live inside groups rather than one flat array.

## What's intentionally not covered

- Landing page and its motion/imagery system (GSAP, Lenis, `DistortImage`, `stone-*`) — separate, already-documented world.
- No new color tokens or radius/shadow scale were introduced — `shadow-theme-*`, `rounded-2xl`, and the existing spacing scale were judged sufficient once applied consistently through `Card`/`Table`.

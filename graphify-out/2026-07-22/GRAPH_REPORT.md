# Graph Report - final  (2026-07-22)

## Corpus Check
- 277 files · ~413,593 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1632 nodes · 4798 edges · 126 communities (77 shown, 49 thin omitted)
- Extraction: 64% EXTRACTED · 36% INFERRED · 0% AMBIGUOUS · INFERRED: 1722 edges (avg confidence: 0.52)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f8f70b25`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- DRF Permission Classes & Admin Registration
- User Auth Models & Admin
- TailAdmin Dashboard Widgets
- Generated API: Auth/Invite/Password Models
- Billing Permissions & Admin
- Ecommerce Dashboard Demo Widgets
- Frontend NPM Dependencies
- Generated API: CancelablePromise Core
- Generated API: Payment/Plan Models
- Generated API: Author/Blog Models
- Reading Detail Page
- Generated API: Core Error/Request Types
- App Routing & Chart Demo Pages
- UI Component Kit (Forms/Cards)
- Readings List Page
- TS App Config
- Auth Forms & Toast System
- TS Node Config
- Billing/Payment API Endpoints & Schemas
- Auth Pages & Form Inputs
- Books Page
- UI Button/Modal/UserAddressCard
- Club Domain OpenAPI Schemas
- Hand-Written API Client & Password Change UI
- Generated API: Meet Models
- JWT Auth Endpoints & Schemas
- Generated API: Reading Models
- ESLint & Dev Dependencies
- Project Metadata & Tech Stack
- User Dropdown, Profile & Auth Context
- Blog/Book Schemas & Pillow
- Auth Page Layout
- Aspect Ratio Demo Components
- Frontend UI Dependencies
- OpenAPI Docs & API Config
- App Bootstrap (main.tsx/App/AuthProvider)
- Responsive Image Grid Components
- Dual API Client Architecture (Rationale)
- NPM Scripts
- @fullcalendar/daygrid
- package.json Metadata
- @fullcalendar/interaction
- accounts App Config
- billing App Config
- Reading Status Enum
- React Router Integration
- Phone Input Component
- api App Config
- club App Config
- manage.py Entrypoint
- Notification Type Enum
- Form Component
- Radio Button Component
- Aspect Ratio Video Component
- TS Root Config
- Migration: accounts.Profile
- Migration: accounts.InviteCode
- Migration: accounts.is_financial
- Migration: accounts.social profiles
- Migration: billing initial
- Migration: billing plan duration
- Migration: billing plan default
- Migration: club initial
- Migration: club MeetPhoto/Notification
- Migration: club BlogCategory/BlogPost
- Migration: club options
- Migration: club book cover
- ASGI Config
- WSGI Config
- Dependency: eslint
- Dependency: eslint-plugin-react-hooks
- Dependency: openapi-typescript
- Dependency: postcss
- swiper
- typescript-eslint
- vite-plugin-svgr
- ChangePasswordView
- 0008_seed_initial_quotes.py
- SVG Module Type Declaration
- api/tests.py (empty)
- api/v1/urls.py
- InviteCode
- accounts/migrations/0001_initial.py
- Meet.ts
- Test Coverage Note (Rationale)
- ApexCharts Note (README)
- AnalyticsPage.tsx
- MercadoPagoNotConfigured
- ToastContext.tsx
- RegisterViewTests
- PaymentConfirmationTests
- UserManager
- IsAdmin
- ._clear_other_defaults
- lenis
- react
- react-dnd
- react-dropzone
- react-helmet-async
- @react-jvectormap/world
- react-router
- swiper
- three

## God Nodes (most connected - your core abstractions)
1. `CancelablePromise` - 117 edges
2. `Meet` - 71 edges
3. `Notification` - 70 edges
4. `Quote` - 70 edges
5. `ContactMessage` - 70 edges
6. `TeamMember` - 70 edges
7. `TimelineEntry` - 70 edges
8. `Author` - 69 edges
9. `Publisher` - 69 edges
10. `Book` - 69 edges

## Surprising Connections (you probably didn't know these)
- `Reading Club Management App (Django+React)` --conceptually_related_to--> `React 19`  [INFERRED]
  CLAUDE.md → frontend/README.md
- `Reading Club Management App (Django+React)` --conceptually_related_to--> `Tailwind CSS v4`  [INFERRED]
  CLAUDE.md → frontend/README.md
- `POST /api/v1/auth/login/ (auth_login_create)` --references--> `accounts Django app`  [INFERRED]
  backend/schema.yaml → CLAUDE.md
- `POST /api/v1/auth/refresh/ (auth_refresh_create)` --references--> `accounts Django app`  [INFERRED]
  backend/schema.yaml → CLAUDE.md
- `Subscription schema` --shares_data_with--> `Subscription model`  [INFERRED]
  backend/schema.yaml → CLAUDE.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Apps with empty/no real test coverage yet** — claude_accounts_app, claude_club_app, claude_billing_app, claude_api_app, claude_empty_tests [INFERRED 0.85]
- **JWT authentication flow (login/refresh) across simplejwt, schema, and accounts app** — backend_requirements_djangorestframework_simplejwt, backend_schema_tokenobtainpair, backend_schema_tokenrefresh, backend_schema_auth_login, backend_schema_auth_refresh, claude_accounts_app [INFERRED 0.85]
- **Billing signal-driven subscription lifecycle (billing/signals.py)** — claude_payment_model, claude_payment_signal_mechanism, claude_subscription_model, claude_notification_model, claude_auto_subscription_signal, claude_plan_model [INFERRED 0.85]

## Communities (126 total, 49 thin omitted)

### Community 0 - "DRF Permission Classes & Admin Registration"
Cohesion: 0.09
Nodes (105): IsAdminOrReadOnly, IsMemberWithActiveSubscription, IsNotificationOwner, ContactMessageRateThrottle, Limits public contact-form submissions per IP address to slow down spam., AuthorAdmin, BlogCategoryAdmin, BlogPostAdmin (+97 more)

### Community 1 - "User Auth Models & Admin"
Cohesion: 0.15
Nodes (32): AnonRateThrottle, ChangePasswordSerializer, InviteCodeSerializer, MemberListSerializer, MeSerializer, Meta, PasswordResetConfirmSerializer, PasswordResetRequestSerializer (+24 more)

### Community 2 - "TailAdmin Dashboard Widgets"
Cohesion: 0.07
Nodes (22): ThemeToggleButton(), HeaderProps, formatDateTime(), Notification, NOTIFICATION_ROUTES, NotificationDropdown(), UserDropdown(), Dropdown() (+14 more)

### Community 3 - "Generated API: Auth/Invite/Password Models"
Cohesion: 0.06
Nodes (21): ChangePassword, ChangePasswordRequest, InviteCode, InviteCodeRequest, Me, MemberList, PasswordResetConfirmRequest, PasswordResetRequestRequest (+13 more)

### Community 4 - "Billing Permissions & Admin"
Cohesion: 0.20
Nodes (19): PaymentStatus, Plan, Meta, PaymentAdminSerializer, PaymentConfirmSerializer, PaymentCreateSerializer, PaymentSerializer, PlanSerializer (+11 more)

### Community 5 - "Ecommerce Dashboard Demo Widgets"
Cohesion: 0.50
Nodes (3): handle_payment_confirmation(), store_previous_payment_status(), Payment

### Community 6 - "Frontend NPM Dependencies"
Cohesion: 0.13
Nodes (15): flatpickr, dependencies, flatpickr, @fullcalendar/timegrid, react-apexcharts, react-dnd-html5-backend, react-dom, @react-jvectormap/core (+7 more)

### Community 7 - "Generated API: CancelablePromise Core"
Cohesion: 0.05
Nodes (11): CancelablePromise, Author, BlogPostWrite, BookWrite, ContactMessage, Notification, Publisher, QuoteWrite (+3 more)

### Community 8 - "Generated API: Payment/Plan Models"
Cohesion: 0.10
Nodes (17): MethodEnum, PatchedPaymentRequest, PatchedPlanWriteRequest, Payment, PaymentAdmin, PaymentConfirmRequest, PaymentCreate, PaymentCreateRequest (+9 more)

### Community 9 - "Generated API: Author/Blog Models"
Cohesion: 0.04
Nodes (33): AuthorRequest, BlogCategory, BlogPostDetail, BlogPostList, BlogPostWriteRequest, Book, BookWriteRequest, ClubStats (+25 more)

### Community 10 - "Reading Detail Page"
Cohesion: 0.06
Nodes (22): Author, authorFullName(), Book, EMPTY_MEET_FORM, EMPTY_READING_FORM, formatDate(), formatDateTime(), Meet (+14 more)

### Community 11 - "Generated API: Core Error/Request Types"
Cohesion: 0.11
Nodes (28): ApiError, ApiRequestOptions, ApiResult, CancelError, OnCancel, Headers, OpenAPI, OpenAPIConfig (+20 more)

### Community 12 - "App Routing & Chart Demo Pages"
Cohesion: 0.13
Nodes (14): BreadcrumbProps, PageBreadcrumb(), BillingPage(), BlogCategory, BlogDetailPage(), BlogPostDetail, formatDate(), BlogCategory (+6 more)

### Community 13 - "UI Component Kit (Forms/Cards)"
Cohesion: 0.14
Nodes (11): ACCENT_CLASSES, formatDate(), formatDateTime(), greeting(), Home(), Meet, MeetParticipant, Payment (+3 more)

### Community 14 - "Readings List Page"
Cohesion: 0.08
Nodes (15): Author, authorFullName(), Book, EMPTY_FORM, formatDate(), Member, Publisher, Reading (+7 more)

### Community 15 - "TS App Config"
Cohesion: 0.08
Nodes (23): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+15 more)

### Community 16 - "Auth Forms & Toast System"
Cohesion: 0.10
Nodes (10): Modal(), ModalProps, EMPTY_FORM, TeamMember, TeamMemberForm, TeamMembersPage(), EMPTY_FORM, TimelineEntriesPage() (+2 more)

### Community 17 - "TS Node Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, isolatedModules, lib, module, moduleDetection, moduleResolution, noEmit (+11 more)

### Community 18 - "Billing/Payment API Endpoints & Schemas"
Cohesion: 0.15
Nodes (19): POST /api/v1/billing/payments/{payment_id}/confirm/ (paymentsConfirm), MethodEnum (PIX/CASH/MP), Payment schema, PaymentCreate schema, PaymentStatusEnum, Plan schema, Subscription schema, SubscriptionStatusEnum (PENDING/ACTIVE/EXPIRED/CANCELED) (+11 more)

### Community 19 - "Auth Pages & Form Inputs"
Cohesion: 0.12
Nodes (23): apiRequest(), ForgotPasswordForm(), ResetPasswordForm(), SignInForm(), SignUpForm(), PasswordChecklist(), Props, CheckboxProps (+15 more)

### Community 20 - "Books Page"
Cohesion: 0.12
Nodes (10): Author, authorFullName(), Book, BookCard(), BookForm, BooksPage(), EMPTY_FORM, getPagesBadge() (+2 more)

### Community 22 - "Club Domain OpenAPI Schemas"
Cohesion: 0.12
Nodes (16): Author schema, BlogCategory schema, Meet schema, MeetTypeEnum (ONLINE/IN_PERSON), MeetUser schema, Notification schema, Publisher schema, ReadingUser schema (+8 more)

### Community 23 - "Hand-Written API Client & Password Change UI"
Cohesion: 0.20
Nodes (8): IsFinancial, AnalyticsView, _fill_month_series(), _months_back(), APIView, First-of-month boundary n months ago, e.g. n=11 -> 12 months inclusive., Turn a sparse {month: value} queryset into a dense 12-month series,     so a mon, Admin/financial-only dashboard: revenue, subscriptions, membership     and readi

### Community 24 - "Generated API: Meet Models"
Cohesion: 0.05
Nodes (27): getAccessToken(), Badge(), BadgeColor, BadgeProps, BadgeSize, BadgeVariant, Author, authorFullName() (+19 more)

### Community 25 - "JWT Auth Endpoints & Schemas"
Cohesion: 0.14
Nodes (14): djangorestframework_simplejwt==5.5.1, PyJWT==2.11.0, POST /api/v1/auth/login/ (auth_login_create), POST /api/v1/auth/refresh/ (auth_refresh_create), ChangePassword schema, InviteCode schema, jwtAuth security scheme, Me schema (+6 more)

### Community 26 - "Generated API: Reading Models"
Cohesion: 0.07
Nodes (9): InviteCode, ChangePasswordTests, InviteCodeViewSetTests, LoginRateThrottleTests, MeAndProfileTests, MemberListViewTests, PasswordResetTests, APITestCase (+1 more)

### Community 27 - "ESLint & Dev Dependencies"
Cohesion: 0.05
Nodes (37): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks (+29 more)

### Community 28 - "Project Metadata & Tech Stack"
Cohesion: 0.18
Nodes (11): Django==6.0.1, django-cors-headers==4.9.0, djangorestframework==3.16.1, Reading Club Management App (Django+React), TailAdmin template scaffolding (unmodified components/pages), Vite dev server proxy /api,/media to :8000, MIT License, Copyright (c) 2023 TailAdmin (+3 more)

### Community 29 - "User Dropdown, Profile & Auth Context"
Cohesion: 0.06
Nodes (36): DistortImage(), DistortImageProps, LandingScrollContext, useLandingScrollContext(), LandingScroll, useLandingScroll(), useScrollReveal(), GsapBundle (+28 more)

### Community 30 - "Blog/Book Schemas & Pillow"
Cohesion: 0.20
Nodes (10): pillow==12.1.0, BlogPostDetail schema, BlogPostList schema, Book schema, MeetPhoto schema, BlogPost model, Book model, Media uploads (profiles/, books/covers/, meetings/, blog/, receipts/) (+2 more)

### Community 31 - "Auth Page Layout"
Cohesion: 0.15
Nodes (11): PaymentAdmin, PlanAdmin, SubscriptionAdmin, Payment, PaymentMethod, Subscription, SubscriptionStatus, MercadoPagoSignatureTests (+3 more)

### Community 32 - "Aspect Ratio Demo Components"
Cohesion: 0.67
Nodes (3): CurrentPlanCard(), formatDate(), STATUS_BADGE

### Community 33 - "Frontend UI Dependencies"
Cohesion: 0.22
Nodes (9): overrides, react-helmet-async, @react-jvectormap/core, @react-jvectormap/world, react, react, react-dom, react (+1 more)

### Community 34 - "OpenAPI Docs & API Config"
Cohesion: 0.25
Nodes (8): drf-spectacular==0.29.0, PyYAML==6.0.3, OpenAPI schema document (backend/schema.yaml), api Django app (cross-cutting), src/api/config.ts (API_HOST/API_PREFIX), API docs served via drf-spectacular (/api/schema/, /api/docs/, /api/redoc/), Shared permission classes (api/permissions.py), reading_club/urls.py -> api/urls.py -> api/v1/urls.py routing chain

### Community 35 - "App Bootstrap (main.tsx/App/AuthProvider)"
Cohesion: 0.16
Nodes (10): Analytics, AnalyticsPage(), formatMoney(), formatMonthLabel(), METHOD_LABELS, MethodBreakdown, MonthPoint, READING_LABELS (+2 more)

### Community 36 - "Responsive Image Grid Components"
Cohesion: 0.14
Nodes (17): App(), GridShape(), AppWrapper(), PageMeta(), ScrollToTop(), ThemeTogglerTwo(), Theme, ThemeContext (+9 more)

### Community 37 - "Dual API Client Architecture (Rationale)"
Cohesion: 0.29
Nodes (7): src/api/client.ts hand-written fetch wrapper, src/api/generated OpenAPI client, utils/apiErrors.ts, toast system (utils/toast.ts), Two parallel API call approaches; know which a file uses before editing, script loading /src/main.tsx, #root mount div

### Community 38 - "NPM Scripts"
Cohesion: 0.18
Nodes (10): name, private, scripts, build, dev, generate-api, lint, preview (+2 more)

### Community 39 - "@fullcalendar/daygrid"
Cohesion: 0.50
Nodes (3): devDependencies, shadcn, shadcn

### Community 40 - "package.json Metadata"
Cohesion: 0.20
Nodes (6): Send a plain-text email, logging (not raising) on failure.      Used by schedule, send_notification_email(), Command, BaseCommand, Command, BaseCommand

### Community 43 - "billing App Config"
Cohesion: 0.29
Nodes (5): BillingConfig, AppConfig, Start the in-process job scheduler (call once, from AppConfig.ready()).      Run, _run_command(), start()

### Community 44 - "Reading Status Enum"
Cohesion: 0.50
Nodes (4): Reading schema, Status8ecEnum (PLANNED/IN_PROGRESS/FINISHED/CANCELED, auto-named), Reading model, ReadingStatus choices

### Community 45 - "React Router Integration"
Cohesion: 0.50
Nodes (4): App.tsx routing via react-router v7, AuthContext (src/context/AuthContext.tsx), ProtectedRoute component, React Router integration

### Community 52 - "Form Component"
Cohesion: 0.18
Nodes (8): Author, AuthorForm, authorFullName(), AuthorsPublishersPage(), EMPTY_AUTHOR_FORM, EMPTY_PUBLISHER_FORM, Publisher, PublisherForm

### Community 53 - "Radio Button Component"
Cohesion: 0.19
Nodes (3): PendingPaymentsQueueTests, PlanManagementTests, APITestCase

### Community 54 - "Aspect Ratio Video Component"
Cohesion: 0.17
Nodes (11): Accessibility & Inclusion, Brand Commitments, Capabilities and Constraints, Evidence on Hand, Operating Context, Platform, Positioning, Product (+3 more)

### Community 71 - "Dependency: eslint-plugin-react-hooks"
Cohesion: 0.25
Nodes (6): EMPTY_FORM, formatDate(), InviteCode, InviteForm, Member, MembersPage()

### Community 74 - "Dependency: postcss"
Cohesion: 0.40
Nodes (4): _copy_image(), Migration, Copies an existing landing-page image into MEDIA_ROOT/<subdir>/ and     returns, seed_team_and_timeline()

### Community 90 - "api/tests.py (empty)"
Cohesion: 0.13
Nodes (6): IsOwner, AnalyticsViewTests, PermissionClassTests, APITestCase, TestCase, _request()

### Community 93 - "InviteCode"
Cohesion: 0.18
Nodes (9): AbstractUser, InviteCodeAdmin, ProfileAdmin, UserAdmin, Migration, Profile, User, UserManager (+1 more)

### Community 99 - "Meet.ts"
Cohesion: 0.18
Nodes (7): Meet, MeetPhoto, MeetTypeEnum, MeetUser, MeetWrite, MeetWriteRequest, PatchedMeetWriteRequest

### Community 109 - "AnalyticsPage.tsx"
Cohesion: 0.12
Nodes (14): ProtectedRoute(), UserMetaCard(), AuthContext, AuthContextType, AuthProvider(), User, useAuth(), formatDate() (+6 more)

### Community 110 - "MercadoPagoNotConfigured"
Cohesion: 0.29
Nodes (9): create_payment_preference(), fetch_mp_payment(), MercadoPagoNotConfigured, Exception, Create a Checkout Pro preference for a pending Payment.      external_reference, Fetch the authoritative payment record from Mercado Pago's API.      We never tr, Validate the x-signature header per Mercado Pago's webhook docs.      Format: "t, _sdk() (+1 more)

### Community 111 - "ToastContext.tsx"
Cohesion: 0.10
Nodes (17): ApiRequestError, ApiRequestOptions, refreshToken(), Toast, ToastContext, ToastContextType, ToastProvider(), ToastVariant (+9 more)

## Ambiguous Edges - Review These
- `ReadingStatus choices` → `Status8ecEnum (PLANNED/IN_PROGRESS/FINISHED/CANCELED, auto-named)`  [AMBIGUOUS]
  backend/schema.yaml · relation: shares_data_with

## Knowledge Gaps
- **316 isolated node(s):** `Migration`, `Migration`, `Migration`, `Migration`, `Migration` (+311 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **49 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `ReadingStatus choices` and `Status8ecEnum (PLANNED/IN_PROGRESS/FINISHED/CANCELED, auto-named)`?**
  _Edge tagged AMBIGUOUS (relation: shares_data_with) - confidence is low._
- **Why does `IsAdmin` connect `Dependency: eslint` to `DRF Permission Classes & Admin Registration`, `User Auth Models & Admin`, `Billing Permissions & Admin`, `Hand-Written API Client & Password Change UI`, `api/tests.py (empty)`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Frontend NPM Dependencies` to `accounts/migrations/0001_initial.py`, `NPM Scripts`, `typescript-eslint`, `vite-plugin-svgr`, `ChangePasswordView`, `RegisterViewTests`, `react-router`, `UserManager`, `IsAdmin`, `lenis`, `react`, `react-dnd`, `react-dropzone`, `react-helmet-async`, `@react-jvectormap/world`, `api/v1/urls.py`, `swiper`, `three`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Why does `useLandingScroll()` connect `User Dropdown, Profile & Auth Context` to `lenis`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Are the 65 inferred relationships involving `Meet` (e.g. with `AuthorAdmin` and `BlogCategoryAdmin`) actually correct?**
  _`Meet` has 65 INFERRED edges - model-reasoned connections that need verification._
- **Are the 63 inferred relationships involving `Notification` (e.g. with `AuthorAdmin` and `BlogCategoryAdmin`) actually correct?**
  _`Notification` has 63 INFERRED edges - model-reasoned connections that need verification._
- **Are the 63 inferred relationships involving `Quote` (e.g. with `AuthorAdmin` and `BlogCategoryAdmin`) actually correct?**
  _`Quote` has 63 INFERRED edges - model-reasoned connections that need verification._
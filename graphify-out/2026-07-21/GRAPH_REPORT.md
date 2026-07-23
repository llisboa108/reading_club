# Graph Report - final  (2026-07-21)

## Corpus Check
- 214 files · ~96,510 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1183 nodes · 3011 edges · 98 communities (61 shown, 37 thin omitted)
- Extraction: 72% EXTRACTED · 28% INFERRED · 0% AMBIGUOUS · INFERRED: 856 edges (avg confidence: 0.53)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7c7007b8`
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
- package.json Metadata
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
- Dependency: globals
- Dependency: openapi-typescript
- Dependency: postcss
- SVG Module Type Declaration
- Test Coverage Note (Rationale)
- ApexCharts Note (README)

## God Nodes (most connected - your core abstractions)
1. `CancelablePromise` - 83 edges
2. `Notification` - 46 edges
3. `Author` - 45 edges
4. `Publisher` - 45 edges
5. `Book` - 45 edges
6. `BlogPost` - 43 edges
7. `Reading` - 42 edges
8. `Meet` - 42 edges
9. `BlogCategory` - 42 edges
10. `ClubService` - 42 edges

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

## Communities (98 total, 37 thin omitted)

### Community 0 - "DRF Permission Classes & Admin Registration"
Cohesion: 0.10
Nodes (73): IsAdminOrReadOnly, IsMemberWithActiveSubscription, IsNotificationOwner, IsOwner, AuthorAdmin, BlogCategoryAdmin, BlogPostAdmin, BookAdmin (+65 more)

### Community 1 - "User Auth Models & Admin"
Cohesion: 0.07
Nodes (41): AbstractUser, InviteCodeAdmin, ProfileAdmin, UserAdmin, Migration, InviteCode, Profile, User (+33 more)

### Community 2 - "TailAdmin Dashboard Widgets"
Cohesion: 0.09
Nodes (21): ThemeToggleButton(), HeaderProps, formatDateTime(), Notification, NOTIFICATION_ROUTES, NotificationDropdown(), Dropdown(), DropdownProps (+13 more)

### Community 3 - "Generated API: Auth/Invite/Password Models"
Cohesion: 0.08
Nodes (20): ChangePassword, ChangePasswordRequest, InviteCode, InviteCodeRequest, Me, MeetPhoto, MeetUser, PasswordValiRequest (+12 more)

### Community 4 - "Billing Permissions & Admin"
Cohesion: 0.08
Nodes (32): IsFinancial, PaymentAdmin, PlanAdmin, SubscriptionAdmin, Payment, PaymentMethod, PaymentStatus, Plan (+24 more)

### Community 5 - "Ecommerce Dashboard Demo Widgets"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 6 - "Frontend NPM Dependencies"
Cohesion: 0.05
Nodes (43): apexcharts, clsx, flatpickr, dependencies, apexcharts, clsx, flatpickr, @fullcalendar/core (+35 more)

### Community 7 - "Generated API: CancelablePromise Core"
Cohesion: 0.09
Nodes (9): CancelablePromise, BlogCategory, BlogPostDetail, BlogPostList, Book, Meet, Notification, Reading (+1 more)

### Community 8 - "Generated API: Payment/Plan Models"
Cohesion: 0.10
Nodes (15): OpenAPI, MethodEnum, PatchedPaymentRequest, PatchedPlanRequest, Payment, PaymentConfirmRequest, PaymentCreate, PaymentCreateRequest (+7 more)

### Community 9 - "Generated API: Author/Blog Models"
Cohesion: 0.09
Nodes (12): Author, AuthorRequest, BlogPostWrite, BlogPostWriteRequest, BookWrite, BookWriteRequest, PatchedAuthorRequest, PatchedBlogPostWriteRequest (+4 more)

### Community 10 - "Reading Detail Page"
Cohesion: 0.06
Nodes (22): Author, authorFullName(), Book, EMPTY_MEET_FORM, EMPTY_READING_FORM, formatDate(), formatDateTime(), Meet (+14 more)

### Community 11 - "Generated API: Core Error/Request Types"
Cohesion: 0.12
Nodes (26): ApiError, ApiRequestOptions, ApiResult, CancelError, OnCancel, Headers, OpenAPIConfig, Resolver (+18 more)

### Community 12 - "App Routing & Chart Demo Pages"
Cohesion: 0.14
Nodes (18): App(), GridShape(), AppWrapper(), PageMeta(), ScrollToTop(), ThemeTogglerTwo(), AuthProvider(), Theme (+10 more)

### Community 13 - "UI Component Kit (Forms/Cards)"
Cohesion: 0.10
Nodes (15): ApiRequestError, UserDropdown(), UserMetaCard(), useAuth(), formatDate(), PaymentConfirmationsPage(), PendingPayment, Home() (+7 more)

### Community 14 - "Readings List Page"
Cohesion: 0.08
Nodes (15): Author, authorFullName(), Book, EMPTY_FORM, formatDate(), Member, Publisher, Reading (+7 more)

### Community 15 - "TS App Config"
Cohesion: 0.08
Nodes (23): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+15 more)

### Community 16 - "Auth Forms & Toast System"
Cohesion: 0.23
Nodes (5): PatchedReadingWriteRequest, ReadingUser, ReadingWrite, ReadingWriteRequest, Status8ecEnum

### Community 17 - "TS Node Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, isolatedModules, lib, module, moduleDetection, moduleResolution, noEmit (+11 more)

### Community 18 - "Billing/Payment API Endpoints & Schemas"
Cohesion: 0.15
Nodes (19): POST /api/v1/billing/payments/{payment_id}/confirm/ (paymentsConfirm), MethodEnum (PIX/CASH/MP), Payment schema, PaymentCreate schema, PaymentStatusEnum, Plan schema, Subscription schema, SubscriptionStatusEnum (PENDING/ACTIVE/EXPIRED/CANCELED) (+11 more)

### Community 19 - "Auth Pages & Form Inputs"
Cohesion: 0.11
Nodes (23): apiRequest(), ApiRequestOptions, refreshToken(), ForgotPasswordForm(), ResetPasswordForm(), SignInForm(), SignUpForm(), PasswordChecklist() (+15 more)

### Community 20 - "Books Page"
Cohesion: 0.12
Nodes (10): Author, authorFullName(), Book, BookCard(), BookForm, BooksPage(), EMPTY_FORM, getPagesBadge() (+2 more)

### Community 21 - "UI Button/Modal/UserAddressCard"
Cohesion: 0.29
Nodes (4): MeetTypeEnum, MeetWrite, MeetWriteRequest, PatchedMeetWriteRequest

### Community 22 - "Club Domain OpenAPI Schemas"
Cohesion: 0.12
Nodes (16): Author schema, BlogCategory schema, Meet schema, MeetTypeEnum (ONLINE/IN_PERSON), MeetUser schema, Notification schema, Publisher schema, ReadingUser schema (+8 more)

### Community 24 - "Generated API: Meet Models"
Cohesion: 0.10
Nodes (16): Badge(), BadgeColor, BadgeProps, BadgeSize, BadgeVariant, Author, authorFullName(), Book (+8 more)

### Community 25 - "JWT Auth Endpoints & Schemas"
Cohesion: 0.14
Nodes (14): djangorestframework_simplejwt==5.5.1, PyJWT==2.11.0, POST /api/v1/auth/login/ (auth_login_create), POST /api/v1/auth/refresh/ (auth_refresh_create), ChangePassword schema, InviteCode schema, jwtAuth security scheme, Me schema (+6 more)

### Community 26 - "Generated API: Reading Models"
Cohesion: 0.10
Nodes (16): Modal(), ModalProps, Author, AuthorForm, authorFullName(), AuthorsPublishersPage(), EMPTY_AUTHOR_FORM, EMPTY_PUBLISHER_FORM (+8 more)

### Community 27 - "ESLint & Dev Dependencies"
Cohesion: 0.15
Nodes (13): @eslint/js, eslint-plugin-react-refresh, devDependencies, @eslint/js, eslint-plugin-react-refresh, openapi-typescript-codegen, @types/react-dom, typescript (+5 more)

### Community 28 - "Project Metadata & Tech Stack"
Cohesion: 0.18
Nodes (11): Django==6.0.1, django-cors-headers==4.9.0, djangorestframework==3.16.1, Reading Club Management App (Django+React), TailAdmin template scaffolding (unmodified components/pages), Vite dev server proxy /api,/media to :8000, MIT License, Copyright (c) 2023 TailAdmin (+3 more)

### Community 29 - "User Dropdown, Profile & Auth Context"
Cohesion: 0.13
Nodes (16): Toast, ToastContext, ToastContextType, ToastProvider(), ToastVariant, useToast(), BillingPage(), CurrentPlanCard() (+8 more)

### Community 30 - "Blog/Book Schemas & Pillow"
Cohesion: 0.20
Nodes (10): pillow==12.1.0, BlogPostDetail schema, BlogPostList schema, Book schema, MeetPhoto schema, BlogPost model, Book model, Media uploads (profiles/, books/covers/, meetings/, blog/, receipts/) (+2 more)

### Community 32 - "Aspect Ratio Demo Components"
Cohesion: 0.17
Nodes (13): BreadcrumbProps, PageBreadcrumb(), UserInfoCard(), useModal(), BlogCategory, BlogDetailPage(), BlogPostDetail, formatDate() (+5 more)

### Community 33 - "Frontend UI Dependencies"
Cohesion: 0.22
Nodes (9): overrides, react-helmet-async, @react-jvectormap/core, @react-jvectormap/world, react, react, react-dom, react (+1 more)

### Community 34 - "OpenAPI Docs & API Config"
Cohesion: 0.25
Nodes (8): drf-spectacular==0.29.0, PyYAML==6.0.3, OpenAPI schema document (backend/schema.yaml), api Django app (cross-cutting), src/api/config.ts (API_HOST/API_PREFIX), API docs served via drf-spectacular (/api/schema/, /api/docs/, /api/redoc/), Shared permission classes (api/permissions.py), reading_club/urls.py -> api/urls.py -> api/v1/urls.py routing chain

### Community 35 - "App Bootstrap (main.tsx/App/AuthProvider)"
Cohesion: 0.11
Nodes (12): getAccessToken(), Author, Book, formatDateTime(), Meet, MeetParticipant, MeetRow(), MeetType (+4 more)

### Community 37 - "Dual API Client Architecture (Rationale)"
Cohesion: 0.29
Nodes (7): src/api/client.ts hand-written fetch wrapper, src/api/generated OpenAPI client, utils/apiErrors.ts, toast system (utils/toast.ts), Two parallel API call approaches; know which a file uses before editing, script loading /src/main.tsx, #root mount div

### Community 38 - "NPM Scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, generate-api, lint, preview

### Community 44 - "Reading Status Enum"
Cohesion: 0.50
Nodes (4): Reading schema, Status8ecEnum (PLANNED/IN_PROGRESS/FINISHED/CANCELED, auto-named), Reading model, ReadingStatus choices

### Community 45 - "React Router Integration"
Cohesion: 0.50
Nodes (4): App.tsx routing via react-router v7, AuthContext (src/context/AuthContext.tsx), ProtectedRoute component, React Router integration

## Ambiguous Edges - Review These
- `ReadingStatus choices` → `Status8ecEnum (PLANNED/IN_PROGRESS/FINISHED/CANCELED, auto-named)`  [AMBIGUOUS]
  backend/schema.yaml · relation: shares_data_with

## Knowledge Gaps
- **260 isolated node(s):** `Migration`, `Migration`, `Migration`, `Migration`, `Migration` (+255 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **37 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `ReadingStatus choices` and `Status8ecEnum (PLANNED/IN_PROGRESS/FINISHED/CANCELED, auto-named)`?**
  _Edge tagged AMBIGUOUS (relation: shares_data_with) - confidence is low._
- **Why does `apiRequest()` connect `Auth Pages & Form Inputs` to `Aspect Ratio Demo Components`, `TailAdmin Dashboard Widgets`, `App Bootstrap (main.tsx/App/AuthProvider)`, `Reading Detail Page`, `Generated API: Core Error/Request Types`, `UI Component Kit (Forms/Cards)`, `Readings List Page`, `Books Page`, `Generated API: Meet Models`, `Generated API: Reading Models`, `User Dropdown, Profile & Auth Context`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Why does `CancelablePromise` connect `Generated API: CancelablePromise Core` to `Generated API: Auth/Invite/Password Models`, `Generated API: Payment/Plan Models`, `Generated API: Author/Blog Models`, `Generated API: Core Error/Request Types`, `Auth Forms & Toast System`, `UI Button/Modal/UserAddressCard`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Why does `IsAdmin` connect `User Auth Models & Admin` to `DRF Permission Classes & Admin Registration`, `Billing Permissions & Admin`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Are the 39 inferred relationships involving `Notification` (e.g. with `AuthorAdmin` and `BlogCategoryAdmin`) actually correct?**
  _`Notification` has 39 INFERRED edges - model-reasoned connections that need verification._
- **Are the 39 inferred relationships involving `Author` (e.g. with `AuthorAdmin` and `BlogCategoryAdmin`) actually correct?**
  _`Author` has 39 INFERRED edges - model-reasoned connections that need verification._
- **Are the 39 inferred relationships involving `Publisher` (e.g. with `AuthorAdmin` and `BlogCategoryAdmin`) actually correct?**
  _`Publisher` has 39 INFERRED edges - model-reasoned connections that need verification._
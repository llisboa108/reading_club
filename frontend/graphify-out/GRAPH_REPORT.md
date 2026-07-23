# Graph Report - frontend  (2026-07-22)

## Corpus Check
- 198 files · ~225,335 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 984 nodes · 2144 edges · 63 communities (49 shown, 14 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f8f70b25`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- LandingPage.tsx
- AuthService.ts
- AppSidebar.tsx
- dependencies
- BillingService.ts
- CancelablePromise
- request.ts
- ReadingDetailPage.tsx
- useAuth
- useToast
- Changelog
- ClubService.ts
- ReadingsPage.tsx
- apiRequest
- generated/index.ts
- compilerOptions
- App.tsx
- MeetsPage.tsx
- compilerOptions
- BooksPage.tsx
- MembersPage.tsx
- BookDetailPage.tsx
- Home.tsx
- devDependencies
- AnalyticsPage.tsx
- Publisher
- AuthorsPublishersPage.tsx
- Author
- MeetTypeEnum.ts
- PlansPage.tsx
- BlogCategory
- ContactMessage
- overrides
- QuoteWrite
- TeamMemberWrite
- TimelineEntryWrite
- TeamMembersPage.tsx
- ToastContext.tsx
- scripts
- Badge.tsx
- package.json
- CurrentPlanCard.tsx
- ComponentCard.tsx
- tsconfig.json
- eslint-plugin-react-hooks
- eslint-plugin-react-refresh
- globals
- openapi-typescript
- openapi-typescript-codegen
- postcss
- @types/react
- @types/react-dom
- typescript-eslint
- vite
- vite-plugin-svgr
- svg.d.ts

## God Nodes (most connected - your core abstractions)
1. `CancelablePromise` - 117 edges
2. `ClubService` - 69 edges
3. `apiRequest()` - 55 edges
4. `useAuth()` - 39 edges
5. `useToast()` - 37 edges
6. `PageMeta()` - 25 edges
7. `prefersReducedMotion()` - 23 edges
8. `AuthService` - 21 edges
9. `loadGsap()` - 21 edges
10. `BillingService` - 19 edges

## Surprising Connections (you probably didn't know these)
- `useLandingScroll()` --references--> `lenis`  [EXTRACTED]
  src/hooks/useLandingScroll.ts → package.json
- `UserDropdown()` --calls--> `useAuth()`  [EXTRACTED]
  src/components/header/UserDropdown.tsx → src/hooks/useAuth.ts
- `apiRequest()` --calls--> `getAccessToken()`  [EXTRACTED]
  src/api/client.ts → src/api/config.ts
- `ForgotPasswordForm()` --calls--> `apiRequest()`  [EXTRACTED]
  src/components/auth/ForgotPasswordForm.tsx → src/api/client.ts
- `ResetPasswordForm()` --calls--> `apiRequest()`  [EXTRACTED]
  src/components/auth/ResetPasswordForm.tsx → src/api/client.ts

## Import Cycles
- None detected.

## Communities (63 total, 14 thin omitted)

### Community 0 - "LandingPage.tsx"
Cohesion: 0.06
Nodes (36): DistortImage(), DistortImageProps, LandingScrollContext, useLandingScrollContext(), LandingScroll, useLandingScroll(), useScrollReveal(), GsapBundle (+28 more)

### Community 1 - "AuthService.ts"
Cohesion: 0.06
Nodes (21): ChangePassword, ChangePasswordRequest, InviteCode, InviteCodeRequest, Me, MemberList, PasswordResetConfirmRequest, PasswordResetRequestRequest (+13 more)

### Community 2 - "AppSidebar.tsx"
Cohesion: 0.06
Nodes (27): ThemeToggleButton(), ThemeTogglerTwo(), HeaderProps, formatDateTime(), Notification, NOTIFICATION_ROUTES, NotificationDropdown(), UserDropdown() (+19 more)

### Community 3 - "dependencies"
Cohesion: 0.04
Nodes (49): apexcharts, clsx, flatpickr, @fullcalendar/core, @fullcalendar/daygrid, @fullcalendar/interaction, @fullcalendar/list, @fullcalendar/react (+41 more)

### Community 4 - "BillingService.ts"
Cohesion: 0.08
Nodes (17): MethodEnum, PatchedPaymentRequest, PatchedPlanWriteRequest, Payment, PaymentAdmin, PaymentConfirmRequest, PaymentCreate, PaymentCreateRequest (+9 more)

### Community 5 - "CancelablePromise"
Cohesion: 0.08
Nodes (9): CancelablePromise, Book, Meet, Notification, Quote, Reading, TeamMember, TimelineEntry (+1 more)

### Community 6 - "request.ts"
Cohesion: 0.11
Nodes (27): ApiError, ApiRequestOptions, ApiResult, CancelError, OnCancel, Headers, OpenAPIConfig, Resolver (+19 more)

### Community 7 - "ReadingDetailPage.tsx"
Cohesion: 0.06
Nodes (22): Author, authorFullName(), Book, EMPTY_MEET_FORM, EMPTY_READING_FORM, formatDate(), formatDateTime(), Meet (+14 more)

### Community 8 - "useAuth"
Cohesion: 0.09
Nodes (19): ProtectedRoute(), Modal(), ModalProps, UserMetaCard(), AuthContext, AuthContextType, User, useAuth() (+11 more)

### Community 9 - "useToast"
Cohesion: 0.14
Nodes (17): ForgotPasswordForm(), ResetPasswordForm(), SignInForm(), SignUpForm(), PasswordChecklist(), Props, CheckboxProps, InputProps (+9 more)

### Community 10 - "Changelog"
Cohesion: 0.06
Nodes (30): Breaking Changes, Changelog, Cloning the Repository, Components, Demos, Enhancements, Enhancements, Feature Comparison (+22 more)

### Community 11 - "ClubService.ts"
Cohesion: 0.11
Nodes (10): OpenAPI, BlogPostWrite, BlogPostWriteRequest, BookWrite, BookWriteRequest, ClubStats, ContactMessageCreate, ContactMessageCreateRequest (+2 more)

### Community 12 - "ReadingsPage.tsx"
Cohesion: 0.08
Nodes (15): Author, authorFullName(), Book, EMPTY_FORM, formatDate(), Member, Publisher, Reading (+7 more)

### Community 13 - "apiRequest"
Cohesion: 0.13
Nodes (18): apiRequest(), ApiRequestOptions, refreshToken(), ChangePasswordModal(), usePasswordValidation(), formatDate(), PaymentHistoryTable(), STATUS_BADGE (+10 more)

### Community 14 - "generated/index.ts"
Cohesion: 0.18
Nodes (9): MeetPhoto, MeetUser, Member, PatchedReadingWriteRequest, ReadingUser, ReadingWrite, ReadingWriteRequest, Status8ecEnum (+1 more)

### Community 15 - "compilerOptions"
Cohesion: 0.08
Nodes (23): DOM, DOM.Iterable, ES2020, src, compilerOptions, allowImportingTsExtensions, isolatedModules, jsx (+15 more)

### Community 16 - "App.tsx"
Cohesion: 0.18
Nodes (13): App(), GridShape(), AppWrapper(), PageMeta(), ScrollToTop(), AuthProvider(), ThemeProvider(), AuthLayout() (+5 more)

### Community 17 - "MeetsPage.tsx"
Cohesion: 0.10
Nodes (11): getAccessToken(), Author, Book, Meet, MeetParticipant, MeetRow, MeetType, Reading (+3 more)

### Community 18 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2023, vite.config.ts, compilerOptions, allowImportingTsExtensions, isolatedModules, lib, module, moduleDetection (+11 more)

### Community 19 - "BooksPage.tsx"
Cohesion: 0.12
Nodes (10): Author, authorFullName(), Book, BookCard(), BookForm, BooksPage(), EMPTY_FORM, getPagesBadge() (+2 more)

### Community 20 - "MembersPage.tsx"
Cohesion: 0.14
Nodes (12): BreadcrumbProps, PageBreadcrumb(), BlogCategory, BlogDetailPage(), BlogPostDetail, formatDate(), EMPTY_FORM, formatDate() (+4 more)

### Community 21 - "BookDetailPage.tsx"
Cohesion: 0.13
Nodes (11): Author, authorFullName(), Book, BookDetailPage(), formatDate(), Publisher, Reading, ReadingCard() (+3 more)

### Community 22 - "Home.tsx"
Cohesion: 0.14
Nodes (11): ACCENT_CLASSES, formatDate(), formatDateTime(), greeting(), Home(), Meet, MeetParticipant, Payment (+3 more)

### Community 23 - "devDependencies"
Cohesion: 0.13
Nodes (15): eslint, @eslint/js, devDependencies, eslint, @eslint/js, tailwindcss, @tailwindcss/postcss, @types/three (+7 more)

### Community 24 - "AnalyticsPage.tsx"
Cohesion: 0.16
Nodes (10): Analytics, AnalyticsPage(), formatMoney(), formatMonthLabel(), METHOD_LABELS, MethodBreakdown, MonthPoint, READING_LABELS (+2 more)

### Community 25 - "Publisher"
Cohesion: 0.20
Nodes (3): PatchedPublisherRequest, Publisher, PublisherRequest

### Community 26 - "AuthorsPublishersPage.tsx"
Cohesion: 0.18
Nodes (8): Author, AuthorForm, authorFullName(), AuthorsPublishersPage(), EMPTY_AUTHOR_FORM, EMPTY_PUBLISHER_FORM, Publisher, PublisherForm

### Community 27 - "Author"
Cohesion: 0.20
Nodes (3): Author, AuthorRequest, PatchedAuthorRequest

### Community 28 - "MeetTypeEnum.ts"
Cohesion: 0.29
Nodes (4): MeetTypeEnum, MeetWrite, MeetWriteRequest, PatchedMeetWriteRequest

### Community 29 - "PlansPage.tsx"
Cohesion: 0.22
Nodes (6): ApiRequestError, EMPTY_FORM, formatPrice(), Plan, PlanForm, PlansPage()

### Community 30 - "BlogCategory"
Cohesion: 0.24
Nodes (3): BlogCategory, BlogPostDetail, BlogPostList

### Community 31 - "ContactMessage"
Cohesion: 0.20
Nodes (3): ContactMessage, ContactMessageRequest, PatchedContactMessageRequest

### Community 32 - "overrides"
Cohesion: 0.22
Nodes (9): overrides, react-helmet-async, @react-jvectormap/core, @react-jvectormap/world, react, react, react-dom, react (+1 more)

### Community 33 - "QuoteWrite"
Cohesion: 0.25
Nodes (3): PatchedQuoteWriteRequest, QuoteWrite, QuoteWriteRequest

### Community 34 - "TeamMemberWrite"
Cohesion: 0.25
Nodes (3): PatchedTeamMemberWriteRequest, TeamMemberWrite, TeamMemberWriteRequest

### Community 35 - "TimelineEntryWrite"
Cohesion: 0.25
Nodes (3): PatchedTimelineEntryWriteRequest, TimelineEntryWrite, TimelineEntryWriteRequest

### Community 36 - "TeamMembersPage.tsx"
Cohesion: 0.22
Nodes (4): EMPTY_FORM, TeamMember, TeamMemberForm, TeamMembersPage()

### Community 37 - "ToastContext.tsx"
Cohesion: 0.29
Nodes (6): Toast, ToastContext, ToastContextType, ToastProvider(), ToastVariant, registerToast()

### Community 38 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, generate-api, lint, preview

### Community 39 - "Badge.tsx"
Cohesion: 0.33
Nodes (5): Badge(), BadgeColor, BadgeProps, BadgeSize, BadgeVariant

### Community 40 - "package.json"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 41 - "CurrentPlanCard.tsx"
Cohesion: 0.67
Nodes (3): CurrentPlanCard(), formatDate(), STATUS_BADGE

## Knowledge Gaps
- **259 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+254 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.176) - this node is a cross-community bridge._
- **Why does `useLandingScroll()` connect `LandingPage.tsx` to `dependencies`?**
  _High betweenness centrality (0.172) - this node is a cross-community bridge._
- **Why does `lenis` connect `dependencies` to `LandingPage.tsx`?**
  _High betweenness centrality (0.171) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _259 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `LandingPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06409130816505706 - nodes in this community are weakly interconnected._
- **Should `AuthService.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05901639344262295 - nodes in this community are weakly interconnected._
- **Should `AppSidebar.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0611764705882353 - nodes in this community are weakly interconnected._
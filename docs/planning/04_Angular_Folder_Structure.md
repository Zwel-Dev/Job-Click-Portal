# 04 — Angular Folder Structure (Refined)

> Target layout under `Job_Click_UI/src/`. Angular 19, **NgModule-based** (`standalone: false` per `angular.json`), SCSS, lazy workspaces.
> This revision is **reconciled against the actual repo state**, not a greenfield assumption.

---

## 0. Review notes — what changed from the first draft & why

The first draft assumed a clean scaffold. The repo is actually **derived from an admin template** (Velzon-style) that was stripped down, leaving vestigial config. Refinements:

| # | Finding in repo | Refinement |
| --- | --- | --- |
| R1 | `environment.{ts,dev,prod}` carry `defaultauth: "fackbackend"`, `firebaseConfig`, `baseAdminUrl`, `timeout`, `allowFilesize` — but **no template libs are installed** (`package.json` is bare Angular) | Treat these as **vestigial**. Trim env to what we use; reuse the existing **`defaultauth` fake-backend toggle** semantics as our mock switch (renamed `useMock`). |
| R2 | Two config sources disagree: `appsettings.json.baseApiUrl = http://localhost:5100` vs `environment.baseApiUrl = ""` | **Single source of truth:** runtime `appsettings.json` via `AppConfigService` (`APP_INITIALIZER`); `environment.*` holds **build-time flags only**. |
| R3 | `tsconfig.json` has **no `paths`/`baseUrl`** | Add **path aliases** (`@core`, `@shared`, `@features`, `@layouts`, `@env`) — see §5. |
| R4 | `angular.json` has **no `fileReplacements`**; build default config = `production` | Wire `fileReplacements` so dev/prod envs actually swap — see §5. |
| R5 | `environment.dev.ts` has `production: true` (bug) | Fix to `production: false`. |
| R6 | Stray `src/styles.css` + `src/styles.css.map` next to `styles.scss` | Remove compiled artifacts; SCSS is the source. Add a real `src/styles/` architecture (§3). |
| R7 | No global state/store convention defined | Adopt **signal-based stores** (Angular 19) over `BehaviorSubject` for app/feature state (§6). |
| R8 | `CoreModule` re-import guard pattern proposed | Lighten it: services `providedIn: 'root'`, **functional interceptors** via `provideHttpClient(withInterceptors(...))` in `AppModule` (§7). |
| R9 | `src/dashboard.json` present, empty/unused | Drop or document; not part of the structure. |

> A separate decision (UI library: hand-built vs Angular Material/Bootstrap/Tailwind) affects `shared/` and is tracked in [05 Shared Component Inventory](05_Shared_Component_Inventory.md), not here.

---

## 1. Top-level principles

- **`core/`** — singletons loaded once: services (`providedIn: 'root'`), guards, functional interceptors, config, cross-cutting models/enums. Not a heavyweight `CoreModule`.
- **`shared/`** — dumb/reusable UI, pipes, directives. **No stateful services.** Re-exports `CommonModule`, `ReactiveFormsModule`.
- **`features/`** — one folder per lazy workspace, each with its own routing module. Sub-features nest. Feature-local services/models/stores live with the feature.
- **`layouts/`** — workspace shells (public, auth, candidate, employer, admin) hosting nav + `<router-outlet>`.
- **`styles/`** — global SCSS architecture (tokens, mixins, base, themes).
- Components are **NgModule-declared** (`standalone: false`), matching `angular.json` schematics + `app.component.ts`.

---

## 2. Tree

```text
src/
├── appsettings.json                 # runtime config (EXISTS) — baseApiUrl, single source of truth
├── main.ts                          # EXISTS — bootstrapModule(AppModule)
├── index.html                       # EXISTS
├── styles.scss                      # EXISTS — imports styles/ partials only
├── environments/                    # EXISTS — trim vestigial fields (R1), fix dev (R5)
│   ├── environment.ts               # dev defaults: useMock, feature flags
│   ├── environment.dev.ts           # production:false (FIX)
│   └── environment.prod.ts
├── styles/                          # NEW (R6) — global SCSS
│   ├── _tokens.scss                 # colors, spacing, radius, z-index, breakpoints
│   ├── _typography.scss
│   ├── _mixins.scss
│   ├── _base.scss                   # resets, html/body
│   ├── _utilities.scss
│   └── _theme.scss                  # light/dark theming hooks
├── assets/                          # EXISTS (served via angular.json)
│   ├── images/  icons/  fonts/
│   ├── i18n/                        # reserved for future localization
│   └── mock/                        # JSON fixtures (see Mock Data Strategy)
└── app/
    ├── app.module.ts                # EXISTS — registers Core providers + HttpClient interceptors
    ├── app-routing.module.ts        # EXISTS — REPOINT to features/* (see Route Map)
    ├── app.component.{ts,html,scss} # EXISTS
    │
    ├── core/
    │   ├── config/
    │   │   ├── app-config.service.ts      # loads appsettings.json via APP_INITIALIZER (R2)
    │   │   └── app-config.model.ts
    │   ├── auth/
    │   │   ├── auth.service.ts             # providedIn: 'root'
    │   │   ├── token-storage.service.ts
    │   │   ├── current-user.store.ts       # signal store (R7)
    │   │   └── guards/                       # FUNCTIONAL guards
    │   │       ├── auth.guard.ts  guest.guard.ts
    │   │       ├── candidate.guard.ts  employer.guard.ts
    │   │       ├── company-admin.guard.ts  recruiter.guard.ts
    │   │       ├── admin.guard.ts  plan-limit.guard.ts
    │   ├── http/
    │   │   ├── api-base.service.ts          # typed get/post/put/delete + Paginated<T>
    │   │   ├── interceptors/                 # FUNCTIONAL interceptors (R8)
    │   │   │   ├── base-url.interceptor.ts   # prefixes AppConfig.baseApiUrl
    │   │   │   ├── auth.interceptor.ts       # Bearer token
    │   │   │   ├── error.interceptor.ts      # 401→login, 403→/403, toast
    │   │   │   ├── loading.interceptor.ts    # global loading bar
    │   │   │   └── mock-api.interceptor.ts   # honors environment.useMock
    │   │   └── mock/                          # in-memory mock backend (see Mock strategy)
    │   ├── models/                            # CROSS-CUTTING domain models only
    │   │   ├── user.model.ts  company.model.ts  candidate.model.ts
    │   │   ├── job.model.ts  application.model.ts  interview.model.ts
    │   │   ├── offer.model.ts  recommendation.model.ts  messaging.model.ts
    │   │   ├── subscription.model.ts
    │   │   └── common.model.ts               # Paginated<T>, ApiResponse<T>, ApiError, Id
    │   ├── enums/                             # ApplicationStatus, JobStatus, OfferStatus,
    │   │                                       # VerificationStatus, EmploymentType, WorkMode,
    │   │                                       # SeniorityLevel, RoleCode
    │   ├── services/                          # notification, messaging, realtime, breadcrumb, toast, confirm
    │   └── utils/                             # date, file, money, validators
    │
    ├── shared/
    │   ├── shared.module.ts                  # declares + exports all below; imports CommonModule, ReactiveFormsModule, RouterModule
    │   ├── components/
    │   │   ├── ui/        # button, card, badge, avatar, tag, modal, drawer, tabs,
    │   │   │              # dropdown, pagination, table, stepper, accordion, progress
    │   │   ├── feedback/  # toast, confirm-dialog, empty-state, error-state,
    │   │   │              # spinner, skeleton, loading-bar
    │   │   ├── form/      # text-field, textarea, select, multi-select, date-picker,
    │   │   │              # file-upload, otp-input, password-strength, salary-range,
    │   │   │              # location-input, skill-selector, rich-text, search-bar, filter-panel
    │   │   └── domain/    # job-card, kpi-card, application-status-chip, status-tracker,
    │   │                  # match-score-badge, match-breakdown, user-avatar-name,
    │   │                  # company-identity, notification-item, pipeline-card, plan-badge, score-bar
    │   ├── directives/   # has-role, autofocus, infinite-scroll, click-outside
    │   ├── pipes/        # time-ago, salary-format, status-label, initials, truncate, file-size, safe-url
    │   └── validators/
    │
    ├── layouts/
    │   ├── components/                        # header, sidebar, footer, breadcrumb (shared chrome)
    │   ├── public-layout/   auth-layout/
    │   ├── candidate-layout/  employer-layout/  admin-layout/
    │   └── nav-config/                        # per-workspace nav item definitions
    │
    └── features/
        ├── public/   public.module.ts  public-routing.module.ts  pages/…
        ├── auth/     auth.module.ts     auth-routing.module.ts    pages/…   # REPLACES deleted pages/systematic/.../auth
        ├── candidate/
        │   ├── candidate.module.ts  candidate-routing.module.ts
        │   ├── pages/        # routed smart components (dashboard, profile, jobs, …)
        │   ├── components/   # feature-local presentational components
        │   ├── services/     # candidate-profile, resume, saved-job, application, …
        │   ├── models/       # feature-only view models / DTOs (not cross-cutting)
        │   └── store/        # candidate-scoped signal stores (optional)
        ├── employer/         # same internal shape; sub-areas: company/, team/, jobs/,
        │                     # pipeline/, candidates/, interviews/, offers/, analytics/,
        │                     # subscription/ (BillingModule, P3), messages/, notifications/, settings/
        ├── admin/            # same internal shape; pages: users, companies, verifications, …
        ├── comms/            # shared messaging + notifications feature module (P2)
        └── ai/               # shared AI widgets + AiService (P3)
```

### Per-feature internal convention

```text
features/<feature>/
├── <feature>.module.ts
├── <feature>-routing.module.ts
├── pages/         # routed (smart) components — one folder each
├── components/    # feature-local presentational components
├── services/      # feature data services (call ApiBaseService)
├── models/        # feature-only types (cross-cutting types go to core/models)
└── store/         # signal stores for feature state (optional)
```

---

## 3. Global styles architecture (R6)

- Delete `src/styles.css` and `src/styles.css.map` (compiled leftovers).
- `src/styles.scss` becomes a thin entry that only `@use`s partials in `src/styles/`.
- Design tokens (`_tokens.scss`) are the single place for color/spacing/typography scales so every component stays consistent and themeable.
- Per-component styles remain co-located `*.scss` (SCSS, per `angular.json`), kept under the **4kB** `anyComponentStyle` budget already configured.

```scss
/* styles.scss */
@use 'styles/tokens';
@use 'styles/typography';
@use 'styles/base';
@use 'styles/utilities';
@use 'styles/theme';
```

---

## 4. Module rules

| Module | Imported by | Contains |
| --- | --- | --- |
| Core providers | `AppModule` only | `providedIn:'root'` services, functional interceptors (via `provideHttpClient`), `APP_INITIALIZER` config |
| `SharedModule` | every feature module | dumb components, pipes, directives; re-exports common Angular modules |
| feature modules | lazy via router | smart components + feature services + feature routing |
| `CommsModule`, `AiModule` | feature modules that need them | cross-cutting widgets |

> No `CoreModule` class is required in Angular 19; if one is kept for tidiness, guard it against re-import. Prefer registering providers directly in `AppModule`.

---

## 5. Config changes to apply (concrete)

### 5.1 `tsconfig.json` — add path aliases (R3)
```jsonc
"compilerOptions": {
  "baseUrl": "./src",
  "paths": {
    "@core/*":     ["app/core/*"],
    "@shared/*":   ["app/shared/*"],
    "@layouts/*":  ["app/layouts/*"],
    "@features/*": ["app/features/*"],
    "@env":        ["environments/environment"]
  }
}
```

### 5.2 `angular.json` — wire env swapping (R4)
```jsonc
"configurations": {
  "production": {
    "fileReplacements": [
      { "replace": "src/environments/environment.ts",
        "with":    "src/environments/environment.prod.ts" }
    ],
    "budgets": [ /* existing */ ],
    "outputHashing": "all"
  },
  "development": { "optimization": false, "extractLicenses": false, "sourceMap": true }
}
```

### 5.3 `environment.ts` — trimmed shape (R1, R5)
```ts
export const environment = {
  production: false,
  useMock: true,          // replaces vestigial defaultauth:'fackbackend'
  enableAi: false,        // P3
  enableRealtime: false,  // P2
  defaultPageSize: 20,
  allowFileSizeMb: 3,     // kept from template (used by file-upload)
};
```
> `baseApiUrl` is **not** here — it comes from `appsettings.json` at runtime (R2). Drop `firebaseConfig`/`defaultauth`/`baseAdminUrl` unless a real need appears.

### 5.4 `AppConfigService` (R2)
Loads `appsettings.json` before app init so `baseApiUrl` is runtime-swappable without rebuild:
```ts
// APP_INITIALIZER in AppModule → fetch('appsettings.json') → store baseApiUrl
// base-url.interceptor reads AppConfigService.baseApiUrl
```

---

## 6. State management convention (R7)

- **Local component state:** component fields / signals.
- **Feature/app state:** lightweight **signal stores** — a `providedIn:'root'` (or feature-provided) service exposing `signal()`/`computed()` + methods. Example: `current-user.store.ts`, candidate profile store.
- **Async data:** services return Observables from `HttpClient`; components use `async` pipe or `toSignal()`.
- **No NgRx in MVP.** Revisit only if cross-feature state coordination grows (Phase 3+).

---

## 7. HTTP & interceptor wiring (R8)

`AppModule` providers:
```ts
provideHttpClient(
  withInterceptors([
    baseUrlInterceptor,   // prepend AppConfig.baseApiUrl
    authInterceptor,      // Bearer token
    mockApiInterceptor,   // short-circuit when environment.useMock
    loadingInterceptor,   // global loading bar
    errorInterceptor,     // 401/403/toast handling
  ])
)
```
Order matters: base-url → auth → mock (short-circuits in mock mode) → loading → error.

---

## 8. Cleanup checklist (separate from feature work)

- [ ] Remove `src/styles.css`, `src/styles.css.map`; restructure `styles.scss` (§3).
- [ ] Trim `environment.*` (§5.3); fix `environment.dev.ts` `production:false`.
- [ ] Add `tsconfig` paths (§5.1) and `angular.json` fileReplacements (§5.2).
- [ ] Repoint `app-routing.module.ts` off the deleted `pages/systematic/.../auth` to `features/auth` (see [Route Map](03_Route_Map.md)).
- [ ] Decide fate of unused `src/dashboard.json` (remove or document).
- [ ] Confirm `appsettings.json` is the only place `baseApiUrl` lives.

---

## 9. Model naming (ERD → TypeScript)

- Table `CANDIDATE_PROFILES` → `CandidateProfile` (singular, `PascalCase`).
- snake_case columns → camelCase fields; mapping in services/mappers, **not** components.
- Status strings → `core/enums`.
- Generics in `common.model.ts`: `Paginated<T>`, `ApiResponse<T>`, `ApiError`, `Id = number`.

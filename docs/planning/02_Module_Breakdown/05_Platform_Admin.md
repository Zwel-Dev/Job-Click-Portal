# Module: Platform Admin

**Workspace:** Platform Admin · **Route prefix:** `/admin` · **Guard:** `authGuard + adminGuard`
**Angular module:** `AdminModule` (lazy-loaded at the workspace boundary)

> Implementation spec. Follows the conventions proven in the **shipped Candidate / Recruiter / Company Admin workspaces** — NgModule components (`standalone: false`), Angular Material + the shared design system, **signal stores**, services returning `Observable<T>` via `of(mock)` gated on `environment.useMock`, strict TS (no `any`), ERD-derived models in `@core/models`. Reuse the shared component library (see §9).
>
> **Workspace decision:** Platform Admin is its **own workspace** — a separate lazy `AdminModule` at `/admin` with its **own shell** (`AdminLayoutComponent`), distinct from the employer (`/employer`) and candidate (`/candidate`) workspaces. The `PlatformAdmin` role is **platform-scoped** (no `company_id`), so it must not reuse the employer shell/context. This is the **operator console**: it reads and acts on data produced by every other module (users, companies, jobs, applications, subscriptions) and is the authority for **company verification** (which unblocks employer onboarding) and platform integrity.

---

## 1. Scope

System-wide operations a Platform Admin performs:

1. **Users** — search, inspect, suspend/reactivate, reset password, view roles & memberships.
2. **Companies** — search, inspect, suspend/activate, view team/jobs/plan.
3. **Verification** — review company business/tax documents; **approve / reject** (sets `COMPANY_VERIFICATIONS.verification_status`, stamps `verified_by`/`verified_at`, toggles `COMPANIES.verified`).
4. **Job moderation** — flag/remove jobs; duplicate detection.
5. **Fraud detection** — surfaced signals (fake companies, duplicate jobs, spam applications, scam postings) with severity + actions.
6. **System analytics** — platform-wide growth, funnel, and health metrics.
7. **Audit & activity logs** — read-only trail of every admin mutating action.
8. **Platform settings** — roles, skills taxonomy, plans, feature flags.
9. **Subscription oversight** — company subscriptions + payments (P3).

> Out of scope: per-company administration (profile/team/locations) → [Company Admin](04_Company_Admin.md); the hiring funnel → [Recruiter](03_Recruiter.md).

---

## 2. Delivery phases at a glance

| # | Feature | Phase | Priority | Status | Primary screens |
| --- | --- | :---: | :---: | :---: | --- |
| 1 | Admin shell + dashboard (KPIs) | P1 | Must | ✅ Done | `/admin/dashboard` |
| 2 | User management | P1 | Must | ✅ Done | `/admin/users`, `/users/:id` |
| 3 | Company management | P1 | Must | ✅ Done | `/admin/companies`, `/companies/:id` |
| 4 | Verification queue + review | P1 | Must | ✅ Done | `/admin/verifications` |
| 5 | Job moderation | P2 | Should | ✅ Done | `/admin/jobs` |
| 6 | Fraud detection | P2 | Should | ✅ Done | `/admin/fraud` |
| 7 | System analytics | P2 | Should | ✅ Done | `/admin/analytics` |
| 8 | Audit & activity logs | P2 | Should | ✅ Done | `/admin/audit-logs` |
| 9 | Platform settings | P2 | Could | ✅ Done | `/admin/settings` |
| 10 | Subscription oversight | P3 | Could | ✅ Done | `/admin/subscriptions` |

> **Status legend:** ✅ done & build-verified · ⬜ pending · 🔒 hidden. **Platform Admin module complete — all 10 features shipped & build-verified (PA1.0–PA1.3, PA2.0–PA2.4, PA3.0).** Shell + `adminGuard` + dashboard; user management (detail drawer + guardrails); company management (detail page + suspend/activate); verification queue + review; job moderation (flag/unflag/remove + duplicate grouping); fraud detection (signal cards, resolve / act-on); system analytics (growth/funnel/plan, CSS bars); audit logs (read-only trail of every admin mutation); platform settings (roles/skills/plans/flags); subscription oversight (read-only, with invoices). The verification review (PA1.3) **closes the loop** with Company Admin CA1.4 via a shared root `VerificationStore`; fraud **act-on** reuses the user/company/job services; every mutating admin action writes to the **audit trail**.

---

## 3. Route map (`admin-routing.module.ts`)

Lazy via the root route
`{ path: 'admin', canActivate: [authGuard, adminGuard], loadChildren: () => import('@features/admin/admin.module').then(m => m.AdminModule) }`.
All children render inside `AdminLayoutComponent`.

```ts
const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: 'dashboard',      component: AdminDashboardComponent,      title: 'Admin | Job Click' },
      { path: 'users',          component: UserManagementComponent,      title: 'Users | Job Click' },
      { path: 'users/:id',      component: UserDetailComponent,          title: 'User | Job Click' },
      { path: 'companies',      component: CompanyManagementComponent,   title: 'Companies | Job Click' },
      { path: 'companies/:id',  component: AdminCompanyDetailComponent,   title: 'Company | Job Click' },
      { path: 'verifications',  component: VerificationQueueComponent,    title: 'Verifications | Job Click' },
      { path: 'jobs',           component: JobModerationComponent,        title: 'Job Moderation | Job Click' },     // P2
      { path: 'fraud',          component: FraudDashboardComponent,       title: 'Fraud | Job Click' },              // P2
      { path: 'analytics',      component: SystemAnalyticsComponent,      title: 'System Analytics | Job Click' },   // P2
      { path: 'audit-logs',     component: AuditLogComponent,             title: 'Audit Logs | Job Click' },         // P2
      { path: 'settings',       component: PlatformSettingsComponent,     title: 'Settings | Job Click' },           // P2
      { path: 'subscriptions',  component: SubscriptionOversightComponent, title: 'Subscriptions | Job Click' },     // P3
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: '**', redirectTo: 'dashboard' },
    ],
  },
];
```

**Guards** (`@core/auth/guards`):
| Guard | Allows |
| --- | --- |
| `adminGuard` | `PlatformAdmin` only (**new** — mirror the shipped `candidateGuard`/`employerGuard`) |
| `authGuard` | any signed-in user (parent route) |

> Wire in **PA1.0**: add the `/admin` lazy route to `app-routing.module.ts`; extend `defaultRouteForRoles` (`@core/auth/home-route.ts`) so `PlatformAdmin` lands on `/admin/dashboard` (currently `/welcome`).

---

## 4. Feature folder structure

```text
features/admin/
├── admin.module.ts
├── admin-routing.module.ts
├── models/                          # admin-only view/query models (most live in @core/models)
├── services/
│   ├── admin-user.service.ts
│   ├── admin-company.service.ts
│   ├── verification-review.service.ts   # shares state with Company Admin verification
│   ├── job-moderation.service.ts        # P2
│   ├── fraud.service.ts                 # P2
│   ├── system-analytics.service.ts      # P2
│   ├── audit-log.service.ts             # P2
│   ├── platform-settings.service.ts     # P2
│   └── admin-subscription.service.ts    # P3
├── state/
│   └── admin-context.store.ts        # system KPIs + queue counts (signal store)
├── components/                       # area-local presentational pieces
│   ├── user-detail-drawer/
│   ├── verification-review-panel/
│   ├── fraud-signal-card/
│   └── confirm-action-dialog/        # reuse shared confirm where possible
└── pages/
    ├── dashboard/
    ├── users/
    ├── companies/
    ├── verifications/
    ├── jobs/            # P2
    ├── fraud/           # P2
    ├── analytics/       # P2
    ├── audit-logs/      # P2
    ├── settings/        # P2
    └── subscriptions/   # P3
```

```text
layouts/admin-layout/   # AdminLayoutComponent + admin-nav.ts (separate shell)
```

> **Import note:** `AdminLayoutComponent` is declared in `AdminModule` and imported into `AdminRoutingModule` via a **relative path** (not `@layouts`) — the TS-993004 re-emit gotcha, as in Auth/Candidate/Recruiter.

---

## 5. Domain models (`@core/models`, ERD-derived)

### `admin-user.model.ts`
```ts
export interface AdminUser {                 // USERS (+ USER_ROLES, company)
  id: Id; uuid: string; fullName: string; email: string; phone?: string;
  status: UserStatus; emailVerified: boolean; phoneVerified: boolean;
  roles: RoleCode[]; companyId?: Id; companyName?: string;
  createdAt: string; lastLoginAt?: string;
}
export interface AdminUserQuery { keyword?: string; role?: RoleCode; status?: UserStatus; page: number; pageSize: number; }
```

### `admin-company.model.ts`
```ts
export interface AdminCompany {               // COMPANIES (+ counts, plan)
  id: Id; name: string; companyCode: string; status: CompanyStatus;
  verified: boolean; verificationStatus: VerificationStatus;
  industry?: string; companySize?: CompanySize; planName?: string;
  jobsCount: number; membersCount: number; createdAt: string;
}
export interface AdminCompanyDetail extends AdminCompany {
  website?: string; locations: CompanyLocation[]; admins: { fullName: string; email: string }[];
}
```

### `verification-review.model.ts` (COMPANY_VERIFICATIONS, admin side)
```ts
export interface VerificationReviewItem {
  companyId: Id; companyName: string; registrationNo?: string; taxNo?: string;
  officialEmail?: string; website?: string; documents: VerificationDocument[];
  status: VerificationStatus; submittedAt?: string;
}
export interface VerificationDecision { companyId: Id; approve: boolean; reason?: string; }
```

### Moderation / fraud / analytics / audit (`@core/models`)
```ts
export interface ModeratedJob { id: Id; title: string; companyName: string; status: JobStatus;
  flagged: boolean; flagReason?: string; applicants: number; postedAt: string; duplicateOf?: Id; }
export interface FraudSignal { id: Id; type: FraudSignalType; severity: FraudSeverity;
  entityLabel: string; detail: string; detectedAt: string; resolved: boolean; }
export interface SystemKpis { totalUsers: number; candidates: number; companies: number;
  activeJobs: number; pendingVerifications: number; openFraudSignals: number; applicationsToday: number; }
export interface AuditLogEntry { id: Id; actorName: string; action: string; entityType: string;
  entityId: Id; summary: string; createdAt: string; }
```

> Reuse `Id`, `Paginated`, `ApiError`; `RoleCode`, `UserStatus`, `CompanyStatus`, `VerificationStatus`, `CompanySize`, `JobStatus`, `SubscriptionStatus`, `CompanyLocation`, `VerificationDocument` (all already shipped).

---

## 6. Enums (`@core/enums`)

Reuse `RoleCode`, `UserStatus`, `CompanyStatus`, `VerificationStatus`, `JobStatus`, `SubscriptionStatus`. New (add `*_LABELS` + `*_META { label; tone }` where badged):

| Enum | Values |
| --- | --- |
| `FraudSignalType` | `FakeCompany, DuplicateJob, SpamApplications, ScamJob, SuspiciousLogin` |
| `FraudSeverity` | `Low, Medium, High` |
| `AuditAction` | `Create, Update, Suspend, Reactivate, Approve, Reject, Delete` *(or free string)* |

> **Tone mapping** (`app-status-badge`): Active/Approved/Verified → `success`; Pending/Flagged/Medium → `progress`/`info`; Suspended/Rejected/High/Removed → `danger`; Inactive/Low/Resolved → `neutral`.

---

## 7. Services & state

All services: `@Injectable({ providedIn: 'root' })`, mock branch gated on `environment.useMock` with **stateful** in-memory collections (mirror `JobService` / `TeamService`), real branch via `ApiBaseService`. Endpoints per [API Contract](../06_API_Contract_Assumptions.md) (`/admin/*`).

```ts
// admin-user.service.ts
list(query: AdminUserQuery): Observable<Paginated<AdminUser>>
getById(id): Observable<AdminUser>
setStatus(id, status: UserStatus): Observable<AdminUser>       // suspend / reactivate
resetPassword(id): Observable<void>                            // sends reset link

// admin-company.service.ts
list(query): Observable<Paginated<AdminCompany>>
getById(id): Observable<AdminCompanyDetail>
setStatus(id, status: CompanyStatus): Observable<AdminCompany> // suspend / activate

// verification-review.service.ts  (shares state with Company Admin CA1.4)
queue(): Observable<VerificationReviewItem[]>                  // status === Pending
review(decision: VerificationDecision): Observable<void>       // → Verified | Rejected

// P2
// job-moderation.service.ts: list / flag / unflag / remove / duplicates
// fraud.service.ts:          signals / resolve / actOn(entity, action)
// system-analytics.service.ts: load(): SystemAnalytics
// audit-log.service.ts:      list(query): Paginated<AuditLogEntry>
// platform-settings.service.ts: roles / skills / plans / flags CRUD
// P3 admin-subscription.service.ts: list / payments
```

**State — `AdminContextStore` (signal store):** loads `SystemKpis` + queue counts (pending verifications, open fraud signals) once for the shell; surfaces nav **badges** (e.g. "Verifications 3"). Dashboard + nav read these signals.

> **Verification loop (PA1.3 ↔ CA1.4):** the admin `VerificationReviewService` and the company `CompanyService` (which owns the verification record) must share one source of truth so an admin's **Approve** flips the company's badge to `Verified`. In the mock: route both through a single root **`VerificationStore`** (or have `VerificationReviewService` delegate to `CompanyService`, mirroring `JobApprovalService` → `JobService`). Approve stamps `verified_by` + `verified_at` and sets `COMPANIES.verified = true`.

---

## 8. Sub-feature specs

### 8.0 Admin dashboard (`AdminDashboardComponent`) — P1
Route `/admin/dashboard`. **KPI strip** (`app-kpi-card`): total users · candidates · companies · active jobs · pending verifications · open fraud signals. **Queue widgets** (compose via `forkJoin`): verifications awaiting review (→ queue), latest sign-ups, recent fraud signals. Skeleton/empty/error per widget.

### 8.1 User management (`UserManagementComponent` + `UserDetailComponent`/drawer) — P1
Route `/admin/users`. Paginated table/cards: name, email, **role chips**, **status badge**, company, joined, last login. Filter by role + status; debounced search; pagination. Row → detail (drawer or `/admin/users/:id`): profile summary, roles & memberships, activity. Actions: **suspend / reactivate** (`setStatus` + confirm), **reset password** (sends link + toast). Cannot suspend another Platform Admin without a second confirm (guardrail).

### 8.2 Company management (`CompanyManagementComponent` + `AdminCompanyDetailComponent`) — P1
Route `/admin/companies`. Paginated list: name, **status badge**, **verified badge**, industry, plan, jobs/members counts, created. Filter by status/verified; search. Detail: profile, locations, admins, jobs/members counts, plan. Actions: **suspend / activate** (`setStatus` + confirm) — suspending a company should gate its employer workspace (server-side).

### 8.3 Verification queue + review (`VerificationQueueComponent` + `VerificationReviewPanel`) — P1
Route `/admin/verifications`. List of companies with `verificationStatus === Pending` (the **inbox** for CA1.4 submissions): company, submitted date, registration/tax no. **Review panel**: inspect the submitted docs (open the `VerificationDocument` files), registration/tax/email/website → **Approve** (→ `Verified`, badge flips for the company) or **Reject** (→ `Rejected` + required reason, returned to the company to resubmit). Writes `verified_by`/`verified_at`; logs an `AUDIT_LOGS` entry.

### 8.4 Job moderation (`JobModerationComponent`) — P2
Route `/admin/jobs`. All platform jobs with status + flags; filter by status/flagged. **Duplicate detection** groups near-identical postings (`duplicateOf`). Actions: **flag** (reason), **unflag**, **remove** (takes the job down, confirm). 

### 8.5 Fraud detection (`FraudDashboardComponent` + `FraudSignalCard`) — P2
Route `/admin/fraud`. Signal cards grouped by `FraudSignalType` with `FraudSeverity` tone: fake companies, duplicate jobs, spam applications, scam postings, suspicious logins. Each signal → **resolve** or **act on** the entity (warn / suspend / remove, deep-linking to the user/company/job).

### 8.6 System analytics (`SystemAnalyticsComponent`) — P2
Route `/admin/analytics`. Platform-wide: user/company growth, jobs posted, applications submitted, hiring funnel, plan distribution. Reuse the lightweight CSS visualisations (`app-analytics-view`-style bars; no chart lib).

### 8.7 Audit & activity logs (`AuditLogComponent`) — P2
Route `/admin/audit-logs`. Paginated `AUDIT_LOGS`: actor, action, entity type/id, summary, time. Filter by entity type / action / actor / date range. **Read-only.** Every admin mutating action across PA1.x/PA2.x writes here.

### 8.8 Platform settings (`PlatformSettingsComponent`) — P2 · Could
Route `/admin/settings`. Tabs: **Roles** (view), **Skills taxonomy** (CRUD `SKILLS`/`SKILL_ALIASES` — feeds candidate/job pickers + matching), **Plans** (`SUBSCRIPTION_PLANS` CRUD), **Feature flags**. 

### 8.9 Subscription oversight (`SubscriptionOversightComponent`) — P3 · Could
Route `/admin/subscriptions`. All company subscriptions + `PAYMENTS`; filter by plan/status; view invoices. Read-mostly; ties to [Subscription & Billing](08_Subscription_and_Billing.md).

---

## 9. Components consumed vs new

**Reuse (already shipped):** `app-page-header`, `app-kpi-card`, `app-empty-state`, `app-error-state`, `app-skeleton`, `app-pagination`, `app-confirm-dialog` + `ConfirmService`, `ToastService`, `app-status-badge` (user/company/verification/fraud status), `app-file-upload` (n/a), `app-logo`.

**New shell + area-local:** `AdminLayoutComponent` (+ `admin-nav.ts`), `AdminDashboardComponent`, `UserManagementComponent` + `UserDetailComponent`/drawer, `CompanyManagementComponent` + `AdminCompanyDetailComponent`, `VerificationQueueComponent` + `VerificationReviewPanel`, `JobModerationComponent` (P2), `FraudDashboardComponent` + `FraudSignalCard` (P2), `SystemAnalyticsComponent` (P2), `AuditLogComponent` (P2), `PlatformSettingsComponent` (P2), `SubscriptionOversightComponent` (P3).

> No new Material modules expected (table/list, menu, dialog, tabs, chips, tooltip, sidenav already in `MaterialModule`).

---

## 10. Mock data requirements

A platform-wide dataset spanning **multiple** companies/users (not just Greenline):
- **Users:** ~25–40 across roles (candidates, recruiters, managers, company admins, 1–2 platform admins) and statuses (Active / Suspended / PendingVerification). Cross-resolve the shipped demo users (`candidate@`, `recruiter@`, `company.admin@`, `platform.admin@`).
- **Companies:** ~6–10 with mixed `status` + `verified` + plan; **2–3 with `verificationStatus: Pending`** so the queue has work (Greenline starts Unverified per CA1.4 → appears here).
- **Verifications:** the pending submissions (with documents) for the review panel.
- **Jobs (P2):** ~20–30 platform jobs, a few `flagged` + a duplicate pair.
- **Fraud (P2):** ~5–8 signals across types/severities.
- **Audit logs (P2):** ~30 recent entries.
- **Analytics (P2) / subscriptions (P3):** aggregates.

Stateful services so suspends/approvals/removals persist within the session. The **`platform.admin@jobclick.dev`** demo account signs into this workspace. Demo password `Password123!`.

---

## 11. Business rules & status flows

- **Company verification** (`§7`, loop with CA1.4): `Pending → Approve (Verified, verified_by/at, COMPANIES.verified=true)` or `Reject (Rejected + reason → company resubmits)`. The verified badge then surfaces to candidates.
- **User suspension:** `Active ↔ Suspended` (suspended users fail `authGuard`/login server-side); reactivate restores. Reset password sends a link, never reveals the password.
- **Company suspension:** `Active ↔ Suspended` gates the whole employer workspace for that company.
- **Job moderation:** `flag` (reason) / `unflag` / `remove` (terminal). Duplicate detection is advisory (groups by `duplicateOf`).
- **Fraud signals:** advisory until an admin **resolves** or **acts**; acting reuses user/company/job suspension/removal.
- **Audit trail:** every mutating admin action writes `AUDIT_LOGS` (actor = current admin); the log UI is strictly read-only.
- **Self-guardrails:** an admin cannot suspend their own account; suspending another Platform Admin needs an extra confirm.
- **Skills taxonomy** edits propagate to candidate/job skill pickers + the matching engine ([Recommendation Engine](06_Recommendation_Engine.md)).

---

## 12. Accessibility & responsive

- Tables (users, companies, jobs, audit) → cards on mobile; sticky headers; sortable where useful.
- All actions keyboard-reachable; destructive actions confirm via `ConfirmService`; status by **text + tone** (not color alone).
- Skeleton loaders for every async view; empty + error states everywhere; optimistic actions roll back on error with a toast.
- Detail drawers trap focus and restore on close. Responsive ≥ 360px.

---

## 13. Phased build plan (sequenced slices)

Vertical slices, each build-verified before the next (same cadence as Recruiter `R1.x` / Company Admin `CA1.x`). IDs map to phases (P1 = `PA1.x`, P2 = `PA2.x`, P3 = `PA3.x`).

### 13.1 Sequence & dependencies

```text
PA1.0 Admin shell + adminGuard + dashboard ─► PA1.1 Users ─► PA1.2 Companies ─► PA1.3 Verification review   (P1 complete)
P2:  PA2.0 Job moderation ─► PA2.1 Fraud ─► PA2.2 System analytics ─► PA2.3 Audit logs ─► PA2.4 Platform settings
P3:  PA3.0 Subscription oversight
```

| Slice | Goal | Depends on | Size |
| --- | --- | --- | :---: |
| **PA1.0** | Admin shell + `adminGuard` + nav + `AdminContextStore` + dashboard (walking skeleton) | Auth | M |
| **PA1.1** | User management (search/filter/detail/suspend/reset) | PA1.0 | M |
| **PA1.2** | Company management (list/detail/suspend) | PA1.0 | M |
| **PA1.3** | Verification queue + review (approve/reject) — closes the CA1.4 loop | PA1.0, CA1.4 | M |
| **PA2.0** | Job moderation (flag/remove/duplicates) | PA1.0 | M |
| **PA2.1** | Fraud detection dashboard | PA1.0 | M |
| **PA2.2** | System analytics | PA1.0 | S |
| **PA2.3** | Audit & activity logs | PA1.0 | S |
| **PA2.4** | Platform settings (roles/skills/plans/flags) | PA1.0 | L |
| **PA3.0** | Subscription oversight + payments | PA1.0, doc 08 | M |

---

### Phase 1 — Core admin

#### PA1.0 — Admin shell & dashboard *(walking skeleton — do first)* ✅
- [x] `adminGuard` (`PlatformAdmin` only); add `/admin` lazy route to `app-routing.module.ts`; extend `defaultRouteForRoles` → `/admin/dashboard`
- [x] `AdminLayoutComponent` + `admin-nav.ts` (Dashboard, Users, Companies, Verifications, [P2 items]); separate shell
- [x] `AdminContextStore` (system KPIs + queue counts → nav badges); `AdminDashboardComponent` (KPI strip + queue widgets)
- [x] Enums (`FraudSignalType`, `FraudSeverity`) + `@core/models` (`admin-user`, `admin-company`, `verification-review`, `SystemKpis`)
- **Exit:** sign in as `platform.admin@jobclick.dev` → admin shell; nav resolves; dashboard KPIs render from mock; build green. ✅ *Remaining P1/P2/P3 screens route to the shared "coming soon" placeholder until their slice lands.*

#### PA1.1 — User management ✅
- [x] `AdminUserService` (list/getById/setStatus/resetPassword); `UserManagementComponent` (filters + pagination) + detail drawer; suspend/reactivate/reset with confirm + toast; self/admin guardrails
- **Exit:** search/filter users; suspend + reactivate persist; build green. ✅ *Detail drawer deep-links via `/admin/users/:id` (used by the dashboard sign-ups widget); user state is shared with the dashboard via `AdminUserService`.*

#### PA1.2 — Company management ✅
- [x] `AdminCompanyService` (list/getById/setStatus); `CompanyManagementComponent` + `AdminCompanyDetailComponent`; suspend/activate with confirm
- **Exit:** browse companies; suspend/activate persist; verified/status badges correct; build green. ✅ *List filters by status + verification with debounced search; detail page shows profile, KPI counts, locations, and admins; suspend warns it gates the whole employer workspace.*

#### PA1.3 — Verification queue + review ✅
- [x] Shared `VerificationStore` (or delegate) so admin decisions update the company's record; `VerificationReviewService.queue/review`; `VerificationQueueComponent` + `VerificationReviewPanel` (approve / reject + reason)
- **Exit:** a company submits (CA1.4) → appears in the queue → **Approve** flips the company to `Verified` (and the overview badge); **Reject** returns it with a reason; build green. **→ Platform Admin P1 complete.** ✅ *Root `@core/state/VerificationStore` is the single source of truth: `CompanyService` (CA1.4) and `VerificationReviewService` (PA1.3) both delegate to it; the admin dashboard pending count, nav badge, and company-list verification badges all read it, so an approval is reflected everywhere.*

---

### Phase 2 — Integrity & insight
- [x] **PA2.0 Job moderation** ✅ — flag/unflag/remove + duplicate grouping. *`JobModerationService` (list/flag/unflag/remove/duplicates, stateful mock); `JobModerationComponent` with an All-jobs filterable table and a Duplicates grouped view; `FlagJobDialog` captures a reason; remove confirms (terminal `removed`).*
- [x] **PA2.1 Fraud detection** ✅ — signal cards + resolve/act actions. *`FraudService` (signals/resolve/actOn, stateful); `FraudDashboardComponent` groups cards by type with a severity filter + show-resolved toggle; `FraudSignalCard` deep-links the entity; **act-on delegates to `AdminUserService`/`AdminCompanyService` (suspend) and `JobModerationService` (remove)**, then resolves. Open count feeds the dashboard KPI + nav badge.*
- [x] **PA2.2 System analytics** ✅ — platform-wide growth/funnel/health (CSS bars, no chart lib). *`SystemAnalyticsService.load()`; `SystemAnalyticsComponent` shows a period KPI strip, four monthly column charts (users/companies/jobs/applications), the hiring funnel, and plan distribution.*
- [x] **PA2.3 Audit & activity logs** ✅ — read-only, rich filters; every PA action writes here. *`AuditLogService.record()` is called by the user/company/verification/job/fraud/settings mutations (actor + time stamped); `AuditLogComponent` filters by actor / action / entity / date range over a paginated, read-only table.*
- [x] **PA2.4 Platform settings** ✅ — roles (view) · skills taxonomy CRUD · plans CRUD · feature flags. *`PlatformSettingsService`; tabbed `PlatformSettingsComponent` with `SkillFormDialog` + `PlanFormDialog`; flag toggles; each change records an audit entry.*

### Phase 3 — Commerce ✅
- [x] **PA3.0 Subscription oversight** — company subscriptions + payments; ties to [doc 08](08_Subscription_and_Billing.md). *Read-only: billing KPI strip (MRR, active, past due, paid companies), subscription list filterable by plan + status with debounced search, and a per-company invoices dialog. `AdminSubscriptionService` (list/payments/summary) over mock `SUBSCRIPTIONS` + `PAYMENTS`.*

---

## 14. Definition of done (per screen)

- Routed + lazy under `AdminModule`; `authGuard + adminGuard` gate.
- Data only via feature service → mock/`of()`; **no hardcoded data in components**; stateful mocks persist within session.
- Typed models, no `any`; reactive forms with validation; loading (skeleton) / empty / error states present.
- Destructive actions confirm; optimistic actions roll back on error; toasts on success/failure; mutating actions write an audit entry.
- Responsive ≥ 360px; keyboard accessible.

---

## 15. Dependencies & build order

**Depends on:** Auth (current user, `authGuard`, **new** `adminGuard`), shared design-system components, `@core` http/models/enums. Reads data produced by **every** other module; verification review pairs with [Company Admin CA1.4](04_Company_Admin.md); skills taxonomy feeds the [Recommendation Engine](06_Recommendation_Engine.md); subscription oversight ties to [Subscription & Billing](08_Subscription_and_Billing.md).
**Feeds:** **verification unblocks employer onboarding** (verified badge → candidates); moderation/fraud actions gate jobs/companies/users platform-wide; settings (skills/plans/flags) configure the rest of the platform.

**Suggested order:** shell + guard → dashboard → users → companies → verification review → (P2) job moderation → fraud → analytics → audit logs → settings → (P3) subscriptions.

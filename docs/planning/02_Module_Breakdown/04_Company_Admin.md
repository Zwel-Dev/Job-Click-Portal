# Module: Company Admin

**Workspace:** Employer · **Route prefix:** `/employer/company/*`, `/employer/team`, `/employer/subscription`
**Guard:** `authGuard + employerGuard` + per-area `companyAdminGuard` (some read areas allow `managerGuard`)
**Angular area:** a `company-admin` feature area **inside `EmployerModule`** (same lazy bundle + shell as Recruiter)

> Implementation spec. Follows the conventions proven in the **shipped Candidate + Recruiter workspaces** — NgModule components (`standalone: false`), Angular Material + the shared design system, **signal stores**, services returning `Observable<T>` via `of(mock)` gated on `environment.useMock`, strict TS (no `any`), ERD-derived models in `@core/models`. Reuse the shared component library (see §9) and the `EmployerLayoutComponent` shell.
>
> **Workspace decision:** Company Admin is **not a separate app** — it lives under the same `/employer` shell as the Recruiter workspace ([doc 03](03_Recruiter.md)), gated by role. Recruiter/Manager run the hiring funnel; Company Admin runs the *organization* (profile, locations, departments, verification, team, plan). Keeping both in `EmployerModule` avoids duplicating the shell/context and lets team/plan limits feed the recruiter features directly. *(If `EmployerModule` grows too large, the `company-admin` area can later be extracted into a lazy child `CompanyAdminModule` mounted under the employer layout — the folder boundary below makes that a mechanical move.)*

---

## 1. Scope

Everything a **Company Admin** (and, for some read areas, a Recruitment Manager) does to run the organization on the platform:

1. **Company profile** — name, logo, website, industry, size, description; the public-facing company identity.
2. **Locations** — offices/sites with a head-office flag (feed job `location`).
3. **Departments** — org units that own jobs (feed the job wizard's department field).
4. **Verification** — submit business/tax documents; track verified/pending/rejected status (drives the "verified" badge).
5. **Team & permissions** — invite members, assign company-scoped roles, activate/deactivate, transfer ownership; permission matrix.
6. **Company analytics** — company-wide hiring insight (admin view of the recruitment funnel).
7. **Subscription & plan** — current plan, usage vs limits, upgrade entry point (full billing in [doc 08](08_Subscription_and_Billing.md)).

> Out of scope here: the hiring funnel itself (jobs, pipeline, offers) → [Recruiter](03_Recruiter.md); platform-wide company review/verification approval → [Platform Admin](05_Platform_Admin.md).

---

## 2. Delivery phases at a glance

| # | Feature | Phase | Priority | Status | Primary screens |
| --- | --- | :---: | :---: | :---: | --- |
| 1 | Company-admin area shell + overview | P1 | Must | ✅ Done | `/employer/company` |
| 2 | Company profile (view + edit + logo) | P1 | Must | ✅ Done | `/employer/company/profile` |
| 3 | Locations CRUD (+ head office) | P1 | Must | ✅ Done | `/employer/company/locations` |
| 4 | Departments CRUD | P1 | Must | ✅ Done | `/employer/company/departments` |
| 5 | Verification center | P1 | Should | ✅ Done | `/employer/company/verification` |
| 6 | Team list + invite + roles | P1 | Must | ✅ Done | `/employer/team` |
| 7 | Permission matrix + transfer ownership | P1 | Must | ✅ Done | `/employer/team` |
| 7a | Member invitation acceptance & onboarding | P1 | Must | ✅ Done | `/invite/accept` *(cross-module → Auth/shell)* |
| 8 | Company analytics (admin view) | P2 | Should | ✅ Done | `/employer/company/insights` |
| 9 | Subscription & plan usage | P3 | Should | ✅ Done | `/employer/subscription` |
| 10 | Audit log viewer | P3 | Could | ⬜ Pending | `/employer/company/audit-log` |

> **Status legend:** ✅ done & build-verified · ⬜ pending · 🔒 hidden. **Depends on the shipped Recruiter shell** (`EmployerLayoutComponent`, `EmployerContextStore`, `companyAdminGuard`, `managerGuard`). **Company Admin Phase 1 (CA1.0–CA1.6) ✅ · Phase 2 CA2.0 ✅ · Phase 3 CA3.0 (Subscription) ✅** — all build-verified. **Next: CA3.1 Audit log** (last slice in the module). Full checkout/billing remains [doc 08](08_Subscription_and_Billing.md). The Subscription area (P3) is an **entry point** here; the full billing module is [doc 08](08_Subscription_and_Billing.md).

---

## 3. Route map (added to `employer-routing.module.ts`)

All children render inside the existing `EmployerLayoutComponent` (same shell as Recruiter). Company-admin routes are grouped under `company/*` plus the top-level `team` and `subscription`.

```ts
// children of the EmployerLayoutComponent route (alongside dashboard/jobs/…)
{ path: 'company',              component: OverviewComponent,            canActivate: [companyAdminGuard], title: 'Company | Job Click' }, // CA1.0 ✅ admin landing
{ path: 'company/profile',      component: CompanyProfileComponent,      canActivate: [companyAdminGuard], title: 'Company Profile | Job Click' },
{ path: 'company/locations',    component: CompanyLocationsComponent,    canActivate: [companyAdminGuard], title: 'Locations | Job Click' },
{ path: 'company/departments',  component: DepartmentsComponent,         canActivate: [managerGuard],      title: 'Departments | Job Click' }, // managers may manage
{ path: 'company/verification', component: VerificationCenterComponent,  canActivate: [companyAdminGuard], title: 'Verification | Job Click' },
{ path: 'company/insights',     component: CompanyInsightsComponent,     canActivate: [managerGuard],      title: 'Company Insights | Job Click' }, // P2
{ path: 'company/audit-log',    component: AuditLogComponent,            canActivate: [companyAdminGuard], title: 'Audit Log | Job Click' },      // P3
{ path: 'team',                 component: TeamListComponent,            canActivate: [companyAdminGuard], title: 'Team | Job Click' },
{ path: 'subscription',         component: SubscriptionComponent,        canActivate: [companyAdminGuard], title: 'Subscription | Job Click' },   // P3
```

**Guard reuse** (already shipped in `@core/auth/guards`):
| Guard | Allows |
| --- | --- |
| `companyAdminGuard` | Company Admin only |
| `managerGuard` | Recruitment Manager + Company Admin (read/manage departments, view insights) |
| `employerGuard` | any employer role (parent route) |

> **Nav:** extend `layouts/employer-layout/employer-nav.ts` with an **admin-only "Company" group** — *Company profile · Locations · Departments · Verification · Team · Subscription*. Add an `adminOnly?: boolean` flag (mirrors the existing `managerOnly`), filtered in the layout against `EmployerContextStore.isCompanyAdmin()` / `isManager()`.

---

## 4. Feature folder structure

```text
features/employer/
├── company-admin/                     # the Company Admin area (this doc)
│   ├── models/                        # area-only view/form models (most live in @core/models)
│   ├── services/
│   │   ├── company.service.ts         # profile + locations + departments
│   │   ├── company-verification.service.ts
│   │   ├── team.service.ts            # members, invites, roles, transfer
│   │   ├── company-insights.service.ts# P2 (or reuse employer-analytics)
│   │   └── subscription.service.ts    # P3 (shared with doc 08)
│   ├── state/
│   │   └── company-context.store.ts   # company profile + plan + usage (signal store)
│   ├── components/                    # area-local presentational pieces
│   │   ├── location-form-dialog/
│   │   ├── department-form-dialog/
│   │   ├── invite-member-dialog/
│   │   ├── member-role-editor/        # permission matrix row editor
│   │   ├── transfer-ownership-dialog/
│   │   └── plan-usage-card/
│   └── pages/
│       ├── overview/                  # company-admin landing (CA1.0)
│       ├── profile/                   # CompanyProfileComponent
│       ├── locations/                 # CompanyLocationsComponent
│       ├── departments/               # DepartmentsComponent
│       ├── verification/              # VerificationCenterComponent
│       ├── team/                      # TeamListComponent
│       ├── insights/                  # CompanyInsightsComponent (P2)
│       ├── subscription/              # SubscriptionComponent (P3)
│       └── audit-log/                 # AuditLogComponent (P3)
```

> **Import note:** `CompanyProfileComponent` et al. are declared in `EmployerModule`. If extracted to a lazy `CompanyAdminModule` later, import `EmployerLayoutComponent` via a **relative path** (TS-993004), as done in Auth/Candidate/Recruiter.

---

## 5. Domain models (`@core/models`, ERD-derived)

### `company.model.ts`
```ts
export interface Company {                 // COMPANIES
  id: Id; companyCode: string; name: string; logoUrl?: string; website?: string;
  industry?: string; companySize?: CompanySize; description?: string;
  status: CompanyStatus; verified: boolean; createdAt: string; updatedAt?: string;
}
export interface CompanyProfileFormValue {
  name: string; website?: string; industry?: string; companySize?: CompanySize; description?: string;
}
export interface CompanyLocation {          // COMPANY_LOCATIONS
  id: Id; country: string; state?: string; city: string; address?: string;
  postalCode?: string; isHeadOffice: boolean;
}
export interface Department {               // DEPARTMENTS
  id: Id; name: string; description?: string; jobCount?: number;
}
export interface CompanyVerification {      // COMPANY_VERIFICATIONS
  id: Id; registrationNo?: string; taxNo?: string; website?: string; officialEmail?: string;
  status: VerificationStatus; submittedAt?: string; reviewedAt?: string; rejectionReason?: string;
  documents: VerificationDocument[];
}
export interface VerificationDocument { id: Id; label: string; fileName: string; fileUrl: string; uploadedAt: string; }
export interface VerificationFormValue {
  registrationNo: string; taxNo?: string; website?: string; officialEmail: string;
  documents: { label: string; fileName: string; fileUrl: string }[];
}
```

### `team.model.ts`
```ts
export interface TeamMember {               // USERS + USER_ROLES scoped by company_id
  userId: Id; fullName: string; email: string; avatarUrl?: string;
  role: RoleCode; status: MemberStatus; jobsOwned?: number; invitedAt?: string; joinedAt?: string;
}
export interface InviteRequest { email: string; role: RoleCode; }
export interface RoleChange { userId: Id; role: RoleCode; }
```

### `invitation.model.ts` (COMPANY_INVITATIONS — see §8.6a)
```ts
export interface Invitation {                // an email-keyed offer of a company membership
  id: Id; companyId: Id; companyName: string; email: string; role: RoleCode;
  token: string;                             // single-use, carried in the accept link
  status: InvitationStatus;                  // Pending | Accepted | Revoked | Expired
  invitedBy: Id; invitedByName: string;
  acceptedUserId?: Id; expiresAt: string; createdAt: string;
}
/** What the accept page resolves a token to (before the recipient acts). */
export interface InvitationPreview {
  companyName: string; role: RoleCode; email: string;
  needsAccount: boolean;                     // true → register-via-invite; false → add-role to existing
  valid: boolean; reason?: 'expired' | 'revoked' | 'accepted' | 'not_found';
}
```

### `subscription.model.ts` (P3 — shared with [doc 08](08_Subscription_and_Billing.md))
```ts
export interface SubscriptionPlan {         // SUBSCRIPTION_PLANS
  id: Id; name: string; price: number; currency: string;
  maxJobs: number; maxRecruiters: number; candidateSearch: boolean; features: string[];
}
export interface Subscription {             // SUBSCRIPTIONS
  id: Id; plan: SubscriptionPlan; status: SubscriptionStatus; startDate: string; endDate?: string;
}
export interface PlanUsage { jobsUsed: number; jobsLimit: number; recruitersUsed: number; recruitersLimit: number; }
```

> Reuse `Id`, `Paginated`, `ApiError` from `common.model`, and `RoleCode` / `EMPLOYER_ROLES` from `role-code.enum.ts`.

---

## 6. Enums (`@core/enums`)

Reuse `RoleCode`. New (add `*_LABELS` + `*_META { label; tone }` where a badge is shown, following `JOB_STATUS_META` / `OFFER_STATUS_META`):

| Enum | Values |
| --- | --- |
| `CompanyStatus` | `Active, Suspended, Closed` |
| `CompanySize` | `Solo (1), Small (2–10), Medium (11–50), Large (51–200), Enterprise (200+)` |
| `VerificationStatus` | `Unverified, Pending, Verified, Rejected` |
| `MemberStatus` | `Active, Invited, Deactivated` |
| `InvitationStatus` | `Pending, Accepted, Revoked, Expired` |
| `SubscriptionStatus` | `Active, Trialing, PastDue, Expired, Cancelled` (P3) |

> **Tone mapping** (for `app-status-badge`): Verified/Active → `success`; Pending/Invited/Trialing → `progress`/`info`; Rejected/PastDue → `danger`; Unverified/Deactivated/Expired → `neutral`.

---

## 7. Services & state

All services: `@Injectable({ providedIn: 'root' })`, mock branch gated on `environment.useMock` with **stateful** in-memory collections (mirror `JobService` / `TalentPoolService`), real branch via `ApiBaseService`. Endpoints per [API Contract](../06_API_Contract_Assumptions.md) (`/employer/company/*`, `/employer/team`, `/employer/subscription`).

```ts
// company.service.ts
getProfile(): Observable<Company>
updateProfile(value: CompanyProfileFormValue): Observable<Company>
uploadLogo(file: File): Observable<{ logoUrl: string }>           // mock returns a data/asset URL
listLocations(): Observable<CompanyLocation[]>
saveLocation(value, id?): Observable<CompanyLocation>;  removeLocation(id): Observable<void>
setHeadOffice(id): Observable<CompanyLocation[]>                  // exactly one head office
listDepartments(): Observable<Department[]>
saveDepartment(value, id?): Observable<Department>;  removeDepartment(id): Observable<void>

// company-verification.service.ts
get(): Observable<CompanyVerification>
submit(value: VerificationFormValue): Observable<CompanyVerification>   // → Pending
resubmit(value): Observable<CompanyVerification>                        // from Rejected → Pending

// team.service.ts
list(): Observable<TeamMember[]>
invite(req: InviteRequest): Observable<Invitation>                     // issues a token + Invited row (§8.6a)
resendInvite(userId): Observable<void>;  revokeInvite(userId): Observable<void>
inviteLink(userId): Observable<string>                                 // mock surrogate for the email link
changeRole(change: RoleChange): Observable<TeamMember>
setStatus(userId, status: MemberStatus): Observable<TeamMember>         // activate / deactivate
transferOwnership(userId): Observable<TeamMember[]>                     // new Company Admin; demotes current

// invitation.service.ts (token side — consumed by the Auth accept page)
getByToken(token): Observable<InvitationPreview>                       // resolve + validate (expiry/revoked)
acceptAsNewUser(token, { fullName, password }): Observable<AuthSession>// register-via-invite → USER + USER_ROLES
acceptAsCurrentUser(token): Observable<TeamMember>                     // add USER_ROLES to the signed-in account

// subscription.service.ts (P3)
current(): Observable<Subscription>;  usage(): Observable<PlanUsage>;  plans(): Observable<SubscriptionPlan[]>

// company-insights.service.ts (P2) — or reuse EmployerAnalyticsService company-wide
load(): Observable<RecruitmentAnalytics>
```

**State — `CompanyContextStore` (signal store):** loads `company` (profile), `verification` status, `subscription`/`plan`, and derived **usage signals** (`jobsRemaining`, `recruitersRemaining`, `atJobLimit`, `atRecruiterLimit`). The recruiter `planLimitGuard` and "Create job" CTA read these (replacing the stub). Provides `verifiedBadge` for the shell header. Hydrated once on entering the company area; `EmployerContextStore` keeps the role/permission helpers.

---

## 8. Sub-feature specs

### 8.0 Company-admin overview (`OverviewComponent`) — P1
Route `/employer/company`. Admin landing: company identity card (logo, name, verified badge), quick stats (members, departments, locations, plan usage `8/20 jobs`), and a checklist of org-setup tasks (profile complete · verification submitted · ≥1 location · team invited). Cards deep-link into each area. Skeleton/empty/error.

### 8.1 Company profile (`CompanyProfileComponent`) — P1
Route `/employer/company/profile`. Reactive form: name, website, industry (select), company size (select), description (textarea). **Logo uploader** via the shared `app-file-upload` → `uploadLogo` (mock returns an asset URL; preview immediately). Read-only `companyCode` + created date. Save → `updateProfile` + toast; dirty-guard prompt on navigate-away.

### 8.2 Locations (`CompanyLocationsComponent` + `LocationFormDialog`) — P1
Route `/employer/company/locations`. List of offices (city, country, address, **Head office** badge). Add/Edit via `LocationFormDialog` (country, state, city, address, postal code, head-office toggle). Delete with `ConfirmService`. **Exactly one head office** — setting one clears the others (`setHeadOffice`). Empty-state CTA when none.

### 8.3 Departments (`DepartmentsComponent` + `DepartmentFormDialog`) — P1
Route `/employer/company/departments`. List with name, description, **job count**. Add/Edit/Delete (dialog + confirm). **Block delete** when `jobCount > 0` (toast: reassign jobs first). Departments populate the **job wizard's department field** (Recruiter R1.2).

### 8.4 Verification center (`VerificationCenterComponent`) — P1
Route `/employer/company/verification`. Shows current `VerificationStatus` (badge + timeline: Submitted → Under review → Verified/Rejected). If `Unverified`/`Rejected`: a submit form (registration no., tax no., official email, website + **document uploads** via `app-file-upload`). On submit → `Pending` (read-only until reviewed). On `Rejected`, show the reason + allow **resubmit**. Platform Admin performs the actual review ([doc 05](05_Platform_Admin.md)); this side is submit + track.

### 8.5 Team list (`TeamListComponent`) — P1
Route `/employer/team`. Table/cards of members: avatar+name, email, **role chip**, **status badge** (`Active/Invited/Deactivated`), jobs owned. Row actions (admin): change role, deactivate/reactivate, resend/revoke invite, transfer ownership. **"Invite member"** → `InviteMemberDialog` (email + role) → `Invited` row. Filter by role/status; search.

### 8.6 Permissions & ownership (`MemberRoleEditor`, `TransferOwnershipDialog`) — P1
A read-only **permission matrix** (roles × capability: manage jobs / approve jobs / manage team / billing / view reports) documents what each role can do. `MemberRoleEditor` changes a member's company role (`changeRole`). `TransferOwnershipDialog` reassigns Company Admin to another member (confirm + warning; ideally re-auth) — the current admin becomes Recruitment Manager.

### 8.6a Member invitations & acceptance (cross-module) — P1

> **Concept.** Inviting a recruiter is **not** "creating a recruiter account." Identity and membership are separate: an **account (`USERS`)** is one human/email; a **membership (`USER_ROLES`, scoped by `company_id`)** is "this user has role X at company Y." One person can hold many memberships at once — e.g. a Candidate *and* a Recruiter at Greenline. So an invite **grants a membership to whoever owns an email**, creating the account only if one doesn't exist.

**The invitation object** (`COMPANY_INVITATIONS`, new ERD table) is **keyed by email**, not by account: `{ email, companyId, role, token, status, invitedBy, expiresAt }`. `TeamService.invite` issues it (→ an `Invited` row on the team list **and** a `Pending` invitation with a single-use `token`). The recipient hears about it via:
1. **Email** with a magic link → `…/invite/accept?token=<token>` (the universal channel — works with no account; guard-free top-level route).
2. *(Optional)* an **in-app notification** if they already have an account ([Messaging & Notifications](07_Messaging_and_Notifications.md)).
Receiving the link *is* the email-ownership proof (only the inbox owner can open it).

**The accept page (`/invite/accept` — a guard-free top-level `InviteModule`; see [Auth §8](01_Auth_and_Onboarding.md))** resolves the token via `InvitationService.getByToken` → `InvitationPreview { companyName, role, email, needsAccount, valid }`, then branches:

| Recipient state | Accept does | Result |
| --- | --- | --- |
| **No account** | inline register (name + password); **email locked** to the invite | create `USER` + `USER_ROLES{ role, company }` → employer workspace |
| **Has an account (e.g. a Candidate)** | sign in (email must match) → one-click accept | **add** `USER_ROLES{ role, company }` to the existing account — keeps their candidate profile; gains the employer hat |
| **Already on this company** | no-op | "You're already on the team." (`invite` already rejects duplicate emails) |

**Multi-role ⇒ workspace switcher.** Once a user holds e.g. `[Candidate, Recruiter]`, `defaultRouteForRoles` (which picks one landing route) is no longer enough — the app shell needs a **"Switch workspace" control** (Candidate ↔ Employer) in the header. Small shell addition; it's what makes multi-role coherent. The candidate's job-seeking profile is never merged into or replaced by the employer role.

**Lifecycle & security:** `Pending → Accepted | Revoked | Expired` (TTL e.g. 7 days). Token is **single-use + expiring + bound to the exact email**. Resend = new token + reset expiry; Revoke = invalidate. Last-admin/plan-limit rules still apply at issue time (§11).

**Mock/demo (no real email):** `invite()` returns the **token + accept link**; the team list exposes a **"Copy invite link"** action on `Invited` rows (stands in for the email). Seed a demo where the existing candidate accepts a Greenline recruiter invite → becomes `[Candidate, Recruiter]` and gets the switcher.

> **Slice:** built as **CA1.6** (§13) — spans Company Admin (issue/lifecycle/token + copy-link) and Auth (accept page + register-via-invite + add-role + switcher).

### 8.7 Company analytics (`CompanyInsightsComponent`) — P2
Route `/employer/company/insights` (manager/admin). **Company-wide** hiring insight — reuses the Recruiter R2.4 visualisations (KPI strip, hiring funnel, applications-by-job, recruiter performance) but scoped to the whole company across all recruiters. Reuse `EmployerAnalyticsService` (or a thin `CompanyInsightsService`). Lightweight CSS charts (no chart lib), per R2.4.

### 8.8 Subscription & plan (`SubscriptionComponent` + `PlanUsageCard`) — P3
Route `/employer/subscription`. Current plan card (name, price, renewal date, status badge), **usage vs limits** bars (`jobsUsed/jobsLimit`, `recruitersUsed/recruitersLimit`), feature list, and a plan-comparison grid with an **Upgrade** CTA. Read-only entry point; checkout/payment lives in [Subscription & Billing](08_Subscription_and_Billing.md).

### 8.9 Audit log (`AuditLogComponent`) — P3 · Could
Route `/employer/company/audit-log`. Paginated `AUDIT_LOGS` for the company (who changed what, when) — profile edits, role changes, invites, verification submissions. Filter by actor/entity/date. Read-only.

---

## 9. Components consumed vs new

**Reuse (already shipped):** `app-page-header`, `app-kpi-card`, `app-empty-state`, `app-error-state`, `app-skeleton`, `app-pagination`, `app-confirm-dialog` + `ConfirmService`, `ToastService`, `app-status-badge` (role/verification/member status), `app-file-upload` (logo + verification docs), `app-logo`, `app-user-avatar-name` (if built), and the `EmployerLayoutComponent` shell + `EmployerContextStore`.

**New area-local:** `OverviewComponent`, `CompanyProfileComponent`, `CompanyLocationsComponent` + `LocationFormDialog`, `DepartmentsComponent` + `DepartmentFormDialog`, `VerificationCenterComponent`, `TeamListComponent` + `InviteMemberDialog` + `MemberRoleEditor` + `TransferOwnershipDialog`, `CompanyInsightsComponent` (P2), `SubscriptionComponent` + `PlanUsageCard` (P3), `AuditLogComponent` (P3).

**CA1.6 (cross-module):** `AcceptInvitationPageComponent` (in [Auth](01_Auth_and_Onboarding.md)) + a **workspace switcher** in the employer/candidate shell headers; `InvitationService` (token side).

> No new Material modules expected (forms, dialog, chips, table/list, slide-toggle, menu, tooltip already in `MaterialModule`).

---

## 10. Mock data requirements

Scope to the demo company **10 — Greenline Technologies**; cross-resolve IDs with the Recruiter mocks so team members own the existing jobs.

- **Company:** Greenline Technologies — logo, website, industry *Information Technology*, size *Medium (11–50)*, description; `status: Active`, `verified: true`.
- **Locations:** ~3 — Yangon HQ (`isHeadOffice`), Mandalay branch, Remote/Distributed.
- **Departments:** Engineering, Design, Product, Data & Analytics, Quality Assurance (with `jobCount` resolving to the Recruiter mock jobs).
- **Verification:** one `CompanyVerification` (status `Verified`, with two documents) — plus a way to demo `Pending`/`Rejected` resubmit.
- **Team:** `company.admin@jobclick.dev` (Company Admin), `Kyaw Zin Latt` (Recruiter, id 2), `Thiri Aung` (Recruitment Manager, id 5), + 1 Hiring Manager and 1 `Invited` member.
- **Invitations (CA1.6):** one `Pending` invitation (the `Invited` member above) with a resolvable `token`; a seeded scenario where the demo **candidate** (`candidate@jobclick.dev`) accepts a Greenline **Recruiter** invite → ends up `[Candidate, Recruiter]` (demonstrates the workspace switcher). No real email — the accept link is surfaced via "Copy invite link".
- **Subscription (P3):** *Pro* plan — `maxJobs 20`, `maxRecruiters 5`, `candidateSearch true`; usage `8/20` jobs, `3/5` recruiters; status `Active`.

All IDs cross-resolve; stateful services so profile edits / invites / role changes / verification submit persist within the session. Demo password `Password123!`.

---

## 11. Business rules & status flows

- **Roles & permissions** (company-scoped via `USER_ROLES.company_id`):
  | Capability | Company Admin | Recruitment Manager | Recruiter | Hiring Manager |
  | --- | :---: | :---: | :---: | :---: |
  | Company profile / locations / verification | ✅ | — | — | — |
  | Departments | ✅ | ✅ | — | — |
  | Team & roles / transfer ownership | ✅ | — | — | — |
  | Subscription & billing | ✅ | — | — | — |
  | Manage jobs / pipeline | ✅ | ✅ | ✅ (assigned) | review only |
  | Approve jobs | ✅ | ✅ | — | — |
  | View company insights | ✅ | ✅ | — | — |
- **Last-admin guard:** the only Company Admin cannot be deactivated, demoted, or have their invite revoked — they must **transfer ownership** first. Enforced server-side; mirrored in the UI (disabled actions + tooltip).
- **Self-guard:** an admin cannot deactivate or demote *themselves* while sole admin; transfer first.
- **Verification flow** (`§8`): `Unverified → submit → Pending → (Platform Admin) → Verified | Rejected → resubmit → Pending`. `verified` drives the company badge shown to candidates.
- **Head office:** exactly one location has `isHeadOffice = true`.
- **Plan limits** (`max_jobs`, `max_recruiters`): `CompanyContextStore` exposes usage; the recruiter **`planLimitGuard`** + "Create job" CTA and the team **Invite** action check remaining quota → show an upgrade prompt instead of blocking silently.
- **Department delete** blocked while it owns jobs.
- **Invitations** (§8.6a): keyed by **email** (not account). Token is **single-use, expiring (≈7 days), email-bound**. Accept never creates a duplicate account — it **adds a `USER_ROLES` membership** to an existing account, or registers a new one with the email locked. A user may legitimately be **both** a Candidate and an employer member; roles/workspaces layer on one identity. Re-inviting an existing member is rejected; the seat counts against `max_recruiters` at issue time.

---

## 12. Accessibility & responsive

- All forms keyboard-navigable with `mat-error`; visible focus (global); dialogs trap focus and restore on close.
- Tables (team, audit log) → cards on mobile; permission matrix scrolls horizontally with a sticky first column.
- Status conveyed by **text + tone** (not color alone); badges have labels.
- Skeleton loaders for every async view; empty + error states everywhere; destructive actions confirm via `ConfirmService` and roll back optimistic UI on error with a toast.
- Responsive ≥ 360px.

---

## 13. Phased build plan (sequenced slices)

Vertical slices, each build-verified before the next (same cadence as Candidate `C1.x` / Recruiter `R1.x`). IDs map to phases (P1 = `CA1.x`, P2 = `CA2.x`, P3 = `CA3.x`).

### 13.1 Sequence & dependencies

```text
CA1.0 Area shell + context store ─► CA1.1 Profile ─► CA1.2 Locations ─► CA1.3 Departments
                                                                              │
                                              CA1.4 Verification ◄────────────┘
                                                       │
                                              CA1.5 Team + permissions + transfer
                                                       │
                                              CA1.6 Invitation acceptance + workspace switcher   (P1 complete)
P2:  CA2.0 Company insights
P3:  CA3.0 Subscription & plan usage ─► CA3.1 Audit log
```

| Slice | Goal | Depends on | Size |
| --- | --- | --- | :---: |
| **CA1.0** ✅ | Company-admin area: nav group, routes, `companyAdminGuard` wiring, `CompanyContextStore`, overview (walking skeleton) | Recruiter shell | S |
| **CA1.1** ✅ | Company profile view + edit + logo upload | CA1.0 | M |
| **CA1.2** ✅ | Locations CRUD (+ single head office) | CA1.0 | S |
| **CA1.3** ✅ | Departments CRUD (+ job-count guard) | CA1.0 | S |
| **CA1.4** ✅ | Verification center (submit + track + resubmit) | CA1.0 | M |
| **CA1.5** ✅ | Team list + invite + role edit + status + transfer ownership + permission matrix | CA1.0 | L |
| **CA1.6** ✅ | Invitation token/lifecycle + accept page (register-via-invite / add-role) + workspace switcher | CA1.5, Auth | M |
| **CA2.0** ✅ | Company analytics (admin, company-wide) | R2.4, CA1.0 | S |
| **CA3.0** ✅ | Subscription & plan usage (entry) | CA1.0, doc 08 | M |
| **CA3.1** | Audit log viewer | CA1.0 | S |

---

### Phase 1 — Organization foundation

#### CA1.0 — Area shell & context ✅ Done *(walking skeleton)*
- [x] Admin-only **Company + Team nav items** (`adminOnly` flag in `employer-nav.ts`, filtered by `isCompanyAdmin`)
- [x] `company` (= `OverviewComponent`) + `company/*` (profile/locations/departments/verification) + `team` + `subscription` routes, guarded (`companyAdminGuard`/`managerGuard`); deeper screens are coming-soon placeholders until CA1.1+
- [x] `CompanyContextStore` (signal store): loads company + plan + usage via `CompanyService.getOverview()`; exposes `isVerified`, `jobsRemaining`, `recruitersRemaining`, `atJobLimit`, `atRecruiterLimit`
- [x] `OverviewComponent` (identity card + verified/status badges + KPI stats + setup checklist + manage-areas list); enums (`CompanyStatus`, `CompanySize`, `VerificationStatus`, `MemberStatus`, `SubscriptionStatus`) + `@core/models` (`company`, `team`, `subscription`)
- **Exit:** sign in as `company.admin@jobclick.dev` → Company/Team nav visible & role-gated; overview renders from mock; build green. ✅

#### CA1.1 — Company profile ✅ Done
- [x] `CompanyService.updateProfile/uploadLogo` (stateful mock; logo read to a data URL); `CompanyProfileComponent` (reactive form: name/website/industry/size/description + `app-file-upload` logo with live preview + read-only code/created)
- [x] **Dirty guard** — `unsavedChangesGuard` (`CanDeactivate`) prompts via `ConfirmService` on navigate-away; save marks the form pristine; `CompanyContextStore.reload()` refreshes the overview/shell
- **Exit:** edit + save profile against mock; logo preview persists; unsaved-changes prompt works; build green. ✅

#### CA1.2 — Locations ✅ Done
- [x] `CompanyService.listLocations/saveLocation/removeLocation/setHeadOffice` (stateful mock); `CompanyLocationsComponent` (list + row menu) + `LocationFormDialogComponent` (add/edit); confirm-delete
- [x] **Single head-office invariant** — saving/setting one clears the others; deleting the head office promotes another; the only location is locked as head office; overview `locations` count is computed live
- **Exit:** add/edit/delete locations; exactly one head office maintained; build green. ✅

#### CA1.3 — Departments ✅ Done
- [x] `CompanyService.listDepartments/saveDepartment/removeDepartment` (stateful mock; live overview count); `DepartmentsComponent` (list + job-count chip) + `DepartmentFormDialogComponent`
- [x] **Delete blocked when `jobCount > 0`** — disabled menu item + toast + server-side 409 guard
- [x] **Feeds the job wizard** — `JobWizardComponent` loads department names from `CompanyService.listDepartments()` (was a hardcoded array)
- **Exit:** department CRUD against mock; feeds the job wizard's department list; delete-block holds; build green. ✅

#### CA1.4 — Verification center ✅ Done
- [x] `CompanyVerificationService.get/submit/resubmit` (delegates to `CompanyService` → single source of truth so the overview/shell badge stays in sync); verification state added to `CompanyService`
- [x] `VerificationCenterComponent` — status badge + **3-step timeline** (Submitted → Under review → Verified/Rejected); submit form (registration/tax no., official email, website) + **document uploads** via `app-file-upload`; rejection-reason banner + **resubmit** (prefilled); Pending/Verified read-only states
- [x] Seed flipped to **Unverified** (`company.verified=false`) so the submit→pending flow is demoable
- **Exit:** submit → Pending; rejected → resubmit; status badge + overview reflect state; build green. ✅

#### CA1.5 — Team & permissions ✅ Done
- [x] `TeamService` (list/invite/resend/revoke/changeRole/setStatus/transferOwnership); `TeamListComponent` (filters by role/status + search) + `InviteMemberDialog` + `TransferOwnershipDialog` (type-to-confirm); role change via row sub-menu; read-only **permission matrix** (roles × capability)
- [x] **Last-admin invariant** enforced server-side (409) + mirrored in UI (disabled change-role/deactivate/revoke on the sole admin); self marked as "You"; transfer ownership demotes the current admin to Recruitment Manager
- **Exit:** invite, change role, deactivate/reactivate, transfer ownership against mock; last-admin protected; build green. ✅

#### CA1.6 — Invitation acceptance & onboarding ✅ Done *(cross-module: Company Admin + Auth + shell)*
- [x] **Model/ERD:** `Invitation` (`COMPANY_INVITATIONS`) + `InvitationStatus`; core `InvitationService` (single source of truth); `TeamService.invite` issues a single-use `token`, `inviteLink` → **"Copy invite link"** on `Invited` rows (email surrogate); resend rotates the token, revoke invalidates; `list()` flips `Invited → Active` once an invite is accepted
- [x] **Accept page** at a **guard-free top-level `/invite/accept?token=…`** (its own lazy `InviteModule` — `/auth/*` is guest-guarded, so it couldn't live there). `InvitationService.getByToken` → `InvitationPreview`; branches: **no account →** register-via-invite (email locked) → `AuthService.acceptInviteAsNewUser` (`USER` + role); **signed-in + same email →** one-click `acceptAsCurrentUser` → `AuthService.addMembership` (adds `USER_ROLES`, keeps the profile); **signed-in + different email →** mismatch; **signed-out + has account →** sign-in prompt; invalid/expired/revoked/accepted terminal states
- [x] **Multi-role workspace switcher** in both shell headers (employer "Switch to candidate" / candidate "Switch to employer"), shown when the user holds the other workspace's role
- [x] Mock: seed `candidate@jobclick.dev` as a `Pending` Greenline Recruiter invite → accepting makes them `[Candidate, Recruiter]`
- **Exit:** copy an invite link → accept as a new user *and* as the signed-in candidate (adds the role, keeps the candidate profile); switch workspaces; build green. ✅ **→ Company Admin P1 complete.**

---

### Phase 2 — Insight
- **CA2.0 Company analytics** ✅ — admin/manager company-wide funnel + time-to-hire + recruiter performance. Extracted a shared **`app-analytics-view`** (KPI strip + funnel + applications-by-job + recruiter table) reused by both the recruiter analytics page (R2.4) and the new `CompanyInsightsComponent`; reuses `EmployerAnalyticsService`. Route `/employer/company/insights` (manager/admin); linked from the overview "Manage" list.

### Phase 3 — Commerce & governance
- **CA3.0 Subscription & plan usage** ✅ — `SubscriptionService` (current/usage/plans) + `SubscriptionComponent`: current-plan card (price, status badge, renewal, features), `PlanUsageCardComponent` (usage-vs-limit bars with near/full warnings), and a **plan-comparison grid** (Free/Pro/Enterprise) with current-plan marker + Upgrade/Switch CTAs. Read-only entry point — checkout toasts "coming soon" (full billing → [doc 08](08_Subscription_and_Billing.md)). Route `/employer/subscription`.
- **CA3.1 Audit log** — paginated company audit trail (read-only).

---

## 14. Definition of done (per screen)

- Routed under `EmployerModule` (company-admin area); `employerGuard` + `companyAdminGuard`/`managerGuard` gate.
- Data only via feature service → mock/`of()`; **no hardcoded data in components**; stateful mocks persist within session.
- Typed models, no `any`; reactive forms with validation; permission checks via `EmployerContextStore`/`CompanyContextStore` + guards (defense-in-depth).
- Loading (skeleton) / empty / error states present; dialogs confirm destructive actions.
- Optimistic actions roll back on error; toasts on success/failure.
- Responsive ≥ 360px; keyboard accessible.

---

## 15. Dependencies & build order

**Depends on:** Auth (current user, `employerGuard`, `companyAdminGuard`), the shipped **Recruiter shell** (`EmployerLayoutComponent`, `EmployerContextStore`, nav), shared design-system components, `@core` http/models/enums. [Subscription & Billing](08_Subscription_and_Billing.md) for CA3.x; [Platform Admin](05_Platform_Admin.md) performs verification review.
**Feeds:** the **Recruiter** workspace — departments populate the job wizard; locations feed job `location`; team membership + roles drive job ownership/approval scoping; plan limits gate "Create job"/invite; the verified badge surfaces to candidates.

**Suggested order:** area shell + context → profile → locations → departments → verification → team & permissions → (P2) company insights → (P3) subscription → audit log.

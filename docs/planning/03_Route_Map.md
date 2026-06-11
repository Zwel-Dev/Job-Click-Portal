# 03 — Route Map

> Full routing tree with lazy boundaries, guards, and phases. Mirrors the [Sitemap](01_Application_Sitemap.md).
> Guard definitions live in the [Auth module](02_Module_Breakdown/01_Auth_and_Onboarding.md).

---

## 1. Root routing (`app-routing.module.ts`)

> **Action required:** the current root route points at the deleted `pages/systematic/modules/auth/auth.module`. Replace with the structure below.

```ts
const routes: Routes = [
  { path: '', loadChildren: () => import('./features/public/public.module').then(m => m.PublicModule) },
  { path: 'auth', canActivate: [guestGuard],
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule) },

  { path: 'candidate', canActivate: [authGuard, candidateGuard],
    loadChildren: () => import('./features/candidate/candidate.module').then(m => m.CandidateModule) },

  { path: 'employer', canActivate: [authGuard, employerGuard],
    loadChildren: () => import('./features/employer/employer.module').then(m => m.EmployerModule) },

  { path: 'admin', canActivate: [authGuard, adminGuard],
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule) },

  { path: '403', component: ForbiddenComponent },
  { path: '**', component: NotFoundComponent },
];
```

---

## 2. Public (`/`) — `PublicModule`  · guard: none

| Path | Screen | Phase |
| --- | --- | --- |
| `` | Landing | P1 |
| `jobs` | Public job search | P1 |
| `jobs/:id` | Public job detail | P1 |
| `companies/:slug` | Public company profile | P1 |
| `pricing` | Pricing/plans | P3 |
| `about`, `contact`, `legal/:doc` | Static | P1 |

---

## 3. Auth (`/auth`) — `AuthModule` · guard: `guestGuard`

| Path | Screen | Phase |
| --- | --- | --- |
| `login` | Login | P1 |
| `register` | Candidate sign up | P1 |
| `register-company` | Company sign up | P1 |
| `verify-email` | Email verification | P1 |
| `verify-phone` | Phone verification | P1 |
| `forgot-password` | Forgot password | P1 |
| `reset-password` | Reset password | P1 |

---

## 4. Candidate (`/candidate`) — `CandidateModule` · guard: `authGuard + candidateGuard`

| Path | Screen | Phase |
| --- | --- | --- |
| `dashboard` | Dashboard | P1 |
| `profile` | Profile shell | P1 |
| `profile/:section` | Profile section (personal/summary/preferences/experience/education/skills/certifications/portfolio) | P1 |
| `resumes` | Resume manager | P1 |
| `jobs` | Job search | P1 |
| `jobs/:id` | Job detail + apply | P1 |
| `saved-jobs` | Saved jobs | P1 |
| `recommendations` | Recommendations | P2 |
| `applications` | Applications list | P1 |
| `applications/:id` | Application detail/tracker | P1 |
| `interviews` | Interviews | P2 |
| `messages` | Messaging | P2 |
| `messages/:conversationId` | Thread | P2 |
| `notifications` | Notifications | P2 |
| `settings` | Account settings | P1 |
| `` (default) | redirect → `dashboard` | P1 |

---

## 5. Employer (`/employer`) — `EmployerModule` · guard: `authGuard + employerGuard`

Per-feature guards in parentheses.

| Path | Screen | Phase | Extra guard |
| --- | --- | --- | --- |
| `dashboard` | Dashboard | P1 | — |
| `company/profile` | Company profile | P1 | `companyAdminGuard` |
| `company/locations` | Locations | P1 | `companyAdminGuard` |
| `company/departments` | Departments | P1 | admin/manager |
| `company/verification` | Verification center | P1 | `companyAdminGuard` |
| `team` | Team & permissions | P1 | `companyAdminGuard` |
| `jobs` | Job list | P1 | — |
| `jobs/new` | Create job wizard | P1 | `recruiterGuard` + `planLimitGuard` |
| `jobs/:id` | Job detail | P1 | — |
| `jobs/:id/edit` | Edit job wizard | P1 | `recruiterGuard` |
| `jobs/:id/applicants` | Pipeline (Kanban) | P1 | recruiter/HM |
| `approvals` | Approval queue | P1 | manager/admin |
| `applications/:id` | Applicant detail | P1 | recruiter/HM |
| `candidates` | Candidate search | P2 | `recruiterGuard` |
| `talent-pools` | Talent pools | P2 | `recruiterGuard` |
| `talent-pools/:id` | Pool detail | P2 | `recruiterGuard` |
| `interviews` | Interviews | P2 | recruiter/HM |
| `offers` | Offers | P1 | recruiter/admin |
| `analytics` | Analytics | P2 | manager/admin |
| `subscription` | Subscription overview | P3 | `companyAdminGuard` |
| `subscription/plans` | Change plan | P3 | `companyAdminGuard` |
| `subscription/payment-methods` | Payment methods | P3 | `companyAdminGuard` |
| `subscription/invoices` | Invoices | P3 | `companyAdminGuard` |
| `messages`, `messages/:conversationId` | Messaging | P2 | — |
| `notifications` | Notifications | P2 | — |
| `settings` | Settings | P1 | — |
| `` (default) | redirect → `dashboard` | P1 | — |

---

## 6. Platform Admin (`/admin`) — `AdminModule` · guard: `authGuard + adminGuard`

| Path | Screen | Phase |
| --- | --- | --- |
| `dashboard` | Dashboard | P1 |
| `users` | User management | P1 |
| `users/:id` | User detail | P1 |
| `companies` | Company management | P1 |
| `companies/:id` | Company detail | P1 |
| `verifications` | Verification queue | P1 |
| `jobs` | Job moderation | P2 |
| `fraud` | Fraud detection | P2 |
| `subscriptions` | Subscription oversight | P3 |
| `analytics` | System analytics | P2 |
| `audit-logs` | Audit & activity logs | P2 |
| `settings` | Platform settings | P2 |
| `` (default) | redirect → `dashboard` | P1 |

---

## 7. Guard summary

| Guard | Allows | Used by |
| --- | --- | --- |
| `guestGuard` | not logged in | `/auth/*` |
| `authGuard` | any logged-in user | all private workspaces |
| `candidateGuard` | role = Candidate | `/candidate/*` |
| `employerGuard` | any company role | `/employer/*` |
| `companyAdminGuard` | Company Admin (some allow Recruitment Manager) | company/team/billing |
| `recruiterGuard` | Recruiter+ | job create/edit, search, pools |
| `adminGuard` | Platform Admin | `/admin/*` |
| `planLimitGuard` | within plan quota | job create, recruiter invite |

> All routes use `scrollPositionRestoration: 'top'` (already set in the current root config) and lazy-load at the workspace boundary. Nested feature modules (e.g. candidate profile, employer jobs) may sub-lazy-load in later phases if bundle budgets require it.

# Module: Company Admin

**Workspace:** Employer · **Route prefix:** `/employer/company`, `/employer/team`, `/employer/subscription`
**Guard:** `employerGuard` + `companyAdminGuard` (role = Company Admin; some areas allow Recruitment Manager)
**Angular module:** part of `EmployerModule`, in a `company-admin` feature area.

---

## 1. Scope

Organization-level administration: company profile, locations, departments, verification, team & permissions, job-approval policy, and subscription/billing entry point.

---

## 2. Sub-features, screens & components

| Sub-feature | Route | Phase | Key components |
| --- | --- | --- | --- |
| Company Profile | `/employer/company/profile` | P1 | `CompanyProfileFormComponent`, logo uploader |
| Locations | `/employer/company/locations` | P1 | `CompanyLocationListComponent`, `LocationFormDialog`, head-office flag |
| Departments | `/employer/company/departments` | P1 | `DepartmentListComponent`, `DepartmentFormDialog` |
| Verification Center | `/employer/company/verification` | P1 | `VerificationCenterComponent`, doc upload, status timeline |
| Team & Permissions | `/employer/team` | P1 | `TeamListComponent`, `InviteMemberDialog`, `MemberRoleEditor`, `TransferOwnershipDialog` |
| Company Analytics | `/employer/analytics` (admin view) | P2 | `CompanyAnalyticsComponent` (time-to-hire, cost-per-hire, funnel, recruiter performance) |
| Subscription & Billing | `/employer/subscription` | P3 | see [Subscription & Billing](08_Subscription_and_Billing.md) |

---

## 3. Services / State

- `CompanyService` (profile, locations, departments)
- `CompanyVerificationService`
- `TeamService` (members, roles, invites, transfer)
- `CompanyAnalyticsService`
- Reuses `SubscriptionService` (P3).

## 4. Entities used

`COMPANIES`, `COMPANY_LOCATIONS`, `COMPANY_VERIFICATIONS`, `DEPARTMENTS`, `USERS`, `ROLES`, `USER_ROLES` (team membership scoped by `company_id`), `SUBSCRIPTIONS`/`SUBSCRIPTION_PLANS` (badge/entry, P3).

## 5. Key flows / business rules

- **Team roles** (`§7`): Company Admin (full), Recruitment Manager (recruiter mgmt + reporting), Recruiter (recruitment activities), Hiring Manager (candidate review). UI shows a permission matrix; assignment writes `USER_ROLES` with `company_id`.
- **Verification** (`§8`): submit Business Registration, Tax Registration, Website, Official Email → status `pending/verified/rejected`. Platform Admin reviews (see [Platform Admin](05_Platform_Admin.md)); company side is read + resubmit.
- **Transfer ownership** reassigns the Company Admin role; requires confirmation + (ideally) re-auth.
- **Plan limits** (`max_jobs`, `max_recruiters`) gate actions in Recruiter/Team features.

---

## 6. Backlog by phase

### Phase 1
- [ ] Company profile CRUD + logo
- [ ] Locations + departments CRUD
- [ ] Verification center (submit + track)
- [ ] Team list, invite, role edit, deactivate, transfer ownership
- [ ] Permission matrix + plan-limit guards

### Phase 2
- [ ] Company analytics dashboards

### Phase 3
- [ ] Subscription & billing management (full)
- [ ] Enterprise team controls (API access, advanced reporting)

## 7. Dependencies
Auth, Recruiter module (consumes company/department/team data), Subscription & Billing (P3).

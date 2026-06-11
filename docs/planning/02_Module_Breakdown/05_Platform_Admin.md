# Module: Platform Admin

**Workspace:** Platform Admin · **Route prefix:** `/admin` · **Guard:** `adminGuard`
**Angular module:** `AdminModule` (lazy)

---

## 1. Scope

System-wide operations: manage users & companies, run verification, moderate jobs, detect fraud, oversee subscriptions, view platform analytics, and audit activity.

---

## 2. Sub-features, screens & components

| Sub-feature | Route | Phase | Key components |
| --- | --- | --- | --- |
| Dashboard | `/admin/dashboard` | P1 | `AdminDashboardComponent`, system KPI cards |
| User Management | `/admin/users` | P1 | `UserManagementComponent`, `UserDetailDrawer`, suspend/reset actions |
| Company Management | `/admin/companies` | P1 | `CompanyManagementComponent`, `CompanyDetailComponent` |
| Verification Queue | `/admin/verifications` | P1 | `VerificationQueueComponent`, `VerificationReviewPanel` (approve/reject) |
| Job Moderation | `/admin/jobs` | P2 | `JobModerationComponent`, flag/remove, duplicate detection |
| Fraud Detection | `/admin/fraud` | P2 | `FraudDashboardComponent`, signal cards (fake companies, dup jobs, spam apps, scams) |
| Subscription Oversight | `/admin/subscriptions` | P3 | `SubscriptionOversightComponent` |
| System Analytics | `/admin/analytics` | P2 | `SystemAnalyticsComponent` |
| Audit & Activity Logs | `/admin/audit-logs` | P2 | `AuditLogComponent`, filter by entity/action/actor/time |
| Platform Settings | `/admin/settings` | P2 | `PlatformSettingsComponent` (roles, skills taxonomy, plans, feature flags) |

---

## 3. Services / State

- `AdminUserService`, `AdminCompanyService`
- `VerificationReviewService`
- `JobModerationService`
- `FraudService`
- `AdminSubscriptionService` (P3)
- `SystemAnalyticsService`
- `AuditLogService`
- `PlatformSettingsService` (roles, skills, plans, flags)

## 4. Entities used

`USERS`, `ROLES`, `USER_ROLES`, `COMPANIES`, `COMPANY_VERIFICATIONS`, `JOBS`, `APPLICATIONS`, `SUBSCRIPTIONS`, `SUBSCRIPTION_PLANS`, `PAYMENTS`, `AUDIT_LOGS`, `SKILLS`, `SKILL_ALIASES`, `RECOMMENDATION_LOGS` (analytics).

## 5. Key flows / business rules

- **Company verification review** (`§8`): inspect Business Registration, Tax, Website, Official Email → set `COMPANY_VERIFICATIONS.verification_status` + stamp `verified_by`/`verified_at`; toggles `COMPANIES.verified`.
- **Fraud signals** (`§8`): surfaced as flagged lists with severity; actions = warn/suspend/remove.
- **Audit log** (`AUDIT_LOGS`): every admin mutating action writes entity_type/entity_id/action/old/new — UI is read-only with rich filters.
- **Skills taxonomy** maintained here feeds candidate/job skill pickers and the matching engine.

---

## 6. Backlog by phase

### Phase 1
- [ ] Admin shell + dashboard KPIs
- [ ] User management (search/suspend/reset)
- [ ] Company management + detail
- [ ] Verification queue + review/approve/reject

### Phase 2
- [ ] Job moderation + duplicate detection
- [ ] Fraud detection dashboard
- [ ] System analytics
- [ ] Audit & activity logs
- [ ] Platform settings (roles, skills, plans, flags)

### Phase 3
- [ ] Subscription oversight + payments

## 7. Dependencies
Auth. Reads data produced by all other modules; verification unblocks employer onboarding.

# Module: Subscription & Billing

**Workspace:** Employer (Company Admin) + Public pricing + Admin oversight. **Primary phase:** Phase 3.
**Angular module:** `BillingModule` (lazy, mounted under Employer); pricing page is public.

> Phase 1 ships only a **read-only plan badge** and plan-limit enforcement (`max_jobs`, `max_recruiters`). Full billing UI is Phase 3.

---

## 1. Scope

Plan selection, subscription lifecycle, payments, invoices, and renewals for companies; public pricing comparison; admin oversight of all subscriptions.

---

## 2. Screens & components

| Surface | Route | Phase | Components |
| --- | --- | --- | --- |
| Public pricing | `/pricing` | P3 | `PricingComponent`, `PlanComparisonTable` |
| Current subscription | `/employer/subscription` | P3 | `SubscriptionOverviewComponent`, `PlanBadge`, usage meters |
| Change plan | `/employer/subscription/plans` | P3 | `PlanSelectorComponent`, `PlanCard` |
| Payment methods | `/employer/subscription/payment-methods` | P3 | `PaymentMethodListComponent`, `AddPaymentMethodDialog` |
| Invoices | `/employer/subscription/invoices` | P3 | `InvoiceListComponent`, `InvoiceDetailComponent` |
| Admin oversight | `/admin/subscriptions` | P3 | `SubscriptionOversightComponent` |
| Plan badge / limit guard | app-wide | P1 (read-only) | `PlanBadgeComponent`, `planLimitGuard` |

### Plans (`§11`)
| Plan | Highlights |
| --- | --- |
| Free | Limited job posts, basic search, basic analytics |
| Business | More job posts, candidate search, advanced analytics, talent pool |
| Enterprise | Unlimited jobs, full ATS, team mgmt, API access, advanced reporting |

---

## 3. Services / State

- `SubscriptionService` — current plan, usage, change plan, cancel/renew.
- `PaymentService` — payment methods, charges (mocked; real gateway later).
- `InvoiceService`.
- `planLimitGuard` / `PlanLimitService` — gate job creation, recruiter invites, premium features by plan.

## 4. Entities used

`SUBSCRIPTION_PLANS`, `SUBSCRIPTIONS`, `PAYMENTS`. (Invoices represented via payments + plan; add an `INVOICES` model if backend exposes one.)

## 5. Business rules

- **Plan limits** drive UI gating everywhere: hitting `max_jobs`/`max_recruiters` shows an upgrade prompt instead of the action.
- **Feature flags by plan**: candidate search, talent pool, advanced analytics, API access — resolved from `SUBSCRIPTION_PLANS` + feature map.
- Payment integration is **mocked** in all phases of this frontend plan; real gateway (Stripe/etc.) is a backend concern surfaced via redirect/secure element later.

---

## 6. Backlog by phase

### Phase 1
- [ ] `PlanBadgeComponent` (read current plan)
- [ ] `planLimitGuard` + upgrade-prompt pattern

### Phase 3
- [ ] Public pricing + comparison
- [ ] Subscription overview + usage meters
- [ ] Change plan flow
- [ ] Payment methods + invoices
- [ ] Admin subscription oversight

## 7. Dependencies
Company Admin (company context), Auth, Admin (oversight). Gates features in Recruiter/Company modules.

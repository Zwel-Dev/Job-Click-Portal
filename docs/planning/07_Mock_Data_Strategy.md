# 07 — Mock Data Strategy

> Goal: build and demo the full UI **before the backend exists**, then swap to the real API with **zero component changes**. The seam is the HTTP layer, not the components.

---

## 1. Principles

1. **Components never know data is mocked.** They call typed feature services; services call `ApiBaseService`; an interceptor decides mock vs real.
2. **One toggle.** `environment.useMock` flips the whole app between mock and live.
3. **Contract-shaped.** Mock responses match the [API Contract Assumptions](06_API_Contract_Assumptions.md) exactly (envelopes, pagination, error shapes).
4. **Stateful where it matters.** Mocks persist mutations in-memory (and optionally `localStorage`) so create/edit/delete flows feel real within a session.

---

## 2. Approach — HTTP interceptor (chosen)

A `mock-api.interceptor.ts` intercepts outgoing requests when `useMock` is true, matches `method + url`, and returns data from in-memory collections seeded from JSON fixtures.

```text
Component → FeatureService → ApiBaseService → HttpClient
                                                  │
                                       ┌──────────┴───────────┐
                              useMock? yes                   no
                                       │                      │
                            mock-api.interceptor      real backend (baseApiUrl)
                                       │
                          MockDb (in-memory, seeded from /assets/mock/*.json)
```

**Why interceptor over alternatives:**

| Option | Verdict |
| --- | --- |
| **HTTP interceptor + in-memory DB** | ✅ Chosen — no extra process, real HttpClient path, supports latency/errors, swaps via flag |
| `angular-in-memory-web-api` | Possible, but less control over envelopes/pagination/auth; heavier to bend to our contract |
| `json-server` (separate process) | Good for a quick REST mock, but needs a running server + CORS; reserve as optional "live mock" mode |
| MSW (service worker) | Powerful, but extra tooling; revisit if we need network-tab realism |

We can still expose a **second mode** (`useMock:false` + a json-server on `baseApiUrl`) for integration rehearsals — both honor the same service layer.

---

## 3. File layout

```text
src/
├── environments/environment.ts        # useMock: true
├── assets/mock/                        # static seed fixtures (JSON)
│   ├── users.json
│   ├── roles.json
│   ├── companies.json
│   ├── company-locations.json
│   ├── departments.json
│   ├── candidate-profiles.json
│   ├── skills.json
│   ├── jobs.json
│   ├── job-skills.json
│   ├── applications.json
│   ├── application-status-history.json
│   ├── interviews.json
│   ├── offers.json
│   ├── talent-pools.json
│   ├── saved-jobs.json
│   ├── job-match-scores.json
│   ├── conversations.json
│   ├── messages.json
│   ├── notifications.json
│   ├── subscription-plans.json
│   ├── subscriptions.json
│   └── audit-logs.json
└── app/core/http/mock/
    ├── mock-api.interceptor.ts         # route table + dispatch
    ├── mock-db.ts                      # loads fixtures into in-memory collections
    ├── mock-helpers.ts                 # paginate(), filter(), sort(), delay(), maybeError()
    └── handlers/                       # per-resource handlers
        ├── auth.handler.ts
        ├── jobs.handler.ts
        ├── applications.handler.ts
        ├── candidate.handler.ts
        ├── employer.handler.ts
        ├── admin.handler.ts
        └── comms.handler.ts
```

> Fixtures live under `assets/mock` (already served; `angular.json` includes `src/assets`). Keep them ERD-faithful so they double as backend seed data later.

---

## 4. Seed data plan (volume & realism)

| Domain | Seed volume | Notes |
| --- | --- | --- |
| Roles | 6 | Platform Admin, Company Admin, Recruitment Manager, Recruiter, Hiring Manager, Candidate |
| Users | ~40 | 1 platform admin, ~10 company users across 3 companies, ~25 candidates |
| Companies | 3 | mix of verified/pending; 1 Free, 1 Business, 1 Enterprise plan |
| Departments | ~9 | 3 per company |
| Candidate profiles | ~25 | varied completion %, skills, experience, education |
| Skills | ~60 | with aliases (e.g. "Spring Boot"→Java) to exercise matching |
| Jobs | ~30 | statuses: draft/pending/published/paused/closed; spread across companies |
| Applications | ~80 | spread across all pipeline statuses + history rows |
| Interviews / Offers | ~20 / ~10 | linked to advanced-stage applications |
| Match scores | per candidate×relevant jobs | seed bands: best/good/growth for demo |
| Conversations / Messages | ~15 / ~120 | candidate↔recruiter threads |
| Notifications | ~50 | mixed read/unread, all types |
| Subscriptions / Payments | 3 / ~6 | one per company |
| Audit logs | ~40 | varied entities/actions for admin filters |

Cross-references must be **consistent** (every `candidate_id`, `job_id`, `company_id` resolves) so joins in the UI work.

---

## 5. Realistic behaviors the mock layer simulates

- **Latency:** `delay(200–600ms)` per request (configurable) so loading/skeleton states are visible.
- **Pagination/sort/filter:** `mock-helpers` apply the same `page/pageSize/sort/q/filters` params the real API uses.
- **Mutations persist:** POST/PUT/PATCH/DELETE update the in-memory `MockDb`; optionally mirror to `localStorage` so a refresh keeps state during a demo (clear via a dev "reset mock data" action).
- **Auth:** `/auth/login` validates against `users.json`, returns a fake JWT (base64 payload with userId+roles); guards work end-to-end.
- **Errors on demand:** special inputs trigger `400/403/409/422` (e.g. duplicate email → 409, plan-limit job create → 409) to exercise error UI.
- **File uploads:** accept multipart, return a placeholder `fileUrl` (e.g. `/assets/mock/files/...`).

---

## 6. Swap-to-real checklist

When the backend is ready:

1. Set `environment.useMock = false` (or `environment.prod` already false).
2. Confirm `appsettings.json.baseApiUrl` points at the API.
3. Verify response envelopes/casing match §2 of the contract; adjust **mappers in services only** if the backend differs — components stay untouched.
4. Remove/disable the mock interceptor registration in `CoreModule` for prod builds (tree-shaken when `useMock` is false).
5. Keep fixtures as backend seed/QA data.

---

## 7. Phasing

| Phase | Mock scope |
| --- | --- |
| P1 | auth, candidate profile/resume/jobs/applications, employer jobs/pipeline/offers, company/team, admin users/companies/verification |
| P2 | recommendations, messaging, notifications, interviews, analytics |
| P3 | subscriptions/payments, AI endpoints (mock streaming responses) |

Build each module's fixtures + handlers **alongside** the module, not all upfront.

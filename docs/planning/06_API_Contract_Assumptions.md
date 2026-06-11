# 06 — API Contract Assumptions

> The backend is not yet defined. These are the **assumptions the frontend will code against**, so mocks and real APIs stay interchangeable. Base URL comes from `appsettings.json` → `baseApiUrl` (`http://localhost:5100`).
> All paths below are relative to `${baseApiUrl}/api/v1`.

---

## 1. Conventions

| Aspect | Assumption |
| --- | --- |
| Protocol | REST/JSON over HTTPS |
| Versioning | `/api/v1` prefix |
| Auth | `Authorization: Bearer <jwt>`; login returns access (+ refresh) token |
| IDs | numeric `bigint` (ERD), serialized as `number` (UUID also available on `USERS`) |
| Casing | JSON **camelCase**; services map to/from ERD snake_case if needed |
| Dates | ISO 8601 UTC strings (`2026-06-11T09:30:00Z`) |
| Money | `{ amount: number, currency: string }` or `salaryMin/salaryMax + currency` |
| Errors | RFC-7807-ish: `{ status, code, message, errors?: {field: string[]} }` |
| Empty collections | `200` + empty `data: []` (never `404`) |

---

## 2. Standard envelopes

```ts
// Single resource
interface ApiResponse<T> { data: T; }

// Paginated list
interface Paginated<T> {
  data: T[];
  page: number;        // 1-based
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

// Error
interface ApiError {
  status: number;            // HTTP status
  code: string;              // machine code e.g. "VALIDATION_ERROR"
  message: string;           // human message
  errors?: Record<string, string[]>; // field-level
}
```

**List query params (uniform):** `?page=1&pageSize=20&sort=field,-otherField&q=keyword&<filters...>`

---

## 3. Status codes

| Code | Meaning |
| --- | --- |
| 200 / 201 | OK / created |
| 204 | deleted, no body |
| 400 | validation error (`errors` populated) |
| 401 | missing/expired token → client redirects to login |
| 403 | authenticated but not permitted → `/403` |
| 404 | resource not found |
| 409 | conflict (duplicate email, plan-limit reached) |
| 422 | business rule violation |
| 429 | rate limited |

---

## 4. Endpoint map (by module)

> Representative, not exhaustive. CRUD implies `GET list`, `GET /:id`, `POST`, `PUT/PATCH /:id`, `DELETE /:id`.

### Auth
| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/auth/login` | → `{ token, refreshToken, user, roles }` |
| POST | `/auth/register` | candidate signup |
| POST | `/auth/register-company` | company signup |
| POST | `/auth/verify-email` · `/auth/verify-phone` | OTP/token confirm |
| POST | `/auth/forgot-password` · `/auth/reset-password` | password reset |
| POST | `/auth/refresh` · `/auth/logout` | session |
| GET | `/auth/me` | current user + roles + active company |

### Candidate
| Path | Notes |
| --- | --- |
| `/candidate/profile` | GET/PUT profile (`CANDIDATE_PROFILES`) |
| `/candidate/skills` · `/experiences` · `/educations` · `/certifications` · `/portfolios` | CRUD sub-collections |
| `/candidate/resumes` | CRUD + `POST /:id/default`, multipart upload |
| `/candidate/saved-jobs` | list/add/remove (`SAVED_JOBS`) |
| `/candidate/applications` | list + `GET /:id` (incl. `APPLICATION_STATUS_HISTORY`) |
| `/candidate/interviews` | list/detail |
| `/candidate/recommendations?category=best\|good\|growth\|trending\|new` | `JOB_MATCH_SCORES` |

### Jobs (shared public + employer)
| Path | Notes |
| --- | --- |
| `/jobs` | public search: filters keyword/location/salary/industry/type/experience/remote |
| `/jobs/:id` | detail incl. skills, benefits, locations |
| `/jobs/:id/apply` | POST application (resumeId, coverNote) |
| `/employer/jobs` | CRUD + `POST /:id/{publish,pause,close,archive,duplicate}` |
| `/employer/jobs/:id/applicants` | pipeline list |
| `/employer/jobs/:id/approval` | submit/approve/reject (workflow) |

### Employer ops
| Path | Notes |
| --- | --- |
| `/employer/applications/:id` | detail, notes, tags, `PATCH status` |
| `/employer/applications/:id/status` | move pipeline stage → writes history |
| `/employer/candidates/search` | talent search filters |
| `/employer/talent-pools` (+ `/:id/candidates`) | CRUD + membership |
| `/employer/interviews` | CRUD + reschedule/cancel + `/:id/feedback` + interviewers |
| `/employer/assessments` | CRUD |
| `/employer/offers` | CRUD + `PATCH status` |
| `/employer/analytics/*` | time-to-hire, cost-per-hire, funnel, recruiter-performance |

### Company / Team
| Path | Notes |
| --- | --- |
| `/company` | GET/PUT profile |
| `/company/locations` · `/company/departments` | CRUD |
| `/company/verification` | GET status, POST submit docs |
| `/company/team` | list members; `POST invite`; `PATCH /:id/role`; `DELETE`; `POST transfer-ownership` |

### Comms
| Path | Notes |
| --- | --- |
| `/conversations` (+ `/:id/messages`) | list/create, send (multipart attachment) |
| `/notifications` | list, `PATCH /:id/read`, `POST read-all` |
| `/notifications/preferences` | GET/PUT channel prefs |
| `/realtime` | WS/SSE endpoint (P2 polling fallback: `GET /notifications?since=`) |

### Platform Admin
| Path | Notes |
| --- | --- |
| `/admin/users` · `/admin/companies` | manage, suspend, detail |
| `/admin/verifications` | queue + `PATCH /:id {approve\|reject}` |
| `/admin/jobs` | moderation, flag/remove |
| `/admin/fraud/*` | signal lists |
| `/admin/analytics/*` | system metrics |
| `/admin/audit-logs` | filterable read-only (`AUDIT_LOGS`) |
| `/admin/settings/*` | roles, skills taxonomy, plans, feature flags |

### Subscription / Billing (P3)
| Path | Notes |
| --- | --- |
| `/plans` | public plan list (`SUBSCRIPTION_PLANS`) |
| `/company/subscription` | current + usage |
| `/company/subscription/change` | switch plan |
| `/company/payment-methods` · `/company/invoices` | billing |

### Reference data
| Path | Notes |
| --- | --- |
| `/ref/skills?q=` | skill typeahead (+ aliases) |
| `/ref/industries` · `/ref/locations` · `/ref/roles` | dropdown sources |

### AI (P3)
| Path | Notes |
| --- | --- |
| `/ai/resume/parse` · `/ai/resume/review` | resume intelligence |
| `/ai/job/generate-description` | JD generation |
| `/ai/interview/questions` | question generation |
| `/ai/match/explain` | semantic match explanation (supports streaming) |

---

## 5. Cross-cutting expectations

- **Pagination everywhere** lists can grow (jobs, applicants, candidates, messages, audit logs).
- **Filtering/sorting server-side** — client passes params, never filters large sets locally.
- **File uploads** (resume, logo, company docs, message attachments) are `multipart/form-data`; responses return a stored `fileUrl`.
- **Optimistic UI** allowed for low-risk toggles (save job, mark notification read) with rollback on error.
- **Permission errors** surface as `403`; the UI also hides disallowed actions via `*appHasRole` (defense in depth).
- **Idempotency** for create-offer / apply via client-sent key to avoid dupes on retry.

---

## 6. Open questions for backend (to confirm before integration)

1. Token model — access+refresh vs session cookie? Refresh rotation?
2. Multi-role users — can one user hold roles in multiple companies? (ERD `USER_ROLES.company_id` suggests yes → need active-company switcher.)
3. Are match scores precomputed (`JOB_MATCH_SCORES`) or computed on request?
4. Is there an `INVOICES` table, or are invoices derived from `PAYMENTS`?
5. Realtime transport: WebSocket vs SSE vs polling for P2?
6. File storage URLs — signed/expiring vs public?
7. Soft-delete vs hard-delete for jobs/users (affects archive/audit behavior)?

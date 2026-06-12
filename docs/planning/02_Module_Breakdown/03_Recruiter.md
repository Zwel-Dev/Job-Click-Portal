# Module: Recruiter / Employer Operations

**Workspace:** Employer · **Route prefix:** `/employer` · **Guard:** `authGuard + employerGuard` (+ per-feature role guards)
**Angular module:** `EmployerModule` (lazy-loaded at the workspace boundary)

> Implementation spec. Follows the conventions proven in the **shipped Candidate workspace** — NgModule components (`standalone: false`), Angular Material + the shared design system, **signal stores**, services returning `Observable<T>` via `of(mock)` gated on `environment.useMock`, strict TS (no `any`), ERD-derived models in `@core/models`. Reuse the shared components already built in Phase 1 (see §9).
>r
> **Workspace decision:** Recruiter, Recruitment Manager, and Hiring Manager share one **Employer** workspace + shell; their differences are **feature-level role gates**, not separate apps. Company-level administration (company profile, team, billing) lives in [Company Admin](04_Company_Admin.md) — also under `/employer`, in a `company-admin` area of the same module. This avoids duplicating the jobs/pipeline UI per role.

---

## 1. Scope

Everything a recruiter/manager/hiring-manager does to fill roles:

1. **Manage jobs** — create (wizard), edit, duplicate, pause/close/archive, submit for approval.
2. **Approve jobs** — manager/admin approval workflow before publish.
3. **Manage applicants** — review applications, rank by match, notes/tags, move through the pipeline (Kanban).
4. **Source candidates** — search the talent pool, build named talent collections (Phase 2).
5. **Interview** — schedule/reschedule, assign interviewers, capture feedback (Phase 2).
6. **Make offers** — create, track status, record outcome.
7. **Measure** — recruitment analytics & funnel (Phase 2).

---

## 2. Delivery phases at a glance

| # | Feature | Phase | Priority | Status | Primary screens |
| --- | --- | :---: | :---: | :---: | --- |
| 1 | Employer shell (sidebar + header) | P1 | Must | ✅ Done | layout |
| 2 | Recruiter dashboard (KPIs) | P1 | Must | ✅ Done | `/employer/dashboard` |
| 3 | Job list + lifecycle actions | P1 | Must | ✅ Done | `/employer/jobs` |
| 4 | Job create/edit wizard | P1 | Must | ✅ Done | `/employer/jobs/new`, `/:id/edit` |
| 5 | Job detail (employer view) | P1 | Must | ✅ Done | `/employer/jobs/:id` |
| 6 | Job approval workflow + queue | P1 | Must | ✅ Done | `/employer/approvals` |
| 7 | Applicants pipeline (Kanban) | P1 | Must | ✅ Done | `/employer/jobs/:id/applicants` |
| 8 | Applicant detail (notes/tags/status) | P1 | Must | ✅ Done | `/employer/applications/:id` |
| 9 | Offers | P1 | Should | ✅ Done | `/employer/offers` |
| 10 | Candidate search | P2 | Must | ✅ Done | `/employer/candidates` |
| 11 | Talent pools | P2 | Should | ✅ Done | `/employer/talent-pools`, `/:id` |
| 12 | Interviews | P2 | Must | 🔒 Hidden | *(deferred — see note)* |
| 13 | Assessments capture | P2 | Could | ✅ Done | within applicant detail |
| 14 | Recruitment analytics | P2 | Should | ✅ Done | `/employer/analytics` |
| 15 | AI JD generator / candidate ranking | P3 | Could | ⬜ Pending | wizard / pipeline |

> **Status legend:** ✅ done & build-verified · ⬜ pending · 🔒 hidden. **Employer Phase 1 (R1.0–R1.6) ✅ complete** (shell · job list · job wizard · job detail + approval · pipeline Kanban + applicant detail · offers · recruiter dashboard). **Phase 2 ✅ complete: R2.0 Candidate search · R2.1 Talent pools · R2.3 Assessments · R2.4 Analytics** (R2.2 Interviews **🔒 hidden** — deferred platform-wide, no nav/route). **Next: Phase 3 — R3.0 AI** (JD generator + candidate ranking), or the Company Admin workspace ([doc 04](04_Company_Admin.md)).

---

## 3. Route map (`employer-routing.module.ts`)

All children render inside `EmployerLayoutComponent`. Lazy via the root route
`{ path: 'employer', canActivate: [authGuard, employerGuard], loadChildren: () => import('@features/employer/employer.module').then(m => m.EmployerModule) }`.

```ts
const routes: Routes = [
  {
    path: '',
    component: EmployerLayoutComponent,
    children: [
      { path: 'dashboard',                component: EmployerDashboardComponent,  title: 'Dashboard | Job Click' },
      { path: 'jobs',                     component: JobListComponent,            title: 'Jobs | Job Click' },
      { path: 'jobs/new',                 component: JobWizardComponent,          canActivate: [recruiterGuard, planLimitGuard], title: 'Create Job | Job Click' },
      { path: 'jobs/:id',                 component: EmployerJobDetailComponent,  title: 'Job | Job Click' },
      { path: 'jobs/:id/edit',            component: JobWizardComponent,          canActivate: [recruiterGuard], title: 'Edit Job | Job Click' },
      { path: 'jobs/:id/applicants',      component: PipelineBoardComponent,      title: 'Applicants | Job Click' },
      { path: 'approvals',               component: JobApprovalQueueComponent,    canActivate: [managerGuard], title: 'Approvals | Job Click' },
      { path: 'applications/:id',         component: ApplicantDetailComponent,    title: 'Applicant | Job Click' },
      { path: 'candidates',              component: CandidateSearchComponent,     canActivate: [recruiterGuard], title: 'Candidates | Job Click' }, // P2
      { path: 'talent-pools',            component: TalentPoolListComponent,      canActivate: [recruiterGuard], title: 'Talent Pools | Job Click' }, // P2
      { path: 'talent-pools/:id',        component: TalentPoolDetailComponent,    canActivate: [recruiterGuard] },                                    // P2
      // { path: 'interviews', ... } — 🔒 hidden/deferred (no nav item or route shipped)
      { path: 'offers',                  component: OfferListComponent,           title: 'Offers | Job Click' },
      { path: 'analytics',               component: RecruitmentAnalyticsComponent, canActivate: [managerGuard], title: 'Analytics | Job Click' }, // P2
      // company/profile, company/locations, departments, team → see Company Admin (doc 04)
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: '**', redirectTo: 'dashboard' },
    ],
  },
];
```

**Guards to add in `@core/auth/guards`** (mirror the shipped `candidateGuard`):
| Guard | Allows |
| --- | --- |
| `employerGuard` | any of `EMPLOYER_ROLES` (Company Admin / Recruitment Manager / Recruiter / Hiring Manager) |
| `recruiterGuard` | Recruiter, Recruitment Manager, Company Admin |
| `managerGuard` | Recruitment Manager, Company Admin |
| `companyAdminGuard` | Company Admin (some areas allow Recruitment Manager) |
| `planLimitGuard` | within plan quota (`max_jobs`) — stubbed until billing (Phase 3) |

> Also extend `defaultRouteForRoles` (`@core/auth/home-route.ts`) so employer roles land on `/employer/dashboard` (currently they fall back to `/welcome`).

---

## 4. Feature folder structure

```text
features/employer/
├── employer.module.ts
├── employer-routing.module.ts
├── models/                         # employer-only view/form models
│   ├── job-form.model.ts
│   ├── job-list-query.model.ts
│   └── recruiter-dashboard.model.ts
├── services/
│   ├── job.service.ts
│   ├── job-approval.service.ts
│   ├── applicant.service.ts        # pipeline moves, notes, tags
│   ├── offer.service.ts
│   ├── employer-dashboard.service.ts
│   ├── candidate-search.service.ts # P2
│   ├── talent-pool.service.ts      # P2
│   ├── employer-interview.service.ts # P2
│   └── employer-analytics.service.ts # P2
├── state/
│   └── employer-context.store.ts   # current company + active role + plan
├── components/                     # feature-local presentational pieces
│   ├── pipeline-column/            # Kanban column
│   ├── applicant-card/             # Kanban card
│   ├── candidate-notes/
│   ├── candidate-tags/
│   └── offer-status-badge/
└── pages/
    ├── dashboard/
    ├── jobs/ (list, wizard, detail, applicants/pipeline)
    ├── approvals/
    ├── applications/ (applicant detail)
    ├── candidates/                 # P2
    ├── talent-pools/               # P2
    ├── interviews/                 # P2
    ├── offers/
    └── analytics/                  # P2
```

Cross-cutting models (`Job`, `JobSummary`, `Application`, `Interview`, `Offer`) live in `@core/models` and are **reused** from the candidate work where possible (e.g. `Job`, `Application`).

> **Import note:** import `EmployerLayoutComponent` into `EmployerModule`/routing via a **relative path** (not `@layouts`) — the TS-993004 re-emit gotcha, same fix used in Auth + Candidate.

---

## 5. Domain models (`@core/models`, ERD-derived)

Reuse existing `Job` / `JobSummary` / `JobSkillRequirement` / `JobLocation` (`job.model.ts`) and `Application` / `ApplicationStatusEvent` (`application.model.ts`). New:

### `job-form.model.ts` (employer-only)
```ts
export interface JobFormValue {
  // Basic
  title: string; departmentId?: Id; employmentType: EmploymentType; workMode: WorkMode;
  seniorityLevel: SeniorityLevel; location: string;
  // Requirements
  description: string; requirements: string;
  skills: { skillId: Id; name: string; required: boolean }[];
  // Compensation
  salaryMin?: number; salaryMax?: number; currency?: string; benefits: string[];
}
```

### `applicant.model.ts` (employer view of an application)
```ts
export interface ApplicantSummary {
  applicationId: Id; candidateId: Id; fullName: string; headline?: string; avatarUrl?: string;
  status: ApplicationStatus; matchScore?: number; appliedAt: string; resumeId: Id;
  tags: string[];
}
export interface ApplicantDetail extends ApplicantSummary {
  email: string; phone?: string; location?: string;
  skills: { name: string; proficiency: ProficiencyLevel }[];
  experiences: CandidateExperience[]; educations: CandidateEducation[];
  notes: CandidateNote[]; statusHistory: ApplicationStatusEvent[]; match?: JobMatchScore;
}
export interface CandidateNote { id: Id; author: string; body: string; createdAt: string; }
```

### `offer.model.ts`
```ts
export interface Offer {
  id: Id; applicationId: Id; candidateName: string; jobTitle: string;
  offeredSalary: number; currency: string; joiningDate?: string;
  status: OfferStatus; offeredAt: string;
}
export interface OfferFormValue { offeredSalary: number; currency: string; joiningDate?: string; notes?: string; }
```

### `recruiter-dashboard.model.ts`
```ts
export interface RecruiterKpis { activeJobs: number; newApplications: number; interviewsToday: number; offersPending: number; hires: number; }
```

### Pipeline + P2 (`talent-pool.model.ts`, `interview.model.ts`, `candidate-search.model.ts`)
```ts
export interface PipelineColumn { status: ApplicationStatus; label: string; applicants: ApplicantSummary[]; }
export interface TalentPool { id: Id; name: string; description?: string; candidateCount: number; }
export interface Interview { id: Id; applicationId: Id; candidateName: string; jobTitle: string; roundName: string; interviewType: InterviewType; scheduledAt: string; meetingLink?: string; status: InterviewStatus; interviewers: string[]; feedback?: string; }
export interface CandidateSearchResult { candidateId: Id; fullName: string; headline?: string; location?: string; topSkills: string[]; availability: AvailabilityStatus; matchScore?: number; }
```

---

## 6. Enums (`@core/enums`)

Reuse `EmploymentType`, `WorkMode`, `SeniorityLevel`, `JobStatus`, `ApplicationStatus`, `ProficiencyLevel`, `AvailabilityStatus`, `RoleCode`. New:

| Enum | Values |
| --- | --- |
| `OfferStatus` | `Draft, Sent, Accepted, Rejected, Withdrawn, Expired` |
| `InterviewType` | `Phone, Video, Onsite, Technical, HR` |
| `InterviewStatus` | `Scheduled, Completed, Cancelled, NoShow` |
| `AssessmentStatus` | `Pending, InProgress, Submitted, Passed, Failed` |
| `JobApprovalStage` | `PendingManager, PendingAdmin, Approved, Rejected` |

> **Pipeline note:** the recruiter Kanban uses `ApplicationStatus`. `Project_Doc §6` adds an **Assessment** stage between Shortlisted and Interview — add `ApplicationStatus.Assessment` (and a tracker stop) if assessments are in scope, else fold into Screening. The Kanban column order is config (`PIPELINE_COLUMNS`), with `Rejected`/`Withdrawn` as a collapsed side bucket.

---

## 7. Services & state

All services: `@Injectable({ providedIn: 'root' })`, mock branch gated on `environment.useMock` with stateful in-memory collections (mirror the candidate `ApplicationService` / `MockCollection` pattern), real branch via `ApiBaseService`. Endpoints per [API Contract](../06_API_Contract_Assumptions.md) §4 (`/employer/*`).

```ts
// job.service.ts
list(query: JobListQuery): Observable<Paginated<JobSummary>>
getById(id: Id): Observable<Job>
create(value: JobFormValue): Observable<Job>;  update(id, value): Observable<Job>
submitForApproval(id): Observable<Job>
transition(id, action: 'pause'|'close'|'archive'|'duplicate'): Observable<Job>

// job-approval.service.ts
queue(): Observable<Job[]>;  approve(id): Observable<Job>;  reject(id, reason): Observable<Job>

// applicant.service.ts (pipeline)
pipeline(jobId): Observable<PipelineColumn[]>
getApplicant(applicationId): Observable<ApplicantDetail>
moveStage(applicationId, status, remarks?): Observable<void>
addNote(applicationId, body): Observable<CandidateNote>;  setTags(applicationId, tags): Observable<void>

// offer.service.ts
list(): Observable<Offer[]>;  getByApplication(applicationId): Observable<Offer | null>
create(applicationId, value: OfferFormValue): Observable<Offer>;  updateStatus(id, status): Observable<Offer>

// employer-dashboard.service.ts
kpis(): Observable<RecruiterKpis>;  recentApplicants(limit): Observable<ApplicantSummary[]>

// P2: candidate-search, talent-pool, employer-interview, employer-analytics
```

**State — `EmployerContextStore` (signal store):** current `company` (id/name from the signed-in user), `activeRole`, `plan` (for limits), and role-permission helpers (`canApproveJobs`, `canManageTeam`, `isRecruiter`). Pages read these signals to gate UI (defense-in-depth alongside guards).

---

## 8. Sub-feature specs

### 8.1 Employer shell (`EmployerLayoutComponent`) — P1
Same shell pattern as the candidate layout (mat-sidenav + header + mobile drawer). Sidebar from an `employer-nav.ts` config, **filtered by role** (e.g. Approvals/Analytics only for managers): Dashboard, Jobs, Approvals, Candidates, Talent Pools, Interviews, Offers, Analytics, and a "Company" group (→ Company Admin areas). Header: `<app-logo>`, global search, notifications, plan badge, user menu. Loads `EmployerContextStore` on init.

### 8.2 Recruiter dashboard — P1
Route `/employer/dashboard`. KPI strip (`app-kpi-card`): **Active jobs · New applications · Interviews today · Offers pending · Hires** (`Project_Doc §6`). Widgets (compose via `forkJoin`): recent applicants (→ applicant detail), jobs needing attention (pending approval / closing soon), pending offers. Skeleton/empty/error per widget.

### 8.3 Job list — P1
Route `/employer/jobs`. Table/cards of company jobs with status chip, applicant count, posted/expiry, owner. Filter by status + owner; search; sort; pagination. Row/bulk actions: **edit, duplicate, pause, close, archive, view applicants**. "Create job" → wizard (gated by `recruiterGuard` + `planLimitGuard`). Scoped: recruiters see assigned jobs; managers/admins see all company jobs.

### 8.4 Job create/edit wizard (`JobWizardComponent`) — P1
Routes `/employer/jobs/new`, `/employer/jobs/:id/edit`. **Material stepper** (reuse the pattern from company registration): **Basic → Requirements → Compensation → Skills → Screening → Review**. Per-step reactive forms + validation; Skills step uses a **reusable `app-skill-selector`**; the **Screening** step (R1.2a) uses `app-screening-questions-editor` for optional LinkedIn-style application questions. Save as **Draft** or **Submit for approval**. Edit pre-loads `getById`.

### 8.5 Job detail (employer view) (`EmployerJobDetailComponent`) — P1
Route `/employer/jobs/:id`. Overview (description/requirements/skills/benefits/locations) + **metrics panel** (views, applicants by stage, days open) + **approval-state badge**. Actions: edit, duplicate, lifecycle transitions, "View applicants". Manager/admin see approve/reject when pending.

### 8.6 Job approval workflow + queue (`JobApprovalQueueComponent`) — P1
Route `/employer/approvals` (manager/admin). Lists jobs in `PendingManager` / `PendingAdmin` for the viewer's role. **Workflow** (`§7`): `Recruiter creates → Manager approval → Company Admin approval → Published`. Approve advances the stage; reject returns to the recruiter with a reason. `JobApprovalService`; uses `app-confirm-dialog` + toast.

### 8.7 Applicants pipeline (Kanban) (`PipelineBoardComponent`) — P1
Route `/employer/jobs/:id/applicants`. **Kanban** via Angular CDK **DragDrop**: columns = `PIPELINE_COLUMNS` (Applied → Screening → Shortlisted → [Assessment] → Interview → Offer → Hired), `Rejected` side bucket. Cards (`ApplicantCard`): avatar, name, `app-match-score-badge`, tags. Dragging a card to a column calls `moveStage` (optimistic, writes `APPLICATION_STATUS_HISTORY`). Filters (stage/tag/score), column counts.

### 8.8 Applicant detail (`ApplicantDetailComponent`) — P1
Route `/employer/applications/:id`. Candidate summary + resume viewer (reuse `ResumePreviewDialog`), skills, experience, education, **match breakdown** (`app-match-breakdown`), **`app-application-status-tracker`**, status history. Recruiter actions: move stage, add note (`CandidateNotes`), edit tags (`CandidateTags`), schedule interview (P2), create offer.

### 8.9 Offers (`OfferListComponent`, `OfferFormComponent`) — P1
Route `/employer/offers`. List of offers with `OfferStatusBadge` (status tone). Create offer from an application (salary, currency, joining date, notes) → status `Sent`. Track candidate outcome (Accepted/Rejected). 1:1 with an application (`APPLICATIONS ||--|| OFFERS`).

### 8.10 Candidate search (`CandidateSearchComponent`) — P2
Route `/employer/candidates`. Filters: skills, experience, salary, location, industry, availability. Respects candidate `profileVisibility`. Results (`CandidateResultCard`) with match score + "Add to talent pool" / "Invite to apply".

### 8.11 Talent pools (`TalentPoolListComponent`, `TalentPoolDetailComponent`) — P2
Routes `/employer/talent-pools`, `/:id`. Named collections (e.g. "Java Developers"); add/remove candidates; open a pool to view members.

### 8.12 Interviews (`InterviewScheduleComponent`) — P2 · 🔒 Hidden (deferred)
> **Deferred platform-wide.** No employer nav item or `/employer/interviews` route ships for now (mirrors the candidate-side interview/message hide). The enums/models (`InterviewType`, `InterviewStatus`, `interview.model.ts`) remain in `@core` for when this is implemented later.

Route `/employer/interviews`. Schedule/reschedule/cancel; `InterviewerPicker` (company users); meeting link; `InterviewFeedbackForm`. Upcoming/past; optional calendar view.

### 8.13 Analytics (`RecruitmentAnalyticsComponent`) — P2
Route `/employer/analytics` (manager/admin). Time-to-hire, cost-per-hire, applications/job, recruiter performance, **hiring funnel** conversion. Charts (lightweight; add a chart lib only if needed).

---

## 9. Components consumed vs new

**Reuse (already shipped):** `app-page-header`, `app-kpi-card`, `app-empty-state`, `app-error-state`, `app-skeleton`, `app-pagination`, `app-confirm-dialog` + `ConfirmService`, `ToastService`, `app-application-status-chip`, `app-application-status-tracker`, `app-match-score-badge`, `app-match-breakdown`, `app-file-upload`, `ResumePreviewDialog` (promote to shared if reused), `app-logo`, `app-password-strength` (team invites).

**New shared (build once, reused by candidate too):** `app-skill-selector` (extract from candidate skills autocomplete), `app-data-table` (sortable/selectable — job list, applicant lists), `app-status-badge` (generic, for `JobStatus`/`OfferStatus`), `app-filter-panel` (composable), `app-user-avatar-name`, `app-search-bar`.

**New employer-local:** `EmployerLayoutComponent`, `JobWizardComponent`, `PipelineBoardComponent` + `PipelineColumn`/`ApplicantCard`, `ApplicantDetailComponent` + `CandidateNotes`/`CandidateTags`, `OfferFormComponent` + `OfferStatusBadge`, `JobApprovalQueueComponent`, P2 search/pools/interviews/analytics.

> Add **`@angular/cdk/drag-drop` (`DragDropModule`)** to `MaterialModule` for the Kanban.

---

## 10. Mock data requirements

Scope all mock data to the demo recruiter's company (`recruiter@jobclick.dev`, company **10 — Greenline Technologies**). Reuse `MOCK_JOB_SUMMARIES` (filter by `companyId === 10`) + extend:
- ~6-10 company jobs across statuses (Draft, PendingApproval, Published, Paused, Closed) with owners + applicant counts.
- ~15-25 applicants spread across pipeline stages for 2-3 jobs (reuse candidate profiles; add match scores via `CANDIDATE_MATCH_SCORES`).
- Notes/tags on a few applicants.
- ~3-5 offers in varied statuses.
- P2: ~3 talent pools, ~5 interviews, ~30 searchable candidates, analytics aggregates.
All IDs cross-resolve; stateful services so create/move/approve persist within the session.

---

## 11. Business rules & status flows

- **Recruitment pipeline** (`Project_Doc §6`): `Applied → Screening → Shortlisted → Assessment → Interview → Offer → Hired`. Kanban moves write `APPLICATION_STATUS_HISTORY`; the candidate sees the same status via their tracker.
- **Job approval** (`§7`): `Recruiter creates (Draft) → Submit (PendingManager) → Manager approve (PendingAdmin) → Admin approve (Published)`. Reject returns to Draft with a reason. `JobStatus` + `JobApprovalStage` track this.
- **Scoping:** recruiters act on **assigned** jobs/candidates; managers/admins act on **all** company jobs (enforced server-side; mirrored in UI via `EmployerContextStore` permissions).
- **Plan limits:** creating a job is gated by `planLimitGuard` (`max_jobs`); show an upgrade prompt instead of the action when exceeded (stub until billing, Phase 3).
- **Offer:** 1:1 with an application; sending an offer can move the application to `Offer`.

---

## 12. Accessibility & responsive

- Kanban: keyboard-reorderable (CDK supports it); each card focusable; status conveyed by text + tone (not color alone).
- All forms keyboard-navigable with `mat-error`; visible focus (global).
- Job list/table responsive → cards on mobile; Kanban → horizontal scroll with sticky column headers on small screens.
- Skeleton loaders for every async view; empty + error states everywhere.

---

## 13. Phased build plan (sequenced slices)

Vertical slices, each build-verified before the next (same cadence as the candidate `C1.x`). IDs map to phases (P1 = `R1.x`, P2 = `R2.x`, P3 = `R3.x`).

### 13.1 Sequence & dependencies

```text
R1.0 Foundation & shell ─► R1.1 Job list ─► R1.2 Job wizard ─► R1.3 Job detail + approval
                                                                      │
                                              R1.4 Pipeline + applicant detail ◄┘
                                                       │
                                              R1.5 Offers ─► R1.6 Dashboard   (P1 complete)
P2:  R2.0 Candidate search ✅ ─► R2.1 Talent pools ✅ ─► R2.3 Assessments ✅ ─► R2.4 Analytics ✅   (R2.2 Interviews 🔒 hidden)
P3:  R3.0 AI JD generator + candidate ranking
```

| Slice | Goal | Depends on | Size |
| --- | --- | --- | :---: |
| **R1.0** | Employer shell + guards + context store (walking skeleton) | Auth | M |
| **R1.1** | Job list + lifecycle actions | R1.0 | M |
| **R1.2** | Job create/edit wizard (+ `app-skill-selector`) | R1.1 | L |
| **R1.3** | Job detail (employer) + approval workflow/queue | R1.2 | M |
| **R1.4** | Applicants pipeline (Kanban) + applicant detail | R1.1 | L |
| **R1.5** | Offers | R1.4 | M |
| **R1.6** | Recruiter dashboard (real KPIs) | R1.1, R1.4, R1.5 | S |
| **R2.0** | Candidate search ✅ | R1.0 | M |
| **R2.1** | Talent pools ✅ | R2.0 | S |
| **R2.2** | Interviews — 🔒 hidden (deferred) | R1.4 | M |
| **R2.3** | Assessments capture ✅ | R1.4 | S |
| **R2.4** | Recruitment analytics ✅ | R1.x | M |
| **R3.0** | AI JD generator + candidate ranking | R1.2, R1.4, AiModule | M |

---

### Phase 1 — MVP

#### R1.0 — Foundation & shell  ✅ Done *(walking skeleton)*
- [x] `employerGuard` + `recruiterGuard` / `managerGuard` / `companyAdminGuard` + stub `planLimitGuard`; extended `defaultRouteForRoles` → `/employer/dashboard`
- [x] Lazy `EmployerModule` + routing; `EmployerLayoutComponent` (role-filtered nav, relative import) — manager-only items (Approvals, Analytics) gated in nav + route guards
- [x] `EmployerContextStore` (company + active role + `isManager`/`isRecruiter`/`canApproveJobs` helpers), derived from the signed-in user
- [x] Enums (`OfferStatus`, `InterviewType`, `InterviewStatus`, `AssessmentStatus`, `JobApprovalStage`) + core models (`offer`, `applicant`, `interview`, `RecruiterKpis`)
- [x] Placeholder dashboard; coming-soon for later routes (mock fixtures land with R1.1)
- **Exit:** build green; sign in as `recruiter@jobclick.dev` → land on the employer shell; nav resolves & role-gates; context store loads. ✅

#### R1.1 — Job list  ✅ Done
- [x] `JobService.list/transition` (stateful mock); `JobListComponent` (status filter, owner scope, debounced search, sort, pagination)
- [x] Lifecycle actions (pause/resume/close/archive/duplicate) with confirm + toast; "My jobs" scope; role-gated actions (recruiter+)
- [x] Shared `app-status-badge` (generic) + `JOB_STATUS_META`; coming-soon routes for detail/edit/applicants/new so links resolve
- **Exit:** jobs render from mock; actions persist; build green. ✅

#### R1.2 — Job wizard  ✅ Done
- [x] Shared `app-skill-selector` (CVA multi-skill picker, required/optional per skill, taxonomy typeahead)
- [x] `JobWizardComponent` (6-step stepper: Basic → Requirements → Compensation → Skills → **Screening** → Review) + `JobService.create/update/getFormValue/submitForApproval`; Draft vs Submit
- **Exit:** create + edit a job against mock; per-step validation; build green. ✅

#### R1.2a — Screening questions (LinkedIn-style application questions) ✅
- [x] `ScreeningQuestionType` enum (Short answer / Yes-No / Multiple choice / Number) + `ScreeningQuestion`/`ScreeningAnswer` models + **predefined templates** (`SCREENING_QUESTION_TEMPLATES`)
- [x] **Authoring:** `ScreeningQuestionsEditorComponent` (FormArray; add-from-template menu + add-custom; per-question type/required/options) as a Screening wizard step; persisted on `JobFormValue`/`EmployerJobDetail`; shown on the employer job detail. **Optional per job** (empty = no questions).
- [x] **Answering (candidate):** apply dialog loads the job's questions and renders dynamic, validated fields (required gating); answers stored on the `Application`; shown on the candidate's application detail.
- [x] **Reviewing (recruiter):** answers shown in the applicant detail **Application** tab (seeded for job-301 applicants).
- **Exit:** recruiter authors questions on a job → candidate answers them when applying → recruiter reads the answers; build green. ✅

#### R1.3 — Job detail + approval ✅
- [x] `EmployerJobDetailComponent` (overview + metrics + approval badge + recruiter actions)
- [x] `JobApprovalService` + `JobApprovalQueueComponent` (manager/admin); approve/reject workflow
- **Exit:** approval advances stage (manager → admin → published); reject returns to draft; build green. ✅

#### R1.4 — Pipeline + applicant detail ✅
- [x] Add CDK `DragDropModule`; `PipelineBoardComponent` (Kanban, optimistic `moveStage` w/ revert)
- [x] `ApplicantDetailComponent` (profile/match/activity/notes tabs, status tracker, editable tags, resume link)
- [x] `ApplicantService` (pipeline/getApplicant/moveStage/addNote/setTags — stateful mock, board ↔ detail consistent)
- **Exit:** drag a card → status updates + records a status event; notes/tags persist this session; build green. ✅

#### R1.4a — Application submission review ✅
- [x] `coverNote` on `Application` (candidate-side, persisted in `apply()`); `coverNote` + `resumeName`/`resumeUrl` on `ApplicantDetail`
- [x] Recruiter applicant detail: new **Application** tab (cover note + real attached-resume link); aside "View resume" opens the candidate's actual file
- [x] Candidate application detail shows the submitted cover note
- **Exit:** a recruiter can read each candidate's submitted cover note + open their attached resume; build green. ✅

#### R1.5 — Offers ✅
- [x] `OfferService` + `OfferListComponent` + `OfferFormComponent` (dialog); offer status shown via the generic `app-status-badge` + `OFFER_STATUS_META`
- [x] Create offer from applicant detail (dialog) → moves application to `Offer`; list tracks status (Draft → Sent → Accepted/Rejected/Withdrawn)
- **Exit:** create offer + lifecycle transitions against mock; creating an offer advances the candidate's pipeline stage; build green. ✅

#### R1.6 — Recruiter dashboard ✅
- [x] `EmployerDashboardService.load()` aggregates KPIs + pipeline snapshot + recent applicants via `forkJoin` (jobs + applicants + offers)
- [x] KPI strip (active jobs / applicants / in interview / offers out), pipeline-snapshot bars, recent-applicants list, role-aware CTAs (Create job, Review approvals)
- **Exit:** KPIs + widgets render from mock; CTAs deep-link; build green. ✅ **→ Employer P1 complete.**

---

### Phase 2 — Engagement
- **R2.0 Candidate search** ✅ — `CandidateSearchService` + filters (keyword/location/seniority/availability/remote/sort) + result cards + pagination; **visibility-aware** (Private profiles excluded). Route `/employer/candidates`.
- **R2.1 Talent pools** ✅ — `TalentPoolService` + list/detail + create/rename/delete + membership CRUD; "Add to pool" dialog from candidate search (multi-select + create-new). Routes `/employer/talent-pools`, `/:id`.
- **R2.2 Interviews** — 🔒 **Hidden / deferred.** Excluded platform-wide (no employer nav item or route), consistent with the candidate-side interview/message hide. To be implemented later alongside the comms/notification surfaces.
- **R2.3 Assessments** ✅ — `AssessmentService` + `AssessmentFormComponent` (dialog); **Assessments tab** on the applicant detail captures name/status/score/remarks with add/edit/remove. Status via `app-status-badge` + `ASSESSMENT_STATUS_META`; capturing a completed status stamps `submittedAt`. Kept as application-level capture (no separate pipeline column).
- **R2.4 Analytics** ✅ — `EmployerAnalyticsService` + `RecruitmentAnalyticsComponent` (manager/admin): KPI strip (open jobs / applicants / hires / avg time-to-hire / offer acceptance), **hiring funnel** (Applied→Hired bars + % of applied), applications-by-job bars, recruiter-performance table. Lightweight CSS visualisations — no chart lib. Route `/employer/analytics`. **→ Employer P2 complete.**

### Phase 3 — AI
- **R3.0** — AI **JD generator** in the wizard (Description step) + AI **candidate ranking** in the pipeline (consume `AiModule`).

---

## 14. Definition of done (per screen)

- Routed + lazy under `EmployerModule`; `employerGuard` + role gate.
- Data only via feature service → mock/`of()`; **no hardcoded data in components**; stateful mocks persist within session.
- Typed models, no `any`; reactive forms with validation; permission checks via `EmployerContextStore` + guards.
- Loading (skeleton) / empty / error states present.
- Responsive ≥ 360px; keyboard accessible (incl. Kanban).
- Optimistic actions roll back on error; toasts on success/failure.

---

## 15. Dependencies & build order

**Depends on:** Auth (current user, `employerGuard`), [Company Admin](04_Company_Admin.md) (company/department/team context — can stub `EmployerContextStore` from the signed-in user initially), shared design-system components, `@core` http/models/enums. Match scores reuse the candidate **Recommendation Engine** (`CANDIDATE_MATCH_SCORES`).
**Feeds:** the candidate workspace — published jobs appear in candidate search/recommendations; pipeline status moves drive the candidate's application tracker; offers/interviews surface to candidates.

**Suggested order:** shell + guards → models/mock → job list → wizard → detail + approval → pipeline + applicant detail → offers → dashboard → (P2) candidate search → talent pools → interviews → analytics → (P3) AI.

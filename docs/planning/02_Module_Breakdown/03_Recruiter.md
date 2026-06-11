# Module: Recruiter / Employer Operations

**Workspace:** Employer · **Route prefix:** `/employer` · **Guard:** `employerGuard`
**Angular module:** `EmployerModule` (lazy); operational features for Recruiter, Recruitment Manager, Hiring Manager.

> Company-level administration (profile, team, billing) lives in [Company Admin](04_Company_Admin.md). This file covers the **recruitment workflow** that recruiters/managers/hiring managers run day to day. Both share the `EmployerModule` shell and routing.

---

## 1. Scope

Job lifecycle, applicant management, hiring pipeline, candidate sourcing, interviews, and offers.

---

## 2. Sub-features, screens & components

| Sub-feature | Route | Phase | Role | Key components |
| --- | --- | --- | --- | --- |
| Dashboard | `/employer/dashboard` | P1 | all | `EmployerDashboardComponent`, KPI cards |
| Job List | `/employer/jobs` | P1 | all (scoped) | `JobListComponent`, `JobStatusFilter`, bulk-action bar |
| Create/Edit Job | `/employer/jobs/new`, `/employer/jobs/:id/edit` | P1 | recruiter+ | `JobWizardComponent` (Basic → Requirements → Compensation → Skills → Review) |
| Job Detail | `/employer/jobs/:id` | P1 | all | `JobDetailComponent`, metrics panel, approval-state badge |
| Approval Queue | `/employer/approvals` | P1 | manager/admin | `JobApprovalQueueComponent` |
| Applicants / Pipeline | `/employer/jobs/:id/applicants` | P1 | recruiter/HM | `PipelineBoardComponent` (Kanban), `ApplicantCard` |
| Applicant Detail | `/employer/applications/:id` | P1 | recruiter/HM | `ApplicantDetailComponent`, `ResumeViewer`, `CandidateNotes`, `CandidateTags`, `MatchScoreBadge` |
| Candidate Search | `/employer/candidates` | P2 | recruiter+ | `CandidateSearchComponent`, `CandidateFilterPanel`, `CandidateResultCard` |
| Talent Pools | `/employer/talent-pools` | P2 | recruiter+ | `TalentPoolListComponent`, `TalentPoolDetailComponent` |
| Interviews | `/employer/interviews` | P2 | recruiter/HM | `InterviewScheduleComponent`, `InterviewFeedbackForm`, `InterviewerPicker` |
| Offers | `/employer/offers` | P1 | recruiter/admin | `OfferListComponent`, `OfferFormComponent`, `OfferStatusBadge` |
| Analytics | `/employer/analytics` | P2 | manager/admin | `RecruitmentAnalyticsComponent`, funnel + KPI charts |

---

## 3. Services / State

- `JobService` (CRUD, status transitions, duplicate/pause/close/archive)
- `JobApprovalService`
- `ApplicantService` / `PipelineService` (status moves, notes, tags)
- `CandidateSearchService`
- `TalentPoolService`
- `EmployerInterviewService`
- `OfferService`
- `EmployerAnalyticsService`

## 4. Entities used

`JOBS`, `JOB_SKILLS`, `JOB_BENEFITS`, `JOB_LOCATIONS`, `APPLICATIONS`, `APPLICATION_STATUS_HISTORY`, `INTERVIEWS`, `INTERVIEWERS`, `ASSESSMENTS`, `OFFERS`, `TALENT_POOLS`, `TALENT_POOL_CANDIDATES`, `CANDIDATE_MATCH_SCORES`, `CANDIDATE_PROFILES` (read), `DEPARTMENTS` (read).

## 5. Key flows / business rules

- **Recruitment pipeline** (`Project_Doc.md §6`): `Applied → Screening → Shortlisted → Assessment → Interview → Offer → Hired`. Kanban columns map to `APPLICATION_STATUS_HISTORY.status`; moving a card POSTs a status change.
- **Job approval** (`§7`): `Recruiter creates → Manager approval → Company Admin approval → Published`. Job `status` reflects stage; queue filters by pending stage and viewer role.
- **Scoping:** recruiters see only assigned jobs/candidates; managers/admins see all company jobs (enforced by API + UI permission helper).
- **Offer** ties 1:1 to an application (`APPLICATIONS ||--|| OFFERS`).

---

## 6. Backlog by phase

### Phase 1
- [ ] Employer shell, nav, dashboard KPIs
- [ ] Job list + wizard create/edit + lifecycle actions
- [ ] Approval queue + workflow
- [ ] Pipeline Kanban + applicant detail (notes, tags, status moves)
- [ ] Offers CRUD + status tracking

### Phase 2
- [ ] Candidate search + filters
- [ ] Talent pools
- [ ] Interview scheduling + feedback + interviewers
- [ ] Assessments capture
- [ ] Recruitment analytics dashboards

### Phase 3
- [ ] AI candidate ranking + JD generation (consumes AI module)

## 7. Dependencies
Auth, Company Admin (company/department/team context), Recommendation Engine (match scores, P2), Messaging (candidate comms, P2).

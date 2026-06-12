# Module: Candidate

**Workspace:** Candidate · **Route prefix:** `/candidate` · **Guard:** `authGuard + candidateGuard`
**Angular module:** `CandidateModule` (lazy-loaded at the workspace boundary)

> Implementation spec. Follows the conventions already established in the Auth module — see [Folder Structure](../04_Angular_Folder_Structure.md) and the shipped `features/auth`. Same rules apply here: NgModule-based components (`standalone: false`), Angular Material + shared design system, **signal stores** for state, services returning `Observable<T>` via `of(mock)` gated on `environment.useMock`, strict TS (no `any`), ERD-derived models in `@core/models`.

---

## 1. Scope

Everything a job seeker does after authenticating:

1. **Build & maintain a profile** (personal info, summary, preferences, experience, education, skills, certifications, portfolio).
2. **Manage resumes** (upload, versions, default, preview).
3. **Find work** (search, filter, view, save, apply).
4. **Track outcomes** (applications pipeline, interviews).
5. **Engage** (recommendations, messages, notifications) — Phase 2.
6. **Get AI help** (resume parsing/review) — Phase 3.

---

## 2. Delivery phases at a glance

| # | Feature | Phase | Priority | Status | Primary screens |
| --- | --- | :---: | :---: | :---: | --- |
| 1 | Candidate shell (header + sidebar layout) | P1 | Must | ✅ Done | layout |
| 2 | Dashboard | P1 | Must | ✅ Done | `/candidate/dashboard` |
| 3 | Profile (multi-section editor) | P1 | Must | ✅ Done | `/candidate/profile` |
| 4 | Resume manager | P1 | Must | ✅ Done | `/candidate/resumes` |
| 5 | Job search + filters | P1 | Must | ✅ Done | `/candidate/jobs` |
| 6 | Job detail + apply flow | P1 | Must | ✅ Done | `/candidate/jobs/:id` |
| 7 | Saved jobs | P1 | Should | ✅ Done | `/candidate/saved-jobs` |
| 8 | Applications list + status tracker | P1 | Must | ✅ Done | `/candidate/applications`, `/:id` |
| 9 | Account settings | P1 | Should | ✅ Done | `/candidate/settings` |
| 10 | Recommendations (match bands) | P2 | Must | ✅ Done | `/candidate/recommendations` |
| 11 | Interviews | P2 | Must | 🔒 Hidden | `/candidate/interviews` |
| 12 | Messages | P2 | Should | 🔒 Hidden | `/candidate/messages` |
| 13 | Notifications | P2 | Should | ⬜ Stub | `/candidate/notifications` |
| 14 | Behavioral tracking hooks | P2 | Could | ⬜ Pending | (cross-cutting) |
| 15 | AI resume review / parse-to-profile | P3 | Could | ⬜ Pending | within profile/resume |

> **Status legend:** ✅ done & build-verified · ⬜ pending · 🔒 hidden in the UI (nav + routes removed; deferred to Phase 2).
> **Phase 1 (MVP) is fully complete & build-verified** — all P1 features incl. the **Resume manager** (slice **C1.7**). **Interviews & Messages were intentionally hidden** from the candidate UI (sidebar, header, dashboard, routes) and are deferred to Phase 2 (C2.1 / C2.2).

---

## 3. Route map (`candidate-routing.module.ts`)

All children render inside `CandidateLayoutComponent` (sidebar + header shell). Lazy-loaded via the root route `{ path: 'candidate', canActivate: [authGuard, candidateGuard], loadChildren: ... }`.

```ts
const routes: Routes = [
  {
    path: '',
    component: CandidateLayoutComponent,
    children: [
      { path: 'dashboard',          component: CandidateDashboardComponent,  title: 'Dashboard | Job Click' },
      { path: 'profile',            component: ProfileShellComponent,        title: 'My Profile | Job Click' },
      { path: 'resumes',            component: ResumeManagerComponent,       title: 'Resumes | Job Click' },
      { path: 'jobs',               component: JobSearchComponent,           title: 'Find Jobs | Job Click' },
      { path: 'jobs/:id',           component: JobDetailComponent,           title: 'Job Details | Job Click' },
      { path: 'saved-jobs',         component: SavedJobsComponent,           title: 'Saved Jobs | Job Click' },
      { path: 'recommendations',    component: RecommendationsComponent,     title: 'Recommended | Job Click' },   // P2
      { path: 'applications',       component: ApplicationListComponent,     title: 'Applications | Job Click' },
      { path: 'applications/:id',   component: ApplicationDetailComponent,   title: 'Application | Job Click' },
      { path: 'interviews',         component: InterviewListComponent,       title: 'Interviews | Job Click' },    // P2
      { path: 'messages',           component: MessagesComponent,            title: 'Messages | Job Click' },      // P2
      { path: 'messages/:conversationId', component: MessagesComponent,      title: 'Messages | Job Click' },      // P2
      { path: 'notifications',      component: NotificationsPageComponent,   title: 'Notifications | Job Click' }, // P2
      { path: 'settings',           component: AccountSettingsComponent,     title: 'Settings | Job Click' },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
];
```

> `candidateGuard` must be created in `@core/auth/guards` (mirrors the shipped `authGuard`/`guestGuard`): allow when `CurrentUserStore.hasRole(RoleCode.Candidate)`, else redirect to `/403`. Update `guestGuard`'s post-login redirect target to `/candidate/dashboard` for candidates once this workspace exists (replaces the temporary `/welcome`).

---

## 4. Feature folder structure

```text
features/candidate/
├── candidate.module.ts
├── candidate-routing.module.ts
├── models/                         # candidate-only view models / form models
│   ├── candidate-dashboard.model.ts
│   └── job-search-query.model.ts
├── services/
│   ├── candidate-profile.service.ts
│   ├── resume.service.ts
│   ├── job-search.service.ts
│   ├── saved-job.service.ts
│   ├── application.service.ts
│   └── candidate-interview.service.ts        # P2
├── state/
│   └── candidate-profile.store.ts            # signal store
├── components/                     # feature-local presentational pieces
│   ├── profile-completion-card/
│   ├── job-card/                   # (or use shared app-job-card)
│   ├── application-status-tracker/
│   ├── match-breakdown/            # P2
│   └── apply-dialog/
└── pages/                          # routed (smart) components
    ├── dashboard/
    ├── profile/                    # ProfileShell + section components
    │   └── sections/
    ├── resumes/
    ├── jobs/                       # search + detail
    ├── saved-jobs/
    ├── applications/               # list + detail
    ├── recommendations/            # P2
    ├── interviews/                 # P2
    ├── messages/                   # P2 (reuses CommsModule)
    ├── notifications/              # P2 (reuses CommsModule)
    └── settings/
```

Cross-cutting models (`Job`, `Application`, `Interview`, `JobMatchScore`) live in `@core/models`; candidate-only models live here.

---

## 5. Domain models (ERD-derived, `@core/models`)

snake_case columns → camelCase fields; mapping in services, never components.

### `candidate.model.ts`
```ts
export interface CandidateProfile {
  id: Id;
  userId: Id;
  // personal (composed from USERS + CANDIDATE_PROFILES for the UI)
  fullName: string;
  email: string;
  phone?: string;
  profilePhotoUrl?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  address?: string;
  // professional
  headline?: string;
  summary?: string;
  careerObjective?: string;
  // preferences
  preferredJobTitles: string[];
  preferredLocations: string[];
  employmentTypes: EmploymentType[];
  workMode?: WorkMode;
  expectedSalary?: number;
  currency?: string;
  availabilityStatus: AvailabilityStatus;
  profileVisibility: ProfileVisibility;
  profileCompletion: number;            // 0-100
  updatedAt?: string;
}

export interface CandidateSkill { id: Id; skillId: Id; name: string; category?: string; proficiency: ProficiencyLevel; yearsExperience: number; }
export interface CandidateExperience { id: Id; companyName: string; jobTitle: string; startDate: string; endDate?: string; currentJob: boolean; responsibilities?: string; achievements?: string; }
export interface CandidateEducation { id: Id; institution: string; degree: string; major: string; gpa?: number; graduationYear: number; }
export interface CandidateCertification { id: Id; certificationName: string; issuer: string; issueDate?: string; expiryDate?: string; }
export interface CandidatePortfolio { id: Id; platform: PortfolioPlatform; url: string; }
export interface Resume { id: Id; fileName: string; fileUrl: string; sizeBytes: number; isDefault: boolean; uploadedAt: string; }
```

### `job.model.ts` (shared with public + employer)
```ts
export interface JobSummary { id: Id; title: string; companyId: Id; companyName: string; companyLogoUrl?: string; location: string; employmentType: EmploymentType; workMode: WorkMode; seniorityLevel: SeniorityLevel; salaryMin?: number; salaryMax?: number; currency?: string; publishedAt: string; matchScore?: number; isSaved?: boolean; }
export interface Job extends JobSummary { description: string; requirements: string; skills: JobSkillRequirement[]; benefits: string[]; locations: JobLocation[]; expiredAt?: string; status: JobStatus; }
export interface JobSkillRequirement { skillId: Id; name: string; required: boolean; }
export interface JobLocation { country: string; state?: string; city: string; address?: string; }
```

### `application.model.ts`
```ts
export interface Application { id: Id; job: JobSummary; resumeId: Id; status: ApplicationStatus; matchScore?: number; appliedAt: string; statusHistory: ApplicationStatusEvent[]; }
export interface ApplicationStatusEvent { status: ApplicationStatus; changedAt: string; remarks?: string; }
export interface ApplyRequest { jobId: Id; resumeId: Id; coverNote?: string; }
```

### `recommendation.model.ts` (P2)
```ts
export interface JobMatchScore { jobId: Id; total: number; skill: number; experience: number; location: number; salary: number; education: number; calculatedAt: string; }
export interface RecommendedJob { job: JobSummary; match: JobMatchScore; }
export type MatchCategory = 'best' | 'good' | 'growth' | 'trending' | 'new';
```

---

## 6. Enums (`@core/enums`)

| Enum | Values |
| --- | --- |
| `ApplicationStatus` | `Applied, Viewed, Screening, Shortlisted, Interview, Offer, Hired, Rejected, Withdrawn` |
| `EmploymentType` | `FullTime, PartTime, Contract, Internship, Temporary` |
| `WorkMode` | `Onsite, Remote, Hybrid` |
| `SeniorityLevel` | `Entry, Junior, Mid, Senior, Lead, Manager, Executive` |
| `AvailabilityStatus` | `OpenToWork, Employed, NotLooking` |
| `ProficiencyLevel` | `Beginner, Intermediate, Advanced, Expert` |
| `ProfileVisibility` | `Public, RecruitersOnly, Private` |
| `PortfolioPlatform` | `LinkedIn, GitHub, Website, Behance, Dribbble` |

Each ships with a `statusLabel`/color map (consumed by the shared `statusLabel` pipe + `app-application-status-chip`).

---

## 7. Services & state

All services: `@Injectable({ providedIn: 'root' })`, mock branch gated on `environment.useMock` with `delay(400-700ms)`, real branch via `ApiBaseService`. Endpoints per [API Contract](../06_API_Contract_Assumptions.md) §4.

```ts
// candidate-profile.service.ts
getProfile(): Observable<CandidateProfile>
updateProfile(patch: Partial<CandidateProfile>): Observable<CandidateProfile>
getSkills(): Observable<CandidateSkill[]>;  addSkill(dto): Observable<CandidateSkill>;  updateSkill(id, dto); removeSkill(id): Observable<void>
getExperiences()/add/update/remove        // same CRUD shape
getEducations()/add/update/remove
getCertifications()/add/update/remove
getPortfolios()/add/update/remove

// resume.service.ts
list(): Observable<Resume[]>;  upload(file: File): Observable<Resume>;  setDefault(id): Observable<void>;  remove(id): Observable<void>

// job-search.service.ts (shared with public)
search(query: JobSearchQuery): Observable<Paginated<JobSummary>>
getById(id: Id): Observable<Job>
apply(request: ApplyRequest): Observable<Application>

// saved-job.service.ts
list(): Observable<SavedJob[]>;  save(jobId): Observable<void>;  remove(jobId): Observable<void>

// application.service.ts
list(query?: PageQuery): Observable<Paginated<Application>>
getById(id: Id): Observable<Application>
withdraw(id: Id): Observable<void>

// candidate-interview.service.ts (P2)
list(): Observable<Interview[]>;  getById(id): Observable<Interview>;  requestReschedule(id, reason): Observable<void>
```

**State — `CandidateProfileStore` (signal store, `providedIn: 'root'`):**
```ts
readonly profile = signal<CandidateProfile | null>(null);
readonly completion = computed(() => this.profile()?.profileCompletion ?? 0);
readonly isApplyReady = computed(() => /* verified email + >=1 resume + min fields */);
load(): void;  patch(p: Partial<CandidateProfile>): void;
```
Dashboard composes data from multiple services with `forkJoin`; lists use the `async` pipe or `toSignal`.

---

## 8. Sub-feature specs

### 8.1 Candidate shell (`CandidateLayoutComponent`) — P1
- Header (global `AppHeaderComponent`): logo (`<app-logo>`), global search, notification bell, messages icon, user menu (profile, settings, sign out).
- Sidebar (`AppSidebarComponent`): nav items driven by a `candidateNav` config — Dashboard, Find Jobs, Recommendations, Applications, Saved Jobs, Interviews, Messages, Profile, Resumes, Settings. Collapsible; mobile = off-canvas drawer (`mat-sidenav`).
- Content area hosts `<router-outlet>` with a max-width container.
- **Import note:** import `CandidateLayoutComponent` into `CandidateModule`/routing via **relative path**, not `@layouts` (see [layout import gotcha](../../..)/memory — same TS-993004 fix used in Auth).

### 8.2 Dashboard — P1
Route `/candidate/dashboard`. Grid of widget cards (`app-kpi-card` + custom):
| Widget | Source | Action |
| --- | --- | --- |
| Profile completion | `CandidateProfileStore.completion` | ring/progress + "Complete profile" CTA → profile |
| Recommended jobs (top 3) | `RecommendationService` (P2; P1 shows "Newest jobs" fallback) | → recommendations / job detail |
| Recent applications | `ApplicationService.list({pageSize:5})` | status chips → application detail |
| Interview invitations | `CandidateInterviewService` (P2) | → interviews |
| Saved jobs (count + preview) | `SavedJobService` | → saved jobs |
| Notifications (latest) | `NotificationService` (P2) | → notifications |
States: skeleton loaders while loading; empty states per widget; error state with retry.

### 8.3 Profile (`ProfileShellComponent` + sections) — P1
Route `/candidate/profile`. Sectioned single page with a sticky left in-page nav (anchors) on desktop, stacked on mobile. A header card shows photo, name, headline, completion ring, visibility/availability badges.

Section components (each: read view + inline edit via dialog or expandable form, optimistic save, toast on success):
| Section | Fields / validation |
| --- | --- |
| `PersonalInfoSection` | full name (req), photo upload, DOB, gender, nationality, phone (pattern), email (read-only), address |
| `ProfessionalSummarySection` | headline (≤120), summary (rich text ≤2000), career objective |
| `EmploymentPreferencesSection` | preferred titles (chips), locations (chips), employment types (multi), work mode, expected salary + currency |
| `WorkExperienceSection` | list + add/edit/remove; company, title, start/end (end disabled when "current"), responsibilities, achievements; date order validation |
| `EducationSection` | list CRUD; institution, degree, major, GPA (0-4/5), graduation year |
| `SkillsSection` | `app-skill-selector` typeahead from skills taxonomy; proficiency + years per skill |
| `CertificationsSection` | list CRUD; name, issuer, issue/expiry dates; expiry highlight |
| `PortfolioSection` | platform + URL (url validation); LinkedIn/GitHub/Website/Behance/Dribbble |
Profile completion recalculated client-side after each save for instant feedback; server value is source of truth.

### 8.4 Resume manager (`ResumeManagerComponent`) — P1
Route `/candidate/resumes`. List of resume cards (name, size, uploaded date, default badge). Actions: upload (`app-file-upload`, PDF/DOC ≤ `environment.allowFileSizeMb`), set default (single), preview (`ResumePreviewComponent` — embed/iframe for PDF), download, remove (confirm dialog). Empty state when none. Parsing is P3.

### 8.5 Job search (`JobSearchComponent`) — P1
Route `/candidate/jobs`. Layout: filter panel (left/drawer) + results list + sort + pagination.
- **Filters** (`JobSearchQuery`): keyword, location, salaryMin, industry, company, employmentType[], seniorityLevel[], workMode (remote toggle). Debounced; reflected in query params (shareable URLs).
- **Sort:** relevance, newest, salary.
- **Result item** (`app-job-card`): title, company + logo, location, employment type, salary range, posted date, match score badge (P2), save toggle, "Apply" / "View".
- States: skeleton list, empty ("no jobs match"), error+retry. Server-side pagination (`Paginated<JobSummary>`).

### 8.6 Job detail + apply (`JobDetailComponent`, `ApplyDialogComponent`) — P1
Route `/candidate/jobs/:id`. Two-column: description/requirements/skills/benefits/locations + sticky company card with apply/save. Match breakdown (P2). Similar jobs (P2).
**Apply flow** (`ApplyDialogComponent`): pre-apply gate (`CandidateProfileStore.isApplyReady` — verified email, ≥1 resume, min fields; else show checklist). Select resume (default preselected), optional cover note, submit → `JobSearchService.apply` → success toast + status becomes "Applied" + button disabled. Idempotent (avoid double apply).

### 8.7 Saved jobs (`SavedJobsComponent`) — P1
Route `/candidate/saved-jobs`. List of saved job cards; remove; "Apply" inline. Optimistic save/unsave synced with search + detail. Empty state.

### 8.8 Applications + tracker — P1
Route `/candidate/applications` (list) and `/:id` (detail).
- **List:** table/cards with job, applied date, current status chip, match score; filter by status; sort by date. Pagination.
- **Detail:** job summary + **`ApplicationStatusTracker`** — horizontal timeline `Applied → Viewed → Screening → Shortlisted → Interview → Offer → Hired` (read-only, server-driven; `Rejected`/`Withdrawn` rendered as terminal states). Shows status history with timestamps + remarks. Withdraw action (confirm) when not terminal.

### 8.9 Recommendations (`RecommendationsComponent`) — P2
Route `/candidate/recommendations`. Tabs/sections by `MatchCategory`: **Best 90-100%**, **Good 75-89%**, **Growth 60-74%**, **Trending**, **New**. Each job card shows `app-match-score-badge` + `match-breakdown` popover (skill/experience/location/salary/education weighted bars per `Project_Doc §9`). Actions feed `BehaviorTrackerService`.

### 8.10 Interviews (`InterviewListComponent`) — P2
Route `/candidate/interviews`. Upcoming/past tabs; cards with round, type, scheduled time, join link (`safeUrl` pipe), status. Request reschedule (reason dialog). Calendar view optional.

### 8.11 Messages & notifications — P2
Reuse `CommsModule` (`ConversationList`, `MessageThread`, `MessageComposer`, `NotificationList`). Candidate pages are thin hosts. See [Messaging & Notifications](07_Messaging_and_Notifications.md).

### 8.12 Settings (`AccountSettingsComponent`) — P1
Route `/candidate/settings`. Tabs: Account (change email/phone/password), Privacy (`profileVisibility`, `availabilityStatus`), Notifications (channel prefs — in-app managed; email/SMS toggles). Each tab = small reactive form with save + toast.

---

## 9. Components consumed vs new

**From shared inventory:** `app-button`, `app-card`, `app-kpi-card`, `app-job-card`, `app-application-status-chip`, `app-status-tracker`, `app-match-score-badge` (P2), `app-empty-state`, `app-error-state`, `app-skeleton`, `app-file-upload`, `app-skill-selector`, `app-search-bar`, `app-filter-panel`, `app-confirm-dialog`, `app-toast`, `app-password-strength` (settings), `app-logo`, `app-pagination`, `app-tag/chip`, pipes (`timeAgo`, `salaryFormat`, `statusLabel`, `safeUrl`).

**New candidate-local:** `ProfileShellComponent` + 8 section components, `ResumePreviewComponent`, `ApplyDialogComponent`, `ApplicationStatusTracker` (if not promoted to shared), `ProfileCompletionCard`, `MatchBreakdown` (P2), `CandidateLayoutComponent`.

> Build the shared P1 primitives first (kpi-card, job-card, status chip/tracker, file-upload, skill-selector, filter-panel, empty/error/skeleton) — they unblock most candidate screens.

---

## 10. Mock data requirements

Add fixtures + handlers per [Mock Data Strategy](../07_Mock_Data_Strategy.md):
- 1 logged-in candidate with a **partially complete** profile (to exercise the completion widget) + skills/experience/education/certs/portfolio.
- 2-3 resumes (one default).
- ~30-50 jobs across companies/industries/types (drives search + detail; cross-referenced to companies).
- ~6-10 applications spanning **all** statuses (incl. Rejected/Withdrawn) with history rows.
- ~3-5 saved jobs.
- P2: match scores per relevant job (seed best/good/growth bands), ~3 interviews, notifications, conversations.
All IDs must cross-resolve (every `jobId`/`companyId` exists).

---

## 11. Business rules & status flows

- **Application status** (`Project_Doc §5`): `Applied → Viewed → Screening → Shortlisted → Interview → Offer → Hired`; `Rejected`/`Withdrawn` terminal. Read-only on candidate side; server-driven.
- **Profile completion %**: server is source of truth (`CANDIDATE_PROFILES.profile_completion`); recompute client-side after edits for instant feedback.
- **Apply gating:** verified email + ≥1 resume + minimum profile fields (`isApplyReady`); otherwise show a checklist instead of the apply dialog.
- **Save/apply sync:** `isSaved`/applied state stays consistent across dashboard, search, detail, saved-jobs (optimistic with rollback on error).
- **Visibility:** `profileVisibility` governs whether recruiters can discover the candidate (enforced server-side; surfaced in settings).

---

## 12. Accessibility & responsive

- All forms keyboard-navigable; labelled inputs; `mat-error` messages; visible focus (already global).
- Status chips/badges convey state with text + color (not color alone).
- Dashboard grid: 3-col → 2 → 1 across breakpoints; sidebar collapses to drawer < 960px; filter panel becomes a bottom-sheet/drawer on mobile.
- Skeleton loaders for every async view; empty + error states everywhere.

---

## 13. Phased build plan (sequenced slices)

Built as **vertical slices**, each independently shippable and **build-verified** before the next — the same cadence used for Auth (Phase 0 → 1 → 2). Slice IDs map to the high-level phases in §2 (P1 = `C1.x`, P2 = `C2.x`, P3 = `C3.x`).

> **Current status:** **Phase 1 (C1.0–C1.7) ✅ complete.** **Phase 2: C2.0 Recommendations ✅ complete & build-verified** (5 match bands, breakdown popover, badge wired into job cards + dashboard "Recommended for you"). **Interviews & Messages remain 🔒 hidden** (re-enabled in C2.1 / C2.2). **Next: C2.3 Behavioral tracking** (or un-hide C2.1 / C2.2 when ready).

### 13.1 Sequence & dependencies

```text
Phase 1 (MVP) — ✅ COMPLETE
  C1.0 Foundation ─► C1.1 Profile ─► C1.2 Dashboard
          │                              ▲
          ├─► C1.3 Job Search ─► C1.4 Job Detail + Apply ─► C1.5 Saved + Applications
          ├─► C1.6 Settings
          └─► C1.7 Resume manager   ✅

Phase 2:  C2.0 Recommendations ─► C2.1 Interviews 🔒 ─► C2.2 Messages 🔒 ─► C2.3 Behavior tracking
Phase 3:  C3.0 AI resume review ─► C3.1 AI parse → profile pre-fill
(🔒 = re-adds the nav items + routes currently hidden in the build)
```

| Slice | Goal | Depends on | Size | Status |
| --- | --- | --- | :---: | :---: |
| **C1.0** | Foundation & shell (walking skeleton) | Auth | M | ✅ Done |
| **C1.1** | Profile (8 sections, CRUD) | C1.0 | L | ✅ Done |
| **C1.2** | Dashboard widgets | C1.0, C1.1 | M | ✅ Done |
| **C1.3** | Job search + filters | C1.0 | L | ✅ Done |
| **C1.4** | Job detail + apply flow | C1.3 | M | ✅ Done |
| **C1.5** | Saved jobs + applications tracker | C1.4 | M | ✅ Done |
| **C1.6** | Account settings | C1.0 | S | ✅ Done |
| **C1.7** | Resume manager | C1.4 | M | ✅ Done |
| **C2.0** | Recommendations (match bands) | C1.3, Reco engine | M | ✅ Done |
| **C2.1** | Interviews | C1.5 | S | 🔒 Hidden |
| **C2.2** | Messages + notifications | CommsModule | M | 🔒 Hidden (msgs) |
| **C2.3** | Behavioral tracking hooks | C1.3–C1.5 | S | ⬜ Pending |
| **C3.0** | AI resume review | C1.4, AiModule | M | ⬜ Pending |
| **C3.1** | AI parse → profile pre-fill | C1.1, C1.4 | M | ⬜ Pending |

---

### Phase 1 — MVP

#### C1.0 — Foundation & shell  *(walking skeleton — do first)*
**Goal:** an authenticated candidate can sign in and navigate an empty-but-real workspace.
- [ ] `candidateGuard` in `@core/auth/guards`; repoint `guestGuard`/post-login redirect to `/candidate/dashboard` for candidates
- [ ] Lazy `CandidateModule` + `candidate-routing.module.ts` wired into root routes
- [ ] `CandidateLayoutComponent` (header with `<app-logo>`, user menu, sidebar nav config, mobile drawer) — **relative import** of the layout class
- [ ] Enums (`ApplicationStatus`, `EmploymentType`, `WorkMode`, `SeniorityLevel`, `AvailabilityStatus`, `ProficiencyLevel`, `ProfileVisibility`, `PortfolioPlatform`) + `statusLabel` maps
- [ ] Cross-cutting models (`candidate`, `job`, `application`, `recommendation`)
- [ ] Mock fixtures (`candidate-profile`, `jobs`, `applications`, `saved-jobs`, `resumes`) + handlers
- [ ] `CandidateProfileService` + `CandidateProfileStore` (load on shell init)
- [ ] Shared P1 primitives needed downstream: `app-kpi-card`, `app-empty-state`, `app-error-state`, `app-skeleton`, `app-page-header`
- [ ] Placeholder dashboard route
- **Exit:** build green; login as candidate → land on shell; sidebar nav routes resolve; profile loads into store.

#### C1.1 — Profile
**Goal:** candidate can view and edit a complete profile; completion updates.
- [ ] `ProfileShellComponent` (header card: photo, name, headline, completion ring, visibility/availability badges; in-page section nav)
- [ ] Sections: `PersonalInfo`, `ProfessionalSummary`, `EmploymentPreferences`, `WorkExperience`, `Education`, `Skills`, `Certifications`, `Portfolio` (read view + edit, validation per §8.3)
- [ ] `CandidateProfileService` sub-collection CRUD (skills/experience/education/certs/portfolio)
- [ ] Shared deps: `app-skill-selector`, `app-file-upload` (photo), `app-confirm-dialog`, `app-tag/chip`, rich-text (summary)
- [ ] Client-side completion recompute after save + toast
- **Exit:** every section CRUD works against mock; completion reflects changes; build green.

#### C1.2 — Dashboard
**Goal:** at-a-glance landing with real widgets.
- [ ] `CandidateDashboardComponent` widget grid: profile completion, recent applications, saved-jobs preview, newest jobs (recommendations fallback until C2.0), (interview/notification widgets stubbed for P2)
- [ ] Compose via `forkJoin`; skeleton + empty + error per widget
- **Exit:** widgets render from mock; CTAs deep-link correctly; build green.

#### C1.3 — Job search
**Goal:** candidate can search, filter, sort, and page through jobs.
- [ ] `JobSearchComponent` + `JobSearchQuery` model; `JobSearchService.search()` (mock paginated)
- [ ] `app-filter-panel` (keyword, location, salary, industry, company, type[], seniority[], remote) — debounced, query-param synced
- [ ] `app-job-card` (shared) + result list + sort + `app-pagination`
- [ ] `SavedJobService.save/remove` + inline save toggle (state stub; full sync in C1.5)
- **Exit:** filters/sort/pagination drive results from mock; URL reflects query; build green.

#### C1.4 — Job detail + apply
**Goal:** candidate can open a job and apply.
- [ ] `JobDetailComponent` (description, requirements, skills, benefits, locations, company card)
- [ ] `ApplyDialogComponent`: pre-apply gate (`isApplyReady` checklist), resume select, cover note, submit (idempotent)
- [ ] `JobSearchService.getById/apply`
- **Exit:** apply creates an application (mock), disables re-apply, toasts; gate blocks when not ready; build green.

#### C1.5 — Saved jobs + applications
**Goal:** candidate can manage saved jobs and track outcomes end-to-end.
- [ ] `SavedJobsComponent` (list, remove, apply inline) with optimistic save/unsave **synced** across search/detail/dashboard
- [ ] `ApplicationListComponent` (filter by status, sort, pagination)
- [ ] `ApplicationDetailComponent` + `ApplicationStatusTracker` timeline (read-only) + history + withdraw (confirm)
- [ ] `ApplicationService.list/getById/withdraw`
- **Exit:** save state consistent everywhere; tracker renders all statuses incl. Rejected/Withdrawn; build green. **→ P1 candidate complete.**

#### C1.6 — Settings  ✅ Done
**Goal:** candidate can manage account, privacy, notification prefs.
- [x] `AccountSettingsComponent` tabs: Account (email/phone/password — reuse `app-password-strength`), Privacy (`profileVisibility`, `availabilityStatus`), Notifications (channel toggles)
- **Exit:** each tab saves to mock + toast; build green. *(Ran in parallel with C1.3–C1.5.)*

#### C1.7 — Resume manager  ✅ Done (last P1 slice)
**Goal:** candidate can upload, manage, preview, and set a default resume.
- [x] `ResumeManagerComponent` at `/candidate/resumes` (replaced the coming-soon route; sidebar nav already present)
- [x] Extended `ResumeService` with stateful `upload` / `setDefault` / `remove` (uploads use an object URL so preview/download hit the real file)
- [x] Shared `app-file-upload` (drag/drop, PDF/DOC ≤ `environment.allowFileSizeMb`, type+size validation) + `ResumePreviewDialogComponent` (PDF iframe), download, remove (confirm)
- [x] Apply dialog (C1.4) reads the same stateful `ResumeService` — uploaded resumes appear in the gate + dropdown
- **Exit:** upload/list/default/preview/remove work against mock; build green. **→ P1 candidate fully complete.** ✅

> A 646-byte valid placeholder PDF (`assets/mock/files/sample-resume.pdf`) backs the seed resumes so preview renders; uploaded files preview via their object URL.

---

### Phase 2 — Engagement

#### C2.0 — Recommendations  ✅ Done
- [x] `recommendation` models + `RecommendationService.getRecommendedJobs(category)` / `getTopRecommendations` / `getMatchBreakdown` (mock scores via §9 weights)
- [x] `RecommendationsComponent` with 5 bands (Best/Good/Growth/Trending/New) as a segmented tab bar, lazy per-band load
- [x] Shared `app-match-score-badge` (band-colored) + `app-match-breakdown` popover (weighted skill/exp/loc/salary/edu bars), surfaced via `RecommendationCardComponent`
- [x] Wired match badge into `app-job-card` + turned the dashboard widget into "Recommended for you"
- **Exit:** bands populate from mock match scores; breakdown explains the score; build green. ✅

#### C2.1 — Interviews  *(🔒 currently hidden in the UI)*
- [ ] Re-add the **Interviews** sidebar nav item + `/candidate/interviews` route (both removed in the current build)
- [ ] `CandidateInterviewService` + `InterviewListComponent` (upcoming/past, join link via `safeUrl`, reschedule request dialog)
- [ ] Re-add the dashboard interview KPI / invitations widget
- **Exit:** interviews list + reschedule against mock; build green.

#### C2.2 — Messages & notifications  *(🔒 messaging currently hidden in the UI)*
- [ ] Re-add the **Messages** sidebar nav item + header icon + `/candidate/messages` route (all removed in the current build)
- [ ] Consume `CommsModule` (`MessagingService`, `NotificationService`, thread/list/composer, bell + panel in header)
- [ ] `MessagesComponent` + `NotificationsPageComponent` host pages (replace the notifications coming-soon placeholder); unread badges in shell
- **Exit:** threads + notifications render/mark-read from mock; build green.

#### C2.3 — Behavioral tracking
- [ ] `BehaviorTrackerService` hooks on job view, search, save, apply (feeds `SEARCH_HISTORY`/`RECOMMENDATION_LOGS` mocks)
- **Exit:** events recorded (verifiable in mock store); no UX regressions; build green.

---

### Phase 3 — AI

#### C3.0 — AI resume review
- [ ] Consume `AiModule`/`AiService`; `ResumeReviewSuggestionsComponent` in resume manager (suggestion cards, apply actions, streaming/loading states, disclaimer)
- **Exit:** review suggestions render from mock AI; build green.

#### C3.1 — AI parse → profile pre-fill
- [ ] On resume upload: `AiService.parse` → `ResumeParseReviewComponent` (review extracted skills/experience/education/certs) → accept → pre-fill profile sections (human-in-the-loop)
- **Exit:** parsed fields reviewable and committed to profile via existing CRUD; build green. **→ candidate module complete.**

---

## 14. Definition of done (per screen)

- Routed + lazy under `CandidateModule`; guarded.
- Data only via feature service → mock interceptor/`of()`; **no hardcoded data in components**.
- Typed models, no `any`; forms reactive with validation.
- Loading (skeleton) / empty / error states present.
- Responsive ≥ 360px; keyboard accessible.
- Optimistic actions roll back on error; toasts on success/failure.

---

## 15. Dependencies & build order

**Depends on:** Auth (current user, `candidateGuard`), shared design-system components, `@core` http/models/enums.
**Blocks/feeds:** Recommendation Engine + Messaging/Notifications surfaces (P2) plug into existing candidate pages; AI (P3) plugs into profile/resume.

**Suggested order:** shell + guard → models/mock → profile + dashboard → job search + detail + apply → saved + applications → settings → (P2) recommendations → interviews → comms → (P3) AI.

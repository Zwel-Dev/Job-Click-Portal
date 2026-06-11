# Job Click Portal — Frontend Planning Pack

> Pre-development planning artifacts derived from [`Project_Doc.md`](../../Project_Doc.md) and [`Database_ERD.md`](../../Database_ERD.md).
> **Status:** Planning only — no application code yet.

---

## 1. Purpose

This pack defines **what we will build and how the Angular app is structured** before any feature code is written. It is the single source of truth for sitemap, routes, module boundaries, shared UI, API expectations, and mock-data approach.

---

## 2. Tech Baseline (from the existing repo)

| Concern | Decision | Source |
| --- | --- | --- |
| Framework | Angular **19.2** | `package.json` |
| Component style | **NgModule-based** (not standalone) | `angular.json` → `schematics.standalone: false` |
| Styling | **SCSS** | `angular.json` → `inlineStyleLanguage: scss` |
| Routing | Lazy-loaded feature modules | `app-routing.module.ts` |
| API base URL | `http://localhost:5100` (runtime config) | `src/appsettings.json` |
| State | **Signal-based stores** (Angular 19) in services; no NgRx in MVP | Decision (see [folder structure](04_Angular_Folder_Structure.md)) |
| Config | `baseApiUrl` from runtime `appsettings.json` (`AppConfigService`); `environment.*` = build flags only | Reconciled in [folder structure](04_Angular_Folder_Structure.md) |

> ⚠️ **Known issue:** `app-routing.module.ts` lazy-loads `./pages/systematic/modules/auth/auth.module`, which has been **deleted** (git status `D`). The `src/app/pages/auth` folder is empty. Routing is currently broken and is addressed in the [Route Map](03_Route_Map.md) and the [Auth module plan](02_Module_Breakdown/01_Auth_and_Onboarding.md).

---

## 3. Audience Workspaces

The app is divided into four top-level **workspaces**, each lazy-loaded and guarded by role:

| Workspace | Route prefix | User types | Guard |
| --- | --- | --- | --- |
| **Public / Auth** | `/`, `/auth` | Anonymous visitors | none |
| **Candidate** | `/candidate` | Candidate | `candidateGuard` |
| **Employer** | `/employer` | Company Admin, Recruitment Manager, Recruiter, Hiring Manager | `employerGuard` + per-feature role checks |
| **Platform Admin** | `/admin` | Platform Admin | `adminGuard` |

Rationale: the four company roles share the same data, layout, and navigation; differences are **feature-level permissions**, not separate apps. Keeping them in one `employer` workspace avoids duplicating the jobs/applications/pipeline UI four times.

---

## 4. Delivery Phases (aligned to `Project_Doc.md §14`)

| Phase | Theme | Modules |
| --- | --- | --- |
| **Phase 1 — MVP** | Core marketplace + ATS basics | Auth, Candidate (profile/resume/search/apply), Employer (company, team, jobs, applications), Admin (verification, users) |
| **Phase 2 — Engagement** | Matching, comms, scheduling | Recommendation Engine, Messaging, Notifications, Interview Scheduling, Analytics |
| **Phase 3 — Intelligence & Revenue** | AI + monetization | AI Resume Parsing, AI Matching, AI Interview Questions, Subscription Billing, Enterprise features |

---

## 5. Index of Artifacts

| # | Artifact | File |
| --- | --- | --- |
| 1 | Application Sitemap | [01_Application_Sitemap.md](01_Application_Sitemap.md) |
| 2 | Feature / Module Breakdown (per-module files) | [02_Module_Breakdown/](02_Module_Breakdown/00_Module_Breakdown_Index.md) |
| 3 | Route Map | [03_Route_Map.md](03_Route_Map.md) |
| 4 | Angular Folder Structure | [04_Angular_Folder_Structure.md](04_Angular_Folder_Structure.md) |
| 5 | Shared Component Inventory | [05_Shared_Component_Inventory.md](05_Shared_Component_Inventory.md) |
| 6 | API Contract Assumptions | [06_API_Contract_Assumptions.md](06_API_Contract_Assumptions.md) |
| 7 | Mock Data Strategy | [07_Mock_Data_Strategy.md](07_Mock_Data_Strategy.md) |

### Module files

| Module | Phase(s) | File |
| --- | --- | --- |
| Auth & Onboarding | 1 | [01_Auth_and_Onboarding.md](02_Module_Breakdown/01_Auth_and_Onboarding.md) |
| Candidate | 1–2 | [02_Candidate.md](02_Module_Breakdown/02_Candidate.md) |
| Recruiter / Employer Ops | 1–2 | [03_Recruiter.md](02_Module_Breakdown/03_Recruiter.md) |
| Company Admin | 1–3 | [04_Company_Admin.md](02_Module_Breakdown/04_Company_Admin.md) |
| Platform Admin | 1–2 | [05_Platform_Admin.md](02_Module_Breakdown/05_Platform_Admin.md) |
| Recommendation Engine | 2 | [06_Recommendation_Engine.md](02_Module_Breakdown/06_Recommendation_Engine.md) |
| Messaging & Notifications | 2 | [07_Messaging_and_Notifications.md](02_Module_Breakdown/07_Messaging_and_Notifications.md) |
| Subscription & Billing | 3 | [08_Subscription_and_Billing.md](02_Module_Breakdown/08_Subscription_and_Billing.md) |
| AI Features | 3 | [09_AI_Features.md](02_Module_Breakdown/09_AI_Features.md) |

---

## 6. Cross-cutting Conventions

- **Naming:** kebab-case files, `PascalCase` classes, feature-prefixed selectors (e.g. `app-candidate-job-card`).
- **Entities:** TypeScript model names mirror ERD tables in `PascalCase` singular (e.g. `CandidateProfile`, `JobMatchScore`).
- **Status enums:** centralized in `core/enums` and sourced from the status flows in `Project_Doc.md` (application status, offer status, etc.).
- **Every list view** assumes server-side pagination, sorting, and filtering — see [API Contract Assumptions](06_API_Contract_Assumptions.md).

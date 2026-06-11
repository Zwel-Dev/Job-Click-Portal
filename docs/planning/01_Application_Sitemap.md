# 01 — Application Sitemap

> Complete navigable map of every screen, grouped by workspace. Page-level detail (widgets, actions) lives in the [module breakdown](02_Module_Breakdown/00_Module_Breakdown_Index.md). Route paths are defined in the [Route Map](03_Route_Map.md).
>
> Legend: 🌐 public · 👤 candidate · 🏢 employer · 🛡️ admin · `[P1/P2/P3]` = delivery phase.

---

## 1. Top-level map

```text
Job Click Portal
│
├── 🌐 Public / Marketing
│   ├── Landing / Home                         [P1]
│   ├── Public Job Search                      [P1]
│   ├── Public Job Detail                      [P1]
│   ├── Public Company Profile                 [P1]
│   ├── Pricing / Plans                        [P3]
│   ├── About / Contact / Legal                [P1]
│   └── Error pages (404 / 403 / 500)          [P1]
│
├── 🔐 Auth & Onboarding
│   ├── Login                                  [P1]
│   ├── Candidate Sign Up                       [P1]
│   ├── Company Sign Up                          [P1]
│   ├── Email Verification                       [P1]
│   ├── Phone Verification                       [P1]
│   ├── Forgot Password                          [P1]
│   ├── Reset Password                           [P1]
│   └── Role Selection / Post-signup redirect    [P1]
│
├── 👤 Candidate Workspace
│   ├── Dashboard                                [P1]
│   ├── Profile (multi-section)                   [P1]
│   ├── Resume Manager                            [P1]
│   ├── Job Search & Detail                       [P1]
│   ├── Saved Jobs                                [P1]
│   ├── Recommendations                           [P2]
│   ├── Applications (list + tracker)             [P1]
│   ├── Interviews                                [P2]
│   ├── Messages                                  [P2]
│   ├── Notifications                             [P2]
│   └── Account Settings                          [P1]
│
├── 🏢 Employer Workspace (Company Admin / Manager / Recruiter / Hiring Manager)
│   ├── Dashboard                                [P1]
│   ├── Company
│   │   ├── Company Profile                       [P1]
│   │   ├── Locations                             [P1]
│   │   ├── Departments                           [P1]
│   │   └── Verification Center                   [P1]
│   ├── Team & Permissions                        [P1]
│   ├── Jobs
│   │   ├── Job List                              [P1]
│   │   ├── Create / Edit Job (wizard)            [P1]
│   │   ├── Job Detail                            [P1]
│   │   └── Job Approval Queue                    [P1]
│   ├── Applicants & Pipeline (Kanban)            [P1]
│   ├── Candidate Search                          [P2]
│   ├── Talent Pools                              [P2]
│   ├── Interviews                                [P2]
│   ├── Offers                                    [P1]
│   ├── Analytics                                 [P2]
│   ├── Subscription & Billing                    [P3]
│   ├── Messages                                  [P2]
│   ├── Notifications                             [P2]
│   └── Settings                                  [P1]
│
└── 🛡️ Platform Admin Workspace
    ├── Dashboard                                [P1]
    ├── User Management                           [P1]
    ├── Company Management                         [P1]
    ├── Company Verification Queue                 [P1]
    ├── Job Moderation                             [P2]
    ├── Fraud Detection                            [P2]
    ├── Subscription Oversight                     [P3]
    ├── System Analytics                           [P2]
    ├── Audit & Activity Logs                      [P2]
    └── Platform Settings                          [P2]
```

---

## 2. 🌐 Public / Auth — screen list

| Screen | Phase | Key content |
| --- | --- | --- |
| Landing / Home | P1 | Hero, search bar, featured jobs, top companies, CTAs (candidate/employer) |
| Public Job Search | P1 | Filters (keyword, location, salary, industry, type, experience, remote), result list, map/list toggle |
| Public Job Detail | P1 | Job description, company card, skills, benefits, "Apply" (auth gate) |
| Public Company Profile | P1 | Logo, about, locations, open jobs |
| Pricing / Plans | P3 | Free / Business / Enterprise comparison |
| About / Contact / Legal | P1 | Static content, T&C, privacy |
| Login | P1 | Email+password, "remember me", links to signup/forgot |
| Candidate Sign Up | P1 | Email, phone, password, consent |
| Company Sign Up | P1 | Company name, admin user, business email |
| Email / Phone Verification | P1 | OTP / token entry, resend |
| Forgot / Reset Password | P1 | Request link, set new password |
| Error pages | P1 | 404, 403 (forbidden), 500 |

---

## 3. 👤 Candidate — screen list

| Screen | Phase | Key content |
| --- | --- | --- |
| Dashboard | P1 | Widgets: profile completion, recommended jobs, recent applications, interview invites, saved jobs, notifications |
| Profile | P1 | Sections: Personal, Summary, Preferences, Experience, Education, Skills, Certifications, Portfolio |
| Resume Manager | P1 | Upload, multiple versions, set default, preview, download, (parsing → P3) |
| Job Search | P1 | Same filters as public + "save"/"apply" inline |
| Job Detail | P1 | Full detail + apply flow (select resume, cover note) |
| Saved Jobs | P1 | List, remove, apply-later |
| Recommendations | P2 | Best matches / good / growth / trending / new (see [Recommendation Engine](02_Module_Breakdown/06_Recommendation_Engine.md)) |
| Applications | P1 | List + status tracker timeline (Applied→…→Hired) |
| Interviews | P2 | Upcoming/past, meeting links, reschedule requests |
| Messages | P2 | Threads with recruiters, attachments |
| Notifications | P2 | In-app feed, mark read, preferences |
| Account Settings | P1 | Credentials, contact, privacy/visibility, notification channels |

---

## 4. 🏢 Employer — screen list

| Screen | Phase | Role visibility | Key content |
| --- | --- | --- | --- |
| Dashboard | P1 | All | KPIs: active jobs, new applications, interviews, offers, hires, subscription status |
| Company Profile | P1 | Admin | Name, logo, website, industry, size, description |
| Locations | P1 | Admin | CRUD company locations, head-office flag |
| Departments | P1 | Admin/Manager | CRUD departments |
| Verification Center | P1 | Admin | Submit registration/tax docs, track status |
| Team & Permissions | P1 | Admin | Invite/edit/deactivate recruiters, managers, hiring managers; assign roles |
| Job List | P1 | All (scoped) | Filter by status, owner; bulk actions (pause/close/archive) |
| Create / Edit Job | P1 | Recruiter+ | Wizard: Basic → Requirements → Compensation → Skills → Review |
| Job Detail | P1 | All | Overview, metrics, applicant count, status, approval state |
| Job Approval Queue | P1 | Manager/Admin | Approve/reject pending jobs (workflow) |
| Applicants & Pipeline | P1 | Recruiter/HM | Kanban: Applied→Screening→Shortlisted→Assessment→Interview→Offer→Hired |
| Applicant Detail | P1 | Recruiter/HM | Resume, match score, notes, tags, status actions |
| Candidate Search | P2 | Recruiter+ | Filters: skills, experience, salary, location, industry, availability |
| Talent Pools | P2 | Recruiter+ | Named collections, add/remove candidates |
| Interviews | P2 | Recruiter/HM | Schedule/reschedule/cancel, interviewers, feedback |
| Offers | P1 | Recruiter/Admin | Create offer, track status, accept/reject outcome |
| Analytics | P2 | Manager/Admin | Time-to-hire, cost-per-hire, apps/job, recruiter performance, funnel |
| Subscription & Billing | P3 | Admin | Plan, invoices, payment methods, renewals |
| Messages / Notifications | P2 | All | Same comms surfaces as candidate |
| Settings | P1 | All | Personal prefs; company-level settings (Admin) |

---

## 5. 🛡️ Platform Admin — screen list

| Screen | Phase | Key content |
| --- | --- | --- |
| Dashboard | P1 | System KPIs: active users, active companies, jobs posted, applications, hire success rate |
| User Management | P1 | Candidates + company users: search, suspend, impersonate (optional), reset |
| Company Management | P1 | All companies, status, verified flag, drill-in |
| Company Verification Queue | P1 | Review business/tax/website/email evidence; approve/reject |
| Job Moderation | P2 | Flag/remove jobs, duplicate detection |
| Fraud Detection | P2 | Fake companies, duplicate jobs, spam applications, scam signals |
| Subscription Oversight | P3 | All subscriptions, plans, payments |
| System Analytics | P2 | Platform-wide metrics & trends |
| Audit & Activity Logs | P2 | Filterable audit trail (entity, action, actor, time) |
| Platform Settings | P2 | Roles, skills taxonomy, plan definitions, feature flags |

---

## 6. Shared / cross-workspace surfaces

These appear inside multiple workspaces and are built once (see [Shared Component Inventory](05_Shared_Component_Inventory.md)):

- Global header + role-aware sidebar/nav
- Notifications dropdown + full page
- Messaging panel + full page
- Global search
- User/account menu
- Confirmation dialogs, toasts, empty/error/loading states

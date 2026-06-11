# 02 — Feature / Module Breakdown (Index)

> Each module has its own file with: scope, screens, components, phase-by-phase backlog, entities used, and dependencies.
> Phases follow `Project_Doc.md §14`. A module may span phases.

---

## Module ↔ Phase matrix

| Module | Phase 1 (MVP) | Phase 2 (Engagement) | Phase 3 (AI & Revenue) |
| --- | :---: | :---: | :---: |
| [Auth & Onboarding](01_Auth_and_Onboarding.md) | ✅ Core | — | — |
| [Candidate](02_Candidate.md) | ✅ Profile/Resume/Search/Apply | ✅ Recs/Interviews/Messages | ⬜ AI resume tools |
| [Recruiter / Employer Ops](03_Recruiter.md) | ✅ Jobs/Applicants/Offers | ✅ Search/Talent/Interviews/Analytics | ⬜ AI matching |
| [Company Admin](04_Company_Admin.md) | ✅ Company/Team/Approvals | ✅ Analytics | ✅ Subscription |
| [Platform Admin](05_Platform_Admin.md) | ✅ Users/Companies/Verification | ✅ Moderation/Fraud/Analytics/Audit | ⬜ Subscription oversight |
| [Recommendation Engine](06_Recommendation_Engine.md) | — | ✅ Matching & recs | ⬜ Semantic/AI matching |
| [Messaging & Notifications](07_Messaging_and_Notifications.md) | — | ✅ Full | — |
| [Subscription & Billing](08_Subscription_and_Billing.md) | ⬜ Read-only plan badge | — | ✅ Full |
| [AI Features](09_AI_Features.md) | — | — | ✅ Full |

✅ = primary delivery · ⬜ = partial / stub · — = not in phase

---

## Dependency graph (build order)

```text
Core/Shared infra ──► Auth ──► Candidate ──► Recruiter ──► Company Admin
                                    │            │              │
                                    └────────────┴──────────────┴──► Recommendation Engine (P2)
                                                                 └──► Messaging & Notifications (P2)
Platform Admin ──► (depends on Auth + Company + Candidate data)
Subscription & Billing (P3) ──► depends on Company Admin
AI Features (P3) ──► depends on Candidate + Recruiter + Recommendation Engine
```

---

## Definition of Done (per module, per phase)

- All screens routed and lazy-loaded under the correct workspace.
- Components consume **typed models** (ERD-derived) via feature services.
- All data via service → **mock interceptor** (see [Mock Data Strategy](../07_Mock_Data_Strategy.md)); no hardcoded data in components.
- Loading / empty / error states present for every async view.
- Role guard + per-action permission checks applied.
- Responsive (desktop-first, usable ≥ 768px).
- Unit test stub for each smart component + service.

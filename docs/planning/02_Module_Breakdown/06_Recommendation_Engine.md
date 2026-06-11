# Module: Recommendation Engine (Frontend)

**Cross-cutting** · consumed by Candidate (`/candidate/recommendations`) and Employer (`/employer/candidates`, applicant ranking).
**Primary phase:** Phase 2 · semantic/AI matching in Phase 3.

> The **scoring** happens server-side (`Project_Doc.md §9`). The frontend's job is to **request, display, explain, and act on** recommendations and to **emit behavioral signals**.

---

## 1. Scope

Two directions:
1. **Candidate → Job** matching (recommended jobs, categorized by score band).
2. **Employer → Candidate** matching (ranked applicants / search results).

Plus behavioral tracking that improves future recommendations.

---

## 2. Screens & components

| Surface | Where | Phase | Components |
| --- | --- | --- | --- |
| Recommended Jobs (categorized) | Candidate recs page + dashboard widget | P2 | `RecommendationsComponent`, `MatchCategoryTabs`, `JobCard` + `MatchScoreBadge`, `MatchBreakdownPopover` |
| Candidate ranking | Employer pipeline & search | P2 | `CandidateRankList`, `MatchScoreBadge`, `MatchBreakdownPopover` |
| Match breakdown | popover/dialog | P2 | shows skill/experience/location/salary/education sub-scores |
| Behavioral tracking | app-wide | P2 | `BehaviorTrackerService` (directive/interceptor) |

### Match categories (`§9`)
| Band | Range | Label |
| --- | --- | --- |
| Best Matches | 90–100% | green |
| Good Opportunities | 75–89% | blue |
| Growth Opportunities | 60–74% | amber |
| Trending | — | most viewed/applied |
| New | — | recently posted |

---

## 3. Services / State

- `RecommendationService` — fetch recs (candidate & employer directions), match breakdown.
- `BehaviorTrackerService` — emit job views, saves, searches, application events (`SEARCH_HISTORY`, `RECOMMENDATION_LOGS`).

## 4. Entities used

`JOB_MATCH_SCORES`, `CANDIDATE_MATCH_SCORES`, `RECOMMENDATION_LOGS`, `SEARCH_HISTORY`, `SAVED_JOBS`, `JOBS`, `CANDIDATE_PROFILES`.

## 5. Business rules / display

- **Match formula weights** (`§9`): Skills 40, Experience 25, Location 15, Salary 10, Education 10 → `MatchBreakdownPopover` renders these as a weighted bar so the score is explainable.
- Recommendation list supports "not interested" / "save" / "apply" actions, all of which feed behavior tracking.
- Trending/New are time/volume-based feeds, not personalized scores.

---

## 6. Backlog by phase

### Phase 2
- [ ] `RecommendationService` + models
- [ ] Candidate recommendations page (5 categories) + dashboard widget
- [ ] Match score badge + breakdown popover (reusable)
- [ ] Employer candidate ranking in pipeline & search
- [ ] Behavior tracker (views/saves/search/apply)

### Phase 3
- [ ] Semantic match explanations (AI) — surface related skills/roles (`§12 AI Semantic Matching`)
- [ ] AI-weighted re-ranking toggles

## 7. Dependencies
Candidate + Recruiter modules (host surfaces), Auth. Feeds AI Features (P3).

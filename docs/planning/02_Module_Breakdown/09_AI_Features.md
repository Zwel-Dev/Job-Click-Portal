# Module: AI Features

**Cross-cutting** · Phase 3 (`Project_Doc.md §12`). Surfaces inside Candidate, Recruiter, and Recommendation modules.
**Angular module:** `AiModule` (shared feature module) exposing AI-powered widgets + `AiService`.

> All AI inference is server-side. The frontend provides **entry points, prompts/inputs, loading/streaming states, and result rendering/acceptance**.

---

## 1. Scope

| AI feature | Consumer surface | Output |
| --- | --- | --- |
| AI Resume Parsing | Candidate resume upload | Extracted skills/experience/education/certifications → pre-fill profile |
| AI Resume Review | Candidate resume/profile | Improvement suggestions list |
| AI Job Description Generator | Recruiter job wizard | Generated JD from role name + inputs |
| AI Interview Question Generator | Recruiter interview setup | Questions from role/skills/seniority |
| AI Semantic Matching | Recommendation engine | Related skills/roles, keyword-free matches |

---

## 2. Components

- `ResumeParseReviewComponent` — shows parsed fields with accept/edit before saving to profile.
- `ResumeReviewSuggestionsComponent` — suggestion cards with apply actions.
- `JdGeneratorPanel` — embedded in `JobWizardComponent` (Description step).
- `InterviewQuestionGenerator` — embedded in interview setup; copy/insert questions.
- `SemanticMatchExplainer` — augments `MatchBreakdownPopover` with related-skill graph.
- Shared: `AiLoadingShimmer`, `AiStreamingText` (token streaming), `AiDisclaimerBanner`.

## 3. Services / State

- `AiService` — single client for all AI endpoints; supports streaming responses, cancellation, and graceful fallback when AI is disabled (feature flag / plan).
- Integrates with `ResumeService`, `JobService`, `EmployerInterviewService`, `RecommendationService`.

## 4. Entities touched

Writes into `CANDIDATE_SKILLS/EXPERIENCES/EDUCATIONS/CERTIFICATIONS` (parsing), reads `RESUMES`, `JOBS`, `SKILLS`/`SKILL_ALIASES` (semantic). No new tables required client-side.

## 5. Business rules

- AI features are **gated by plan/feature flag** (Enterprise-leaning) — degrade gracefully when unavailable.
- Parsed/generated content is **always reviewable** before persistence (human-in-the-loop).
- Show provenance + disclaimer; never auto-submit AI output silently.

---

## 6. Backlog (Phase 3)
- [ ] `AiService` + streaming/cancel/fallback infra
- [ ] Resume parsing → review → profile pre-fill
- [ ] Resume review suggestions
- [ ] JD generator in job wizard
- [ ] Interview question generator
- [ ] Semantic match explainer in recommendations

## 7. Dependencies
Candidate, Recruiter, Recommendation Engine, Subscription (plan gating). Last module to build.

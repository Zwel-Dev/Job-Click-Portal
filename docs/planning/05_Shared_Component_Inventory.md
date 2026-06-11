# 05 — Shared Component Inventory

> Reusable building blocks in `shared/` (and a few cross-cutting domain widgets). "Smart" feature components compose these. Goal: build once, reuse across all four workspaces.
> Phase column = when first needed.

---

## 1. UI primitives (`shared/components/ui`)

| Component | Selector | Purpose | Key inputs/outputs | Phase |
| --- | --- | --- | --- | --- |
| Button | `app-button` | variants (primary/secondary/ghost/danger), loading state | `variant`, `loading`, `disabled`, `(click)` | P1 |
| Card | `app-card` | content container w/ header/footer slots | `title`, `padding` | P1 |
| Badge | `app-badge` | small status label | `color`, `text` | P1 |
| Tag / Chip | `app-tag` | removable chips (skills, tags) | `label`, `removable`, `(remove)` | P1 |
| Avatar | `app-avatar` | user/company image w/ initials fallback | `src`, `name`, `size` | P1 |
| Modal / Dialog | `app-modal` | overlay container | `open`, `title`, `(close)` | P1 |
| Drawer | `app-drawer` | side panel (filters, detail) | `open`, `side` | P1 |
| Tabs | `app-tabs` | tabbed sections | `tabs`, `activeIndex` | P1 |
| Dropdown menu | `app-dropdown` | action menus | `items`, `(select)` | P1 |
| Tooltip | `appTooltip` (directive) | hover hints | `appTooltip` text | P1 |
| Pagination | `app-pagination` | page nav for lists | `page`, `total`, `pageSize`, `(pageChange)` | P1 |
| Data table | `app-table` | sortable/selectable rows, templated cells | `columns`, `rows`, `(sort)`, `(rowClick)` | P1 |
| Stepper | `app-stepper` | wizard steps (job create) | `steps`, `activeStep` | P1 |
| Accordion | `app-accordion` | collapsible sections | `items` | P1 |
| Progress bar | `app-progress` | profile completion, usage meters | `value`, `max` | P1 |

---

## 2. Feedback & state (`shared/components/feedback`)

| Component | Selector | Purpose | Phase |
| --- | --- | --- | --- |
| Toast / Snackbar | `app-toast` (+ `ToastService`) | transient success/error messages | P1 |
| Confirm dialog | `app-confirm-dialog` (+ `ConfirmService`) | destructive action confirmation | P1 |
| Empty state | `app-empty-state` | "no results / no data yet" w/ CTA | P1 |
| Error state | `app-error-state` | load failure w/ retry | P1 |
| Loading spinner | `app-spinner` | inline/overlay loading | P1 |
| Skeleton loader | `app-skeleton` | list/card placeholders | P1 |
| Global loading bar | `app-loading-bar` | top progress (tied to `loadingInterceptor`) | P1 |

---

## 3. Form controls (`shared/components/form`)

All implement `ControlValueAccessor` for use in reactive forms.

| Component | Selector | Purpose | Phase |
| --- | --- | --- | --- |
| Text field | `app-text-field` | labeled input + validation message | P1 |
| Textarea | `app-textarea` | multiline | P1 |
| Select | `app-select` | single-select dropdown | P1 |
| Multi-select | `app-multi-select` | tags/checkbox multi | P1 |
| Date picker | `app-date-picker` | dates (DOB, start/end, joining) | P1 |
| File upload | `app-file-upload` | drag/drop, progress (resume, logo, docs) | P1 |
| OTP input | `app-otp-input` | verification codes | P1 |
| Password strength | `app-password-strength` | signup/reset meter | P1 |
| Salary range | `app-salary-range` | min/max + currency | P1 |
| Location input | `app-location-input` | country/state/city w/ autocomplete | P1 |
| Skill selector | `app-skill-selector` | typeahead from skills taxonomy + aliases | P1 |
| Rich text editor | `app-rich-text` | job description, summaries | P1 |
| Search bar | `app-search-bar` | debounced search input | P1 |
| Filter panel | `app-filter-panel` | composable filter container | P1 |

---

## 4. Domain widgets (`shared/components/domain`)

Reusable across candidate + employer + admin.

| Component | Selector | Used in | Phase |
| --- | --- | --- | --- |
| Job card | `app-job-card` | public/candidate search, recs, saved, dashboards | P1 |
| KPI / stat card | `app-kpi-card` | all dashboards | P1 |
| Application status chip | `app-application-status-chip` | candidate apps, pipeline | P1 |
| Status tracker (timeline) | `app-status-tracker` | application detail | P1 |
| Match score badge | `app-match-score-badge` | recs, pipeline, search | P2 |
| Match breakdown popover | `app-match-breakdown` | recs, applicant detail | P2 |
| User avatar + name | `app-user-avatar-name` | messages, team, applicants | P1 |
| Company logo + name | `app-company-identity` | job cards, company pages | P1 |
| Notification item | `app-notification-item` | bell + feed | P2 |
| Pipeline column / card | `app-pipeline-card` | Kanban board | P1 |
| Plan badge | `app-plan-badge` | employer header, subscription | P1 (read-only) |
| Rating / score bar | `app-score-bar` | match breakdown, analytics | P2 |

---

## 5. Layout components (`layouts/`)

| Component | Purpose | Phase |
| --- | --- | --- |
| `AppHeaderComponent` | top bar: logo, global search, notifications bell, messages, user menu | P1 |
| `AppSidebarComponent` | role-aware nav (driven by a nav-config per workspace) | P1 |
| `AppFooterComponent` | footer links | P1 |
| `BreadcrumbComponent` | route-based breadcrumbs | P1 |
| Workspace shells | `Public/Auth/Candidate/Employer/Admin` layout wrappers w/ `<router-outlet>` | P1 |

---

## 6. Directives & pipes (`shared/directives`, `shared/pipes`)

| Type | Name | Purpose | Phase |
| --- | --- | --- | --- |
| Directive | `*appHasRole` | show/hide by role/permission | P1 |
| Directive | `appAutofocus` | focus on render | P1 |
| Directive | `appInfiniteScroll` | lazy list loading | P2 |
| Directive | `appClickOutside` | dropdown/drawer dismissal | P1 |
| Pipe | `timeAgo` | relative timestamps | P1 |
| Pipe | `salaryFormat` | salary + currency | P1 |
| Pipe | `statusLabel` | enum → human label + color | P1 |
| Pipe | `initials` | name → initials | P1 |
| Pipe | `truncate` | clamp text | P1 |
| Pipe | `fileSize` | bytes → KB/MB | P1 |
| Pipe | `safeUrl` | sanitize meeting/portfolio links | P1 |

---

## 7. Build priority

**P1 must-haves before any feature page:** button, card, text-field, select, file-upload, table, pagination, modal, confirm-dialog, toast, empty/error/loading/skeleton states, job-card, kpi-card, status chip/tracker, header/sidebar shells, `*appHasRole`, core pipes.

Everything else can be added as the consuming feature reaches its phase.

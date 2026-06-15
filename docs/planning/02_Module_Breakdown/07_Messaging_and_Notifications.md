# Module: Messaging & Notifications

**Cross-cutting** · shared by Candidate and Employer workspaces. **Primary phase:** Phase 2.
**Angular module:** `CommsModule` (shared feature module providing components + services).

> **Status:** ✅ done · ⬜ pending. **Phase 2 complete — module shipped & build-verified (MN1.0–MN1.3).** Foundation: `CommsModule` + `RealtimeService` (polling) + `NotificationService`/`MessagingService` signal stores (`unreadCount` → header badges). Notifications: bell dropdown + feed (`/{candidate,employer}/notifications`) + mark-read + **channel preferences** (`/notifications/preferences`, In-App/Email/SMS/Push toggles). Messaging: responsive two-pane page (`/{candidate,employer}/messages`) — `ConversationList` + `MessageThread` (bubbles + attachments + **interview-invite card**) + `MessageComposer` — header `MessagingPanel` with badge + `?c=` deep-link. **Interview invites:** a recruiter sends one from the thread (`InterviewInviteDialog`) → creates an invite message **+** a notification; the candidate accepts/declines from the card → reply message + notification. Role-aware mock data throughout. **Phase 3 (WS/SSE realtime, read receipts) deferred.**

---

## 1. Scope

Two related surfaces:
1. **Messaging** — conversations between candidates and recruiters, with attachments and interview invitations.
2. **Notifications** — in-app feed plus multi-channel delivery (email/SMS/push) preferences.

---

## 2. Screens & components

### Messaging
| Surface | Route | Components |
| --- | --- | --- |
| Conversation list + thread (full page) | `/candidate/messages`, `/employer/messages` | `ConversationListComponent`, `MessageThreadComponent`, `MessageComposer`, `AttachmentUploader` |
| Quick panel (header dropdown) | global | `MessagingPanelComponent` |
| Interview invitation card | inline in thread | `InterviewInviteCard` |

### Notifications
| Surface | Route | Components |
| --- | --- | --- |
| Notification feed (full page) | `/candidate/notifications`, `/employer/notifications` | `NotificationListComponent`, `NotificationItem` |
| Bell dropdown | global header | `NotificationBellComponent` |
| Channel preferences | in Settings | `NotificationPreferencesComponent` |

---

## 3. Services / State

- `MessagingService` — conversations, messages, send, attachments; `unreadCount$`.
- `NotificationService` — feed, mark-read, preferences; `unreadCount$`.
- **Realtime:** abstract behind `RealtimeService` (polling in P2; WebSocket/SSE upgrade later) so components don't care about transport.

## 4. Entities used

`CONVERSATIONS`, `CONVERSATION_PARTICIPANTS`, `MESSAGES`, `NOTIFICATIONS`. (Conversations are scoped by `company_id`; participants are `USERS`.)

## 5. Business rules

- **Notification types** (`§10`): candidate (job recs, application updates, interview invites, recruiter messages) and recruiter (new applications, candidate replies, interview confirmations, offer responses).
- **Delivery channels** (`§10`): In-App, Email, SMS, Push — frontend manages **preferences + in-app**; other channels are server-dispatched.
- Sending an interview invitation creates a message **and** a notification, and links to an `INTERVIEWS` record.

---

## 6. Backlog by phase

### Phase 2
- [x] `CommsModule` shell + services + realtime abstraction (polling) ✅
- [x] Conversation list + thread + composer + attachments ✅
- [x] Header messaging panel with unread badge ✅
- [x] Notification feed + bell dropdown + mark-read ✅
- [x] Notification channel preferences (in-app managed) ✅
- [x] Interview invite message/notification integration ✅

### Phase 3
- [ ] WebSocket/SSE realtime upgrade
- [ ] Rich templates, read receipts, typing indicators

## 7. Dependencies
Auth (participants/current user), Candidate & Employer (host surfaces), Recruiter interviews (invites).

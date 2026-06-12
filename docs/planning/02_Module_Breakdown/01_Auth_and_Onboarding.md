# Module: Auth & Onboarding

**Workspace:** Public/Auth · **Route prefix:** `/auth` · **Primary phase:** Phase 1
**Angular module:** `AuthModule` (lazy)

> ⚠️ **Repo note:** the old `pages/systematic/modules/auth/auth.module.ts` referenced by `app-routing.module.ts:5` was deleted. This module replaces it at `src/app/features/auth/`. The root route must be repointed (see [Route Map](../03_Route_Map.md)).

---

## 1. Scope

Account creation, identity verification, and session management for **all** user types. Issues the JWT/session that downstream guards rely on, and routes the user to the correct workspace after login based on roles (ERD `USERS`, `ROLES`, `USER_ROLES`).

---

## 2. Screens

| Screen | Route | Notes |
| --- | --- | --- |
| Login | `/auth/login` | Email + password; "remember me"; error on locked/unverified |
| Candidate Sign Up | `/auth/register` | Creates `USERS` row + candidate role |
| Company Sign Up | `/auth/register-company` | Creates company admin user + `COMPANIES` shell |
| Email Verification | `/auth/verify-email` | Token from email link or OTP |
| Phone Verification | `/auth/verify-phone` | OTP |
| Forgot Password | `/auth/forgot-password` | Request reset link |
| Reset Password | `/auth/reset-password` | Token + new password |
| **Accept Invitation** ✅ | `/invite/accept?token=…` | Join a company from a team invite (§8) — register-via-invite **or** add-role. *(Top-level guard-free `InviteModule`, not under `/auth` — that tree is guest-guarded.)* |
| Post-signup redirect | (resolver/guard) | Routes by primary role |

---

## 3. Components

- `LoginPageComponent`, `RegisterCandidatePageComponent`, `RegisterCompanyPageComponent`
- `VerifyEmailPageComponent`, `VerifyPhonePageComponent`
- `ForgotPasswordPageComponent`, `ResetPasswordPageComponent`
- `AcceptInvitationPageComponent` (§8) — resolves a token, branches to register-via-invite or add-role
- `AuthLayoutComponent` (split-screen branding shell)
- `OtpInputComponent`, `PasswordStrengthMeterComponent` (candidates for [shared](../05_Shared_Component_Inventory.md))
- **Workspace switcher** (shell-level, §8) — Candidate ↔ Employer for multi-role users

## 4. Services / State

- `AuthService` — login, logout, register, refresh; exposes `currentUser$`, `roles$`. **Multi-role aware** (`User.roles: RoleCode[]`); `registerViaInvite()` + `addRole()` for §8.
- `TokenStorageService` — persist token (localStorage), attach via `authInterceptor`.
- `VerificationService` — email/phone OTP send/confirm.
- `InvitationService` (§8) — `getByToken` (resolve/validate), `acceptAsNewUser`, `acceptAsCurrentUser`. *(Issuing side lives in Company Admin `TeamService` — [doc 04 §8.6a](04_Company_Admin.md).)*
- Guards produced here, consumed everywhere: `authGuard`, `guestGuard`, `candidateGuard`, `employerGuard`, `adminGuard`, role-permission helper.

## 5. Entities used

`USERS`, `ROLES`, `USER_ROLES`, `COMPANIES` (shell on company signup), `COMPANY_VERIFICATIONS` (initiated post-signup), `COMPANY_INVITATIONS` (accept flow, §8).

---

## 6. Backlog by phase

### Phase 1
- [ ] Auth layout + routing module
- [ ] Login + session persistence + `authInterceptor`
- [ ] Candidate + Company registration flows
- [ ] Email & phone verification (OTP)
- [ ] Forgot/reset password
- [ ] Role-based post-login redirect
- [ ] Guards (`authGuard`, `guestGuard`, role guards)

### Phase 2
- [x] **Accept invitation flow** (§8) — ✅ shipped with **CA1.6**: guard-free `/invite/accept` (`InviteModule`), register-via-invite, add-role-to-existing-account, multi-role workspace switcher in both shells
- [ ] "Remember device" / session list
- [ ] Social/SSO login (optional)

### Phase 3
- [ ] MFA, enterprise SSO (SAML/OIDC) for Enterprise plan

## 7. Dependencies
Core/shared infra only. **Blocks every other workspace** (guards + current user).

---

## 8. Member invitation acceptance & onboarding (CA1.6)

> Full concept + the issuing/lifecycle side: [Company Admin §8.6a](04_Company_Admin.md). This doc owns the **receiving** half — the accept page, account creation/role-add, and the multi-role switcher.

**Principle — identity ≠ membership.** An account (`USERS`) is one email/login; a membership (`USER_ROLES`, scoped by `company_id`) is a role at a company. One person can hold several at once (a Candidate **and** a Recruiter at Greenline). Accepting an invite therefore **adds a membership** — it never creates a second account for the same person.

**Accept page** `/invite/accept?token=…` (its own **guard-free top-level `InviteModule`** — `/auth/*` is guest-guarded so a signed-in user couldn't reach it there) → `InvitationService.getByToken(token)` → `InvitationPreview`. If invalid/expired/revoked/already-accepted → a clear terminal message. Otherwise it shows *"{Company} invited you to join as {Role}"* and branches:

1. **No account for the email** → inline **register-via-invite** (full name + password; **email locked** to the invite) → `AuthService.registerViaInvite` creates the `USER` + `USER_ROLES{ role, company }`, signs them in, lands in the employer workspace.
2. **Email already has an account** (e.g. they're a Candidate) → prompt sign-in (email must match the invite) → **one-click accept** → `AuthService.addRole` adds `USER_ROLES{ role, company }`. Their candidate profile is untouched; they simply gain the employer hat.
3. **Already a member of this company** → "You're already on the team" + go to workspace.

**Security:** the token is **single-use, expiring (~7 days), and bound to the exact email** — only the inbox owner can open the link, which doubles as email-ownership proof. Accept requires the email to match (logged-in or registered).

**Multi-role workspace switcher.** `defaultRouteForRoles` picks a single landing route, so once a user has more than one workspace role the shell header needs a **"Switch workspace"** control (Candidate ↔ Employer). One identity, layered roles — no profile merging.

**Mock (no real email):** the invite's accept link is surfaced by Company Admin's *"Copy invite link"* (team list). Seed: `candidate@jobclick.dev` accepts a Greenline **Recruiter** invite → becomes `[Candidate, Recruiter]` and sees the switcher. Demo password `Password123!`.

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
| Post-signup redirect | (resolver/guard) | Routes by primary role |

---

## 3. Components

- `LoginPageComponent`, `RegisterCandidatePageComponent`, `RegisterCompanyPageComponent`
- `VerifyEmailPageComponent`, `VerifyPhonePageComponent`
- `ForgotPasswordPageComponent`, `ResetPasswordPageComponent`
- `AuthLayoutComponent` (split-screen branding shell)
- `OtpInputComponent`, `PasswordStrengthMeterComponent` (candidates for [shared](../05_Shared_Component_Inventory.md))

## 4. Services / State

- `AuthService` — login, logout, register, refresh; exposes `currentUser$`, `roles$`.
- `TokenStorageService` — persist token (localStorage), attach via `authInterceptor`.
- `VerificationService` — email/phone OTP send/confirm.
- Guards produced here, consumed everywhere: `authGuard`, `guestGuard`, `candidateGuard`, `employerGuard`, `adminGuard`, role-permission helper.

## 5. Entities used

`USERS`, `ROLES`, `USER_ROLES`, `COMPANIES` (shell on company signup), `COMPANY_VERIFICATIONS` (initiated post-signup).

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
- [ ] "Remember device" / session list
- [ ] Social/SSO login (optional)

### Phase 3
- [ ] MFA, enterprise SSO (SAML/OIDC) for Enterprise plan

## 7. Dependencies
Core/shared infra only. **Blocks every other workspace** (guards + current user).

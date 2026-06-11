import { Id } from './common.model';
import { User } from './user.model';

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe: boolean;
}

/** Successful authentication result (token + user). */
export interface AuthSession {
  token: string;
  refreshToken: string;
  /** ISO 8601 expiry timestamp. */
  expiresAt: string;
  user: User;
}

export interface RegisterCandidateRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  acceptTerms: boolean;
}

export interface RegisterCompanyRequest {
  companyName: string;
  industry: string;
  companySize: string;
  adminFullName: string;
  workEmail: string;
  phone: string;
  password: string;
  acceptTerms: boolean;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export type VerificationChannel = 'email' | 'phone';

export interface VerifyOtpRequest {
  channel: VerificationChannel;
  code: string;
}

/** Result of a registration call (account created, awaiting verification). */
export interface RegisterResult {
  userId: Id;
  email: string;
  requiresVerification: boolean;
}

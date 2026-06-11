/**
 * Relative API endpoint paths. The base host is prepended by baseUrlInterceptor.
 * Centralized so the future ASP.NET Core backend wiring touches one file.
 */
export const API = {
  auth: {
    login: '/api/v1/auth/login',
    registerCandidate: '/api/v1/auth/register',
    registerCompany: '/api/v1/auth/register-company',
    forgotPassword: '/api/v1/auth/forgot-password',
    resetPassword: '/api/v1/auth/reset-password',
    verify: '/api/v1/auth/verify',
    resendOtp: '/api/v1/auth/resend-otp',
    me: '/api/v1/auth/me',
    refresh: '/api/v1/auth/refresh',
    logout: '/api/v1/auth/logout',
  },
} as const;

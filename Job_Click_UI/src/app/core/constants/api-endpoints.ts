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
  candidate: {
    profile: '/api/v1/candidate/profile',
    skills: '/api/v1/candidate/skills',
    experiences: '/api/v1/candidate/experiences',
    educations: '/api/v1/candidate/educations',
    certifications: '/api/v1/candidate/certifications',
    portfolios: '/api/v1/candidate/portfolios',
    resumes: '/api/v1/candidate/resumes',
    savedJobs: '/api/v1/candidate/saved-jobs',
    applications: '/api/v1/candidate/applications',
    recommendations: '/api/v1/candidate/recommendations',
    interviews: '/api/v1/candidate/interviews',
    account: '/api/v1/candidate/account',
    password: '/api/v1/candidate/password',
    notificationPreferences: '/api/v1/candidate/notification-preferences',
  },
  jobs: {
    search: '/api/v1/jobs',
    byId: (id: number | string): string => `/api/v1/jobs/${id}`,
    apply: (id: number | string): string => `/api/v1/jobs/${id}/apply`,
  },
} as const;

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  applicationUpdates: boolean;
  interviewInvitations: boolean;
  jobRecommendations: boolean;
  recruiterMessages: boolean;
}

export interface AccountUpdateRequest {
  email: string;
  phone: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

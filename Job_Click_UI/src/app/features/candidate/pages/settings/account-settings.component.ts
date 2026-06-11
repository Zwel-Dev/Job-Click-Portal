import { Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ToastService } from '@core/services/toast.service';
import { ApiError } from '@core/models/common.model';
import { PHONE_PATTERN } from '@core/constants/patterns';
import { passwordsMatchValidator, strongPasswordValidator } from '@core/utils/validators';
import { CurrentUserStore } from '@core/auth/current-user.store';
import { PROFILE_VISIBILITY_LABELS, ProfileVisibility } from '@core/enums/profile-visibility.enum';
import { AVAILABILITY_STATUS_LABELS, AvailabilityStatus } from '@core/enums/availability-status.enum';
import { CandidateProfileStore } from '../../state/candidate-profile.store';
import { CandidateSettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-account-settings',
  standalone: false,
  templateUrl: './account-settings.component.html',
  styleUrl: './account-settings.component.scss',
})
export class AccountSettingsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  private readonly settingsService = inject(CandidateSettingsService);
  private readonly profileStore = inject(CandidateProfileStore);
  private readonly currentUser = inject(CurrentUserStore);

  readonly visibilityOptions = Object.values(ProfileVisibility);
  readonly visibilityLabels = PROFILE_VISIBILITY_LABELS;
  readonly availabilityOptions = Object.values(AvailabilityStatus);
  readonly availabilityLabels = AVAILABILITY_STATUS_LABELS;

  readonly savingAccount = signal(false);
  readonly savingPassword = signal(false);
  readonly savingPrivacy = signal(false);
  readonly savingNotifications = signal(false);
  readonly hideCurrent = signal(true);
  readonly hideNew = signal(true);

  readonly accountForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(PHONE_PATTERN)]],
  });

  readonly passwordForm = this.fb.nonNullable.group(
    {
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, strongPasswordValidator()]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordsMatchValidator('newPassword', 'confirmPassword') },
  );

  readonly privacyForm = this.fb.nonNullable.group({
    profileVisibility: [ProfileVisibility.RecruitersOnly],
    availabilityStatus: [AvailabilityStatus.OpenToWork],
  });

  readonly notificationsForm = this.fb.nonNullable.group({
    email: [true],
    sms: [false],
    push: [true],
    applicationUpdates: [true],
    interviewInvitations: [true],
    jobRecommendations: [true],
    recruiterMessages: [false],
  });

  private profileApplied = false;

  constructor() {
    this.profileStore.load();

    const user = this.currentUser.user();
    if (user) {
      this.accountForm.patchValue({ email: user.email }, { emitEvent: false });
    }

    // Hydrate phone + privacy once the profile is available.
    effect(() => {
      const profile = this.profileStore.profile();
      if (profile && !this.profileApplied) {
        this.accountForm.patchValue({ phone: profile.phone ?? '' }, { emitEvent: false });
        this.privacyForm.patchValue(
          { profileVisibility: profile.profileVisibility, availabilityStatus: profile.availabilityStatus },
          { emitEvent: false },
        );
        this.profileApplied = true;
      }
    });

    this.settingsService
      .getNotificationPreferences()
      .subscribe((prefs) => this.notificationsForm.patchValue(prefs, { emitEvent: false }));
  }

  toggleCurrent(): void {
    this.hideCurrent.update((hidden) => !hidden);
  }

  toggleNew(): void {
    this.hideNew.update((hidden) => !hidden);
  }

  saveAccount(): void {
    if (this.accountForm.invalid) {
      this.accountForm.markAllAsTouched();
      return;
    }
    this.savingAccount.set(true);
    const { email, phone } = this.accountForm.getRawValue();
    this.settingsService
      .updateAccount({ email, phone })
      .pipe(finalize(() => this.savingAccount.set(false)))
      .subscribe({
        next: () => {
          const user = this.currentUser.user();
          if (user) {
            this.currentUser.setUser({ ...user, email, phone });
          }
          // Keep the profile's phone in sync (single source for the profile page).
          this.profileStore.saveProfile({ phone }).subscribe({ error: () => undefined });
          this.toast.success('Account details updated.');
        },
        error: (error: ApiError) => this.toast.error(error.message),
      });
  }

  savePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    this.savingPassword.set(true);
    const { currentPassword, newPassword } = this.passwordForm.getRawValue();
    this.settingsService
      .changePassword({ currentPassword, newPassword })
      .pipe(finalize(() => this.savingPassword.set(false)))
      .subscribe({
        next: () => {
          this.passwordForm.reset();
          this.toast.success('Password changed.');
        },
        error: (error: ApiError) => this.toast.error(error.message),
      });
  }

  savePrivacy(): void {
    this.savingPrivacy.set(true);
    const value = this.privacyForm.getRawValue();
    this.profileStore
      .saveProfile({ profileVisibility: value.profileVisibility, availabilityStatus: value.availabilityStatus })
      .pipe(finalize(() => this.savingPrivacy.set(false)))
      .subscribe({
        next: () => this.toast.success('Privacy settings saved.'),
        error: (error: ApiError) => this.toast.error(error.message),
      });
  }

  saveNotifications(): void {
    this.savingNotifications.set(true);
    this.settingsService
      .saveNotificationPreferences(this.notificationsForm.getRawValue())
      .pipe(finalize(() => this.savingNotifications.set(false)))
      .subscribe({
        next: () => this.toast.success('Notification preferences saved.'),
        error: (error: ApiError) => this.toast.error(error.message),
      });
  }
}

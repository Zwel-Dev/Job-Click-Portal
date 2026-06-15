import { Component, computed, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AdminUser } from '@core/models/admin-user.model';
import { UserStatus, USER_STATUS_META } from '@core/enums/user-status.enum';
import { roleLabel } from '@core/utils/role-label';
import { formatDate } from '@core/utils/format';
import { AdminUserActionsService } from '../../services/admin-user-actions.service';

export interface UserDetailDrawerData {
  user: AdminUser;
}

export interface UserDetailDrawerResult {
  changed: boolean;
  user: AdminUser;
}

/** Detail panel for a single user: profile, roles & memberships, activity, actions. */
@Component({
  selector: 'app-user-detail-drawer',
  standalone: false,
  templateUrl: './user-detail-drawer.component.html',
  styleUrl: './user-detail-drawer.component.scss',
})
export class UserDetailDrawerComponent {
  private readonly data = inject<UserDetailDrawerData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<UserDetailDrawerComponent, UserDetailDrawerResult>);
  private readonly actions = inject(AdminUserActionsService);

  readonly user = signal<AdminUser>(this.data.user);
  readonly busy = signal(false);
  private changed = false;

  readonly statusMeta = USER_STATUS_META;
  readonly roleLabel = roleLabel;
  readonly formatDate = formatDate;

  readonly initial = computed(() => this.user().fullName.charAt(0).toUpperCase());
  readonly isSuspended = computed(() => this.user().status === UserStatus.Suspended);
  readonly isSelf = computed(() => this.actions.isSelf(this.user()));

  toggleStatus(): void {
    this.busy.set(true);
    this.actions.toggleStatus(this.user()).subscribe((updated) => {
      if (updated) {
        this.user.set(updated);
        this.changed = true;
      }
      this.busy.set(false);
    });
  }

  resetPassword(): void {
    this.busy.set(true);
    this.actions.resetPassword(this.user()).subscribe(() => this.busy.set(false));
  }

  close(): void {
    this.dialogRef.close({ changed: this.changed, user: this.user() });
  }
}

import { Component, computed, inject, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ApiError, Id, Paginated } from '@core/models/common.model';
import { AdminUser } from '@core/models/admin-user.model';
import { RoleCode } from '@core/enums/role-code.enum';
import { UserStatus, USER_STATUS_META } from '@core/enums/user-status.enum';
import { roleLabel } from '@core/utils/role-label';
import { formatDate } from '@core/utils/format';
import { AdminUserService } from '../../services/admin-user.service';
import { AdminUserActionsService } from '../../services/admin-user-actions.service';
import {
  UserDetailDrawerComponent,
  UserDetailDrawerData,
  UserDetailDrawerResult,
} from '../../components/user-detail-drawer/user-detail-drawer.component';

/** Platform user directory — search / filter / paginate, with a detail drawer + actions (PA1.1 §8.1). */
@Component({
  selector: 'app-user-management',
  standalone: false,
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss',
})
export class UserManagementComponent {
  private readonly service = inject(AdminUserService);
  private readonly actions = inject(AdminUserActionsService);
  private readonly dialog = inject(MatDialog);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly result = signal<Paginated<AdminUser> | null>(null);

  readonly keywordControl = new FormControl('', { nonNullable: true });
  readonly role = signal<RoleCode | null>(null);
  readonly status = signal<UserStatus | null>(null);
  readonly page = signal(1);
  readonly pageSize = 8;

  readonly statusMeta = USER_STATUS_META;
  readonly roleLabel = roleLabel;
  readonly formatDate = formatDate;
  readonly skeletons = [0, 1, 2, 3, 4, 5];

  readonly roleOptions = Object.values(RoleCode).map((value) => ({ value, label: roleLabel(value) }));
  readonly statusOptions = Object.values(UserStatus).map((value) => ({
    value,
    label: USER_STATUS_META[value].label,
  }));

  readonly hasFilters = computed(
    () => !!this.keywordControl.value || this.role() !== null || this.status() !== null,
  );

  /** Drawer currently open for a row (also guards deep-link re-opens). */
  private detailUserId: Id | null = null;

  constructor() {
    this.keywordControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(() => this.resetAndLoad());

    // Deep-link: /admin/users/:id opens the detail drawer over the list.
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.openDetailById(Number(id));
      }
    });

    this.load();
  }

  isSelf(user: AdminUser): boolean {
    return this.actions.isSelf(user);
  }

  isSuspended(user: AdminUser): boolean {
    return user.status === UserStatus.Suspended;
  }

  onRoleChange(value: RoleCode | null): void {
    this.role.set(value);
    this.resetAndLoad();
  }

  onStatusChange(value: UserStatus | null): void {
    this.status.set(value);
    this.resetAndLoad();
  }

  onPageChange(page: number): void {
    this.page.set(page);
    this.load();
  }

  clearFilters(): void {
    this.keywordControl.setValue('', { emitEvent: false });
    this.role.set(null);
    this.status.set(null);
    this.resetAndLoad();
  }

  openDetail(user: AdminUser): void {
    const data: UserDetailDrawerData = { user };
    this.dialog
      .open<UserDetailDrawerComponent, UserDetailDrawerData, UserDetailDrawerResult>(
        UserDetailDrawerComponent,
        { data, width: '560px', maxWidth: '94vw', maxHeight: '92vh', autoFocus: false },
      )
      .afterClosed()
      .subscribe((res) => {
        if (res?.changed) {
          this.load();
        }
      });
  }

  /** Quick row action: suspend / reactivate without opening the drawer. */
  toggleStatus(user: AdminUser): void {
    this.actions.toggleStatus(user).subscribe((updated) => {
      if (updated) {
        this.load();
      }
    });
  }

  /** Quick row action: send a reset link. */
  resetPassword(user: AdminUser): void {
    this.actions.resetPassword(user).subscribe();
  }

  reload(): void {
    this.load();
  }

  private resetAndLoad(): void {
    this.page.set(1);
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service
      .list({
        keyword: this.keywordControl.value || undefined,
        role: this.role() ?? undefined,
        status: this.status() ?? undefined,
        page: this.page(),
        pageSize: this.pageSize,
      })
      .subscribe({
        next: (result) => {
          this.result.set(result);
          this.loading.set(false);
        },
        error: (error: ApiError) => {
          this.error.set(error.message ?? 'Failed to load users.');
          this.loading.set(false);
        },
      });
  }

  private openDetailById(id: Id): void {
    if (this.detailUserId === id) {
      return;
    }
    this.detailUserId = id;
    this.service.getById(id).subscribe({
      next: (user) => {
        this.dialog
          .open<UserDetailDrawerComponent, UserDetailDrawerData, UserDetailDrawerResult>(
            UserDetailDrawerComponent,
            { data: { user }, width: '560px', maxWidth: '94vw', maxHeight: '92vh', autoFocus: false },
          )
          .afterClosed()
          .subscribe((res) => {
            this.detailUserId = null;
            if (res?.changed) {
              this.load();
            }
            // Drop the :id from the URL so the list is shareable/back-navigable.
            this.router.navigate(['/admin/users']);
          });
      },
      error: () => {
        this.detailUserId = null;
        this.router.navigate(['/admin/users']);
      },
    });
  }
}

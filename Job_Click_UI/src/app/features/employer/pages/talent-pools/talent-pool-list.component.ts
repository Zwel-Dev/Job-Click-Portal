import { Component, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from '@core/services/toast.service';
import { ConfirmService } from '@shared/services/confirm.service';
import { ApiError } from '@core/models/common.model';
import { formatDate } from '@core/utils/format';
import { TalentPoolService } from '../../services/talent-pool.service';
import { TalentPool } from '../../models/talent-pool.model';
import { TalentPoolDialogData, TalentPoolFormComponent } from './talent-pool-form.component';

@Component({
  selector: 'app-talent-pool-list',
  standalone: false,
  templateUrl: './talent-pool-list.component.html',
  styleUrl: './talent-pool-list.component.scss',
})
export class TalentPoolListComponent {
  private readonly poolService = inject(TalentPoolService);
  private readonly dialog = inject(MatDialog);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly pools = signal<TalentPool[]>([]);

  readonly formatDate = formatDate;
  readonly skeletons = [0, 1, 2];

  constructor() {
    this.load();
  }

  reload(): void {
    this.load();
  }

  create(): void {
    const data: TalentPoolDialogData = { mode: 'create' };
    this.dialog
      .open(TalentPoolFormComponent, { data, width: '440px' })
      .afterClosed()
      .subscribe((value) => {
        if (!value) {
          return;
        }
        this.poolService.create(value).subscribe({
          next: () => {
            this.toast.success('Talent pool created.');
            this.load();
          },
          error: (error: ApiError) => this.toast.error(error.message),
        });
      });
  }

  remove(pool: TalentPool): void {
    this.confirm
      .confirm({
        title: 'Delete pool',
        message: `Delete "${pool.name}"? Saved candidates are not deleted, only the pool.`,
        confirmLabel: 'Delete',
        danger: true,
      })
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.poolService.remove(pool.id).subscribe({
          next: () => {
            this.toast.success('Pool deleted.');
            this.load();
          },
          error: (error: ApiError) => this.toast.error(error.message),
        });
      });
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.poolService.list().subscribe({
      next: (pools) => {
        this.pools.set(pools);
        this.loading.set(false);
      },
      error: (error: ApiError) => {
        this.error.set(error.message ?? 'Failed to load talent pools.');
        this.loading.set(false);
      },
    });
  }
}

import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from '@core/services/toast.service';
import { ConfirmService } from '@shared/services/confirm.service';
import { ApiError, Id } from '@core/models/common.model';
import { StatusTone } from '@core/enums/application-status.enum';
import { SENIORITY_LEVEL_LABELS } from '@core/enums/seniority-level.enum';
import { AVAILABILITY_STATUS_LABELS, AvailabilityStatus } from '@core/enums/availability-status.enum';
import { formatDate } from '@core/utils/format';
import { TalentPoolService } from '../../services/talent-pool.service';
import { TalentPoolDetail, TalentPoolMember } from '../../models/talent-pool.model';
import { TalentPoolDialogData, TalentPoolFormComponent } from './talent-pool-form.component';

const AVAILABILITY_TONE: Record<AvailabilityStatus, StatusTone> = {
  [AvailabilityStatus.OpenToWork]: 'success',
  [AvailabilityStatus.Employed]: 'info',
  [AvailabilityStatus.NotLooking]: 'neutral',
};

@Component({
  selector: 'app-talent-pool-detail',
  standalone: false,
  templateUrl: './talent-pool-detail.component.html',
  styleUrl: './talent-pool-detail.component.scss',
})
export class TalentPoolDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly poolService = inject(TalentPoolService);
  private readonly dialog = inject(MatDialog);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly pool = signal<TalentPoolDetail | null>(null);

  readonly seniorityLabels = SENIORITY_LEVEL_LABELS;
  readonly availabilityLabels = AVAILABILITY_STATUS_LABELS;
  readonly availabilityTone = AVAILABILITY_TONE;
  readonly formatDate = formatDate;

  private currentId = 0;

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.currentId = Number(params.get('id'));
      this.load();
    });
  }

  reload(): void {
    this.load();
  }

  rename(): void {
    const pool = this.pool();
    if (!pool) {
      return;
    }
    const data: TalentPoolDialogData = {
      mode: 'edit',
      value: { name: pool.name, description: pool.description },
    };
    this.dialog
      .open(TalentPoolFormComponent, { data, width: '440px' })
      .afterClosed()
      .subscribe((value) => {
        if (!value) {
          return;
        }
        this.poolService.update(this.currentId, value).subscribe({
          next: () => {
            this.toast.success('Pool updated.');
            this.load();
          },
          error: (error: ApiError) => this.toast.error(error.message),
        });
      });
  }

  removeMember(member: TalentPoolMember): void {
    this.confirm
      .confirm({
        title: 'Remove candidate',
        message: `Remove ${member.fullName} from this pool?`,
        confirmLabel: 'Remove',
        danger: true,
      })
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.removeCandidate(member.candidateId, `${member.fullName} removed from the pool.`);
      });
  }

  private removeCandidate(candidateId: Id, message: string): void {
    this.poolService.removeCandidate(this.currentId, candidateId).subscribe({
      next: () => {
        this.toast.success(message);
        this.load();
      },
      error: (error: ApiError) => this.toast.error(error.message),
    });
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.pool.set(null);
    this.poolService.getById(this.currentId).subscribe({
      next: (pool) => {
        this.pool.set(pool);
        this.loading.set(false);
      },
      error: (error: ApiError) => {
        this.error.set(error.message ?? 'This pool could not be found.');
        this.loading.set(false);
      },
    });
  }
}

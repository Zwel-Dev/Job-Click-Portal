import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { forkJoin, switchMap } from 'rxjs';
import { ToastService } from '@core/services/toast.service';
import { ApiError, Id } from '@core/models/common.model';
import { TalentPoolService } from '../../services/talent-pool.service';
import { TalentPool } from '../../models/talent-pool.model';

export interface AddToPoolData {
  candidateId: Id;
  candidateName: string;
}

@Component({
  selector: 'app-add-to-pool-dialog',
  standalone: false,
  templateUrl: './add-to-pool-dialog.component.html',
  styleUrl: './add-to-pool-dialog.component.scss',
})
export class AddToPoolDialogComponent {
  readonly data = inject<AddToPoolData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<AddToPoolDialogComponent, boolean>);
  private readonly poolService = inject(TalentPoolService);
  private readonly toast = inject(ToastService);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly pools = signal<TalentPool[]>([]);

  selectedPoolIds: Id[] = [];
  newPoolName = '';

  constructor() {
    this.poolService.list().subscribe({
      next: (pools) => {
        this.pools.set(pools);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  get canSubmit(): boolean {
    return !this.saving() && (this.selectedPoolIds.length > 0 || this.newPoolName.trim().length > 0);
  }

  add(): void {
    if (!this.canSubmit) {
      return;
    }
    this.saving.set(true);
    const candidateId = this.data.candidateId;
    const operations = this.selectedPoolIds.map((poolId) => this.poolService.addCandidate(poolId, candidateId));

    const name = this.newPoolName.trim();
    if (name) {
      operations.push(
        this.poolService.create({ name }).pipe(switchMap((pool) => this.poolService.addCandidate(pool.id, candidateId))),
      );
    }

    forkJoin(operations).subscribe({
      next: () => {
        this.toast.success(`${this.data.candidateName} added to ${operations.length === 1 ? 'the pool' : 'the pools'}.`);
        this.dialogRef.close(true);
      },
      error: (error: ApiError) => {
        this.toast.error(error.message);
        this.saving.set(false);
      },
    });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}

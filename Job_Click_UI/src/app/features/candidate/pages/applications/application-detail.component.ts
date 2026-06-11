import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastService } from '@core/services/toast.service';
import { ConfirmService } from '@shared/services/confirm.service';
import { ApiError } from '@core/models/common.model';
import { Application } from '@core/models/application.model';
import { APPLICATION_STATUS_META, ApplicationStatus } from '@core/enums/application-status.enum';
import { formatDate, formatSalary } from '@core/utils/format';
import { ApplicationService } from '../../services/application.service';

@Component({
  selector: 'app-application-detail',
  standalone: false,
  templateUrl: './application-detail.component.html',
  styleUrl: './application-detail.component.scss',
})
export class ApplicationDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly applicationService = inject(ApplicationService);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly application = signal<Application | null>(null);

  readonly statusMeta = APPLICATION_STATUS_META;
  readonly formatDate = formatDate;
  readonly formatSalary = formatSalary;

  private currentId = 0;

  readonly historyDesc = computed(() => {
    const app = this.application();
    return app ? [...app.statusHistory].reverse() : [];
  });
  readonly canWithdraw = computed(() => {
    const app = this.application();
    return Boolean(
      app &&
        app.status !== ApplicationStatus.Hired &&
        app.status !== ApplicationStatus.Rejected &&
        app.status !== ApplicationStatus.Withdrawn,
    );
  });

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.currentId = Number(params.get('id'));
      this.load();
    });
  }

  reload(): void {
    this.load();
  }

  withdraw(): void {
    const app = this.application();
    if (!app) {
      return;
    }
    this.confirm
      .confirm({
        title: 'Withdraw application',
        message: `Withdraw your application for "${app.job.title}"? This can't be undone.`,
        confirmLabel: 'Withdraw',
        danger: true,
      })
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.applicationService.withdraw(app.id).subscribe({
          next: (updated) => {
            this.application.set(updated);
            this.toast.success('Application withdrawn.');
          },
          error: (error: ApiError) => this.toast.error(error.message),
        });
      });
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.application.set(null);
    this.applicationService.getById(this.currentId).subscribe({
      next: (app) => {
        this.application.set(app);
        this.loading.set(false);
      },
      error: (error: ApiError) => {
        this.error.set(error.message ?? 'This application could not be found.');
        this.loading.set(false);
      },
    });
  }
}

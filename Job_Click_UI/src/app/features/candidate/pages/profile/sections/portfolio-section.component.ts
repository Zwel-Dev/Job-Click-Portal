import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ToastService } from '@core/services/toast.service';
import { ConfirmService } from '@shared/services/confirm.service';
import { ApiError, Id } from '@core/models/common.model';
import { CandidatePortfolio } from '@core/models/candidate.model';
import { PORTFOLIO_PLATFORM_LABELS, PortfolioPlatform } from '@core/enums/portfolio-platform.enum';
import { URL_PATTERN } from '@core/constants/patterns';
import { CandidateProfileStore } from '../../../state/candidate-profile.store';

@Component({
  selector: 'app-portfolio-section',
  standalone: false,
  templateUrl: './portfolio-section.component.html',
})
export class PortfolioSectionComponent {
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  readonly store = inject(CandidateProfileStore);
  readonly items = this.store.portfolios;

  readonly platformOptions = Object.values(PortfolioPlatform);
  readonly platformLabels = PORTFOLIO_PLATFORM_LABELS;

  readonly formOpen = signal(false);
  readonly editingId = signal<Id | null>(null);
  readonly saving = signal(false);

  readonly form = this.fb.nonNullable.group({
    platform: [PortfolioPlatform.LinkedIn, [Validators.required]],
    url: ['', [Validators.required, Validators.pattern(URL_PATTERN)]],
  });

  startAdd(): void {
    this.editingId.set(null);
    this.form.reset({ platform: PortfolioPlatform.LinkedIn, url: '' });
    this.formOpen.set(true);
  }

  startEdit(item: CandidatePortfolio): void {
    this.editingId.set(item.id);
    this.form.reset({ platform: item.platform, url: item.url });
    this.formOpen.set(true);
  }

  cancel(): void {
    this.formOpen.set(false);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const input = this.form.getRawValue();
    const id = this.editingId();
    const op = id ? this.store.updatePortfolio(id, input) : this.store.addPortfolio(input);

    this.saving.set(true);
    op.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: () => {
        this.formOpen.set(false);
        this.toast.success(id ? 'Portfolio link updated.' : 'Portfolio link added.');
      },
      error: (error: ApiError) => this.toast.error(error.message),
    });
  }

  remove(item: CandidatePortfolio): void {
    this.confirm
      .confirm({
        title: 'Remove portfolio link',
        message: `Remove your ${platformName(item.platform, this.platformLabels)} link?`,
        confirmLabel: 'Remove',
        danger: true,
      })
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.store.removePortfolio(item.id).subscribe({
          next: () => this.toast.success('Portfolio link removed.'),
          error: (error: ApiError) => this.toast.error(error.message),
        });
      });
  }
}

function platformName(platform: PortfolioPlatform, labels: Record<PortfolioPlatform, string>): string {
  return labels[platform];
}

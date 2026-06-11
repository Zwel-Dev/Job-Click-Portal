import { Component, computed, input, output } from '@angular/core';
import { JobSummary } from '@core/models/job.model';
import { EMPLOYMENT_TYPE_LABELS } from '@core/enums/employment-type.enum';
import { WORK_MODE_LABELS } from '@core/enums/work-mode.enum';
import { formatDate, formatSalary } from '@core/utils/format';

/** Reusable job card for search, saved jobs, and recommendations. */
@Component({
  selector: 'app-job-card',
  standalone: false,
  templateUrl: './job-card.component.html',
  styleUrl: './job-card.component.scss',
})
export class JobCardComponent {
  readonly job = input.required<JobSummary>();
  /** Base path for the detail link (so the card works in any workspace). */
  readonly detailLinkBase = input<string>('/candidate/jobs');
  /** Show an inline "Apply" button (e.g. on the saved-jobs page). */
  readonly showApply = input(false);
  readonly save = output<JobSummary>();
  readonly apply = output<JobSummary>();

  readonly employmentLabel = computed(() => EMPLOYMENT_TYPE_LABELS[this.job().employmentType]);
  readonly workModeLabel = computed(() => WORK_MODE_LABELS[this.job().workMode]);
  readonly salary = computed(() => formatSalary(this.job()));
  readonly posted = computed(() => formatDate(this.job().publishedAt));
  readonly companyInitial = computed(() => this.job().companyName.charAt(0).toUpperCase());

  toggleSave(): void {
    this.save.emit(this.job());
  }

  onApply(): void {
    this.apply.emit(this.job());
  }
}

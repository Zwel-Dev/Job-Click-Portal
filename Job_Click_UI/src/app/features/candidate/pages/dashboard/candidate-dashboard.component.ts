import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Application } from '@core/models/application.model';
import { JobSummary, SavedJob } from '@core/models/job.model';
import { ApiError } from '@core/models/common.model';
import { EMPLOYMENT_TYPE_LABELS } from '@core/enums/employment-type.enum';
import { formatDate, formatSalary } from '@core/utils/format';
import { CandidateProfileStore } from '../../state/candidate-profile.store';
import { ApplicationService } from '../../services/application.service';
import { SavedJobService } from '../../services/saved-job.service';
import { JobSearchService } from '../../services/job-search.service';

@Component({
  selector: 'app-candidate-dashboard',
  standalone: false,
  templateUrl: './candidate-dashboard.component.html',
  styleUrl: './candidate-dashboard.component.scss',
})
export class CandidateDashboardComponent implements OnInit {
  readonly store = inject(CandidateProfileStore);
  private readonly applicationService = inject(ApplicationService);
  private readonly savedJobService = inject(SavedJobService);
  private readonly jobSearchService = inject(JobSearchService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly applications = signal<Application[]>([]);
  readonly savedJobs = signal<SavedJob[]>([]);
  readonly newestJobs = signal<JobSummary[]>([]);

  readonly employmentTypeLabels = EMPLOYMENT_TYPE_LABELS;
  readonly formatSalary = formatSalary;
  readonly formatDate = formatDate;
  readonly skeletons = [0, 1, 2];

  readonly greeting = computed(() => {
    const profile = this.store.profile();
    return profile ? `Welcome back, ${profile.fullName}` : 'Welcome back';
  });
  readonly recentApplications = computed(() => this.applications().slice(0, 5));
  readonly savedPreview = computed(() => this.savedJobs().slice(0, 3));

  ngOnInit(): void {
    this.store.load();
    this.loadWidgets();
  }

  loadWidgets(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      applications: this.applicationService.list(),
      saved: this.savedJobService.list(),
      newest: this.jobSearchService.getNewest(5),
    }).subscribe({
      next: (data) => {
        this.applications.set(data.applications);
        this.savedJobs.set(data.saved);
        this.newestJobs.set(data.newest);
        this.loading.set(false);
      },
      error: (error: ApiError) => {
        this.error.set(error.message ?? 'Failed to load your dashboard.');
        this.loading.set(false);
      },
    });
  }
}

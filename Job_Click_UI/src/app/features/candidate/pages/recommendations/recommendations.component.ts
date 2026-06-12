import { Component, inject, signal } from '@angular/core';
import { ToastService } from '@core/services/toast.service';
import { ApiError } from '@core/models/common.model';
import { JobSummary } from '@core/models/job.model';
import { MatchCategory, RecommendedJob } from '@core/models/recommendation.model';
import { RecommendationService } from '../../services/recommendation.service';
import { SavedJobService } from '../../services/saved-job.service';

interface CategoryTab {
  key: MatchCategory;
  label: string;
  hint?: string;
}

@Component({
  selector: 'app-recommendations',
  standalone: false,
  templateUrl: './recommendations.component.html',
  styleUrl: './recommendations.component.scss',
})
export class RecommendationsComponent {
  private readonly recommendationService = inject(RecommendationService);
  private readonly savedJobService = inject(SavedJobService);
  private readonly toast = inject(ToastService);

  readonly categories: CategoryTab[] = [
    { key: 'best', label: 'Best matches', hint: '90-100%' },
    { key: 'good', label: 'Good opportunities', hint: '75-89%' },
    { key: 'growth', label: 'Growth', hint: '60-74%' },
    { key: 'trending', label: 'Trending' },
    { key: 'new', label: 'New' },
  ];

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly jobs = signal<RecommendedJob[]>([]);
  readonly activeIndex = signal(0);
  readonly skeletons = [0, 1, 2, 3];

  constructor() {
    this.load(0);
  }

  select(index: number): void {
    if (index === this.activeIndex()) {
      return;
    }
    this.activeIndex.set(index);
    this.load(index);
  }

  reload(): void {
    this.load(this.activeIndex());
  }

  onSave(job: JobSummary): void {
    const op = job.isSaved ? this.savedJobService.remove(job.id) : this.savedJobService.save(job.id);
    op.subscribe({
      next: () => {
        this.jobs.update((list) =>
          list.map((rec) =>
            rec.job.id === job.id ? { ...rec, job: { ...rec.job, isSaved: !job.isSaved } } : rec,
          ),
        );
        this.toast.success(job.isSaved ? 'Removed from saved jobs.' : 'Job saved.');
      },
      error: (error: ApiError) => this.toast.error(error.message),
    });
  }

  private load(index: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.recommendationService.getRecommendedJobs(this.categories[index].key).subscribe({
      next: (list) => {
        this.jobs.set(list);
        this.loading.set(false);
      },
      error: (error: ApiError) => {
        this.error.set(error.message ?? 'Failed to load recommendations.');
        this.loading.set(false);
      },
    });
  }
}

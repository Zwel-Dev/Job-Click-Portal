import { Component, input, output } from '@angular/core';
import { JobSummary } from '@core/models/job.model';
import { RecommendedJob } from '@core/models/recommendation.model';

/** A recommended job: the shared job card + a "why this match" breakdown popover. */
@Component({
  selector: 'app-recommendation-card',
  standalone: false,
  templateUrl: './recommendation-card.component.html',
  styleUrl: './recommendation-card.component.scss',
})
export class RecommendationCardComponent {
  readonly rec = input.required<RecommendedJob>();
  readonly save = output<JobSummary>();
}

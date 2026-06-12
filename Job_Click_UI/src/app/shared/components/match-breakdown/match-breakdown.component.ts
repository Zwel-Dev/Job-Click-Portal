import { Component, computed, input } from '@angular/core';
import { JobMatchScore } from '@core/models/recommendation.model';

interface BreakdownRow {
  label: string;
  value: number;
  weight: number;
}

/** Weighted match-score breakdown (skill/experience/location/salary/education). */
@Component({
  selector: 'app-match-breakdown',
  standalone: false,
  templateUrl: './match-breakdown.component.html',
  styleUrl: './match-breakdown.component.scss',
})
export class MatchBreakdownComponent {
  readonly match = input.required<JobMatchScore>();

  readonly rows = computed<BreakdownRow[]>(() => {
    const match = this.match();
    return [
      { label: 'Skills', value: match.skill, weight: 40 },
      { label: 'Experience', value: match.experience, weight: 25 },
      { label: 'Location', value: match.location, weight: 15 },
      { label: 'Salary', value: match.salary, weight: 10 },
      { label: 'Education', value: match.education, weight: 10 },
    ];
  });
}

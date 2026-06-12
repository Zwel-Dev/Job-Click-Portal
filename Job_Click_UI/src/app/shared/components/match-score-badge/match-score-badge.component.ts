import { Component, computed, input } from '@angular/core';

type MatchBand = 'best' | 'good' | 'growth' | 'low';

/** Compact "92% match" badge, colored by score band. */
@Component({
  selector: 'app-match-score-badge',
  standalone: false,
  templateUrl: './match-score-badge.component.html',
  styleUrl: './match-score-badge.component.scss',
})
export class MatchScoreBadgeComponent {
  readonly score = input.required<number>();

  readonly band = computed<MatchBand>(() => {
    const score = this.score();
    if (score >= 90) {
      return 'best';
    }
    if (score >= 75) {
      return 'good';
    }
    if (score >= 60) {
      return 'growth';
    }
    return 'low';
  });
}

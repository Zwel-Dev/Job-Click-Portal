import { Component, input } from '@angular/core';

/** Compact metric card for dashboards: value, label, optional icon + hint. */
@Component({
  selector: 'app-kpi-card',
  standalone: false,
  templateUrl: './kpi-card.component.html',
  styleUrl: './kpi-card.component.scss',
})
export class KpiCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly icon = input<string>();
  readonly hint = input<string>();
}

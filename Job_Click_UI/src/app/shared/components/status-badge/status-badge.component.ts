import { Component, input } from '@angular/core';
import { StatusTone } from '@core/enums/application-status.enum';

/** Generic status badge (text + tone). Use for JobStatus, OfferStatus, etc. */
@Component({
  selector: 'app-status-badge',
  standalone: false,
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.scss',
})
export class StatusBadgeComponent {
  readonly label = input.required<string>();
  readonly tone = input<StatusTone>('neutral');
}

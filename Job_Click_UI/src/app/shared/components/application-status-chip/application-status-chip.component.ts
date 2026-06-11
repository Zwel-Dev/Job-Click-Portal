import { Component, computed, input } from '@angular/core';
import { APPLICATION_STATUS_META, ApplicationStatus } from '@core/enums/application-status.enum';

/** Colored chip for an application status (text + tone, not color alone). */
@Component({
  selector: 'app-application-status-chip',
  standalone: false,
  templateUrl: './application-status-chip.component.html',
  styleUrl: './application-status-chip.component.scss',
})
export class ApplicationStatusChipComponent {
  readonly status = input.required<ApplicationStatus>();
  readonly meta = computed(() => APPLICATION_STATUS_META[this.status()]);
}

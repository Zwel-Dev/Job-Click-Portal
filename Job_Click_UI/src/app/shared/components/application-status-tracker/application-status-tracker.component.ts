import { Component, computed, input } from '@angular/core';
import {
  APPLICATION_PIPELINE,
  APPLICATION_STATUS_META,
  ApplicationStatus,
} from '@core/enums/application-status.enum';
import { ApplicationStatusEvent } from '@core/models/application.model';

interface TrackerStage {
  label: string;
  state: 'done' | 'current' | 'upcoming';
}

/** Read-only pipeline timeline for an application (Applied → … → Hired, + terminal). */
@Component({
  selector: 'app-application-status-tracker',
  standalone: false,
  templateUrl: './application-status-tracker.component.html',
  styleUrl: './application-status-tracker.component.scss',
})
export class ApplicationStatusTrackerComponent {
  readonly status = input.required<ApplicationStatus>();
  readonly history = input<ApplicationStatusEvent[]>([]);

  readonly isTerminal = computed(
    () => this.status() === ApplicationStatus.Rejected || this.status() === ApplicationStatus.Withdrawn,
  );
  readonly terminalMeta = computed(() =>
    this.isTerminal() ? APPLICATION_STATUS_META[this.status()] : null,
  );
  readonly terminalIcon = computed(() =>
    this.status() === ApplicationStatus.Withdrawn ? 'undo' : 'cancel',
  );

  readonly stages = computed<TrackerStage[]>(() => {
    const pipeline = APPLICATION_PIPELINE;
    const terminal = this.isTerminal();
    const reached = terminal ? this.maxReachedIndex() : pipeline.indexOf(this.status());

    return pipeline.map((stage, index): TrackerStage => {
      let state: TrackerStage['state'];
      if (index < reached) {
        state = 'done';
      } else if (index === reached) {
        state = terminal ? 'done' : 'current';
      } else {
        state = 'upcoming';
      }
      return { label: APPLICATION_STATUS_META[stage].label, state };
    });
  });

  private maxReachedIndex(): number {
    const pipeline = APPLICATION_PIPELINE;
    const indices = this.history()
      .map((event) => pipeline.indexOf(event.status))
      .filter((index) => index >= 0);
    return indices.length ? Math.max(...indices) : 0;
  }
}

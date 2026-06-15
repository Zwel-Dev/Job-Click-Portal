import { Component, computed, inject, signal } from '@angular/core';
import { ApiError, Id } from '@core/models/common.model';
import { FraudSignal } from '@core/models/admin-platform.model';
import { FraudSignalType, FRAUD_SIGNAL_TYPE_META } from '@core/enums/fraud-signal-type.enum';
import { FraudSeverity, FRAUD_SEVERITY_META } from '@core/enums/fraud-severity.enum';
import { ConfirmService } from '@shared/services/confirm.service';
import { ToastService } from '@core/services/toast.service';
import { AdminContextStore } from '../../state/admin-context.store';
import { FraudService } from '../../services/fraud.service';
import { FraudActionKind, FraudSignalGroup } from '../../models/fraud.model';

/** Fraud detection — signal cards grouped by type, with resolve / act (PA2.1 §8.5). */
@Component({
  selector: 'app-fraud-dashboard',
  standalone: false,
  templateUrl: './fraud-dashboard.component.html',
  styleUrl: './fraud-dashboard.component.scss',
})
export class FraudDashboardComponent {
  private readonly service = inject(FraudService);
  private readonly context = inject(AdminContextStore);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly signals = signal<FraudSignal[]>([]);
  readonly busyId = signal<Id | null>(null);

  readonly showResolved = signal(false);
  readonly severity = signal<FraudSeverity | null>(null);

  readonly typeMeta = FRAUD_SIGNAL_TYPE_META;
  readonly skeletons = [0, 1, 2, 3];
  readonly severityOptions = Object.values(FraudSeverity).map((value) => ({
    value,
    label: FRAUD_SEVERITY_META[value].label,
  }));

  readonly openCount = computed(() => this.signals().filter((s) => !s.resolved).length);
  readonly highCount = computed(
    () => this.signals().filter((s) => !s.resolved && s.severity === FraudSeverity.High).length,
  );
  readonly resolvedCount = computed(() => this.signals().filter((s) => s.resolved).length);

  /** Filtered signals grouped by type (only non-empty groups, in enum order). */
  readonly groups = computed<FraudSignalGroup[]>(() => {
    const showResolved = this.showResolved();
    const severity = this.severity();
    const filtered = this.signals().filter(
      (s) => (showResolved || !s.resolved) && (!severity || s.severity === severity),
    );
    return Object.values(FraudSignalType)
      .map((type) => ({ type, signals: filtered.filter((s) => s.type === type) }))
      .filter((group) => group.signals.length > 0);
  });

  readonly hasVisible = computed(() => this.groups().length > 0);

  constructor() {
    this.load();
  }

  onSeverityChange(value: FraudSeverity | null): void {
    this.severity.set(value);
  }

  toggleResolved(value: boolean): void {
    this.showResolved.set(value);
  }

  resolve(item: FraudSignal): void {
    this.busyId.set(item.id);
    this.service.resolve(item.id).subscribe({
      next: () => {
        this.toast.success('Signal marked resolved.');
        this.afterAction();
      },
      error: (error: ApiError) => {
        this.toast.error(error.message ?? 'Could not resolve the signal.');
        this.busyId.set(null);
      },
    });
  }

  act(item: FraudSignal, kind: FraudActionKind): void {
    const verb = kind === 'remove' ? 'Remove' : 'Suspend';
    this.confirm
      .confirm({
        title: `${verb} ${item.entityLabel}?`,
        message:
          kind === 'remove'
            ? 'This takes the job posting down across the platform. The signal will be marked resolved.'
            : `This suspends the ${item.entityType} and blocks their access until reactivated. The signal will be marked resolved.`,
        confirmLabel: verb,
        danger: true,
      })
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.busyId.set(item.id);
        this.service.actOn(item, kind).subscribe({
          next: () => {
            this.toast.success(`${verb} applied — signal resolved.`);
            this.afterAction();
          },
          error: (error: ApiError) => {
            this.toast.error(error.message ?? 'Could not complete the action.');
            this.busyId.set(null);
          },
        });
      });
  }

  reload(): void {
    this.load();
  }

  private afterAction(): void {
    this.busyId.set(null);
    this.load();
    // Resolving/acting changes the open count — refresh the shell nav badge.
    this.context.reload();
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.signals().subscribe({
      next: (signals) => {
        this.signals.set(signals);
        this.loading.set(false);
      },
      error: (error: ApiError) => {
        this.error.set(error.message ?? 'Failed to load fraud signals.');
        this.loading.set(false);
      },
    });
  }
}

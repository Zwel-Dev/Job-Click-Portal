import { Component, computed, input, output } from '@angular/core';
import { FraudSignal } from '@core/models/admin-platform.model';
import { FRAUD_SIGNAL_TYPE_META } from '@core/enums/fraud-signal-type.enum';
import { FRAUD_SEVERITY_META } from '@core/enums/fraud-severity.enum';
import { formatDate } from '@core/utils/format';
import { FraudActionKind } from '../../models/fraud.model';

/** Presentational card for one fraud signal: type/severity, entity, resolve/act. */
@Component({
  selector: 'app-fraud-signal-card',
  standalone: false,
  templateUrl: './fraud-signal-card.component.html',
  styleUrl: './fraud-signal-card.component.scss',
})
export class FraudSignalCardComponent {
  readonly signal = input.required<FraudSignal>();
  readonly busy = input(false);
  readonly resolve = output<void>();
  readonly act = output<FraudActionKind>();

  readonly formatDate = formatDate;

  readonly typeMeta = computed(() => FRAUD_SIGNAL_TYPE_META[this.signal().type]);
  readonly severityMeta = computed(() => FRAUD_SEVERITY_META[this.signal().severity]);

  /** Deep-link to the linked entity, when one is known. */
  readonly entityLink = computed<string[] | null>(() => {
    const item = this.signal();
    if (item.entityId === undefined) {
      return null;
    }
    switch (item.entityType) {
      case 'user':
        return ['/admin/users', String(item.entityId)];
      case 'company':
        return ['/admin/companies', String(item.entityId)];
      case 'job':
        return ['/admin/jobs'];
      default:
        return null;
    }
  });

  /** Which act-on control to offer (suspend user/company, remove job). */
  readonly actionKind = computed<FraudActionKind | null>(() => {
    switch (this.signal().entityType) {
      case 'user':
      case 'company':
        return 'suspend';
      case 'job':
        return 'remove';
      default:
        return null;
    }
  });

  readonly actionLabel = computed(() => (this.actionKind() === 'remove' ? 'Remove job' : 'Suspend'));
  readonly actionIcon = computed(() => (this.actionKind() === 'remove' ? 'delete_outline' : 'block'));

  onResolve(): void {
    this.resolve.emit();
  }

  onAct(): void {
    const kind = this.actionKind();
    if (kind) {
      this.act.emit(kind);
    }
  }
}

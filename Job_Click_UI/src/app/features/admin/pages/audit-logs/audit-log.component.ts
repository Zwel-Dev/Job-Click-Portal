import { Component, computed, inject, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ApiError, Paginated } from '@core/models/common.model';
import { AuditLogEntry } from '@core/models/admin-platform.model';
import { AuditAction, AUDIT_ACTION_META } from '@core/enums/audit-action.enum';
import { AuditLogService } from '../../services/audit-log.service';
import { AUDIT_ENTITY_TYPES } from '../../models/audit-log.model';

/** Audit & activity logs — read-only, filterable trail of admin actions (PA2.3 §8.7). */
@Component({
  selector: 'app-audit-log',
  standalone: false,
  templateUrl: './audit-log.component.html',
  styleUrl: './audit-log.component.scss',
})
export class AuditLogComponent {
  private readonly service = inject(AuditLogService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly result = signal<Paginated<AuditLogEntry> | null>(null);

  readonly actorControl = new FormControl('', { nonNullable: true });
  readonly action = signal<AuditAction | null>(null);
  readonly entityType = signal<string | null>(null);
  readonly from = signal<string>('');
  readonly to = signal<string>('');
  readonly page = signal(1);
  readonly pageSize = 10;

  readonly actionMeta = AUDIT_ACTION_META;
  readonly entityTypes = AUDIT_ENTITY_TYPES;
  readonly actionOptions = Object.values(AuditAction).map((value) => ({
    value,
    label: AUDIT_ACTION_META[value].label,
  }));

  readonly hasFilters = computed(
    () =>
      !!this.actorControl.value ||
      this.action() !== null ||
      this.entityType() !== null ||
      !!this.from() ||
      !!this.to(),
  );

  constructor() {
    this.actorControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(() => this.resetAndLoad());
    this.load();
  }

  formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  onActionChange(value: AuditAction | null): void {
    this.action.set(value);
    this.resetAndLoad();
  }

  onEntityTypeChange(value: string | null): void {
    this.entityType.set(value);
    this.resetAndLoad();
  }

  onFromChange(value: string): void {
    this.from.set(value);
    this.resetAndLoad();
  }

  onToChange(value: string): void {
    this.to.set(value);
    this.resetAndLoad();
  }

  onPageChange(page: number): void {
    this.page.set(page);
    this.load();
  }

  clearFilters(): void {
    this.actorControl.setValue('', { emitEvent: false });
    this.action.set(null);
    this.entityType.set(null);
    this.from.set('');
    this.to.set('');
    this.resetAndLoad();
  }

  reload(): void {
    this.load();
  }

  private resetAndLoad(): void {
    this.page.set(1);
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service
      .list({
        actor: this.actorControl.value || undefined,
        action: this.action() ?? undefined,
        entityType: this.entityType() ?? undefined,
        from: this.from() || undefined,
        to: this.to() || undefined,
        page: this.page(),
        pageSize: this.pageSize,
      })
      .subscribe({
        next: (result) => {
          this.result.set(result);
          this.loading.set(false);
        },
        error: (error: ApiError) => {
          this.error.set(error.message ?? 'Failed to load audit logs.');
          this.loading.set(false);
        },
      });
  }
}

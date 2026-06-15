import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrentUserStore } from '@core/auth/current-user.store';
import { ApiError } from '@core/models/common.model';
import { formatDate } from '@core/utils/format';
import { roleLabel } from '@core/utils/role-label';
import { USER_STATUS_META } from '@core/enums/user-status.enum';
import { FRAUD_SEVERITY_META } from '@core/enums/fraud-severity.enum';
import { FRAUD_SIGNAL_TYPE_META } from '@core/enums/fraud-signal-type.enum';
import { AdminContextStore } from '../../state/admin-context.store';
import { AdminDashboardService } from '../../services/admin-dashboard.service';
import { AdminDashboardWidgets } from '../../models/admin-dashboard.model';

/** Platform-admin dashboard — system KPI strip + verification / sign-up / fraud queue widgets (PA1.0 §8.0). */
@Component({
  selector: 'app-admin-dashboard',
  standalone: false,
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {
  readonly currentUser = inject(CurrentUserStore);
  readonly context = inject(AdminContextStore);
  private readonly dashboardService = inject(AdminDashboardService);

  readonly widgetsLoading = signal(true);
  readonly widgetsError = signal<string | null>(null);
  readonly widgets = signal<AdminDashboardWidgets | null>(null);

  readonly userStatusMeta = USER_STATUS_META;
  readonly fraudSeverityMeta = FRAUD_SEVERITY_META;
  readonly fraudTypeMeta = FRAUD_SIGNAL_TYPE_META;
  readonly formatDate = formatDate;
  readonly roleLabel = roleLabel;
  readonly kpiSkeletons = [0, 1, 2, 3, 4, 5];
  readonly widgetSkeletons = [0, 1, 2];

  readonly greeting = computed(() => {
    const name = this.currentUser.displayName();
    return name ? `Welcome back, ${name}` : 'Platform overview';
  });

  ngOnInit(): void {
    // The shell already kicks off the KPI load; this is idempotent.
    this.context.load();
    this.loadWidgets();
  }

  loadWidgets(): void {
    this.widgetsLoading.set(true);
    this.widgetsError.set(null);
    this.dashboardService.getWidgets(5).subscribe({
      next: (data) => {
        this.widgets.set(data);
        this.widgetsLoading.set(false);
      },
      error: (error: ApiError) => {
        this.widgetsError.set(error.message ?? 'Failed to load the dashboard queues.');
        this.widgetsLoading.set(false);
      },
    });
  }
}

import { Component, OnInit, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ToastService } from '@core/services/toast.service';
import { ApiError } from '@core/models/common.model';
import { PlanUsage, Subscription, SubscriptionPlan } from '@core/models/subscription.model';
import { SUBSCRIPTION_STATUS_META } from '@core/enums/subscription-status.enum';
import { formatDate } from '@core/utils/format';
import { SubscriptionService } from '../../services/subscription.service';

const UNLIMITED = 999;

@Component({
  selector: 'app-subscription',
  standalone: false,
  templateUrl: './subscription.component.html',
  styleUrl: './subscription.component.scss',
})
export class SubscriptionComponent implements OnInit {
  private readonly subscriptionService = inject(SubscriptionService);
  private readonly toast = inject(ToastService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly subscription = signal<Subscription | null>(null);
  readonly usage = signal<PlanUsage | null>(null);
  readonly plans = signal<SubscriptionPlan[]>([]);

  readonly statusMeta = SUBSCRIPTION_STATUS_META;
  readonly formatDate = formatDate;

  ngOnInit(): void {
    this.load();
  }

  reload(): void {
    this.load();
  }

  limitLabel(value: number): string {
    return value >= UNLIMITED ? 'Unlimited' : `${value}`;
  }

  isCurrent(plan: SubscriptionPlan): boolean {
    return this.subscription()?.plan.id === plan.id;
  }

  isUpgrade(plan: SubscriptionPlan): boolean {
    const current = this.subscription()?.plan;
    return !!current && plan.price > current.price;
  }

  choosePlan(plan: SubscriptionPlan): void {
    this.toast.info(`Checkout for the ${plan.name} plan is coming soon.`);
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.subscription.set(null);
    forkJoin({
      subscription: this.subscriptionService.current(),
      usage: this.subscriptionService.usage(),
      plans: this.subscriptionService.plans(),
    }).subscribe({
      next: ({ subscription, usage, plans }) => {
        this.subscription.set(subscription);
        this.usage.set(usage);
        this.plans.set(plans);
        this.loading.set(false);
      },
      error: (error: ApiError) => {
        this.error.set(error.message ?? 'Failed to load your subscription.');
        this.loading.set(false);
      },
    });
  }
}

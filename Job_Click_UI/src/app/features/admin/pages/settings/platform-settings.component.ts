import { Component, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { ApiError, Id } from '@core/models/common.model';
import { SubscriptionPlan } from '@core/models/subscription.model';
import { formatMoney } from '@core/utils/format';
import { ConfirmService } from '@shared/services/confirm.service';
import { ToastService } from '@core/services/toast.service';
import { PlatformSettingsService } from '../../services/platform-settings.service';
import { FeatureFlag, RoleInfo, Skill } from '../../models/platform-settings.model';
import {
  SkillFormDialogComponent,
  SkillFormDialogData,
} from '../../components/skill-form-dialog/skill-form-dialog.component';
import {
  PlanFormDialogComponent,
  PlanFormDialogData,
} from '../../components/plan-form-dialog/plan-form-dialog.component';

/** Platform settings — roles (view), skills, plans, and feature flags (PA2.4 §8.8). */
@Component({
  selector: 'app-platform-settings',
  standalone: false,
  templateUrl: './platform-settings.component.html',
  styleUrl: './platform-settings.component.scss',
})
export class PlatformSettingsComponent {
  private readonly service = inject(PlatformSettingsService);
  private readonly dialog = inject(MatDialog);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly roles = signal<RoleInfo[]>([]);
  readonly skills = signal<Skill[]>([]);
  readonly plans = signal<SubscriptionPlan[]>([]);
  readonly flags = signal<FeatureFlag[]>([]);
  readonly flagBusy = signal<Id | null>(null);

  readonly formatMoney = formatMoney;

  constructor() {
    this.load();
  }

  // --- Skills ---------------------------------------------------------------

  addSkill(): void {
    this.openSkillDialog({});
  }

  editSkill(skill: Skill): void {
    this.openSkillDialog({ skill });
  }

  removeSkill(skill: Skill): void {
    this.confirm
      .confirm({
        title: `Remove "${skill.name}"?`,
        message: 'This removes the skill from the taxonomy used by candidate and job pickers.',
        confirmLabel: 'Remove',
        danger: true,
      })
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.service.removeSkill(skill.id).subscribe({
          next: () => {
            this.toast.success(`Removed "${skill.name}".`);
            this.reloadSkills();
          },
          error: (error: ApiError) => this.toast.error(error.message ?? 'Could not remove the skill.'),
        });
      });
  }

  // --- Plans ----------------------------------------------------------------

  addPlan(): void {
    this.openPlanDialog({});
  }

  editPlan(plan: SubscriptionPlan): void {
    this.openPlanDialog({ plan });
  }

  removePlan(plan: SubscriptionPlan): void {
    this.confirm
      .confirm({
        title: `Remove the "${plan.name}" plan?`,
        message: 'Companies already on this plan keep it until they change; new signups will not see it.',
        confirmLabel: 'Remove',
        danger: true,
      })
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.service.removePlan(plan.id).subscribe({
          next: () => {
            this.toast.success(`Removed the "${plan.name}" plan.`);
            this.reloadPlans();
          },
          error: (error: ApiError) => this.toast.error(error.message ?? 'Could not remove the plan.'),
        });
      });
  }

  planLimit(value: number): string {
    return value >= 999 ? 'Unlimited' : String(value);
  }

  // --- Feature flags --------------------------------------------------------

  toggleFlag(flag: FeatureFlag, enabled: boolean): void {
    this.flagBusy.set(flag.id);
    this.service.setFlag(flag.id, enabled).subscribe({
      next: (updated) => {
        this.flags.update((flags) => flags.map((item) => (item.id === updated.id ? updated : item)));
        this.toast.success(`${updated.enabled ? 'Enabled' : 'Disabled'} "${updated.label}".`);
        this.flagBusy.set(null);
      },
      error: (error: ApiError) => {
        this.toast.error(error.message ?? 'Could not update the flag.');
        this.flagBusy.set(null);
      },
    });
  }

  reload(): void {
    this.load();
  }

  // --- Loading --------------------------------------------------------------

  private openSkillDialog(data: SkillFormDialogData): void {
    this.dialog
      .open(SkillFormDialogComponent, { data, width: '420px', autoFocus: false })
      .afterClosed()
      .subscribe((value) => {
        if (!value) {
          return;
        }
        this.service.saveSkill(value, data.skill?.id).subscribe({
          next: (saved) => {
            this.toast.success(`${data.skill ? 'Updated' : 'Added'} "${saved.name}".`);
            this.reloadSkills();
          },
          error: (error: ApiError) => this.toast.error(error.message ?? 'Could not save the skill.'),
        });
      });
  }

  private openPlanDialog(data: PlanFormDialogData): void {
    this.dialog
      .open(PlanFormDialogComponent, { data, width: '520px', maxWidth: '94vw', autoFocus: false })
      .afterClosed()
      .subscribe((value) => {
        if (!value) {
          return;
        }
        this.service.savePlan(value, data.plan?.id).subscribe({
          next: (saved) => {
            this.toast.success(`${data.plan ? 'Updated' : 'Added'} the "${saved.name}" plan.`);
            this.reloadPlans();
          },
          error: (error: ApiError) => this.toast.error(error.message ?? 'Could not save the plan.'),
        });
      });
  }

  private reloadSkills(): void {
    this.service.skills().subscribe((skills) => this.skills.set(skills));
  }

  private reloadPlans(): void {
    this.service.plans().subscribe((plans) => this.plans.set(plans));
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      roles: this.service.roles(),
      skills: this.service.skills(),
      plans: this.service.plans(),
      flags: this.service.flags(),
    }).subscribe({
      next: ({ roles, skills, plans, flags }) => {
        this.roles.set(roles);
        this.skills.set(skills);
        this.plans.set(plans);
        this.flags.set(flags);
        this.loading.set(false);
      },
      error: (error: ApiError) => {
        this.error.set(error.message ?? 'Failed to load settings.');
        this.loading.set(false);
      },
    });
  }
}

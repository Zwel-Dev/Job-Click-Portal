import { Injectable, computed, inject } from '@angular/core';
import { CurrentUserStore } from '@core/auth/current-user.store';
import { RoleCode } from '@core/enums/role-code.enum';
import { roleLabel } from '@core/utils/role-label';

/**
 * Employer workspace context — current company, active role, and permission
 * helpers. Derived from the signed-in user (no async load needed). Later slices
 * can hydrate richer company/plan data from a service.
 */
@Injectable({ providedIn: 'root' })
export class EmployerContextStore {
  private readonly currentUser = inject(CurrentUserStore);

  readonly companyId = computed(() => this.currentUser.user()?.companyId ?? null);
  readonly companyName = computed(() => this.currentUser.user()?.companyName ?? '');

  readonly activeRole = computed<RoleCode | null>(() => {
    const roles = this.currentUser.roles();
    const priority = [
      RoleCode.CompanyAdmin,
      RoleCode.RecruitmentManager,
      RoleCode.Recruiter,
      RoleCode.HiringManager,
    ];
    return priority.find((role) => roles.includes(role)) ?? null;
  });
  readonly activeRoleLabel = computed(() => {
    const role = this.activeRole();
    return role ? roleLabel(role) : '';
  });

  readonly isCompanyAdmin = computed(() => this.currentUser.hasRole(RoleCode.CompanyAdmin));
  readonly isManager = computed(() =>
    this.currentUser.hasAnyRole([RoleCode.CompanyAdmin, RoleCode.RecruitmentManager]),
  );
  readonly isRecruiter = computed(() =>
    this.currentUser.hasAnyRole([
      RoleCode.CompanyAdmin,
      RoleCode.RecruitmentManager,
      RoleCode.Recruiter,
    ]),
  );

  readonly canApproveJobs = this.isManager;
  readonly canManageTeam = this.isCompanyAdmin;
}

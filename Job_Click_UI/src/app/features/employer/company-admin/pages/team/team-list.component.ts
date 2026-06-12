import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ToastService } from '@core/services/toast.service';
import { ConfirmService } from '@shared/services/confirm.service';
import { CurrentUserStore } from '@core/auth/current-user.store';
import { ApiError } from '@core/models/common.model';
import { TeamMember } from '@core/models/team.model';
import { RoleCode } from '@core/enums/role-code.enum';
import { MEMBER_STATUS_META, MemberStatus } from '@core/enums/member-status.enum';
import { roleLabel } from '@core/utils/role-label';
import { formatDate } from '@core/utils/format';
import { TeamService } from '../../services/team.service';
import { CompanyContextStore } from '../../state/company-context.store';
import { InviteMemberDialogComponent } from '../../components/invite-member-dialog/invite-member-dialog.component';
import { TransferOwnershipData, TransferOwnershipDialogComponent } from '../../components/transfer-ownership-dialog/transfer-ownership-dialog.component';

type RoleFilter = RoleCode | 'ALL';
type StatusFilter = MemberStatus | 'ALL';

interface MatrixRow {
  capability: string;
  allowed: RoleCode[];
}

@Component({
  selector: 'app-team-list',
  standalone: false,
  templateUrl: './team-list.component.html',
  styleUrl: './team-list.component.scss',
})
export class TeamListComponent implements OnInit {
  private readonly teamService = inject(TeamService);
  private readonly companyContext = inject(CompanyContextStore);
  private readonly currentUser = inject(CurrentUserStore);
  private readonly dialog = inject(MatDialog);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly members = signal<TeamMember[]>([]);
  readonly roleFilter = signal<RoleFilter>('ALL');
  readonly statusFilter = signal<StatusFilter>('ALL');
  readonly searchControl = new FormControl('', { nonNullable: true });
  private readonly searchTerm = signal('');

  readonly statusMeta = MEMBER_STATUS_META;
  readonly roleLabel = roleLabel;
  readonly formatDate = formatDate;
  readonly MemberStatus = MemberStatus;
  readonly RoleCode = RoleCode;
  readonly skeletons = [0, 1, 2, 3];

  readonly assignableRoles = [RoleCode.RecruitmentManager, RoleCode.Recruiter, RoleCode.HiringManager];
  readonly statusOptions = Object.values(MemberStatus);

  readonly matrixRoles: RoleCode[] = [
    RoleCode.CompanyAdmin,
    RoleCode.RecruitmentManager,
    RoleCode.Recruiter,
    RoleCode.HiringManager,
  ];
  readonly matrix: MatrixRow[] = [
    { capability: 'Company profile / locations / verification', allowed: [RoleCode.CompanyAdmin] },
    { capability: 'Departments', allowed: [RoleCode.CompanyAdmin, RoleCode.RecruitmentManager] },
    { capability: 'Team & roles / ownership', allowed: [RoleCode.CompanyAdmin] },
    { capability: 'Subscription & billing', allowed: [RoleCode.CompanyAdmin] },
    { capability: 'Manage jobs & pipeline', allowed: [RoleCode.CompanyAdmin, RoleCode.RecruitmentManager, RoleCode.Recruiter] },
    { capability: 'Approve jobs', allowed: [RoleCode.CompanyAdmin, RoleCode.RecruitmentManager] },
    { capability: 'View company insights', allowed: [RoleCode.CompanyAdmin, RoleCode.RecruitmentManager] },
  ];

  readonly currentUserId = computed(() => this.currentUser.user()?.id ?? null);
  readonly adminCount = computed(
    () => this.members().filter((member) => member.role === RoleCode.CompanyAdmin).length,
  );

  readonly filtered = computed(() => {
    const role = this.roleFilter();
    const status = this.statusFilter();
    const term = this.searchTerm().toLowerCase();
    return this.members().filter((member) => {
      if (role !== 'ALL' && member.role !== role) {
        return false;
      }
      if (status !== 'ALL' && member.status !== status) {
        return false;
      }
      if (term && !`${member.fullName} ${member.email}`.toLowerCase().includes(term)) {
        return false;
      }
      return true;
    });
  });

  constructor() {
    this.searchControl.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((value) => this.searchTerm.set(value));
  }

  ngOnInit(): void {
    this.load();
  }

  reload(): void {
    this.load();
  }

  hasCapability(allowed: RoleCode[], role: RoleCode): boolean {
    return allowed.includes(role);
  }

  isSelf(member: TeamMember): boolean {
    return member.userId === this.currentUserId();
  }

  /** The only Company Admin can't be demoted/deactivated/removed. */
  isLastAdmin(member: TeamMember): boolean {
    return member.role === RoleCode.CompanyAdmin && this.adminCount() <= 1;
  }

  invite(): void {
    this.dialog
      .open(InviteMemberDialogComponent, { width: '440px' })
      .afterClosed()
      .subscribe((request) => {
        if (!request) {
          return;
        }
        this.teamService.invite(request).subscribe({
          next: () => {
            this.toast.success('Invitation sent.');
            this.load();
          },
          error: (error: ApiError) => this.toast.error(error.message),
        });
      });
  }

  changeRole(member: TeamMember, role: RoleCode): void {
    if (member.role === role) {
      return;
    }
    this.teamService.changeRole({ userId: member.userId, role }).subscribe({
      next: () => {
        this.toast.success(`${member.fullName} is now a ${roleLabel(role)}.`);
        this.load();
      },
      error: (error: ApiError) => this.toast.error(error.message),
    });
  }

  deactivate(member: TeamMember): void {
    this.confirm
      .confirm({
        title: 'Deactivate member',
        message: `Deactivate ${member.fullName}? They'll lose access until reactivated.`,
        confirmLabel: 'Deactivate',
        danger: true,
      })
      .subscribe((confirmed) => {
        if (confirmed) {
          this.setStatus(member, MemberStatus.Deactivated, `${member.fullName} deactivated.`);
        }
      });
  }

  reactivate(member: TeamMember): void {
    this.setStatus(member, MemberStatus.Active, `${member.fullName} reactivated.`);
  }

  resendInvite(member: TeamMember): void {
    this.teamService.resendInvite(member.userId).subscribe({
      next: () => this.toast.success('Invitation resent.'),
      error: (error: ApiError) => this.toast.error(error.message),
    });
  }

  copyInviteLink(member: TeamMember): void {
    this.teamService.inviteLink(member.userId).subscribe({
      next: (path) => {
        const link = `${window.location.origin}${path}`;
        navigator.clipboard?.writeText(link).then(
          () => this.toast.success('Invite link copied to clipboard.'),
          () => this.toast.info(link),
        );
      },
      error: (error: ApiError) => this.toast.error(error.message),
    });
  }

  revokeInvite(member: TeamMember): void {
    this.confirm
      .confirm({
        title: 'Revoke invitation',
        message: `Revoke the invitation for ${member.email}?`,
        confirmLabel: 'Revoke',
        danger: true,
      })
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.teamService.revokeInvite(member.userId).subscribe({
          next: () => {
            this.toast.success('Invitation revoked.');
            this.load();
          },
          error: (error: ApiError) => this.toast.error(error.message),
        });
      });
  }

  transferOwnership(member: TeamMember): void {
    const data: TransferOwnershipData = { member };
    this.dialog
      .open(TransferOwnershipDialogComponent, { data, width: '460px' })
      .afterClosed()
      .subscribe((userId) => {
        if (!userId) {
          return;
        }
        this.teamService.transferOwnership(userId).subscribe({
          next: () => {
            this.toast.success(`${member.fullName} is now the Company Admin.`);
            this.load();
          },
          error: (error: ApiError) => this.toast.error(error.message),
        });
      });
  }

  private setStatus(member: TeamMember, status: MemberStatus, message: string): void {
    this.teamService.setStatus(member.userId, status).subscribe({
      next: () => {
        this.toast.success(message);
        this.load();
      },
      error: (error: ApiError) => this.toast.error(error.message),
    });
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.teamService.list().subscribe({
      next: (members) => {
        this.members.set(members);
        this.loading.set(false);
        this.companyContext.reload();
      },
      error: (error: ApiError) => {
        this.error.set(error.message ?? 'Failed to load the team.');
        this.loading.set(false);
      },
    });
  }
}

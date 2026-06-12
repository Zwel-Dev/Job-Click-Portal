import { Component, OnInit, computed, inject } from '@angular/core';
import { COMPANY_STATUS_META } from '@core/enums/company-status.enum';
import { COMPANY_SIZE_LABELS } from '@core/enums/company-size.enum';
import { VERIFICATION_STATUS_META, VerificationStatus } from '@core/enums/verification-status.enum';
import { formatDate } from '@core/utils/format';
import { CompanyContextStore } from '../../state/company-context.store';

interface SetupItem {
  label: string;
  done: boolean;
  link: string;
}

interface AreaLink {
  label: string;
  description: string;
  icon: string;
  link: string;
}

@Component({
  selector: 'app-company-overview',
  standalone: false,
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
})
export class OverviewComponent implements OnInit {
  readonly store = inject(CompanyContextStore);

  readonly companyStatusMeta = COMPANY_STATUS_META;
  readonly companySizeLabels = COMPANY_SIZE_LABELS;
  readonly verificationMeta = VERIFICATION_STATUS_META;
  readonly formatDate = formatDate;
  readonly skeletons = [0, 1, 2, 3];

  readonly areas: ReadonlyArray<AreaLink> = [
    { label: 'Company profile', description: 'Name, logo, industry, description', icon: 'business', link: '/employer/company/profile' },
    { label: 'Locations', description: 'Offices and head office', icon: 'place', link: '/employer/company/locations' },
    { label: 'Departments', description: 'Org units that own jobs', icon: 'account_tree', link: '/employer/company/departments' },
    { label: 'Verification', description: 'Business documents & status', icon: 'verified_user', link: '/employer/company/verification' },
    { label: 'Team', description: 'Members, roles & invitations', icon: 'group', link: '/employer/team' },
    { label: 'Insights', description: 'Company-wide hiring analytics', icon: 'insights', link: '/employer/company/insights' },
    { label: 'Subscription', description: 'Plan & usage', icon: 'card_membership', link: '/employer/subscription' },
  ];

  readonly checklist = computed<SetupItem[]>(() => {
    const overview = this.store.overview();
    if (!overview) {
      return [];
    }
    return [
      { label: 'Complete your company profile', done: Boolean(overview.company.description), link: '/employer/company/profile' },
      { label: 'Verify your company', done: overview.verification.status === VerificationStatus.Verified, link: '/employer/company/verification' },
      { label: 'Add an office location', done: overview.counts.locations > 0, link: '/employer/company/locations' },
      { label: 'Invite your hiring team', done: overview.counts.members > 1, link: '/employer/team' },
    ];
  });
  readonly completedCount = computed(() => this.checklist().filter((item) => item.done).length);

  readonly initial = computed(() => this.store.company()?.name.charAt(0).toUpperCase() ?? '?');

  ngOnInit(): void {
    this.store.load();
  }
}

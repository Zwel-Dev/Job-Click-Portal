import { TeamMember } from '@core/models/team.model';
import { RoleCode } from '@core/enums/role-code.enum';
import { MemberStatus } from '@core/enums/member-status.enum';

/** The demo company's team (Greenline Technologies). IDs cross-resolve with mock users/jobs. */
export const MOCK_TEAM: TeamMember[] = [
  {
    userId: 3, fullName: 'Nilar Win', email: 'company.admin@jobclick.dev',
    role: RoleCode.CompanyAdmin, status: MemberStatus.Active, jobsOwned: 0, joinedAt: '2024-01-15T09:00:00Z',
  },
  {
    userId: 5, fullName: 'Thiri Aung', email: 'thiri.aung@greenline.example.com',
    role: RoleCode.RecruitmentManager, status: MemberStatus.Active, jobsOwned: 3, joinedAt: '2024-03-10T09:00:00Z',
  },
  {
    userId: 2, fullName: 'Kyaw Zin Latt', email: 'recruiter@jobclick.dev',
    role: RoleCode.Recruiter, status: MemberStatus.Active, jobsOwned: 5, joinedAt: '2024-05-02T09:00:00Z',
  },
  {
    userId: 6, fullName: 'Hsu Myat Noe', email: 'hsu.myat@greenline.example.com',
    role: RoleCode.HiringManager, status: MemberStatus.Active, jobsOwned: 0, joinedAt: '2025-02-20T09:00:00Z',
  },
  {
    userId: 7, fullName: 'Zaw Lin Htet', email: 'new.recruiter@greenline.example.com',
    role: RoleCode.Recruiter, status: MemberStatus.Invited, jobsOwned: 0, invitedAt: '2026-06-09T09:00:00Z',
  },
  {
    // An invited email that already has a (candidate) account — demos "add role" on accept.
    userId: 1, fullName: 'Su Su Hlaing', email: 'candidate@jobclick.dev',
    role: RoleCode.Recruiter, status: MemberStatus.Invited, jobsOwned: 0, invitedAt: '2026-06-10T09:00:00Z',
  },
];

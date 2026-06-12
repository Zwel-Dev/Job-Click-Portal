import { StatusTone } from './application-status.enum';

/** Team member state within a company. */
export enum MemberStatus {
  Active = 'ACTIVE',
  Invited = 'INVITED',
  Deactivated = 'DEACTIVATED',
}

export const MEMBER_STATUS_META: Record<MemberStatus, { label: string; tone: StatusTone }> = {
  [MemberStatus.Active]: { label: 'Active', tone: 'success' },
  [MemberStatus.Invited]: { label: 'Invited', tone: 'info' },
  [MemberStatus.Deactivated]: { label: 'Deactivated', tone: 'neutral' },
};

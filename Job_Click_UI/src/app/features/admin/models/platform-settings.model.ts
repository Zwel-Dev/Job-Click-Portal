import { Id } from '@core/models/common.model';
import { RoleCode } from '@core/enums/role-code.enum';

/** A platform role with a human description (Roles tab — read-only). */
export interface RoleInfo {
  code: RoleCode;
  label: string;
  description: string;
}

/** A skill in the taxonomy (mirrors SKILLS). Feeds candidate/job pickers + matching. */
export interface Skill {
  id: Id;
  name: string;
  category: string;
}

export interface SkillFormValue {
  name: string;
  category: string;
}

/** A plan editing payload (maps to SUBSCRIPTION_PLANS). */
export interface PlanFormValue {
  name: string;
  price: number;
  maxJobs: number;
  maxRecruiters: number;
  candidateSearch: boolean;
  features: string[];
}

/** A platform feature flag. */
export interface FeatureFlag {
  id: Id;
  key: string;
  label: string;
  description: string;
  enabled: boolean;
}

/** Portfolio link platforms (mirrors CANDIDATE_PORTFOLIOS.platform in the ERD). */
export enum PortfolioPlatform {
  LinkedIn = 'LINKEDIN',
  GitHub = 'GITHUB',
  Website = 'WEBSITE',
  Behance = 'BEHANCE',
  Dribbble = 'DRIBBBLE',
}

export const PORTFOLIO_PLATFORM_LABELS: Record<PortfolioPlatform, string> = {
  [PortfolioPlatform.LinkedIn]: 'LinkedIn',
  [PortfolioPlatform.GitHub]: 'GitHub',
  [PortfolioPlatform.Website]: 'Website',
  [PortfolioPlatform.Behance]: 'Behance',
  [PortfolioPlatform.Dribbble]: 'Dribbble',
};

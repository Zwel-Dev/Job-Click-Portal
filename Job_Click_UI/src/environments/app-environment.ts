// Build-time environment contract. Lives in its own file (NOT subject to the
// `fileReplacements` swap in angular.json) so environment.ts / environment.prod.ts
// / environment.dev.ts can all import it without a self-reference during prod builds.

export interface AppEnvironment {
  production: boolean;
  /** When true, services return mock data via `of(...)` instead of calling HttpClient. */
  useMock: boolean;
  enableAi: boolean;
  enableRealtime: boolean;
  defaultPageSize: number;
  /** Max upload size (MB) for resumes, logos, attachments. */
  allowFileSizeMb: number;
}

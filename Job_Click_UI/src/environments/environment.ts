// Development environment (default). Replaced by environment.prod.ts in production
// builds via the `fileReplacements` entry in angular.json.
//
// NOTE: `baseApiUrl` is intentionally NOT defined here. It is loaded at runtime
// from `src/appsettings.json` by AppConfigService so the API host can be changed
// without rebuilding. This file holds build-time flags only.

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

export const environment: AppEnvironment = {
  production: false,
  useMock: true,
  enableAi: false,
  enableRealtime: false,
  defaultPageSize: 20,
  allowFileSizeMb: 3,
};

import type { AppEnvironment } from './app-environment';

// Optional "dev API" target (not wired by default). Use by adding a `development`
// fileReplacement in angular.json if you want to run against a live dev backend.
export const environment: AppEnvironment = {
  production: false,
  useMock: false,
  enableAi: false,
  enableRealtime: false,
  defaultPageSize: 20,
  allowFileSizeMb: 3,
};

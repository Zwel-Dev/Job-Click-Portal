import type { AppEnvironment } from './app-environment';

export const environment: AppEnvironment = {
  production: true,
  useMock: false,
  enableAi: false,
  enableRealtime: false,
  defaultPageSize: 20,
  allowFileSizeMb: 3,
};

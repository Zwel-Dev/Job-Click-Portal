import { Injectable } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AppConfig } from './app-config.model';

/**
 * Loads runtime configuration from `appsettings.json` before the app boots
 * (wired via APP_INITIALIZER). Uses HttpBackend so the request bypasses the
 * app's HTTP interceptors (which themselves depend on this config).
 */
@Injectable({ providedIn: 'root' })
export class AppConfigService {
  private readonly http: HttpClient;
  private config: AppConfig = { baseApiUrl: '', baseAdminUrl: '' };

  constructor(handler: HttpBackend) {
    this.http = new HttpClient(handler);
  }

  async load(): Promise<void> {
    try {
      this.config = await firstValueFrom(this.http.get<AppConfig>('appsettings.json'));
    } catch {
      // Fall back to empty config; in mock mode the API host is never used.
      this.config = { baseApiUrl: '', baseAdminUrl: '' };
    }
  }

  get baseApiUrl(): string {
    return this.config.baseApiUrl;
  }

  get baseAdminUrl(): string {
    return this.config.baseAdminUrl;
  }
}

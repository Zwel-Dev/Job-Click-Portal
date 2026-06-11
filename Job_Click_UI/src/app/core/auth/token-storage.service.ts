import { Injectable } from '@angular/core';
import { AuthSession } from '@core/models/auth.model';
import { STORAGE_KEYS } from '@core/constants/storage-keys';

/**
 * Persists the auth session. Uses localStorage when "remember me" is chosen,
 * otherwise sessionStorage (cleared when the tab closes).
 */
@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private cached: AuthSession | null | undefined;

  get session(): AuthSession | null {
    if (this.cached !== undefined) {
      return this.cached;
    }
    const raw =
      localStorage.getItem(STORAGE_KEYS.authSession) ??
      sessionStorage.getItem(STORAGE_KEYS.authSession);
    this.cached = raw ? this.safeParse(raw) : null;
    return this.cached;
  }

  get token(): string | null {
    return this.session?.token ?? null;
  }

  save(session: AuthSession, remember: boolean): void {
    this.cached = session;
    const store = remember ? localStorage : sessionStorage;
    const other = remember ? sessionStorage : localStorage;
    other.removeItem(STORAGE_KEYS.authSession);
    store.setItem(STORAGE_KEYS.authSession, JSON.stringify(session));
  }

  clear(): void {
    this.cached = null;
    localStorage.removeItem(STORAGE_KEYS.authSession);
    sessionStorage.removeItem(STORAGE_KEYS.authSession);
  }

  private safeParse(raw: string): AuthSession | null {
    try {
      return JSON.parse(raw) as AuthSession;
    } catch {
      return null;
    }
  }
}

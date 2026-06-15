import { Injectable } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

const DEFAULT_INTERVAL_MS = 30_000;

/**
 * Transport abstraction for live updates. Phase 2 uses polling; a WebSocket/SSE
 * upgrade can replace `poll()` later without touching consumers (doc 07 §3).
 */
@Injectable({ providedIn: 'root' })
export class RealtimeService {
  /**
   * Emits the result of `source` immediately, then re-runs it every
   * `intervalMs`. Callers pipe `takeUntilDestroyed` to stop on teardown.
   */
  poll<T>(source: () => Observable<T>, intervalMs: number = DEFAULT_INTERVAL_MS): Observable<T> {
    return timer(intervalMs, intervalMs).pipe(switchMap(() => source()));
  }
}

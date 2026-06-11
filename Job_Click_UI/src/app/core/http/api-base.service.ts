import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse, Paginated } from '@core/models/common.model';

export type QueryParams = Record<string, string | number | boolean | undefined | null>;

/**
 * Thin, typed wrapper over HttpClient. Unwraps the `{ data }` envelope so
 * feature services work with domain types directly. Base URL is applied by
 * baseUrlInterceptor, so callers pass relative paths.
 */
@Injectable({ providedIn: 'root' })
export class ApiBaseService {
  private readonly http = inject(HttpClient);

  get<T>(url: string, params?: QueryParams): Observable<T> {
    return this.http
      .get<ApiResponse<T>>(url, { params: this.toHttpParams(params) })
      .pipe(map((res) => res.data));
  }

  getPaginated<T>(url: string, params?: QueryParams): Observable<Paginated<T>> {
    return this.http.get<Paginated<T>>(url, { params: this.toHttpParams(params) });
  }

  post<T>(url: string, body: unknown): Observable<T> {
    return this.http.post<ApiResponse<T>>(url, body).pipe(map((res) => res.data));
  }

  put<T>(url: string, body: unknown): Observable<T> {
    return this.http.put<ApiResponse<T>>(url, body).pipe(map((res) => res.data));
  }

  patch<T>(url: string, body: unknown): Observable<T> {
    return this.http.patch<ApiResponse<T>>(url, body).pipe(map((res) => res.data));
  }

  delete<T>(url: string): Observable<T> {
    return this.http.delete<ApiResponse<T>>(url).pipe(map((res) => res.data));
  }

  private toHttpParams(params?: QueryParams): HttpParams {
    let httpParams = new HttpParams();
    if (!params) {
      return httpParams;
    }
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        httpParams = httpParams.set(key, String(value));
      }
    }
    return httpParams;
  }
}

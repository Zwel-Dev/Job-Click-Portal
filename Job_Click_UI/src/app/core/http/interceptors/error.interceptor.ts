import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ApiError } from '@core/models/common.model';

/** Normalizes HTTP errors to ApiError and handles 401/403 navigation centrally. */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const apiError = normalizeError(error);

      if (apiError.status === 401) {
        router.navigate(['/auth/login']);
      } else if (apiError.status === 403) {
        router.navigate(['/403']);
      }

      return throwError(() => apiError);
    }),
  );
};

function normalizeError(error: HttpErrorResponse): ApiError {
  const body = error.error as Partial<ApiError> | string | null;

  if (body && typeof body === 'object' && typeof body.message === 'string') {
    return {
      status: error.status,
      code: body.code ?? 'ERROR',
      message: body.message,
      errors: body.errors,
    };
  }

  return {
    status: error.status,
    code: 'ERROR',
    message: typeof body === 'string' && body ? body : error.message || 'Unexpected error occurred.',
  };
}

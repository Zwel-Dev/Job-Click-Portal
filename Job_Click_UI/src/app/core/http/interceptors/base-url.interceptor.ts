import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AppConfigService } from '@core/config/app-config.service';

/** Prefixes relative API paths with the runtime base URL. Leaves absolute URLs and static assets untouched. */
export const baseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  const config = inject(AppConfigService);

  const isAbsolute = /^https?:\/\//i.test(req.url);
  const isStaticAsset = req.url.startsWith('assets/') || req.url.endsWith('appsettings.json');

  if (isAbsolute || isStaticAsset || !config.baseApiUrl) {
    return next(req);
  }

  return next(req.clone({ url: `${config.baseApiUrl}${req.url}` }));
};

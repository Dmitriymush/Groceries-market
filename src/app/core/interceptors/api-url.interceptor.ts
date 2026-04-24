import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '@env/environment';

export const apiUrlInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith('http') || req.url.startsWith('assets/') || req.url.startsWith('./assets/') || req.url.includes('/assets/')) {
    return next(req);
  }

  const apiReq = req.clone({
    url: `${environment.apiUrl}${req.url}`,
  });

  return next(apiReq);
};

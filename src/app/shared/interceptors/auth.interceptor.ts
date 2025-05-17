import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { ConfigService } from '../../shared/services/config.service';
import { switchMap, from } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  if (req.url.includes('/api')) {
    const configService = inject(ConfigService);

    let config;
    try {
      config = configService.getConfig();

      const username = config.apiCredentials.username;
      const password = config.apiCredentials.password;
      const authToken = btoa(`${username}:${password}`);

      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Basic ${authToken}`),
      });

      return next(authReq);
    } catch (error) {
      return from(configService.loadConfig()).pipe(
        switchMap((loadedConfig) => {
          const username = loadedConfig.apiCredentials.username;
          const password = loadedConfig.apiCredentials.password;
          const authToken = btoa(`${username}:${password}`);

          const authReq = req.clone({
            headers: req.headers.set('Authorization', `Basic ${authToken}`),
          });

          return next(authReq);
        })
      );
    }
  }

  return next(req);
};

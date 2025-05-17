import { InjectionToken, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ConfigService } from '../services/config.service';

export interface ApiConfig {
  baseUrl: string;
}

export const API_CONFIG = new InjectionToken<ApiConfig>('API_CONFIG', {
  factory: () => {
    try {
      const configService = inject(ConfigService);
      const config = configService.getConfig();
      const apiUrl = config.apiUrl || environment.apiUrl;

      return {
        baseUrl: environment.production && apiUrl ? `${apiUrl}/api` : '/api',
      };
    } catch (error) {
      return {
        baseUrl:
          environment.production && environment.apiUrl
            ? `${environment.apiUrl}/api`
            : '/api',
      };
    }
  },
});

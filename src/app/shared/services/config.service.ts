import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface AppConfig {
  apiCredentials: {
    username: string;
    password: string;
  };
  apiUrl?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private http = inject(HttpClient);
  private config: AppConfig | null = null;
  private configUrl = 'assets/config/config.json';
  private devConfigUrl = 'assets/config/config.dev.json';

  private fallbackConfig: AppConfig = {
    apiCredentials: {
      username: environment.apiUsername || '',
      password: environment.apiPassword || '',
    },
    apiUrl: environment.apiUrl || 'https://viewsource-001-site1.ptempurl.com',
  };

  async initialize(): Promise<void> {
    await this.loadConfig();
  }

  async loadConfig(): Promise<AppConfig> {
    if (this.config) {
      return this.config;
    }

    try {
      if (!environment.production) {
        try {
          this.config = await lastValueFrom(
            this.http.get<AppConfig>(this.devConfigUrl)
          );
          console.info(
            'Configuração de desenvolvimento carregada com sucesso.'
          );
          return this.config;
        } catch (devConfigError) {
          console.warn(
            'Arquivo de configuração de desenvolvimento não encontrado, usando arquivo padrão.'
          );
        }
      }

      this.config = await lastValueFrom(
        this.http.get<AppConfig>(this.configUrl).pipe(
          catchError(() => {
            console.warn(
              'Arquivo de configuração não encontrado, usando variáveis de ambiente.'
            );
            return of(this.fallbackConfig);
          })
        )
      );

      if (
        !this.config?.apiCredentials?.username &&
        !this.config?.apiCredentials?.password
      ) {
        console.warn(
          'Credenciais vazias no arquivo de configuração, usando variáveis de ambiente.'
        );
        this.config = this.fallbackConfig;
      }

      return this.config;
    } catch (error) {
      console.warn(
        'Falha ao carregar a configuração. Usando configuração fallback.'
      );
      this.config = this.fallbackConfig;
      return this.config;
    }
  }

  getConfig(): AppConfig {
    if (!this.config) {
      throw new Error('Config não carregada. Chame loadConfig() primeiro.');
    }
    return this.config;
  }
}

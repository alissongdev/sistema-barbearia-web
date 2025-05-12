import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { ConfigService } from './shared/services/config.service';

export function provideAppInitialization(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: ConfigService,
      useFactory: () => {
        const service = new ConfigService();
        service.initialize().catch((error) => {
          console.error(
            'Erro ao inicializar a configuração da aplicação:',
            error
          );
        });
        return service;
      },
    },
  ]);
}

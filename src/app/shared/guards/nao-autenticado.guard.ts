import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { map, take } from 'rxjs/operators';

export const naoAutenticadoGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    take(1),
    map((isAuthenticated) => {
      if (!isAuthenticated) {
        return true;
      }

      const usuario = authService.getCurrentUser();
      if (usuario?.ehBarbeiro) {
        router.navigate(['/meus-agendamentos']);
      } else {
        router.navigate(['/agendamento']);
      }

      return false;
    })
  );
};

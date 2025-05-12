import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { map, take } from 'rxjs/operators';

export const clienteGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    take(1),
    map((isAuthenticated) => {
      if (!isAuthenticated) {
        router.navigate(['/login']);
        return false;
      }

      const usuario = authService.getCurrentUser();
      if (usuario && usuario.ehBarbeiro) {
        router.navigate(['/meus-agendamentos']);
        return false;
      }

      return true;
    })
  );
};

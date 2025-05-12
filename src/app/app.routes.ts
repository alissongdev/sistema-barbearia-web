import { Routes } from '@angular/router';
import { authGuard as autenticadoGuard } from './shared/guards/autenticado.guard';
import { clienteGuard } from './shared/guards/cliente.guard';
import { naoAutenticadoGuard } from './shared/guards/nao-autenticado.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component').then((m) => m.LoginComponent),
    canActivate: [naoAutenticadoGuard],
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./auth/registro/registro.component').then(
        (m) => m.RegistroComponent
      ),
    canActivate: [naoAutenticadoGuard],
  },
  {
    path: 'agendamento',
    loadComponent: () =>
      import('./features/agendamento/agendamento.component').then(
        (m) => m.AgendamentoComponent
      ),
    canActivate: [autenticadoGuard, clienteGuard],
  },
  {
    path: 'meus-agendamentos',
    loadComponent: () =>
      import('./features/meus-agendamentos/meus-agendamentos.component').then(
        (m) => m.MeusAgendamentosComponent
      ),
    canActivate: [autenticadoGuard],
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];

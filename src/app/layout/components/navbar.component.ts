import { Component, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { AuthService } from '../../shared/services/auth/auth.service';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [AsyncPipe, RouterModule],
  template: `
    @if (isAuthenticated$ | async) {
    <nav class="bg-primary-800 text-white p-4 shadow-md">
      <div class="container mx-auto px-4 max-w-6xl">
        <!-- Desktop navbar -->
        <div class="hidden md:flex justify-between items-center">
          <div class="flex items-center space-x-2">
            <span class="text-2xl">💈</span>
            <span class="font-bold text-xl">Barbearia Mano Peri</span>
          </div>

          <div class="flex items-center space-x-4">
            @if (!isBarber()) {
            <a
              routerLink="/agendamento"
              routerLinkActive="bg-blue-700"
              class="text-white px-3 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              Agendar
            </a>
            }
            <a
              routerLink="/meus-agendamentos"
              routerLinkActive="bg-blue-700"
              class="text-white px-3 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              Meus Agendamentos
            </a>
            <div class="h-8 border-l border-gray-400 ml-1"></div>
            <span>Bem-vindo(a), {{ nomeUsuario }}</span>
            <button
              (click)="logout()"
              class="bg-red-600 hover:bg-red-700 text-white py-2 px-5 rounded cursor-pointer"
            >
              Sair
            </button>
          </div>
        </div>

        <!-- Mobile navbar -->
        <div class="md:hidden">
          <div class="flex justify-between items-center">
            <div class="flex items-center space-x-2">
              <span class="text-2xl">💈</span>
              <span class="font-bold text-lg">Barbearia Mano Peri</span>
            </div>
            <button
              (click)="toggleMobileMenu()"
              class="text-white focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                @if (!mobileMenuOpen()) {
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
                } @else {
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
                }
              </svg>
            </button>
          </div>

          @if (mobileMenuOpen()) {
          <div class="mt-3 py-2 border-t border-blue-700">
            <div class="flex flex-col space-y-2">
              <div class="px-3 py-2">
                <span>Bem-vindo(a), {{ nomeUsuario }}</span>
              </div>
              @if (!isBarber()) {
              <a
                routerLink="/agendamento"
                routerLinkActive="bg-blue-700"
                class="text-white px-3 py-2 rounded-md hover:bg-blue-600 transition-colors"
                (click)="toggleMobileMenu()"
              >
                Agendar
              </a>
              }
              <a
                routerLink="/meus-agendamentos"
                routerLinkActive="bg-blue-700"
                class="text-white px-3 py-2 rounded-md hover:bg-blue-600 transition-colors"
                (click)="toggleMobileMenu()"
              >
                Meus Agendamentos
              </a>
              <button
                (click)="logout()"
                class="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded cursor-pointer text-left"
              >
                Sair
              </button>
            </div>
          </div>
          }
        </div>
      </div>
    </nav>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class NavbarComponent {
  private authService = inject(AuthService);
  nomeUsuario: string = 'Visitante';
  isAuthenticated$ = this.authService.isAuthenticated$;
  mobileMenuOpen = signal<boolean>(false);

  constructor() {
    this.loadUserName();

    this.authService.currentUser$
      .pipe(takeUntilDestroyed())
      .subscribe((usuario) => {
        if (usuario && usuario.nome) {
          this.nomeUsuario = usuario.nome;
        }
      });
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((state) => !state);
  }

  logout(): void {
    this.authService.logout();
    this.mobileMenuOpen.set(false);
  }

  isBarber(): boolean {
    const usuario = this.authService.getCurrentUser();
    return usuario ? usuario.ehBarbeiro : false;
  }

  private loadUserName(): void {
    const storedName = this.authService.getUserNome();
    if (storedName) {
      this.nomeUsuario = storedName;
    }
  }
}

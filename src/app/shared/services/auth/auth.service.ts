import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  BehaviorSubject,
  Observable,
  catchError,
  map,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../../config/api.config';
import { Usuario } from '../../models/usuario.model';
import { UsuarioService } from '../usuario.service';
import {
  RegistroResponseDto,
  RegistroUsuarioDto,
} from '../../models/registro-usuario.model';

interface LoginRequest {
  email: string;
  senha: string;
}

interface LoginResponse {
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private router = inject(Router);
  private http = inject(HttpClient);
  private apiConfig = inject(API_CONFIG);
  private usuarioService = inject(UsuarioService);

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);

  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  isLoading$ = this.isLoadingSubject.asObservable();
  currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.isAuthenticatedSubject.next(this.hasToken());
    this.loadUserData();
  }

  private loadUserData(): void {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        const usuario = JSON.parse(userData) as Usuario;
        this.currentUserSubject.next(usuario);
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        this.logout();
      }
    }
  }

  login(credentials: { email: string; password: string }): Observable<boolean> {
    this.isLoadingSubject.next(true);

    const loginData: LoginRequest = {
      email: credentials.email,
      senha: credentials.password,
    };

    return this.http
      .post<LoginResponse>(`${this.apiConfig.baseUrl}/Auth/login`, loginData)
      .pipe(
        switchMap((response) => {
          if (response && response.token) {
            localStorage.setItem('auth_token', response.token);
            this.isAuthenticatedSubject.next(true);

            return this.usuarioService
              .findUsuarioByEmail(credentials.email)
              .pipe(
                tap((usuario) => {
                  if (usuario) {
                    this.currentUserSubject.next(usuario);
                    localStorage.setItem('user_data', JSON.stringify(usuario));
                  }
                }),
                map(() => true)
              );
          }
          return of(false);
        }),
        catchError((error) => {
          console.error('Erro ao realizar login:', error);
          return of(false);
        }),
        tap(() => this.isLoadingSubject.next(false)),
        tap((success) => {
          if (success) {
            this.router.navigate(['/agendamento']);
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  hasToken(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  getCurrentUser(): Usuario | null {
    return this.currentUserSubject.getValue();
  }

  getUserNome(): string | null {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        const usuario = JSON.parse(userData) as Usuario;
        return usuario.nome || null;
      } catch {
        return null;
      }
    }
    return null;
  }

  getUserId(): string | null {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        const usuario = JSON.parse(userData) as Usuario;
        return usuario.id || null;
      } catch {
        return null;
      }
    }
    return null;
  }

  registro(registroData: RegistroUsuarioDto): Observable<{
    success: boolean;
    data?: RegistroResponseDto;
    message?: string;
  }> {
    this.isLoadingSubject.next(true);

    return this.http
      .post<RegistroResponseDto>(
        `${this.apiConfig.baseUrl}/Auth/registro`,
        registroData
      )
      .pipe(
        map((response) => {
          return { success: true, data: response };
        }),
        catchError((error) => {
          console.error('Erro ao registrar usuário:', error);
          let errorMessage = 'Ocorreu um erro ao tentar realizar o cadastro';

          if (error.error && typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else if (error.error && error.error.title) {
            errorMessage = error.error.title;
          } else if (error.status === 400 && error.error) {
            errorMessage =
              'Dados inválidos. Verifique os campos e tente novamente.';
          }

          return of({ success: false, message: errorMessage });
        }),
        tap(() => this.isLoadingSubject.next(false))
      );
  }
}

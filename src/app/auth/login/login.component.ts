import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../shared/services/auth/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    ProgressSpinnerModule,
    ToastModule,
    RouterLink,
  ],
  providers: [MessageService],
  template: `
    <p-toast />
    <div class="grid grid-cols-1 md:grid-cols-2 min-h-screen">
      <div class="hidden md:flex items-center justify-center bg-gray-200">
        <img
          src="assets/images/barber.jpg"
          alt="Barbeiro"
          class="object-cover h-full w-full"
        />
      </div>
      <div class="flex items-center justify-center p-4 md:p-8">
        <div
          class="w-full max-w-md space-y-6 bg-white p-6 md:p-8 rounded-lg shadow-md"
        >
          <div class="text-center">
            <p class="text-lg text-gray-600">Bem-vindo(a) de volta!</p>
            <h1 class="text-4xl font-bold text-gray-900 mt-2">
              💈 Barbearia Mano Peri
            </h1>
          </div>
          <hr class="my-6 border-gray-300" />
          <h2 class="text-2xl font-bold text-center text-gray-900 mt-4 md:mt-8">
            Entre com sua conta
          </h2>
          <form
            [formGroup]="loginForm"
            (ngSubmit)="onSubmit()"
            class="space-y-6"
          >
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700"
                >E-mail</label
              >
              <input
                pInputText
                id="email"
                type="email"
                formControlName="email"
                class="w-full mt-1"
                aria-describedby="email-error"
              />
              @if (emailControl.invalid && (emailControl.dirty ||
              emailControl.touched)) {
              <div id="email-error" class="text-sm text-red-600 mt-1">
                @if (emailControl.errors?.['required']) {
                <span>Email é obrigatório</span>
                } @else if (emailControl.errors?.['email']) {
                <span>Por favor, insira um email válido</span>
                }
              </div>
              }
            </div>
            <div>
              <label
                for="password"
                class="block text-sm font-medium text-gray-700"
                >Senha</label
              >
              <p-password
                id="password"
                formControlName="password"
                [feedback]="false"
                styleClass="w-full mt-1"
                inputStyleClass="w-full"
                aria-describedby="password-error"
              ></p-password>
              @if (passwordControl.invalid && (passwordControl.dirty ||
              passwordControl.touched)) {
              <div id="password-error" class="text-sm text-red-600 mt-1">
                <span>Senha é obrigatória</span>
              </div>
              }
            </div>
            <button
              pButton
              type="submit"
              label="Entrar"
              class="w-full"
              [disabled]="loginForm.invalid || isLoading()"
              aria-live="polite"
            >
              @if (isLoading()) {
              <p-progressSpinner
                [style]="{ width: '20px', height: '20px' }"
                styleClass="mr-2"
                aria-hidden="true"
              ></p-progressSpinner>
              <span>Processando...</span>
              }
            </button>
            <div class="text-center mt-4">
              <span class="text-sm text-gray-600">Não tem uma conta?</span>
              <a
                routerLink="/registro"
                class="text-sm font-medium text-blue-600 hover:text-blue-500 ml-1"
              >
                Cadastre-se
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
        height: auto;
        overflow-y: auto;
      }
    `,
  ],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  isLoading = signal(false);

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  get emailControl() {
    return this.loginForm.controls.email;
  }

  get passwordControl() {
    return this.loginForm.controls.password;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading.set(true);
    const credentials = {
      email: this.emailControl.value,
      password: this.passwordControl.value,
    };

    this.authService.login(credentials).subscribe({
      next: (success) => {
        if (!success) {
          this.showErrorMessage(
            'Erro no login',
            'E-mail ou senha inválidos. Por favor, tente novamente.'
          );
        } else {
          this.router.navigate(['/agendamento']);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.showErrorMessage(
          'Erro no login',
          'Ocorreu um erro ao tentar realizar o login. Tente novamente.'
        );
        this.isLoading.set(false);
      },
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach((field) => {
      const control = this.loginForm.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  private showErrorMessage(summary: string, detail: string): void {
    this.messageService.add({
      severity: 'error',
      summary,
      detail,
    });
  }
}

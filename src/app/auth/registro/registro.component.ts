import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../shared/services/auth/auth.service';
import { Router, RouterLink } from '@angular/router';
import { RegistroUsuarioDto } from '../../shared/models/registro-usuario.model';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    ProgressSpinnerModule,
    ToastModule,
    CheckboxModule,
    RouterLink,
  ],
  providers: [MessageService],
  template: `
    <p-toast [life]="3000" />
    <div class="grid grid-cols-1 md:grid-cols-2 min-h-screen">
      <div class="hidden md:flex items-center justify-center bg-gray-200">
        <img
          src="assets/images/barber.jpg"
          alt="Barbeiro"
          class="object-cover h-full w-full"
        />
      </div>
      <div class="flex items-center justify-center p-4 md:p-8 py-8">
        <div
          class="w-full max-w-md space-y-6 bg-white p-6 md:p-8 rounded-lg shadow-md"
        >
          <div class="text-center">
            <p class="text-lg text-gray-600">Bem-vindo(a)!</p>
            <h1 class="text-4xl font-bold text-gray-900 mt-2">
              💈 Barbearia Mano Peri
            </h1>
          </div>
          <hr class="my-6 border-gray-300" />
          <h2 class="text-2xl font-bold text-center text-gray-900 mt-4 md:mt-8">
            Crie sua conta
          </h2>
          <form
            [formGroup]="registroForm"
            (ngSubmit)="onSubmit()"
            class="space-y-6"
          >
            <div>
              <label for="nome" class="block text-sm font-medium text-gray-700"
                >Nome</label
              >
              <input
                pInputText
                id="nome"
                type="text"
                formControlName="nome"
                class="w-full mt-1"
                aria-describedby="nome-error"
              />
              @if (nomeControl.invalid && (nomeControl.dirty ||
              nomeControl.touched)) {
              <div id="nome-error" class="text-sm text-red-600 mt-1">
                <span>Nome é obrigatório</span>
              </div>
              }
            </div>

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
              <label for="senha" class="block text-sm font-medium text-gray-700"
                >Senha</label
              >
              <p-password
                id="senha"
                formControlName="senha"
                [feedback]="true"
                styleClass="w-full mt-1"
                inputStyleClass="w-full"
                aria-describedby="senha-error"
                [toggleMask]="true"
              ></p-password>
              @if (senhaControl.invalid && (senhaControl.dirty ||
              senhaControl.touched)) {
              <div id="senha-error" class="text-sm text-red-600 mt-1">
                @if (senhaControl.errors?.['required']) {
                <span>Senha é obrigatória</span>
                } @else if (senhaControl.errors?.['minlength']) {
                <span>A senha deve ter pelo menos 6 caracteres</span>
                }
              </div>
              }
            </div>

            <div>
              <label
                for="confirmSenha"
                class="block text-sm font-medium text-gray-700"
                >Confirme a senha</label
              >
              <p-password
                id="confirmSenha"
                formControlName="confirmSenha"
                [feedback]="false"
                styleClass="w-full mt-1"
                inputStyleClass="w-full"
                aria-describedby="confirm-senha-error"
                [toggleMask]="true"
              ></p-password>
              @if (confirmSenhaControl.invalid && (confirmSenhaControl.dirty ||
              confirmSenhaControl.touched) ||
              registroForm.errors?.['senhasDiferentes']) {
              <div id="confirm-senha-error" class="text-sm text-red-600 mt-1">
                @if (confirmSenhaControl.errors?.['required']) {
                <span>Confirmação de senha é obrigatória</span>
                } @else if (registroForm.errors?.['senhasDiferentes']) {
                <span>As senhas não coincidem</span>
                }
              </div>
              }
            </div>

            <div class="flex items-center">
              <p-checkbox
                formControlName="ehBarbeiro"
                [binary]="true"
                inputId="ehBarbeiro"
                value="true"
                aria-labelledby="tipo-conta-label"
              ></p-checkbox>
              <label
                id="tipo-conta-label"
                for="ehBarbeiro"
                class="ml-2 text-sm font-medium text-gray-700"
              >
                Sou barbeiro
              </label>
            </div>

            <button
              pButton
              type="submit"
              label="Cadastrar"
              class="w-full"
              [disabled]="registroForm.invalid || isLoading()"
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

            <div class="text-center">
              <span class="text-sm text-gray-600">Já tem uma conta?</span>
              <a
                routerLink="/login"
                class="text-sm font-medium text-blue-600 hover:text-blue-500 ml-1"
              >
                Faça login
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
export class RegistroComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  isLoading = signal(false);

  registroForm = this.fb.nonNullable.group(
    {
      nome: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      confirmSenha: ['', [Validators.required]],
      ehBarbeiro: [false],
    },
    {
      validators: this.matchingPasswordsValidator,
    }
  );

  get nomeControl() {
    return this.registroForm.controls.nome;
  }

  get emailControl() {
    return this.registroForm.controls.email;
  }

  get senhaControl() {
    return this.registroForm.controls.senha;
  }

  get confirmSenhaControl() {
    return this.registroForm.controls.confirmSenha;
  }

  get ehBarbeiroControl() {
    return this.registroForm.controls.ehBarbeiro;
  }

  matchingPasswordsValidator(group: FormBuilder | any) {
    const senha = group.get('senha')?.value;
    const confirmSenha = group.get('confirmSenha')?.value;

    return senha === confirmSenha ? null : { senhasDiferentes: true };
  }

  onSubmit(): void {
    if (this.registroForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading.set(true);
    const registroData: RegistroUsuarioDto = {
      nome: this.nomeControl.value,
      email: this.emailControl.value,
      senha: this.senhaControl.value,
      ehBarbeiro: this.ehBarbeiroControl.value,
    };

    this.authService.registro(registroData).subscribe({
      next: (result) => {
        if (!result.success) {
          this.showErrorMessage(
            'Erro no cadastro',
            result.message ||
              'Ocorreu um erro ao tentar realizar o cadastro. Tente novamente.'
          );
        } else {
          this.showSuccessMessage(
            'Cadastro realizado',
            'Seu cadastro foi realizado com sucesso. Faça login para continuar.'
          );

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.showErrorMessage(
          'Erro no cadastro',
          'Ocorreu um erro ao tentar realizar o cadastro. Tente novamente.'
        );
        this.isLoading.set(false);
      },
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registroForm.controls).forEach((field) => {
      const control = this.registroForm.get(field);
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

  private showSuccessMessage(summary: string, detail: string): void {
    this.messageService.add({
      severity: 'success',
      summary,
      detail,
    });
  }
}

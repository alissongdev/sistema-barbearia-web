import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideAnimations } from '@angular/platform-browser/animations';

import { RegistroComponent } from './registro.component';
import { API_CONFIG } from '../../shared/config/api.config';
import { AuthService } from '../../shared/services/auth/auth.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('RegistroComponent', () => {
  let component: RegistroComponent;
  let fixture: ComponentFixture<RegistroComponent>;
  let authService: AuthService;
  let router: Router;
  let messageServiceAddSpy: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAnimations(),
        { provide: API_CONFIG, useValue: { baseUrl: 'http://localhost:3000' } },
        AuthService,
        MessageService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistroComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);

    const componentSpecificMessageService =
      fixture.debugElement.injector.get(MessageService);
    messageServiceAddSpy = spyOn(componentSpecificMessageService, 'add');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have an invalid form when empty', () => {
    expect(component.registroForm.valid).toBeFalsy();
  });

  it('should validate nome field as required', () => {
    const nomeControl = component.nomeControl;
    nomeControl.setValue('');
    expect(nomeControl.hasError('required')).toBeTruthy();
    nomeControl.setValue('Test User');
    expect(nomeControl.hasError('required')).toBeFalsy();
  });

  it('should validate email field as required and for valid email format', () => {
    const emailControl = component.emailControl;
    emailControl.setValue('');
    expect(emailControl.hasError('required')).toBeTruthy();
    emailControl.setValue('invalid-email');
    expect(emailControl.hasError('email')).toBeTruthy();
    emailControl.setValue('valid@email.com');
    expect(emailControl.hasError('required')).toBeFalsy();
    expect(emailControl.hasError('email')).toBeFalsy();
  });

  it('should validate senha field as required and for minlength', () => {
    const senhaControl = component.senhaControl;
    senhaControl.setValue('');
    expect(senhaControl.hasError('required')).toBeTruthy();
    senhaControl.setValue('123');
    expect(senhaControl.hasError('minlength')).toBeTruthy();
    senhaControl.setValue('123456');
    expect(senhaControl.hasError('required')).toBeFalsy();
    expect(senhaControl.hasError('minlength')).toBeFalsy();
  });

  it('should validate confirmSenha field as required', () => {
    const confirmSenhaControl = component.confirmSenhaControl;
    confirmSenhaControl.setValue('');
    expect(confirmSenhaControl.hasError('required')).toBeTruthy();
    confirmSenhaControl.setValue('123456');
    expect(confirmSenhaControl.hasError('required')).toBeFalsy();
  });

  it('should validate if senhas are different', () => {
    component.registroForm.patchValue({
      senha: 'password123',
      confirmSenha: 'password456',
    });
    expect(component.registroForm.hasError('senhasDiferentes')).toBeTruthy();
  });

  it('should not have senhasDiferentes error if senhas are equal', () => {
    component.registroForm.patchValue({
      senha: 'password123',
      confirmSenha: 'password123',
    });
    expect(component.registroForm.hasError('senhasDiferentes')).toBeFalsy();
  });

  it('should mark form as touched and not call authService.registro on submit with invalid form', () => {
    spyOn(component, 'markFormGroupTouched' as any).and.callThrough();
    spyOn(authService, 'registro');

    component.onSubmit();

    expect(component['markFormGroupTouched']).toHaveBeenCalled();
    expect(authService.registro).not.toHaveBeenCalled();
    expect(component.isLoading()).toBeFalsy();
  });

  it('should call authService.registro, show success message, and navigate on successful registration', (done) => {
    spyOn(authService, 'registro').and.returnValue(
      of({ success: true, message: 'Success!' })
    );
    spyOn(router, 'navigate');

    component.registroForm.setValue({
      nome: 'Test User',
      email: 'test@example.com',
      senha: 'password123',
      confirmSenha: 'password123',
      ehBarbeiro: false,
    });
    component.onSubmit();
    fixture.detectChanges();

    expect(authService.registro).toHaveBeenCalledOnceWith({
      nome: 'Test User',
      email: 'test@example.com',
      senha: 'password123',
      ehBarbeiro: false,
    });
    expect(messageServiceAddSpy).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Cadastro realizado',
      detail:
        'Seu cadastro foi realizado com sucesso. Faça login para continuar.',
    });
    expect(component.isLoading()).toBeFalsy();

    setTimeout(() => {
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
      done();
    }, 2000);
  });

  it('should call authService.registro and show error message on failed registration (API returns success: false)', () => {
    const errorMessage = 'Email already exists.';
    spyOn(authService, 'registro').and.returnValue(
      of({ success: false, message: errorMessage })
    );

    component.registroForm.setValue({
      nome: 'Test User',
      email: 'test@example.com',
      senha: 'password123',
      confirmSenha: 'password123',
      ehBarbeiro: false,
    });
    component.onSubmit();
    fixture.detectChanges();

    expect(authService.registro).toHaveBeenCalled();
    expect(messageServiceAddSpy).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Erro no cadastro',
      detail: errorMessage,
    });
    expect(component.isLoading()).toBeFalsy();
  });

  it('should call authService.registro and show default error message on failed registration (API returns success: false, no message)', () => {
    spyOn(authService, 'registro').and.returnValue(of({ success: false }));

    component.registroForm.setValue({
      nome: 'Test User',
      email: 'test@example.com',
      senha: 'password123',
      confirmSenha: 'password123',
      ehBarbeiro: false,
    });
    component.onSubmit();
    fixture.detectChanges();

    expect(authService.registro).toHaveBeenCalled();
    expect(messageServiceAddSpy).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Erro no cadastro',
      detail: 'Ocorreu um erro ao tentar realizar o cadastro. Tente novamente.',
    });
    expect(component.isLoading()).toBeFalsy();
  });

  it('should call authService.registro and show error message on registration error (authService throws error)', () => {
    spyOn(authService, 'registro').and.returnValue(
      throwError(() => new Error('Network Error'))
    );

    component.registroForm.setValue({
      nome: 'Test User',
      email: 'test@example.com',
      senha: 'password123',
      confirmSenha: 'password123',
      ehBarbeiro: false,
    });
    component.onSubmit();
    fixture.detectChanges();

    expect(authService.registro).toHaveBeenCalled();
    expect(messageServiceAddSpy).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Erro no cadastro',
      detail: 'Ocorreu um erro ao tentar realizar o cadastro. Tente novamente.',
    });
    expect(component.isLoading()).toBeFalsy();
  });

  it('markFormGroupTouched should mark all controls as touched', () => {
    component.registroForm.setValue({
      nome: '',
      email: '',
      senha: '',
      confirmSenha: '',
      ehBarbeiro: false,
    });
    component['markFormGroupTouched']();
    fixture.detectChanges();

    expect(component.nomeControl.touched).toBeTruthy();
    expect(component.emailControl.touched).toBeTruthy();
    expect(component.senhaControl.touched).toBeTruthy();
    expect(component.confirmSenhaControl.touched).toBeTruthy();
  });

  it('showErrorMessage should call messageService.add with correct parameters', () => {
    const summary = 'Test Error Summary';
    const detail = 'Test Error Detail';
    component['showErrorMessage'](summary, detail);
    fixture.detectChanges();

    expect(messageServiceAddSpy).toHaveBeenCalledWith({
      severity: 'error',
      summary,
      detail,
    });
  });

  it('showSuccessMessage should call messageService.add with correct parameters', () => {
    const summary = 'Test Success Summary';
    const detail = 'Test Success Detail';
    component['showSuccessMessage'](summary, detail);
    fixture.detectChanges();

    expect(messageServiceAddSpy).toHaveBeenCalledWith({
      severity: 'success',
      summary,
      detail,
    });
  });
});

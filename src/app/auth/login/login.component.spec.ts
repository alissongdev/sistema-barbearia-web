import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideAnimations } from '@angular/platform-browser/animations';

import { LoginComponent } from './login.component';
import { API_CONFIG } from '../../shared/config/api.config';
import { AuthService } from '../../shared/services/auth/auth.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: AuthService;
  let router: Router;
  let messageServiceAddSpy: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
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

    fixture = TestBed.createComponent(LoginComponent);
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
    expect(component.loginForm.valid).toBeFalsy();
  });

  it('should validate email field as required', () => {
    const emailControl = component.emailControl;
    emailControl.setValue('');
    expect(emailControl.hasError('required')).toBeTruthy();
  });

  it('should validate email field for valid email format', () => {
    const emailControl = component.emailControl;
    emailControl.setValue('invalid-email');
    expect(emailControl.hasError('email')).toBeTruthy();
    emailControl.setValue('valid@email.com');
    expect(emailControl.hasError('email')).toBeFalsy();
  });

  it('should validate password field as required', () => {
    const passwordControl = component.passwordControl;
    passwordControl.setValue('');
    expect(passwordControl.hasError('required')).toBeTruthy();
  });

  it('should mark form as touched and not call authService.login on submit with invalid form', () => {
    spyOn(component, 'markFormGroupTouched' as any).and.callThrough();
    spyOn(authService, 'login');

    component.onSubmit();

    expect(component['markFormGroupTouched']).toHaveBeenCalled();
    expect(authService.login).not.toHaveBeenCalled();
    expect(component.isLoading()).toBeFalsy();
  });

  it('should call authService.login and navigate on successful login', () => {
    spyOn(authService, 'login').and.returnValue(of(true));
    spyOn(router, 'navigate');

    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'password',
    });
    component.onSubmit();
    fixture.detectChanges();

    expect(authService.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    });
    expect(router.navigate).toHaveBeenCalledWith(['/agendamento']);
    expect(component.isLoading()).toBeFalsy();
    expect(messageServiceAddSpy).not.toHaveBeenCalled();
  });

  it('should call authService.login and show error message on failed login (authService returns false)', () => {
    spyOn(authService, 'login').and.returnValue(of(false));

    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'password',
    });
    component.onSubmit();
    fixture.detectChanges();

    expect(authService.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    });
    expect(messageServiceAddSpy).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Erro no login',
      detail: 'E-mail ou senha inválidos. Por favor, tente novamente.',
    });
    expect(component.isLoading()).toBeFalsy();
  });

  it('should call authService.login and show error message on login error (authService throws error)', () => {
    spyOn(authService, 'login').and.returnValue(
      throwError(() => new Error('Login failed'))
    );

    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'password',
    });
    component.onSubmit();
    fixture.detectChanges();

    expect(authService.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    });
    expect(messageServiceAddSpy).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Erro no login',
      detail: 'Ocorreu um erro ao tentar realizar o login. Tente novamente.',
    });
    expect(component.isLoading()).toBeFalsy();
  });

  it('markFormGroupTouched should mark all controls as touched', () => {
    component.loginForm.setValue({ email: '', password: '' });
    component['markFormGroupTouched']();
    fixture.detectChanges();

    expect(component.emailControl.touched).toBeTruthy();
    expect(component.passwordControl.touched).toBeTruthy();
  });

  it('showErrorMessage should call messageService.add with correct parameters', () => {
    const summary = 'Test Summary';
    const detail = 'Test Detail';
    component['showErrorMessage'](summary, detail);
    fixture.detectChanges();

    expect(messageServiceAddSpy).toHaveBeenCalledWith({
      severity: 'error',
      summary,
      detail,
    });
  });
});

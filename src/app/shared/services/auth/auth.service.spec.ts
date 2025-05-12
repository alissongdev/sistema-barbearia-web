import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { UsuarioService } from '../usuario.service';
import { API_CONFIG } from '../../config/api.config';
import { Usuario } from '../../models/usuario.model';
import { of } from 'rxjs';
import {
  RegistroUsuarioDto,
  RegistroResponseDto,
} from '../../models/registro-usuario.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: jasmine.SpyObj<Router>;
  let usuarioService: jasmine.SpyObj<UsuarioService>;
  const baseUrl = '/api';

  const mockUsuario: Usuario = {
    id: '1',
    nome: 'Test User',
    email: 'test@example.com',
    ehBarbeiro: false,
  };

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const usuarioServiceSpy = jasmine.createSpyObj('UsuarioService', [
      'findUsuarioByEmail',
    ]);
    usuarioServiceSpy.findUsuarioByEmail.and.returnValue(of(mockUsuario));

    TestBed.configureTestingModule({
      imports: [],
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy },
        { provide: UsuarioService, useValue: usuarioServiceSpy },
        { provide: API_CONFIG, useValue: { baseUrl } },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    usuarioService = TestBed.inject(
      UsuarioService
    ) as jasmine.SpyObj<UsuarioService>;

    spyOn(localStorage, 'getItem').and.callFake((key) => {
      if (key === 'auth_token') return 'mock-token';
      if (key === 'user_data') return JSON.stringify(mockUsuario);
      return null;
    });
    spyOn(localStorage, 'setItem').and.callFake(() => {});
    spyOn(localStorage, 'removeItem').and.callFake(() => {});
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('constructor', () => {
    it('should set isAuthenticated to true if token exists', () => {
      service['isAuthenticatedSubject'].next(service.hasToken());
      service.isAuthenticated$.subscribe((isAuth) => {
        expect(isAuth).toBe(true);
      });
    });

    it('should load user data if available in localStorage', () => {
      service['currentUserSubject'].next(mockUsuario);
      service.currentUser$.subscribe((user) => {
        expect(user).toEqual(mockUsuario);
      });
    });
  });

  describe('loadUserData', () => {
    it('should load user data from localStorage and update currentUserSubject', () => {
      service['currentUserSubject'].next(null);

      service['loadUserData']();

      expect(service.getCurrentUser()).toEqual(mockUsuario);
      service.currentUser$.subscribe((user) => {
        expect(user).toEqual(mockUsuario);
      });
    });

    it('should not update currentUserSubject if no user data in localStorage', () => {
      (localStorage.getItem as jasmine.Spy).and.callFake((key) => {
        if (key === 'auth_token') return 'mock-token';
        return null;
      });

      service['currentUserSubject'].next(null);

      service['loadUserData']();

      expect(service.getCurrentUser()).toBeNull();
    });

    it('should handle and log JSON parse errors', () => {
      (localStorage.getItem as jasmine.Spy).and.callFake((key) => {
        if (key === 'auth_token') return 'mock-token';
        if (key === 'user_data') return 'invalid-json-format';
        return null;
      });

      spyOn(console, 'error');

      spyOn(service, 'logout');

      service['loadUserData']();

      expect(console.error).toHaveBeenCalled();

      expect(service.logout).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should authenticate user and store token on successful login', () => {
      const credentials = { email: 'test@example.com', password: 'password' };
      const mockResponse = { token: 'mock-token' };

      service.login(credentials).subscribe((result) => {
        expect(result).toBe(true);
        expect(router.navigate).toHaveBeenCalledWith(['/agendamento']);
      });

      const req = httpMock.expectOne(`${baseUrl}/Auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        email: credentials.email,
        senha: credentials.password,
      });
      req.flush(mockResponse);

      expect(usuarioService.findUsuarioByEmail).toHaveBeenCalledWith(
        credentials.email
      );
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'auth_token',
        mockResponse.token
      );
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'user_data',
        JSON.stringify(mockUsuario)
      );
    });

    it('should return false on failed login', () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrong-password',
      };

      service.login(credentials).subscribe((result) => {
        expect(result).toBe(false);
        expect(router.navigate).not.toHaveBeenCalled();
      });

      const req = httpMock.expectOne(`${baseUrl}/Auth/login`);
      req.error(new ErrorEvent('Network error'));
    });

    it('should return false when no token is returned', () => {
      const credentials = { email: 'test@example.com', password: 'password' };
      const mockResponse = {};

      service.login(credentials).subscribe((result) => {
        expect(result).toBe(false);
      });

      const req = httpMock.expectOne(`${baseUrl}/Auth/login`);
      req.flush(mockResponse);
    });
  });

  describe('logout', () => {
    it('should clear user data and navigate to login page', () => {
      service.logout();

      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('user_data');
      expect(router.navigate).toHaveBeenCalledWith(['/login']);

      service.isAuthenticated$.subscribe((isAuth) => {
        expect(isAuth).toBe(false);
      });

      service.currentUser$.subscribe((user) => {
        expect(user).toBeNull();
      });
    });
  });

  describe('hasToken', () => {
    it('should return true if token exists', () => {
      expect(service.hasToken()).toBe(true);
    });

    it('should return false if token does not exist', () => {
      (localStorage.getItem as jasmine.Spy).and.returnValue(null);
      expect(service.hasToken()).toBe(false);
    });
  });

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      expect(service.getToken()).toBe('mock-token');
    });
  });

  describe('getCurrentUser', () => {
    it('should return the current user', () => {
      service['currentUserSubject'].next(mockUsuario);
      expect(service.getCurrentUser()).toEqual(mockUsuario);
    });
  });

  describe('getUserNome', () => {
    it('should return the user nome from localStorage', () => {
      const nome = service.getUserNome();
      expect(nome).not.toBeNull();
      expect(nome).toBe('Test User');
    });

    it('should return null if user data is not in localStorage', () => {
      (localStorage.getItem as jasmine.Spy).and.returnValue(null);
      expect(service.getUserNome()).toBeNull();
    });

    it('should return null if user data cannot be parsed', () => {
      (localStorage.getItem as jasmine.Spy).and.returnValue('invalid-json');
      expect(service.getUserNome()).toBeNull();
    });
  });

  describe('getUserId', () => {
    it('should return the user id from localStorage', () => {
      const id = service.getUserId();
      expect(id).not.toBeNull();
      expect(id).toBe('1');
    });

    it('should return null if user data is not in localStorage', () => {
      (localStorage.getItem as jasmine.Spy).and.returnValue(null);
      expect(service.getUserId()).toBeNull();
    });

    it('should return null if user data cannot be parsed', () => {
      (localStorage.getItem as jasmine.Spy).and.returnValue('invalid-json');
      expect(service.getUserId()).toBeNull();
    });
  });

  describe('registro', () => {
    it('should register a new user successfully', () => {
      const registroData: RegistroUsuarioDto = {
        nome: 'New User',
        email: 'newuser@example.com',
        senha: 'password',
        ehBarbeiro: false,
      };

      const mockResponse: RegistroResponseDto = {
        id: '2',
        nome: 'New User',
        email: 'newuser@example.com',
        ehBarbeiro: false,
      };

      service.registro(registroData).subscribe((result) => {
        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/Auth/registro`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(registroData);
      req.flush(mockResponse);
    });

    it('should handle registration error with string error', () => {
      const registroData: RegistroUsuarioDto = {
        nome: 'New User',
        email: 'existing@example.com',
        senha: 'password',
        ehBarbeiro: false,
      };

      const errorMessage = 'Email já cadastrado';

      service.registro(registroData).subscribe((result) => {
        expect(result.success).toBe(false);
        expect(result.message).toBe(errorMessage);
      });

      const req = httpMock.expectOne(`${baseUrl}/Auth/registro`);
      req.flush(errorMessage, { status: 400, statusText: 'Bad Request' });
    });

    it('should handle registration error with error object containing message', () => {
      const registroData: RegistroUsuarioDto = {
        nome: 'New User',
        email: 'invalid@example.com',
        senha: 'password',
        ehBarbeiro: false,
      };

      const errorObj = { message: 'Dados inválidos' };

      service.registro(registroData).subscribe((result) => {
        expect(result.success).toBe(false);
        expect(result.message).toBe(errorObj.message);
      });

      const req = httpMock.expectOne(`${baseUrl}/Auth/registro`);
      req.flush(errorObj, { status: 400, statusText: 'Bad Request' });
    });

    it('should handle registration error with error object containing title', () => {
      const registroData: RegistroUsuarioDto = {
        nome: 'New User',
        email: 'invalid@example.com',
        senha: 'password',
        ehBarbeiro: false,
      };

      const errorObj = { title: 'Erro de validação' };

      service.registro(registroData).subscribe((result) => {
        expect(result.success).toBe(false);
        expect(result.message).toBe(errorObj.title);
      });

      const req = httpMock.expectOne(`${baseUrl}/Auth/registro`);
      req.flush(errorObj, { status: 400, statusText: 'Bad Request' });
    });

    it('should handle generic registration error', () => {
      const registroData: RegistroUsuarioDto = {
        nome: 'New User',
        email: 'server-error@example.com',
        senha: 'password',
        ehBarbeiro: false,
      };

      service.registro(registroData).subscribe((result) => {
        expect(result.success).toBe(false);
        expect(result.message).toBe(
          'Dados inválidos. Verifique os campos e tente novamente.'
        );
      });

      const req = httpMock.expectOne(`${baseUrl}/Auth/registro`);
      req.flush({}, { status: 400, statusText: 'Bad Request' });
    });
  });
});

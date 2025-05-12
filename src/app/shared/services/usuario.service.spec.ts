import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { UsuarioService } from './usuario.service';
import { Usuario } from '../models/usuario.model';
import { API_CONFIG } from '../config/api.config';

describe('UsuarioService', () => {
  let service: UsuarioService;
  let httpMock: HttpTestingController;
  const baseUrl = '/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UsuarioService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl } },
      ],
    });
    service = TestBed.inject(UsuarioService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getBarbeiros', () => {
    it('should return a list of barbeiros from the API', () => {
      const mockBarbeiros: Usuario[] = [
        {
          id: '1',
          nome: 'Barbeiro 1',
          email: 'barbeiro1@email.com',
          ehBarbeiro: true,
        },
        {
          id: '2',
          nome: 'Barbeiro 2',
          email: 'barbeiro2@email.com',
          ehBarbeiro: true,
        },
      ];

      service.getBarbeiros().subscribe((barbeiros) => {
        expect(barbeiros).toEqual(mockBarbeiros);
        expect(barbeiros.length).toBe(2);
        expect(barbeiros[0].ehBarbeiro).toBeTrue();
      });

      const req = httpMock.expectOne(`${baseUrl}/Usuarios/barbeiros`);
      expect(req.request.method).toBe('GET');
      req.flush(mockBarbeiros);
    });
  });

  describe('getUsuarios', () => {
    it('should return a list of all usuarios from the API', () => {
      const mockUsuarios: Usuario[] = [
        {
          id: '1',
          nome: 'Barbeiro 1',
          email: 'barbeiro1@email.com',
          ehBarbeiro: true,
        },
        {
          id: '2',
          nome: 'Cliente 1',
          email: 'cliente1@email.com',
          ehBarbeiro: false,
        },
        {
          id: '3',
          nome: 'Cliente 2',
          email: 'cliente2@email.com',
          ehBarbeiro: false,
        },
      ];

      service.getUsuarios().subscribe((usuarios) => {
        expect(usuarios).toEqual(mockUsuarios);
        expect(usuarios.length).toBe(3);
      });

      const req = httpMock.expectOne(`${baseUrl}/Usuarios`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUsuarios);
    });
  });

  describe('findUsuarioByEmail', () => {
    it('should return the usuario with the matching email', () => {
      const mockUsuarios: Usuario[] = [
        {
          id: '1',
          nome: 'Barbeiro 1',
          email: 'barbeiro1@email.com',
          ehBarbeiro: true,
        },
        {
          id: '2',
          nome: 'Cliente 1',
          email: 'cliente1@email.com',
          ehBarbeiro: false,
        },
        {
          id: '3',
          nome: 'Cliente 2',
          email: 'cliente2@email.com',
          ehBarbeiro: false,
        },
      ];

      const targetEmail = 'cliente1@email.com';
      const expectedUsuario = mockUsuarios[1];

      service.findUsuarioByEmail(targetEmail).subscribe((usuario) => {
        expect(usuario).toEqual(expectedUsuario);
      });

      const req = httpMock.expectOne(`${baseUrl}/Usuarios`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUsuarios);
    });

    it('should return null when no usuario is found with the given email', () => {
      const mockUsuarios: Usuario[] = [
        {
          id: '1',
          nome: 'Barbeiro 1',
          email: 'barbeiro1@email.com',
          ehBarbeiro: true,
        },
        {
          id: '2',
          nome: 'Cliente 1',
          email: 'cliente1@email.com',
          ehBarbeiro: false,
        },
      ];

      const nonExistentEmail = 'naoexiste@email.com';

      service.findUsuarioByEmail(nonExistentEmail).subscribe((usuario) => {
        expect(usuario).toBeNull();
      });

      const req = httpMock.expectOne(`${baseUrl}/Usuarios`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUsuarios);
    });
  });
});

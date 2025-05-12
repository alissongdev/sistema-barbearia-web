import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { AgendamentoService } from './agendamento.service';
import { HorarioDisponivel } from '../models/horario-disponivel.model';
import { Agendamento } from '../models/agendamento.model';

describe('AgendamentoService', () => {
  let service: AgendamentoService;
  let httpMock: HttpTestingController;
  const baseUrl = '/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AgendamentoService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(AgendamentoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('fetchAvailableTimes', () => {
    it('should return horarios disponiveis for a given date', () => {
      const testDate = new Date('2023-05-10T10:00:00');
      const expectedHorarios: HorarioDisponivel[] = [
        {
          barbeiroId: '1',
          nome: 'Barbeiro 1',
          horariosDisponiveis: ['09:00', '10:00'],
        },
        {
          barbeiroId: '2',
          nome: 'Barbeiro 2',
          horariosDisponiveis: ['11:00', '14:00'],
        },
      ];

      service.fetchAvailableTimes(testDate).subscribe((horarios) => {
        expect(horarios).toEqual(expectedHorarios);
        expect(horarios.length).toBe(2);
      });

      const req = httpMock.expectOne(
        `${baseUrl}/Agendamentos/horarios-disponiveis?data=${testDate.toISOString()}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(expectedHorarios);
    });

    it('should handle empty response for fetchAvailableTimes', () => {
      const testDate = new Date('2023-05-10T10:00:00');

      service.fetchAvailableTimes(testDate).subscribe((horarios) => {
        expect(horarios).toEqual([]);
        expect(horarios.length).toBe(0);
      });

      const req = httpMock.expectOne(
        `${baseUrl}/Agendamentos/horarios-disponiveis?data=${testDate.toISOString()}`
      );
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });

  describe('createAppointment', () => {
    it('should create agendamento', () => {
      const newAgendamento: Agendamento = {
        clienteId: '123',
        barbeiroId: '456',
        dataHora: new Date('2023-05-10T10:00:00'),
      };
      const responseAgendamento: Agendamento = {
        id: '789',
        clienteId: '123',
        barbeiroId: '456',
        dataHora: new Date('2023-05-10T10:00:00'),
      };

      service.createAppointment(newAgendamento).subscribe((agendamento) => {
        expect(agendamento).toEqual(responseAgendamento);
      });

      const req = httpMock.expectOne(`${baseUrl}/Agendamentos`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newAgendamento);
      req.flush(responseAgendamento);
    });
  });

  describe('fetchUserAppointments', () => {
    it('should return agendamentos for a user', () => {
      const usuarioId = '123';
      const expectedAgendamentos: Agendamento[] = [
        {
          id: '1',
          clienteId: usuarioId,
          barbeiroId: '456',
          dataHora: new Date('2023-05-10T10:00:00'),
        },
        {
          id: '2',
          clienteId: usuarioId,
          barbeiroId: '789',
          dataHora: new Date('2023-05-15T14:00:00'),
        },
      ];

      service.fetchUserAppointments(usuarioId).subscribe((agendamentos) => {
        expect(agendamentos).toEqual(expectedAgendamentos);
        expect(agendamentos.length).toBe(2);
      });

      const req = httpMock.expectOne(
        `${baseUrl}/Agendamentos/usuario/${usuarioId}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(expectedAgendamentos);
    });

    it('should handle empty response for fetchUserAppointments', () => {
      const usuarioId = '123';

      service.fetchUserAppointments(usuarioId).subscribe((agendamentos) => {
        expect(agendamentos).toEqual([]);
        expect(agendamentos.length).toBe(0);
      });

      const req = httpMock.expectOne(
        `${baseUrl}/Agendamentos/usuario/${usuarioId}`
      );
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });

  describe('cancelAppointment', () => {
    it('should cancel an agendamento', () => {
      const agendamentoId = '789';

      service.cancelAppointment(agendamentoId).subscribe((response) => {
        expect(response).toBeTruthy();
      });

      const req = httpMock.expectOne(
        `${baseUrl}/Agendamentos/${agendamentoId}`
      );
      expect(req.request.method).toBe('DELETE');
      req.flush({ success: true });
    });
  });
});

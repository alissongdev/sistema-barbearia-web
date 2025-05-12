import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AgendamentoComponent } from './agendamento.component';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { API_CONFIG } from '../../shared/config/api.config';
import { Usuario } from '../../shared/models/usuario.model';
import { of, throwError } from 'rxjs';
import { AgendamentoService } from '../../shared/services/agendamento.service';
import { UsuarioService } from '../../shared/services/usuario.service';
import { AuthService } from '../../shared/services/auth/auth.service';
import { HorarioDisponivel } from '../../shared/models/horario-disponivel.model';

describe('AgendamentoComponent', () => {
  let component: AgendamentoComponent;
  let fixture: ComponentFixture<AgendamentoComponent>;
  let agendamentoService: jasmine.SpyObj<AgendamentoService>;
  let usuarioService: jasmine.SpyObj<UsuarioService>;
  let authService: jasmine.SpyObj<AuthService>;
  let messageService: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    const agendamentoServiceSpy = jasmine.createSpyObj('AgendamentoService', [
      'getHorariosDisponiveis',
      'criarAgendamento',
    ]);
    const usuarioServiceSpy = jasmine.createSpyObj('UsuarioService', [
      'getBarbeiros',
    ]);
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'getCurrentUser',
    ]);
    const messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      imports: [
        AgendamentoComponent,
        ReactiveFormsModule,
        CardModule,
        ButtonModule,
        ToastModule,
        ProgressSpinnerModule,
      ],
      providers: [
        { provide: AgendamentoService, useValue: agendamentoServiceSpy },
        { provide: UsuarioService, useValue: usuarioServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { apiUrl: 'http://localhost:3000' } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AgendamentoComponent);
    component = fixture.componentInstance;
    agendamentoService = TestBed.inject(
      AgendamentoService
    ) as jasmine.SpyObj<AgendamentoService>;
    usuarioService = TestBed.inject(
      UsuarioService
    ) as jasmine.SpyObj<UsuarioService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    messageService = TestBed.inject(
      MessageService
    ) as jasmine.SpyObj<MessageService>;

    authService.getCurrentUser.and.returnValue({
      id: 'client-123',
      nome: 'Cliente Teste',
      email: 'cliente@teste.com',
      ehBarbeiro: false,
    });

    spyOn(component, 'fetchBarbers');

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with default values', () => {
    const form = component.agendamentoForm;
    expect(form.get('barbeiro')?.value).toBeNull();
    expect(form.get('data')?.value).toBeNull();
    expect(form.get('horario')?.value).toBeNull();
  });

  it('should set showTimeSlots to true and call loadAvailableTimeSlots when handleDateSelection is called', () => {
    spyOn(component, 'loadAvailableTimeSlots');
    const testDate = new Date();

    component.handleDateSelection(testDate);

    expect(component.showTimeSlots()).toBeTrue();
    expect(component.loadAvailableTimeSlots).toHaveBeenCalled();
  });

  describe('loadAvailableTimeSlots', () => {
    it('should not call the service if date or barbeiro is not selected', () => {
      component.agendamentoForm.patchValue({
        data: null,
        barbeiro: null,
      });

      component.loadAvailableTimeSlots();

      expect(agendamentoService.getHorariosDisponiveis).not.toHaveBeenCalled();
      expect(component.isLoadingSchedules()).toBeFalse();
    });

    it('should load and filter horarios for the selected barbeiro', () => {
      const testDate = new Date('2025-05-15T10:00:00');
      const mockBarbeiro: Usuario = {
        id: '123',
        nome: 'Barbeiro Teste',
        email: 'barbeiro@teste.com',
        ehBarbeiro: true,
      };

      const mockHorariosResponse: HorarioDisponivel[] = [
        {
          barbeiroId: '123',
          nome: 'Barbeiro Teste',
          horariosDisponiveis: ['09:00', '10:00', '11:00'],
        },
        {
          barbeiroId: '456',
          nome: 'Outro Barbeiro',
          horariosDisponiveis: ['14:00', '15:00'],
        },
      ];

      component.agendamentoForm.patchValue({
        data: testDate,
        barbeiro: mockBarbeiro,
      });

      agendamentoService.getHorariosDisponiveis.and.returnValue(
        of(mockHorariosResponse)
      );

      spyOn(component as any, 'filterValidTimeSlots').and.returnValue([
        '09:00',
        '10:00',
        '11:00',
      ]);

      component.loadAvailableTimeSlots();

      expect(agendamentoService.getHorariosDisponiveis).toHaveBeenCalledWith(
        testDate
      );
      expect(component.isLoadingSchedules()).toBeFalse();
      expect(component.availableTimeSlots()).toEqual([
        '09:00',
        '10:00',
        '11:00',
      ]);
      expect((component as any).filterValidTimeSlots).toHaveBeenCalledWith([
        '09:00',
        '10:00',
        '11:00',
      ]);
    });

    it('should set availableTimeSlots to empty array when no horarios are found for the barbeiro', () => {
      const testDate = new Date('2025-05-15T10:00:00');
      const mockBarbeiro: Usuario = {
        id: '789',
        nome: 'Barbeiro Sem Horarios',
        email: 'sem.horarios@teste.com',
        ehBarbeiro: true,
      };

      const mockHorariosResponse: HorarioDisponivel[] = [
        {
          barbeiroId: '123',
          nome: 'Barbeiro Teste',
          horariosDisponiveis: ['09:00', '10:00', '11:00'],
        },
      ];

      component.agendamentoForm.patchValue({
        data: testDate,
        barbeiro: mockBarbeiro,
      });

      agendamentoService.getHorariosDisponiveis.and.returnValue(
        of(mockHorariosResponse)
      );

      component.loadAvailableTimeSlots();

      expect(agendamentoService.getHorariosDisponiveis).toHaveBeenCalledWith(
        testDate
      );
      expect(component.isLoadingSchedules()).toBeFalse();
      expect(component.availableTimeSlots()).toEqual([]);
    });
  });

  describe('filterValidTimeSlots', () => {
    it('should return all horarios when selected date is not today', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      component.agendamentoForm.patchValue({
        data: tomorrow,
      });

      const horarios = ['09:00', '10:00', '11:00'];
      const result = (component as any).filterValidTimeSlots(horarios);

      expect(result).toEqual(horarios);
    });

    it('should filter out past hours when selected date is today', () => {
      const hoje = new Date();

      jasmine.clock().mockDate(hoje);

      component.agendamentoForm.patchValue({
        data: new Date(hoje),
      });

      const horarios = [
        '09:00',
        '10:00',
        '12:00',
        '12:15',
        '12:45',
        '13:00',
        '14:00',
      ];
      const result = (component as any).filterValidTimeSlots(horarios);

      const horaAtual = hoje.getHours();
      const minutosAtual = hoje.getMinutes();

      const expectedHorarios = horarios.filter((horario) => {
        const [hora, minutos] = horario.split(':').map(Number);
        return (
          hora > horaAtual || (hora === horaAtual && minutos > minutosAtual)
        );
      });

      expect(result).toEqual(expectedHorarios);
    });
  });

  describe('handleBarberSelection', () => {
    it('should update form with selected barbeiro and reset date and time values', () => {
      const mockBarbeiro: Usuario = {
        id: '123',
        nome: 'Barbeiro Teste',
        email: 'barbeiro@teste.com',
        ehBarbeiro: true,
      };

      component.agendamentoForm.patchValue({
        data: new Date(),
        horario: '14:00',
      });

      component.handleBarberSelection(mockBarbeiro);

      expect(component.agendamentoForm.get('barbeiro')?.value).toEqual(
        mockBarbeiro
      );

      expect(component.agendamentoForm.get('data')?.value).toBeNull();
      expect(component.agendamentoForm.get('horario')?.value).toBeNull();
      expect(component.showTimeSlots()).toBeFalse();
    });

    it('should update only the barbeiro field and not modify other unrelated form fields', () => {
      const fb = TestBed.inject(FormBuilder);
      const testForm = fb.group({
        barbeiro: [null],
        data: [null],
        horario: [null],
        customField: ['testValue'],
      });

      component.agendamentoForm = testForm;

      const mockBarbeiro: Usuario = {
        id: '456',
        nome: 'Outro Barbeiro',
        ehBarbeiro: true,
      };

      component.handleBarberSelection(mockBarbeiro);

      expect(component.agendamentoForm.get('barbeiro')?.value).toEqual(
        mockBarbeiro
      );

      expect(component.agendamentoForm.get('data')?.value).toBeNull();
      expect(component.agendamentoForm.get('horario')?.value).toBeNull();

      expect(component.agendamentoForm.get('customField')?.value).toEqual(
        'testValue'
      );
    });
  });

  describe('fetchBarbers', () => {
    beforeEach(() => {
      (component.fetchBarbers as jasmine.Spy).and.callThrough();
    });

    it('should set isLoadingBarbers to true at the beginning and false at the end', () => {
      const mockBarbeiros: Usuario[] = [
        {
          id: '123',
          nome: 'Barbeiro Teste',
          email: 'barbeiro@teste.com',
          ehBarbeiro: true,
        },
      ];

      usuarioService.getBarbeiros.and.returnValue(of(mockBarbeiros));

      spyOn(component.isLoadingBarbers, 'set').and.callThrough();

      component.fetchBarbers();

      expect(component.isLoadingBarbers.set).toHaveBeenCalledWith(true);
      expect(component.isLoadingBarbers.set).toHaveBeenCalledWith(false);
      expect(component.isLoadingBarbers()).toBeFalse();

      expect(component.barbersList()).toEqual(mockBarbeiros);
    });

    it('should update barbersList signal with data from service', () => {
      const mockBarbeiros: Usuario[] = [
        {
          id: '123',
          nome: 'Barbeiro 1',
          email: 'barbeiro1@teste.com',
          ehBarbeiro: true,
        },
        {
          id: '456',
          nome: 'Barbeiro 2',
          email: 'barbeiro2@teste.com',
          ehBarbeiro: true,
        },
      ];

      usuarioService.getBarbeiros.and.returnValue(of(mockBarbeiros));

      spyOn(component.barbersList, 'set').and.callThrough();

      component.fetchBarbers();

      expect(component.barbersList.set).toHaveBeenCalledWith(mockBarbeiros);
      expect(component.barbersList()).toEqual(mockBarbeiros);
    });

    it('should set isLoadingBarbers to false even when an error occurs', () => {
      const errorResponse = new Error('API Error');
      usuarioService.getBarbeiros.and.returnValue(
        throwError(() => errorResponse)
      );

      spyOn(component.isLoadingBarbers, 'set').and.callThrough();

      component.fetchBarbers();

      expect(component.isLoadingBarbers.set).toHaveBeenCalledWith(false);
      expect(component.isLoadingBarbers()).toBeFalse();
    });
  });
});

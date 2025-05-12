import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { catchError, EMPTY, finalize, tap } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

import { Usuario } from '../../shared/models/usuario.model';
import { UsuarioService } from '../../shared/services/usuario.service';
import { AgendamentoService } from '../../shared/services/agendamento.service';
import { AuthService } from '../../shared/services/auth/auth.service';
import { SelecionarBarbeiroComponent } from './selecionar-barbeiro/selecionar-barbeiro.component';
import { SelecionarDataComponent } from './selecionar-data/selecionar-data.component';
import { SelecionarHorarioComponent } from './selecionar-horario/selecionar-horario.component';

@Component({
  selector: 'app-agendamento',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    ToastModule,
    ProgressSpinnerModule,
    SelecionarBarbeiroComponent,
    SelecionarDataComponent,
    SelecionarHorarioComponent,
  ],
  providers: [MessageService],
  template: `
    <div class="container mx-auto p-6">
      <h1 class="text-3xl font-bold mb-6 text-blue-800">Agendar Serviço</h1>

      <form [formGroup]="agendamentoForm" (ngSubmit)="confirmAppointment()">
        <div class="flex flex-col md:flex-row gap-6">
          <div class="w-full md:w-1/3">
            <app-selecionar-barbeiro
              [barbeiros]="barbersList()"
              [carregando]="isLoadingBarbers()"
              [selectedBarbeiro]="agendamentoForm.get('barbeiro')?.value"
              (barbeiroSelected)="handleBarberSelection($event)"
            >
            </app-selecionar-barbeiro>
          </div>

          @if (agendamentoForm.get('barbeiro')?.value) {
          <div class="w-full md:w-1/3">
            <app-selecionar-data
              [selectedDate]="agendamentoForm.get('data')?.value"
              [minDataSelecionavel]="minDate"
              [maxDataSelecionavel]="maxDate"
              (dataSelecionada)="handleDateSelection($event)"
            >
            </app-selecionar-data>
          </div>
          } @if (agendamentoForm.get('barbeiro')?.value && showTimeSlots()) {
          <div class="w-full md:w-1/3">
            <app-selecionar-horario
              [horarios]="availableTimeSlots()"
              [carregando]="isLoadingSchedules()"
              [selectedHorario]="agendamentoForm.get('horario')?.value"
              (horarioSelecionado)="selectTimeSlot($event)"
            >
            </app-selecionar-horario>

            <div class="mt-3 flex justify-end">
              <button
                pButton
                type="submit"
                label="Confirmar Agendamento"
                class="w-full"
                [disabled]="agendamentoForm.invalid || isSchedulingInProgress()"
              ></button>
            </div>
          </div>
          }
        </div>
      </form>
    </div>

    <p-toast></p-toast>
  `,
  styles: [
    `
      :host ::ng-deep .p-button.p-button-outlined:hover {
        @apply bg-blue-50;
      }
    `,
  ],
})
export class AgendamentoComponent implements OnInit {
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private agendamentoService = inject(AgendamentoService);
  private messageService = inject(MessageService);
  private authService = inject(AuthService);

  agendamentoForm: FormGroup = this.createForm();

  barbersList = signal<Usuario[]>([]);
  isLoadingBarbers = signal<boolean>(false);
  isLoadingSchedules = signal<boolean>(false);
  isSchedulingInProgress = signal<boolean>(false);
  showTimeSlots = signal<boolean>(false);
  availableTimeSlots = signal<string[]>([]);

  minDate = new Date();
  maxDate = new Date();

  ngOnInit() {
    this.maxDate.setMonth(this.maxDate.getMonth() + 2);
    this.fetchBarbers();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      barbeiro: [null, Validators.required],
      data: [null, Validators.required],
      horario: [null, Validators.required],
    });
  }

  handleBarberSelection(barbeiro: Usuario) {
    this.agendamentoForm.patchValue({ barbeiro });
    this.resetDateAndTime();
  }

  handleDateSelection(data: Date) {
    this.agendamentoForm.patchValue({
      data,
      horario: null,
    });
    this.showTimeSlots.set(true);
    this.loadAvailableTimeSlots();
  }

  fetchBarbers() {
    this.isLoadingBarbers.set(true);
    this.usuarioService
      .getBarbeiros()
      .pipe(
        tap((barbeiros) => this.barbersList.set(barbeiros)),
        catchError((err) => {
          console.error('Erro ao carregar barbeiros:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possível carregar a lista de barbeiros.',
          });
          return EMPTY;
        }),
        finalize(() => this.isLoadingBarbers.set(false))
      )
      .subscribe();
  }

  loadAvailableTimeSlots() {
    const selectedDate = this.agendamentoForm.get('data')?.value;
    const selectedBarbeiro = this.agendamentoForm.get('barbeiro')?.value;

    if (!selectedDate || !selectedBarbeiro) return;

    this.isLoadingSchedules.set(true);
    this.agendamentoService
      .fetchAvailableTimes(selectedDate)
      .pipe(
        tap((horariosDisponiveis) => {
          const horariosBarbeiro = horariosDisponiveis.find(
            (h) => h.barbeiroId === selectedBarbeiro.id
          );

          if (horariosBarbeiro) {
            this.availableTimeSlots.set(
              this.filterValidTimeSlots(horariosBarbeiro.horariosDisponiveis)
            );
          } else {
            this.availableTimeSlots.set([]);
          }
        }),
        catchError((err) => {
          console.error('Erro ao carregar horários:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possível carregar os horários disponíveis.',
          });
          this.availableTimeSlots.set([]);
          return EMPTY;
        }),
        finalize(() => this.isLoadingSchedules.set(false))
      )
      .subscribe();
  }

  selectTimeSlot(slot: string) {
    this.agendamentoForm.get('horario')?.setValue(slot);
  }

  confirmAppointment() {
    if (this.agendamentoForm.invalid) return;

    const clienteData = this.authService.getCurrentUser();
    if (!this.checkClienteAuthentication(clienteData)) return;

    const formValue = this.agendamentoForm.value;
    const appointmentData = {
      id: uuidv4(),
      clienteId: clienteData!.id,
      barbeiroId: formValue.barbeiro.id,
      dataHora: this.combineDateTime(formValue.data, formValue.horario),
      cliente: clienteData,
      barbeiro: formValue.barbeiro,
    };

    this.isSchedulingInProgress.set(true);
    this.agendamentoService
      .createAppointment(appointmentData)
      .pipe(
        tap(() => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Agendamento realizado com sucesso!',
          });
          this.resetForm();
        }),
        catchError((err) => {
          console.error('Erro ao criar agendamento:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possível realizar o agendamento. Tente novamente.',
          });
          return EMPTY;
        }),
        finalize(() => this.isSchedulingInProgress.set(false))
      )
      .subscribe();
  }

  private resetDateAndTime() {
    this.agendamentoForm.patchValue({
      data: null,
      horario: null,
    });
    this.showTimeSlots.set(false);
  }

  private resetForm() {
    this.agendamentoForm.reset();
    this.showTimeSlots.set(false);
  }

  private checkClienteAuthentication(clienteData: Usuario | null): boolean {
    if (!clienteData || !clienteData.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro de autenticação. Por favor, faça login novamente.',
      });
      return false;
    }
    return true;
  }

  private filterValidTimeSlots(horarios: string[]): string[] {
    const hoje = new Date();
    const dataAgendamento = new Date(this.agendamentoForm.get('data')?.value);

    const ehHoje =
      dataAgendamento.getDate() === hoje.getDate() &&
      dataAgendamento.getMonth() === hoje.getMonth() &&
      dataAgendamento.getFullYear() === hoje.getFullYear();

    if (!ehHoje) return horarios;

    const horaAtual = hoje.getHours();
    const minutosAtual = hoje.getMinutes();

    return horarios.filter((horario) => {
      const [hora, minutos] = horario.split(':').map(Number);
      return hora > horaAtual || (hora === horaAtual && minutos > minutosAtual);
    });
  }

  private combineDateTime(date: Date, timeString: string): string {
    const [hours, minutes] = timeString.split(':').map(Number);

    const dateTime = new Date(date);
    dateTime.setHours(hours, minutes, 0, 0);

    const year = dateTime.getFullYear();
    const month = String(dateTime.getMonth() + 1).padStart(2, '0');
    const day = String(dateTime.getDate()).padStart(2, '0');
    const hour = String(hours).padStart(2, '0');
    const minute = String(minutes).padStart(2, '0');

    return `${year}-${month}-${day}T${hour}:${minute}:00.000`;
  }
}

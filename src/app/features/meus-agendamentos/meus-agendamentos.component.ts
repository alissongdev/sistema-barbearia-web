import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Agendamento } from '../../shared/models/agendamento.model';
import { AgendamentoService } from '../../shared/services/agendamento.service';
import { AuthService } from '../../shared/services/auth/auth.service';
import { Usuario } from '../../shared/models/usuario.model';
import { finalize } from 'rxjs';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-meus-agendamentos',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TableModule,
    ToastModule,
    ProgressSpinnerModule,
    ConfirmDialogModule,
    TagModule,
    TooltipModule,
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="container mx-auto px-4 py-6 max-w-6xl">
      <h1 class="text-3xl font-bold mb-6 text-blue-800">Meus Agendamentos</h1>

      @if (carregando()) {
      <div class="flex justify-center py-8">
        <p-progressSpinner
          [style]="{ width: '50px', height: '50px' }"
        ></p-progressSpinner>
      </div>
      } @else {
      <p-card>
        <p-table
          [value]="agendamentosOrdenados()"
          [paginator]="true"
          [rows]="5"
          [rowHover]="true"
          styleClass="p-datatable-sm"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} agendamentos"
          [rowsPerPageOptions]="[5, 10, 25]"
          emptyMessage="Nenhum agendamento encontrado."
          [tableStyle]="{ 'min-width': '100%' }"
        >
          <ng-template pTemplate="header">
            <tr>
              <th>Data e Hora</th>
              <th>{{ usuarioAtual()?.ehBarbeiro ? 'Cliente' : 'Barbeiro' }}</th>
              <th>Status</th>
              <th>Cancelar</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-agendamento>
            <tr>
              <td>{{ formatDate(agendamento.dataHora) }}</td>
              <td>
                {{
                  usuarioAtual()?.ehBarbeiro
                    ? agendamento.cliente?.nome
                    : agendamento.barbeiro?.nome
                }}
              </td>
              <td>
                <p-tag
                  [value]="
                    hasAppointmentPassed(agendamento.dataHora)
                      ? 'Realizado'
                      : 'Agendado'
                  "
                  [severity]="
                    hasAppointmentPassed(agendamento.dataHora)
                      ? 'success'
                      : 'info'
                  "
                ></p-tag>
              </td>
              <td>
                <button
                  pButton
                  icon="pi pi-times"
                  class="p-button-rounded p-button-danger p-button-sm ml-3"
                  (click)="confirmCancellation(agendamento)"
                  [disabled]="
                    hasAppointmentPassed(agendamento.dataHora) || cancelando()
                  "
                  pTooltip="Cancelar agendamento"
                  tooltipPosition="top"
                ></button>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>

      @if (agendamentos().length === 0) {
      <div class="text-center py-4 text-gray-500">
        Você ainda não possui agendamentos.
      </div>
      } }
    </div>

    @defer {
    <p-toast position="top-right"></p-toast>
    <p-confirmDialog
      header="Cancelar Agendamento"
      icon="pi pi-exclamation-triangle"
    >
      <ng-template pTemplate="footer">
        <button
          pButton
          icon="pi pi-times"
          label="Não"
          class="p-button-text"
          (click)="confirmationService.close()"
        ></button>
        <button
          pButton
          icon="pi pi-check"
          label="Sim"
          (click)="cancelAppointment()"
        ></button>
      </ng-template>
    </p-confirmDialog>
    }
  `,
})
export class MeusAgendamentosComponent implements OnInit {
  private agendamentoService = inject(AgendamentoService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  public confirmationService = inject(ConfirmationService);

  agendamentos = signal<Agendamento[]>([]);
  agendamentosOrdenados = signal<Agendamento[]>([]);
  carregando = signal<boolean>(false);
  cancelando = signal<boolean>(false);
  usuarioAtual = signal<Usuario | null>(null);
  agendamentoParaCancelar: Agendamento | null = null;

  ngOnInit() {
    const usuario = this.authService.getCurrentUser();
    if (usuario) {
      this.usuarioAtual.set(usuario);
      this.loadUserAppointments();
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Usuário não autenticado',
      });
    }
  }

  loadUserAppointments() {
    const usuario = this.usuarioAtual();
    if (!usuario || !usuario.id) return;

    this.carregando.set(true);
    this.agendamentoService
      .getAgendamentosUsuario(usuario.id)
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: (agendamentos) => {
          this.agendamentos.set(agendamentos);
          this.sortAppointments();
        },
        error: (err) => {
          console.error('Erro ao carregar agendamentos:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possível carregar seus agendamentos.',
          });
        },
      });
  }

  sortAppointments() {
    const hoje = new Date();

    const agendamentosFuturos = this.agendamentos()
      .filter(
        (agendamento) =>
          agendamento.dataHora && new Date(agendamento.dataHora) >= hoje
      )
      .sort((a, b) => {
        const dataA = a.dataHora ? new Date(a.dataHora).getTime() : 0;
        const dataB = b.dataHora ? new Date(b.dataHora).getTime() : 0;
        return dataA - dataB;
      });

    const agendamentosPassados = this.agendamentos()
      .filter(
        (agendamento) =>
          agendamento.dataHora && new Date(agendamento.dataHora) < hoje
      )
      .sort((a, b) => {
        const dataA = a.dataHora ? new Date(a.dataHora).getTime() : 0;
        const dataB = b.dataHora ? new Date(b.dataHora).getTime() : 0;
        return dataB - dataA;
      });

    this.agendamentosOrdenados.set([
      ...agendamentosFuturos,
      ...agendamentosPassados,
    ]);
  }

  formatDate(data: string | Date): string {
    if (!data) return '';

    const dataObj = new Date(data);
    return dataObj.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  hasAppointmentPassed(data: string | Date): boolean {
    if (!data) return false;

    const dataAgendamento = new Date(data);
    const hoje = new Date();

    return dataAgendamento < hoje;
  }

  confirmCancellation(agendamento: Agendamento) {
    this.agendamentoParaCancelar = agendamento;
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja cancelar este agendamento?',
      accept: () => this.cancelAppointment(),
      reject: () => this.rejectAppointment(),
    });
  }

  cancelAppointment() {
    if (!this.agendamentoParaCancelar || !this.agendamentoParaCancelar.id)
      return;

    this.cancelando.set(true);
    this.confirmationService.close();
    this.agendamentoService
      .cancelarAgendamento(this.agendamentoParaCancelar.id)
      .pipe(finalize(() => this.cancelando.set(false)))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Agendamento cancelado com sucesso!',
          });
          this.loadUserAppointments();
          this.agendamentoParaCancelar = null;
        },
        error: (err) => {
          console.error('Erro ao cancelar agendamento:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possível cancelar o agendamento. Tente novamente.',
          });
        },
      });
  }

  rejectAppointment() {
    this.agendamentoParaCancelar = null;
  }
}

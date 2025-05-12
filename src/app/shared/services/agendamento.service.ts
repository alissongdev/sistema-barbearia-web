import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HorarioDisponivel } from '../models/horario-disponivel.model';
import { Agendamento } from '../models/agendamento.model';

@Injectable({
  providedIn: 'root',
})
export class AgendamentoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api';

  fetchAvailableTimes(data: Date): Observable<HorarioDisponivel[]> {
    const formattedDate = data.toISOString();
    return this.http.get<HorarioDisponivel[]>(
      `${this.baseUrl}/Agendamentos/horarios-disponiveis?data=${formattedDate}`
    );
  }

  createAppointment(agendamento: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/Agendamentos`, agendamento);
  }

  fetchUserAppointments(usuarioId: string): Observable<Agendamento[]> {
    return this.http.get<Agendamento[]>(
      `${this.baseUrl}/Agendamentos/usuario/${usuarioId}`
    );
  }

  cancelAppointment(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/Agendamentos/${id}`);
  }
}

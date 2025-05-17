import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HorarioDisponivel } from '../models/horario-disponivel.model';
import { Agendamento } from '../models/agendamento.model';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class AgendamentoService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(API_CONFIG);

  fetchAvailableTimes(data: Date): Observable<HorarioDisponivel[]> {
    const formattedDate = data.toISOString();
    return this.http.get<HorarioDisponivel[]>(
      `${this.apiConfig.baseUrl}/Agendamentos/horarios-disponiveis?data=${formattedDate}`
    );
  }

  createAppointment(agendamento: any): Observable<any> {
    return this.http.post(
      `${this.apiConfig.baseUrl}/Agendamentos`,
      agendamento
    );
  }

  fetchUserAppointments(usuarioId: string): Observable<Agendamento[]> {
    return this.http.get<Agendamento[]>(
      `${this.apiConfig.baseUrl}/Agendamentos/usuario/${usuarioId}`
    );
  }

  cancelAppointment(id: string): Observable<any> {
    return this.http.delete(`${this.apiConfig.baseUrl}/Agendamentos/${id}`);
  }
}

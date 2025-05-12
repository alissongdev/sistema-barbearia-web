import { Agendamento } from './agendamento.model';

export interface Usuario {
  id?: string;
  nome?: string;
  email?: string;
  ehBarbeiro: boolean;
  agendamentos?: Agendamento[];
}

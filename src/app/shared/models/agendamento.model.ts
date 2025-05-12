import { Usuario } from './usuario.model';

export interface Agendamento {
  id?: string;
  clienteId?: string;
  barbeiroId?: string;
  dataHora?: Date;
  cliente?: Usuario;
  barbeiro?: Usuario;
}

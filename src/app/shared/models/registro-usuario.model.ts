export interface RegistroUsuarioDto {
  nome: string;
  email: string;
  senha: string;
  ehBarbeiro: boolean;
}

export interface RegistroResponseDto {
  id: string;
  nome: string;
  email: string;
  ehBarbeiro: boolean;
}

export interface Usuario {
  id: string
  nome: string
  email: string
  criadoEm: string
}

export interface RespostaAuth {
  token: string
  usuario: Usuario
}
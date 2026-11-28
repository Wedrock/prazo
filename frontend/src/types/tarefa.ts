export type Prioridade = 'BAIXA' | 'MEDIA' | 'ALTA'

export type Status = 'A_FAZER' | 'FAZENDO' | 'FEITO'

export interface Tarefa {
  id: string
  titulo: string
  descricao: string | null
  prazo: string
  prioridade: Prioridade
  categoria: string | null
  status: Status
  criadoEm: string
  atualizadoEm: string
}
import { Prioridade, Prisma, Status } from "@prisma/client";
import { prisma } from "../prisma";
import { ErroApp } from "../middlewares/tratarErros";

export type DadosTarefa = {
  titulo: string;
  descricao?: string | null;
  prazo: Date;
  prioridade?: Prioridade;
  categoria?: string | null;
  status?: Status;
};

export type FiltrosTarefa = {
  categoria?: string;
  prioridade?: Prioridade;
};

export async function listar(usuarioId: string, filtros: FiltrosTarefa) {
  const where: Prisma.TarefaWhereInput = { usuarioId };

  if (filtros.prioridade) where.prioridade = filtros.prioridade;
  if (filtros.categoria) {
    where.categoria = { equals: filtros.categoria, mode: "insensitive" };
  }

  return prisma.tarefa.findMany({
    where,
    // No Postgres o enum segue a ordem de declaração, então "desc" põe ALTA antes de BAIXA
    orderBy: [{ prazo: "asc" }, { prioridade: "desc" }, { criadoEm: "asc" }],
  });
}

// Tarefa de outro usuário responde 404, como se não existisse
export async function buscar(usuarioId: string, id: string) {
  const tarefa = await prisma.tarefa.findFirst({ where: { id, usuarioId } });
  if (!tarefa) {
    throw new ErroApp("Tarefa não encontrada", 404);
  }
  return tarefa;
}

export async function criar(usuarioId: string, dados: DadosTarefa) {
  return prisma.tarefa.create({ data: { ...dados, usuarioId } });
}

export async function atualizar(usuarioId: string, id: string, dados: Partial<DadosTarefa>) {
  await buscar(usuarioId, id);
  return prisma.tarefa.update({ where: { id }, data: dados });
}

export async function excluir(usuarioId: string, id: string) {
  await buscar(usuarioId, id);
  await prisma.tarefa.delete({ where: { id } });
}

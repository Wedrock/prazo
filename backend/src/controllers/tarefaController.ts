import { Request, Response } from "express";
import { Prioridade, Status } from "@prisma/client";
import * as tarefaService from "../services/tarefaService";
import { ErroApp } from "../middlewares/tratarErros";
import { usuarioLogado } from "../middlewares/autenticar";

const PRIORIDADES = Object.values(Prioridade);
const STATUS = Object.values(Status);

// ---------- validação ----------

// Aceita só "AAAA-MM-DD" e guarda à meia-noite UTC (o banco guarda só o dia)
function lerData(valor: unknown, campo: string): Date {
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    throw new ErroApp(`${campo} deve estar no formato AAAA-MM-DD`);
  }
  const data = new Date(`${valor}T00:00:00.000Z`);
  if (Number.isNaN(data.getTime()) || data.toISOString().slice(0, 10) !== valor) {
    throw new ErroApp(`${campo} não é uma data válida`);
  }
  return data;
}

function lerOpcao<T extends string>(valor: unknown, opcoes: T[], campo: string): T {
  if (typeof valor !== "string" || !opcoes.includes(valor.toUpperCase() as T)) {
    throw new ErroApp(`${campo} deve ser um destes: ${opcoes.join(", ")}`);
  }
  return valor.toUpperCase() as T;
}

// Texto opcional: string vazia ou null viram null (apaga o campo)
function lerTextoOpcional(valor: unknown, campo: string): string | null {
  if (valor === null) return null;
  if (typeof valor !== "string") throw new ErroApp(`${campo} deve ser texto`);
  return valor.trim() || null;
}

function lerTitulo(valor: unknown): string {
  const titulo = typeof valor === "string" ? valor.trim() : "";
  if (!titulo) throw new ErroApp("Informe o título da tarefa");
  if (titulo.length > 200) throw new ErroApp("O título pode ter no máximo 200 caracteres");
  return titulo;
}

// Com parcial = true, só valida os campos que vieram (usado no PATCH)
function lerTarefa(corpo: Record<string, unknown>, parcial: boolean) {
  const dados: Partial<tarefaService.DadosTarefa> = {};

  if (!parcial || corpo.titulo !== undefined) dados.titulo = lerTitulo(corpo.titulo);
  if (!parcial || corpo.prazo !== undefined) dados.prazo = lerData(corpo.prazo, "prazo");
  if (corpo.descricao !== undefined) dados.descricao = lerTextoOpcional(corpo.descricao, "descricao");
  if (corpo.categoria !== undefined) dados.categoria = lerTextoOpcional(corpo.categoria, "categoria");
  if (corpo.prioridade !== undefined) {
    dados.prioridade = lerOpcao(corpo.prioridade, PRIORIDADES, "prioridade");
  }
  if (corpo.status !== undefined) dados.status = lerOpcao(corpo.status, STATUS, "status");

  return dados;
}

function corpoDe(request: Request): Record<string, unknown> {
  const corpo = request.body;
  if (!corpo || typeof corpo !== "object" || Array.isArray(corpo)) {
    throw new ErroApp("Envie os dados da tarefa em JSON");
  }
  return corpo;
}

function textoDaQuery(valor: unknown): string | undefined {
  return typeof valor === "string" && valor.trim() ? valor.trim() : undefined;
}

// ---------- handlers ----------

export async function listar(request: Request, response: Response) {
  const q = request.query;
  const filtros: tarefaService.FiltrosTarefa = {};

  const status = textoDaQuery(q.status);
  const prioridade = textoDaQuery(q.prioridade);
  const prazoDe = textoDaQuery(q.prazoDe);
  const prazoAte = textoDaQuery(q.prazoAte);

  if (status) filtros.status = lerOpcao(status, STATUS, "status");
  if (prioridade) filtros.prioridade = lerOpcao(prioridade, PRIORIDADES, "prioridade");
  if (prazoDe) filtros.prazoDe = lerData(prazoDe, "prazoDe");
  if (prazoAte) filtros.prazoAte = lerData(prazoAte, "prazoAte");
  filtros.categoria = textoDaQuery(q.categoria);
  filtros.busca = textoDaQuery(q.busca);

  const tarefas = await tarefaService.listar(usuarioLogado(request), filtros);
  return response.json(tarefas);
}

export async function buscar(request: Request<{ id: string }>, response: Response) {
  const tarefa = await tarefaService.buscar(usuarioLogado(request), request.params.id);
  return response.json(tarefa);
}

export async function criar(request: Request, response: Response) {
  const dados = lerTarefa(corpoDe(request), false) as tarefaService.DadosTarefa;
  const tarefa = await tarefaService.criar(usuarioLogado(request), dados);
  return response.status(201).json(tarefa);
}

export async function atualizar(request: Request<{ id: string }>, response: Response) {
  const dados = lerTarefa(corpoDe(request), true);
  if (Object.keys(dados).length === 0) {
    throw new ErroApp("Envie pelo menos um campo para atualizar");
  }
  const tarefa = await tarefaService.atualizar(usuarioLogado(request), request.params.id, dados);
  return response.json(tarefa);
}

export async function excluir(request: Request<{ id: string }>, response: Response) {
  await tarefaService.excluir(usuarioLogado(request), request.params.id);
  return response.status(204).send();
}

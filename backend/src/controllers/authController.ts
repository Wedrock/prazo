import { Request, Response } from "express";
import * as authService from "../services/authService";
import { ErroApp } from "../middlewares/tratarErros";

function texto(valor: unknown) {
  return typeof valor === "string" ? valor.trim() : "";
}

export async function cadastrar(request: Request, response: Response) {
  const nome = texto(request.body?.nome);
  const email = texto(request.body?.email);
  const senha = typeof request.body?.senha === "string" ? request.body.senha : "";

  if (!nome || !email || !senha) {
    throw new ErroApp("Informe nome, e-mail e senha");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ErroApp("E-mail inválido");
  }
  if (senha.length < 6) {
    throw new ErroApp("A senha precisa ter pelo menos 6 caracteres");
  }

  const resultado = await authService.cadastrar({ nome, email, senha });
  return response.status(201).json(resultado);
}

export async function login(request: Request, response: Response) {
  const email = texto(request.body?.email);
  const senha = typeof request.body?.senha === "string" ? request.body.senha : "";

  if (!email || !senha) {
    throw new ErroApp("Informe e-mail e senha");
  }

  const resultado = await authService.login({ email, senha });
  return response.json(resultado);
}

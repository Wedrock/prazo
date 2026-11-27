import { NextFunction, Request, Response } from "express";

export class ErroApp extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

export function tratarErros(
  erro: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction,
) {
  if (erro instanceof ErroApp) {
    return response.status(erro.status).json({ erro: erro.message });
  }

  console.error(erro);
  return response.status(500).json({ erro: "Erro interno do servidor" });
}

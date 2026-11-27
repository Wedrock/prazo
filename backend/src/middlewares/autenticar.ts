import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { ErroApp } from "./tratarErros";

declare global {
  namespace Express {
    interface Request {
      usuarioId?: string;
    }
  }
}

export function autenticar(request: Request, _response: Response, next: NextFunction) {
  const cabecalho = request.headers.authorization;
  const [tipo, token] = cabecalho?.split(" ") ?? [];

  if (tipo !== "Bearer" || !token) {
    throw new ErroApp("Token não informado", 401);
  }

  try {
    const { sub } = jwt.verify(token, config.jwtSecret);
    if (typeof sub !== "string") throw new Error();
    request.usuarioId = sub;
  } catch {
    throw new ErroApp("Token inválido ou expirado", 401);
  }

  next();
}

export function usuarioLogado(request: Request): string {
  if (!request.usuarioId) {
    throw new ErroApp("Token não informado", 401);
  }
  return request.usuarioId;
}

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";
import { config } from "../config";
import { ErroApp } from "../middlewares/tratarErros";

type DadosCadastro = { nome: string; email: string; senha: string };
type DadosLogin = { email: string; senha: string };

function gerarToken(usuarioId: string) {
  return jwt.sign({}, config.jwtSecret, {
    subject: usuarioId,
    expiresIn: config.jwtExpiraEm,
  });
}

export async function cadastrar({ nome, email, senha }: DadosCadastro) {
  const emailNormalizado = email.trim().toLowerCase();

  const existente = await prisma.usuario.findUnique({
    where: { email: emailNormalizado },
  });
  if (existente) {
    throw new ErroApp("Este e-mail já está cadastrado", 409);
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  const usuario = await prisma.usuario.create({
    data: { nome: nome.trim(), email: emailNormalizado, senha: senhaHash },
    select: { id: true, nome: true, email: true, criadoEm: true },
  });

  return { token: gerarToken(usuario.id), usuario };
}

export async function login({ email, senha }: DadosLogin) {
  const usuario = await prisma.usuario.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  // Mesma mensagem para e-mail inexistente e senha errada: não revela quais e-mails existem
  const senhaConfere = usuario ? await bcrypt.compare(senha, usuario.senha) : false;
  if (!usuario || !senhaConfere) {
    throw new ErroApp("E-mail ou senha inválidos", 401);
  }

  const { senha: _senha, ...usuarioSemSenha } = usuario;
  return { token: gerarToken(usuario.id), usuario: usuarioSemSenha };
}

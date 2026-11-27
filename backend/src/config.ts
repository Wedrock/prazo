import "dotenv/config";

function obrigatoria(nome: string): string {
  const valor = process.env[nome];
  if (!valor) {
    throw new Error(`Variável de ambiente ${nome} não definida no .env`);
  }
  return valor;
}

export const config = {
  porta: Number(process.env.PORT ?? 3333),
  jwtSecret: obrigatoria("JWT_SECRET"),
  jwtExpiraEm: "7d",
} as const;

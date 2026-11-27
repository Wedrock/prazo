import express from "express";
import cors from "cors";
import { config } from "./config";
import { authRoutes } from "./routes/authRoutes";
import { tarefaRoutes } from "./routes/tarefaRoutes";
import { tratarErros } from "./middlewares/tratarErros";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.use("/auth", authRoutes);
app.use("/tarefas", tarefaRoutes);

// Precisa vir depois das rotas
app.use(tratarErros);

app.listen(config.porta, () => {
  console.log(`API rodando na porta ${config.porta}`);
});

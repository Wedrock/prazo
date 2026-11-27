import { Router } from "express";
import * as tarefaController from "../controllers/tarefaController";
import { autenticar } from "../middlewares/autenticar";

export const tarefaRoutes = Router();

// Todas as rotas de tarefas exigem token
tarefaRoutes.use(autenticar);

tarefaRoutes.get("/", tarefaController.listar);
tarefaRoutes.get("/:id", tarefaController.buscar);
tarefaRoutes.post("/", tarefaController.criar);
tarefaRoutes.patch("/:id", tarefaController.atualizar);
tarefaRoutes.delete("/:id", tarefaController.excluir);

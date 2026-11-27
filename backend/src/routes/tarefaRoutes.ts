import { Router } from "express";
import * as tarefaController from "../controllers/tarefaController";
import { autenticar } from "../middlewares/autenticar";

export const tarefaRoutes = Router();

tarefaRoutes.use(autenticar);

tarefaRoutes.get("/", tarefaController.listar);
tarefaRoutes.post("/", tarefaController.criar);
tarefaRoutes.patch("/:id", tarefaController.atualizar);
tarefaRoutes.delete("/:id", tarefaController.excluir);

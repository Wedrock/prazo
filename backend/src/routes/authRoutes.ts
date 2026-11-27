import { Router } from "express";
import * as authController from "../controllers/authController";

export const authRoutes = Router();

authRoutes.post("/cadastro", authController.cadastrar);
authRoutes.post("/login", authController.login);

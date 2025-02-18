import { Router } from "express";
import { UsuariosController } from "../controllers/auth/UsuariosController";

const UsuariosRouter = Router();
const usuariosController = new UsuariosController();

UsuariosRouter.post("", usuariosController.create);
UsuariosRouter.post("/login", usuariosController.login);

export default UsuariosRouter;

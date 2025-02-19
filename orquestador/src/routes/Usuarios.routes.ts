import { Router } from "express";
import { UsuariosController } from "../controllers/auth/UsuariosController";
import { Authorization } from "../middlewares/Authorization";

const UsuariosRouter = Router();
const usuariosController = new UsuariosController();

UsuariosRouter.get("", usuariosController.listar);
UsuariosRouter.post("", Authorization, usuariosController.create);
UsuariosRouter.post("/login", usuariosController.login);
UsuariosRouter.post("/validate", usuariosController.validate);
export default UsuariosRouter;

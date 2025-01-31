
import { Router } from "express";
import MensajesController from "../controllers/mensajes/MensajesController";

const MensajesRouter = Router();
const mensajeController = new MensajesController();

MensajesRouter.get("", mensajeController.listar);
MensajesRouter.post("", mensajeController.create);
MensajesRouter.delete("/:id", mensajeController.delete);

export default MensajesRouter;
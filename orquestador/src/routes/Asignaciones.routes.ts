import { Router } from "express";
import { AsignacionesController } from "../controllers/asignaciones/AsignacionesController";


const AsignacionesRouter = Router();
const asignacionesController = new AsignacionesController()

AsignacionesRouter.post("", asignacionesController.sendAsignaciones);
AsignacionesRouter.post("failmessage", asignacionesController.FailMessage)
AsignacionesRouter.post("/programacion", asignacionesController.ProgramarAsignacion)
export default AsignacionesRouter;
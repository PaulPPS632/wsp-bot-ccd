import { Router } from "express";
import { AsignacionesController } from "../controllers/asignaciones/AsignacionesController";
import { Authorization } from "../middlewares/Authorization";


const AsignacionesRouter = Router();
const asignacionesController = new AsignacionesController()

AsignacionesRouter.post("", Authorization,asignacionesController.sendAsignaciones);
AsignacionesRouter.post("/failmessage", asignacionesController.FailMessage);
AsignacionesRouter.post("/programacion", asignacionesController.ProgramarAsignacion);
export default AsignacionesRouter;
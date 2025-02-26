
import { Router } from "express";
import MasivosController from "../controllers/masivos/MasivosController";
import { Authorization } from "../middlewares/Authorization";

const MasivosRouter = Router();
const masivosController = new MasivosController();

MasivosRouter.post("", Authorization,masivosController.SendMasivos);
MasivosRouter.post("/excel", Authorization,masivosController.SendMasivosExcel);
MasivosRouter.post("/failmessage", masivosController.FailMessage);

export default MasivosRouter;
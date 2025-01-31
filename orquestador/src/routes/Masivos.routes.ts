
import { Router } from "express";
import MasivosController from "../controllers/masivos/MasivosController";

const MasivosRouter = Router();
const masivosController = new MasivosController();

MasivosRouter.post("", masivosController.SendMasivos);
MasivosRouter.post("/failmessage", masivosController.FailMessage);

export default MasivosRouter;
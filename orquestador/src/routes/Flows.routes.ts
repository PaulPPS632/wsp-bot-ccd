import { Router } from "express";
import FlowsController from "../controllers/flows/FlowsController";

const FlowsRouter = Router();
const flowsController = new FlowsController();

FlowsRouter.get("", flowsController.listar);
FlowsRouter.post("", flowsController.create);
FlowsRouter.delete("/:id", flowsController.delete);

export default FlowsRouter;

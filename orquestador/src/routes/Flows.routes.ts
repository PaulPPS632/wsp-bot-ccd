import { Router } from "express";
import FlowsController from "../controllers/flows/FlowsController";

const FlowsRouter = Router();
const flowsController = new FlowsController();

FlowsRouter.get("", flowsController.listar);
FlowsRouter.get("/:id", flowsController.getById);
FlowsRouter.post("", flowsController.create);
FlowsRouter.delete("/:id", flowsController.delete);
FlowsRouter.post("/search", flowsController.search);
FlowsRouter.put("/:id", flowsController.update);
export default FlowsRouter;

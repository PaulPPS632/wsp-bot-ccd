import { Router } from "express";
import BotController from "../controllers/bot/BotController";

const BotRouter = Router();
const botController = new BotController();

BotRouter.get("", botController.getBots);
BotRouter.get("/stopAll", botController.stopBots);
BotRouter.get("/startAll", botController.startBots);
BotRouter.post("", botController.createBot);
BotRouter.post("/codigo", botController.getBotCodigo);
BotRouter.post("/start", botController.startBotbyContainerID);
BotRouter.post("/stop", botController.stopBotbyContainerID);
BotRouter.get("/ultimo", botController.getprueba)
BotRouter.post("/search", botController.search);
BotRouter.delete("/deletecache/:id", botController.deleteCache);
export default BotRouter;
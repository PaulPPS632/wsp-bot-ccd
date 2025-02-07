"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const BotController_1 = __importDefault(require("../controllers/bot/BotController"));
const BotRouter = (0, express_1.Router)();
const botController = new BotController_1.default();
BotRouter.get("", botController.getBots);
BotRouter.get("/stopAll", botController.stopBots);
BotRouter.get("/startAll", botController.startBots);
BotRouter.post("", botController.createBot);
BotRouter.post("/codigo", botController.getBotCodigo);
BotRouter.post("/start", botController.startBotbyContainerID);
BotRouter.post("/stop", botController.stopBotbyContainerID);
BotRouter.get("/ultimo", botController.getprueba);
exports.default = BotRouter;

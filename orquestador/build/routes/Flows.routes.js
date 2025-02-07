"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const FlowsController_1 = __importDefault(require("../controllers/flows/FlowsController"));
const FlowsRouter = (0, express_1.Router)();
const flowsController = new FlowsController_1.default();
FlowsRouter.get("", flowsController.listar);
FlowsRouter.post("", flowsController.create);
FlowsRouter.delete("/:id", flowsController.delete);
exports.default = FlowsRouter;

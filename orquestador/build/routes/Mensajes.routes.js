"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const MensajesController_1 = __importDefault(require("../controllers/mensajes/MensajesController"));
const MensajesRouter = (0, express_1.Router)();
const mensajeController = new MensajesController_1.default();
MensajesRouter.get("", mensajeController.listar);
MensajesRouter.post("", mensajeController.create);
MensajesRouter.delete("/:id", mensajeController.delete);
exports.default = MensajesRouter;

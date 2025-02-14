"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AsignacionesController_1 = require("../controllers/asignaciones/AsignacionesController");
const AsignacionesRouter = (0, express_1.Router)();
const asignacionesController = new AsignacionesController_1.AsignacionesController();
AsignacionesRouter.post("", asignacionesController.sendAsignaciones);
AsignacionesRouter.post("/failmessage", asignacionesController.FailMessage);
AsignacionesRouter.post("/programacion", asignacionesController.ProgramarAsignacion);
exports.default = AsignacionesRouter;

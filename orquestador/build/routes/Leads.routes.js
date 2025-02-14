"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const LeadsController_1 = __importDefault(require("../controllers/leads/LeadsController"));
const LeadsRouter = (0, express_1.Router)();
const leadsController = new LeadsController_1.default();
LeadsRouter.post("", leadsController.RegisterLead);
LeadsRouter.get("", leadsController.getbytNumber);
LeadsRouter.put("", leadsController.updatebynumber);
LeadsRouter.get("/excel", leadsController.downloadExcel);
LeadsRouter.get("/leadsrestantes", leadsController.cantRestanteParaMasivos);
exports.default = LeadsRouter;

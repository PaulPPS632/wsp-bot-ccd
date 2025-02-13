
import { Router } from "express";
import LeadsController from "../controllers/leads/LeadsController";

const LeadsRouter = Router();
const leadsController = new LeadsController();

LeadsRouter.post("", leadsController.RegisterLead);
LeadsRouter.get("", leadsController.getbytNumber);
LeadsRouter.put("", leadsController.updatebynumber);
LeadsRouter.get("/excel", leadsController.downloadExcel);
LeadsRouter.get("/leadsrestantes", leadsController.cantRestanteParaMasivos);

export default LeadsRouter;
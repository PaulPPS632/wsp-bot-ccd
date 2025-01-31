
import { Router } from "express";
import LeadsController from "../controllers/leads/LeadsController";

const LeadsRouter = Router();
const leadsController = new LeadsController();

LeadsRouter.post("", leadsController.RegisterLead);


export default LeadsRouter;
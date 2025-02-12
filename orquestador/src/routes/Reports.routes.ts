
import { Router } from "express";
import { ReportsController } from "../controllers/Reports/ReportsController";

const ReportsRouter = Router();
const reportsController = new ReportsController();
ReportsRouter.get("/asignaciones", reportsController.ReporteAsignacion);
ReportsRouter.get("/masivos", reportsController.ReporteMasivos);
ReportsRouter.get("/leadsinteresados", reportsController.LeadsInteresados);
export default ReportsRouter;

import { Router } from "express";
import { ReportsController } from "../controllers/Reports/ReportsController";

const ReportsRouter = Router();
const reportsController = new ReportsController();
ReportsRouter.get("/asignaciones", reportsController.ReporteAsignacion);
ReportsRouter.get("/masivos", reportsController.ReporteMasivos);
ReportsRouter.get("/leadsinteresados/:id", reportsController.LeadsInteresados);
ReportsRouter.get("/leadsasignaciones/:id", reportsController.LeadsAsignacion);

ReportsRouter.post("/cantmensajes", reportsController.cantMensajes);
ReportsRouter.get("/masivosxdia", reportsController.cantMasivosPorDia);
ReportsRouter.post("/asignacionesxusuario", reportsController.AsignacionesxUsuario2);
ReportsRouter.get("/cantinteresados", reportsController.cantInteresadosPorDiav2);

export default ReportsRouter;
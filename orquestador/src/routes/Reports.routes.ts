
import { Router } from "express";
import { ReportsController } from "../controllers/Reports/ReportsController";

const ReportsRouter = Router();
const reportsController = new ReportsController();
ReportsRouter.get("/asignaciones", reportsController.ReporteAsignacion);
ReportsRouter.get("/masivos", reportsController.ReporteMasivos);
ReportsRouter.get("/leadsinteresados/:id", reportsController.LeadsInteresados);
ReportsRouter.get("/leadsasignaciones/:id", reportsController.LeadsAsignacion);

ReportsRouter.get("/totalmensajes", reportsController.cantMensajesDelDia);
ReportsRouter.get("/mensajesenviados", reportsController.cantMensajesEnviadosDelDia);
ReportsRouter.get("/mensajespendientes", reportsController.cantMensajesPendientesDelDia);
ReportsRouter.get("/mensajeserror", reportsController.cantMensajesErrorDelDia);
ReportsRouter.get("/asignacionesxusuario", reportsController.AsignacionesxUsuario);

export default ReportsRouter;
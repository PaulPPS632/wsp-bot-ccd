import express, { Application } from "express";
import cors from "cors";
import BotRouter from "./routes/Bot.routes";
import MasivosRouter from "./routes/Masivos.routes";
import LeadsRouter from "./routes/Leads.routes";
import FlowsRouter from "./routes/Flows.routes";
import AsignacionesRouter from "./routes/Asignaciones.routes";
import ReportsRouter from "./routes/Reports.routes";
import UsuariosRouter from "./routes/Usuarios.routes";
class App {
    private server: Application;
    constructor() {
      this.server = express();
      this.middlewares();
      this.routes();
    }
    private middlewares(): void {
      this.server.use(
        cors()
      );
      this.server.use(express.json());
      //this.server.use("/documentation", swaggerUi.serve, swaggerUi.setup(swaggerSetup))
    }
    private routes(): void {
      // Configuración de rutas
      //this.server.use("/api", UserRoutes);
      this.server.use("/api/usuarios", UsuariosRouter);
      this.server.use("/api/bots", BotRouter);
      this.server.use("/api/masivos", MasivosRouter);
      this.server.use("/api/leads", LeadsRouter);
      this.server.use("/api/flows", FlowsRouter);
      this.server.use("/api/asignaciones", AsignacionesRouter)
      this.server.use("/api/reports", ReportsRouter);
    }
    public getServer(): Application {
      return this.server;
    }
  }
  
  export default new App().getServer();
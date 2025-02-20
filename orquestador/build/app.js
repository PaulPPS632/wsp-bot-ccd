"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const Bot_routes_1 = __importDefault(require("./routes/Bot.routes"));
const Masivos_routes_1 = __importDefault(require("./routes/Masivos.routes"));
const Leads_routes_1 = __importDefault(require("./routes/Leads.routes"));
const Flows_routes_1 = __importDefault(require("./routes/Flows.routes"));
const Asignaciones_routes_1 = __importDefault(require("./routes/Asignaciones.routes"));
const Reports_routes_1 = __importDefault(require("./routes/Reports.routes"));
const Usuarios_routes_1 = __importDefault(require("./routes/Usuarios.routes"));
//import { Authorization } from "./middlewares/Authorization";
class App {
    constructor() {
        this.server = (0, express_1.default)();
        this.middlewares();
        this.routes();
    }
    middlewares() {
        this.server.use((0, cors_1.default)());
        this.server.use(express_1.default.json());
        //this.server.use("/documentation", swaggerUi.serve, swaggerUi.setup(swaggerSetup))
    }
    routes() {
        // Configuración de rutas
        //this.server.use("/api", UserRoutes);
        this.server.use("/api/auth", Usuarios_routes_1.default);
        //this.server.use(Authorization);
        this.server.use("/api/bots", Bot_routes_1.default);
        this.server.use("/api/masivos", Masivos_routes_1.default);
        this.server.use("/api/leads", Leads_routes_1.default);
        this.server.use("/api/flows", Flows_routes_1.default);
        this.server.use("/api/asignaciones", Asignaciones_routes_1.default);
        this.server.use("/api/reports", Reports_routes_1.default);
    }
    getServer() {
        return this.server;
    }
}
exports.default = new App().getServer();

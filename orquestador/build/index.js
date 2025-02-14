"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const database_1 = __importDefault(require("./config/database"));
const app_1 = __importDefault(require("./app"));
const RabbitMQService_1 = __importDefault(require("./services/RabbitMQService"));
const GoogleSheet_1 = require("./services/GoogleSheet");
const http_1 = require("http");
const WebSocketBots_1 = require("./services/WebSocketBots");
const bullmq_1 = require("bullmq");
const redisconfig_1 = require("./config/redisconfig");
const SendAsignacionProgramada_1 = require("./services/SendAsignacionProgramada");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //sincronizacion con db
            yield database_1.default.sync();
            // Inicialización del servidor
            const httpServer = (0, http_1.createServer)(app_1.default);
            //inizializacion del websocket
            const timeout = process.env.TIMEOUT_WEBSOCKET || 10000;
            new WebSocketBots_1.WebSocketBots(httpServer, Number(timeout));
            //coneccion con rabbitmq
            yield RabbitMQService_1.default.getInstance();
            //coneccion con googlesheet
            yield GoogleSheet_1.GoogleSheet.getInstance(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL, process.env.GOOGLE_PRIVATE_KEY, (sheetInstance) => __awaiter(this, void 0, void 0, function* () {
                console.log("Hoja cargada:", sheetInstance.getDoc().title);
            }));
            new bullmq_1.Worker("taskQueue", (job) => __awaiter(this, void 0, void 0, function* () {
                console.log(`✅ Ejecutando tarea #${job.id} - ${new Date().toISOString()}`);
                yield (0, SendAsignacionProgramada_1.sendAsignacionProgramada)(job.data);
            }), { connection: redisconfig_1.connection });
            //escucha del servidor en puerto 8000
            httpServer.listen(8000, '0.0.0.0', () => {
                console.log(`Server is running on http://localhost:8000`);
            });
        }
        catch (error) {
            console.error("Error during application initialization:", error);
            process.exit(1); // Salir del proceso si ocurre un error crítico
        }
    });
}
main();

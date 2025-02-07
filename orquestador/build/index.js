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
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //const PORT = process.env.PORT ?? 8000;
            //sincronizacion de base de datos
            yield database_1.default.sync();
            // Inicialización del servidor
            //await RabbitMQService.
            const rabbitMQ = RabbitMQService_1.default.getInstance();
            yield rabbitMQ.init();
            app_1.default.listen(8000, '0.0.0.0', () => {
                //console.log(`Server is running on http://localhost:${PORT}`);
                console.log(`Server is running on http://localhost:8000`);
            });
            /*
            process.on("SIGINT", async () => {
                console.log("Cerrando RabbitMQ...");
                await rabbitMQ.closeRabbitMQ();
                process.exit(0);
              });
            */
        }
        catch (error) {
            console.error("Error during application initialization:", error);
            process.exit(1); // Salir del proceso si ocurre un error crítico
        }
    });
}
main();

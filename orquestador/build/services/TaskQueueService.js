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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskQueueService = void 0;
const bullmq_1 = require("bullmq");
const redisconfig_1 = require("../config/redisconfig");
class TaskQueueService {
    constructor() {
        this.queue = new bullmq_1.Queue("taskQueue", { connection: redisconfig_1.connection });
    }
    // Programar una tarea para ejecución futura
    scheduleTask(fecha, asignacionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const fechaEjecucion = new Date(fecha);
            if (isNaN(fechaEjecucion.getTime())) {
                throw new Error("Fecha inválida");
            }
            const delay = fechaEjecucion.getTime() - Date.now();
            console.log("delay para esperar a envio", delay);
            if (delay <= 0) {
                throw new Error("La fecha debe ser futura");
            }
            console.log("--------------------------------");
            console.log("programando tarea");
            // Agregar la tarea con retraso programado
            const job = yield this.queue.add("ejecutarFuncion", { asignacionId }, { delay });
            return job.id;
        });
    }
}
exports.TaskQueueService = TaskQueueService;

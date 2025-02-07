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
const Leads_1 = require("../../models/Leads");
const RabbitMQService_1 = __importDefault(require("../../services/RabbitMQService"));
class MasivosController {
    constructor() {
        this.SendMasivos = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { masivos } = req.body;
            try {
                // Obtener bots y bases desde la base de datos
                const bases = yield Leads_1.Leads.findAll({
                    where: {
                        status: false,
                    },
                    limit: masivos.cant,
                });
                if (!bases || bases.length === 0) {
                    return res
                        .status(404)
                        .json({ error: "No se encontraron bases para enviar masivos" });
                }
                const numbers = bases.map((base) => base.number);
                if (numbers.length === 0) {
                    return res
                        .status(404)
                        .json({ error: "No hay números disponibles para asignar" });
                }
                // Enviar mensaje a la cola para cada número
                const rabbitMQ = RabbitMQService_1.default.getInstance();
                yield rabbitMQ.init();
                for (const number of numbers) {
                    const queue = "bases";
                    const cantdelay = (Math.floor(Math.random() * (masivos.delaymax - masivos.delaymin + 1)) + masivos.delaymin) * 1000;
                    let randomIndex = Math.floor(Math.random() * masivos.flows.length);
                    let flowAleatorio = masivos.flows[randomIndex];
                    const message = { number: number, delai: cantdelay, flow: flowAleatorio };
                    // Enviar mensaje a la cola "bases"
                    yield rabbitMQ.sendMessage(queue, JSON.stringify(message));
                    yield Leads_1.Leads.update({
                        flowId: flowAleatorio.id,
                        status: true
                    }, { where: {
                            number: number
                        } });
                }
                // Actualizar el estado de todas las bases a 'true'
                if (numbers.length > 0) {
                    yield Leads_1.Leads.update({ status: true }, { where: { number: numbers } });
                }
                res
                    .status(200)
                    .json({ message: "se registraron correctamente los queues" });
            }
            catch (error) {
                console.error("Error al procesar los masivos:", error);
                res
                    .status(500)
                    .json({ error: "Ocurrió un error al procesar la solicitud" });
            }
        });
        this.FailMessage = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { number } = req.body;
            yield Leads_1.Leads.update({
                status: false,
            }, {
                where: {
                    number: number,
                },
            });
            return res.status(200).json();
        });
    }
}
exports.default = MasivosController;

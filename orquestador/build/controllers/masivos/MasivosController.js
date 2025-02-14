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
const MasivoLead_1 = require("../../models/MasivoLead");
const Masivos_1 = require("../../models/Masivos");
const RabbitMQService_1 = __importDefault(require("../../services/RabbitMQService"));
class MasivosController {
    constructor() {
        this.SendMasivos = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { masivos } = req.body;
            try {
                // Obtener bots y bases desde la base de datos
                const leads = yield Leads_1.Leads.findAll({
                    where: {
                        status: false,
                    },
                    limit: masivos.cant,
                });
                if (!leads || leads.length === 0) {
                    return res
                        .status(404)
                        .json({ error: "No se encontraron leads para enviar masivos" });
                }
                // Enviar mensaje a la cola para cada número
                const rabbitMQ = yield RabbitMQService_1.default.getInstance();
                //registrando masivo
                const nuevoMasivo = yield Masivos_1.Masivos.create({
                    name: masivos.name,
                    amountsend: masivos.cant,
                    delaymin: masivos.delaymin,
                    delaymax: masivos.delaymax,
                });
                // Registrar relación con flows
                if (masivos.flows && masivos.flows.length > 0) {
                    yield nuevoMasivo.$set("flows", masivos.flows.map((flow) => flow.id));
                }
                for (const lead of leads) {
                    const queue = "bases";
                    const cantdelay = (Math.floor(Math.random() * (masivos.delaymax - masivos.delaymin + 1)) + masivos.delaymin) * 1000;
                    let randomIndex = Math.floor(Math.random() * masivos.flows.length);
                    let flowAleatorio = masivos.flows[randomIndex];
                    const message = { number: lead.number, delai: cantdelay, flow: flowAleatorio };
                    // Enviar mensaje a la cola "bases"
                    yield rabbitMQ.sendMessage(queue, JSON.stringify(message));
                    yield Leads_1.Leads.update({
                        flowId: flowAleatorio.id,
                        status: true
                    }, { where: {
                            number: lead.number
                        } });
                    yield MasivoLead_1.MasivoLead.create({
                        masivoId: nuevoMasivo.id,
                        leadId: lead.id,
                        status: "ENVIADO"
                    });
                }
                // Actualizar el estado de todas las bases a 'true'
                /*
                if (numbers.length > 0) {
                  await Leads.update({ status: true }, { where: { number: numbers } });
                }*/
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
            try {
                const { number, error } = req.body;
                const lead = yield Leads_1.Leads.findOne({
                    where: {
                        number,
                    },
                });
                if (!lead)
                    return res
                        .status(404)
                        .json({ message: "no se encontro el cliente de este numero" });
                const ultimoMasivo = yield MasivoLead_1.MasivoLead.findOne({
                    where: { leadId: lead.id },
                    order: [["createdAt", "DESC"]], // Ordena por id en orden descendente (el más reciente primero)
                });
                if (!ultimoMasivo) {
                    return res
                        .status(404)
                        .json({
                        message: "No se encontró ningun masivo para este cliente",
                    });
                }
                yield ultimoMasivo.update({
                    status: "error al enviar el mensaje",
                    observacionstatus: error,
                });
                return res.status(200).json();
            }
            catch (error) {
                console.error("Error en FailMessage:", error.message);
                return res
                    .status(500)
                    .json({
                    message: "Error al actualizar la asignación",
                    error: error.message,
                });
            }
        });
    }
}
exports.default = MasivosController;

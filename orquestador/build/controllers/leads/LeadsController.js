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
const temporal_polyfill_1 = require("temporal-polyfill");
const Bot_1 = require("../../models/Bot");
const Flows_1 = require("../../models/Flows");
const Leads_1 = require("../../models/Leads");
const xlsx_1 = __importDefault(require("xlsx"));
const sequelize_1 = require("sequelize");
class LeadsController {
    constructor() {
        this.RegisterLead = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { name, phone, respuesta } = req.body;
                if (respuesta == "interesado") {
                    const bot = yield Bot_1.Bot.findAll({
                        where: {
                            tipo: "responder",
                        },
                        limit: 1,
                    });
                    if (bot) {
                        yield Leads_1.Leads.update({
                            name,
                            number: phone,
                            respuesta,
                        }, {
                            where: {
                                number: phone,
                            },
                        });
                        const lead = yield Leads_1.Leads.findOne({
                            where: { number: phone },
                        });
                        if (lead) {
                            const botResponse = yield fetch(`http://localhost:${bot[0].port}/v1/messages`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    number: phone,
                                    flow: (_a = lead.flowId) !== null && _a !== void 0 ? _a : 0,
                                }),
                            });
                            if (!botResponse.ok) {
                                return res
                                    .status(500)
                                    .json({ error: "No se pudo enviar el mensaje al bot." });
                            }
                        }
                    }
                    else {
                        console.warn("No se encontró un bot disponible del tipo 'responder'.");
                    }
                }
                return res
                    .status(201)
                    .json({ message: "Lead registrado correctamente." });
            }
            catch (error) {
                console.error("Error en el endpoint /bot/register-lead:", error);
                return res.status(500).json({
                    error: "Ocurrió un error interno al procesar la solicitud.",
                });
            }
        });
        this.getbytNumber = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { number } = req.query;
            console.log("el numero:", number);
            const lead = yield Leads_1.Leads.findOne({
                where: {
                    number,
                },
            });
            return res.status(200).json({ lead });
        });
        this.updatebynumber = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { phone, curso } = req.body;
                console.log(phone);
                console.log(curso);
                yield Leads_1.Leads.update({
                    curso,
                }, {
                    where: {
                        number: phone,
                    },
                });
                return res.status(201).json({ message: "actualizado correctamente" });
            }
            catch (error) {
                console.log(error.message);
                return res.status(404).json({ message: "no se encontro el lead" });
            }
        });
        this.downloadExcel = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const time = temporal_polyfill_1.Temporal.Now.plainDateISO().toString();
                console.log(time);
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Inicio del día
                const tomorrow = new Date();
                tomorrow.setHours(24, 0, 0, 0);
                const leads = yield Leads_1.Leads.findAll({
                    where: {
                        updatedAt: {
                            [sequelize_1.Op.between]: [today, tomorrow], // Mayor a hoy a las 00:00:00
                        },
                    },
                    include: [
                        {
                            model: Flows_1.Flows,
                            attributes: ["name"],
                        },
                    ],
                });
                const respuesta = leads.map((lead) => ({
                    nombre: lead.name,
                    telefono: lead.number,
                    flujo: lead.flow.name,
                    curso: lead.curso,
                    estado: lead.respuesta,
                    fechaInteraccion: time,
                }));
                // Crear un nuevo libro de Excel
                const worksheet = xlsx_1.default.utils.json_to_sheet(respuesta);
                const workbook = xlsx_1.default.utils.book_new();
                xlsx_1.default.utils.book_append_sheet(workbook, worksheet, "Leads");
                // Escribir el archivo en un buffer
                const excelBuffer = xlsx_1.default.write(workbook, {
                    bookType: "xlsx",
                    type: "buffer",
                });
                // Configurar encabezados HTTP
                res.setHeader("Content-Disposition", "attachment; filename=leads.xlsx");
                res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
                res.send(excelBuffer);
            }
            catch (error) {
                console.log("error: ", error.message);
                return res
                    .status(400)
                    .json({
                    error: "ocurrio un error en el proceso de generacion del excel",
                });
            }
        });
    }
}
exports.default = LeadsController;

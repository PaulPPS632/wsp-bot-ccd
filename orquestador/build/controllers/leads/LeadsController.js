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
const GoogleSheet_1 = require("../../services/GoogleSheet");
const MasivoLead_1 = require("../../models/MasivoLead");
const Masivos_1 = require("../../models/Masivos");
class LeadsController {
    constructor() {
        this.RegisterLead = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, phone, respuesta } = req.body;
                console.log("=============================================================");
                console.log("hay interaccion");
                console.log("=============================================================");
                const bot = yield Bot_1.Bot.findAll({
                    where: {
                        tipo: "responder",
                    },
                    limit: 1,
                });
                const lead = yield Leads_1.Leads.findOne({
                    where: { number: phone },
                    include: [
                        {
                            model: Flows_1.Flows
                        }
                    ]
                });
                if (bot && lead) {
                    lead.update({
                        name,
                        number: phone,
                        respuesta,
                    });
                    const masivolead = yield MasivoLead_1.MasivoLead.findOne({
                        where: {
                            leadId: lead.id
                        },
                        order: [["createdAt", "DESC"]]
                    });
                    if (masivolead) {
                        yield masivolead.update({ status: respuesta });
                        if (masivolead.status != null) {
                            console.log("=============================================");
                            console.log("AQUI LLEGA -------------------------");
                            console.log("=============================================");
                            yield Masivos_1.Masivos.update({
                                amountinteres: sequelize_1.Sequelize.literal("amountinteres + 1"), //aumentar en 1 al valor actual
                            }, {
                                where: {
                                    id: masivolead.masivoId
                                }
                            });
                        }
                    }
                    const botResponse = yield fetch(`http://localhost:${bot[0].port}/v1/messages`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            number: phone,
                            flow: lead.flow,
                        }),
                    });
                    const sheetInstance = yield GoogleSheet_1.GoogleSheet.getInstance();
                    yield sheetInstance.addRow(phone, 'SIN CURSO SELECCIONADO');
                    if (!botResponse.ok) {
                        return res
                            .status(500)
                            .json({ error: "No se pudo enviar el mensaje al bot." });
                    }
                }
                else {
                    console.warn("No se encontró un bot disponible del tipo 'responder'.");
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
            const lead = yield Leads_1.Leads.findOne({
                where: {
                    number,
                },
                include: [
                    {
                        model: Flows_1.Flows
                    }
                ]
            });
            console.log(lead);
            return res.status(200).json({ lead });
        });
        this.updatebynumber = (req, res) => __awaiter(this, void 0, void 0, function* () {
            //punto final de mi proceso masivo
            try {
                const { phone, curso } = req.body;
                yield Leads_1.Leads.update({
                    curso,
                }, {
                    where: {
                        number: phone,
                    },
                });
                const sheetInstance = yield GoogleSheet_1.GoogleSheet.getInstance();
                yield sheetInstance.addRow(phone, curso);
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
        this.cantRestanteParaMasivos = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const restante = yield Leads_1.Leads.count({ where: { status: false } });
                console.log(restante);
                return res.status(200).json({ cant: restante });
            }
            catch (error) {
                console.log("error al obtener el restante", error);
                return res.status(500).json({ message: "error interno del servidor", error: error.menssage });
            }
        });
    }
}
exports.default = LeadsController;

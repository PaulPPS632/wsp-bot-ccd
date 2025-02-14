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
exports.ReportsController = void 0;
const sequelize_1 = require("sequelize");
const Asignaciones_1 = require("../../models/Asignaciones");
const Flows_1 = require("../../models/Flows");
const Leads_1 = require("../../models/Leads");
const MasivoLead_1 = require("../../models/MasivoLead");
const Masivos_1 = require("../../models/Masivos");
const Bot_1 = require("../../models/Bot");
const AsignacionLead_1 = require("../../models/AsignacionLead");
class ReportsController {
    constructor() {
        this.ReporteMasivos = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            const masivos = yield Masivos_1.Masivos.findAll({
                include: [
                    {
                        model: Flows_1.Flows
                    }
                ],
                limit: 20
            });
            const formattedMasivos = masivos.map(masivo => {
                var _a;
                return ({
                    id: masivo.id,
                    name: masivo.name,
                    amountsend: masivo.amountsend,
                    delaymin: masivo.delaymin,
                    delaymax: masivo.delaymax,
                    amountinteres: masivo.amountinteres,
                    flows: ((_a = masivo.flows) === null || _a === void 0 ? void 0 : _a.map(flow => flow.name)) || [], // Extrae solo los nombres de los Flows,
                    createdAt: masivo.createdAt,
                    updatedAt: masivo.updatedAt
                });
            });
            return res.status(200).json({ masivos: formattedMasivos });
        });
        this.LeadsInteresados = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            if (!id)
                return res.status(500).json({ message: "se necesita un id para consultar" });
            const masivosLead = yield MasivoLead_1.MasivoLead.findAll({
                include: [
                    {
                        model: Masivos_1.Masivos,
                    },
                    {
                        model: Leads_1.Leads,
                        include: [
                            {
                                model: Flows_1.Flows
                            }
                        ]
                    }
                ],
                where: {
                    masivoId: id,
                    [sequelize_1.Op.or]: [
                        { status: { [sequelize_1.Op.like]: 'interesado' } },
                        { status: { [sequelize_1.Op.like]: 'interesado asesor' } }
                    ]
                },
                limit: 100
            });
            const formattedMasivos = masivosLead.map(masivolead => ({
                masivo: masivolead.masivo.name,
                fechaenvio: masivolead.createdAt,
                leadName: masivolead.lead.name,
                leadPhone: masivolead.lead.number,
                leadCurso: masivolead.lead.curso,
                status: masivolead.status
            }));
            return res.status(200).json({ leadsinteresados: formattedMasivos });
        });
        this.ReporteAsignacion = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            const asignaciones = yield Asignaciones_1.Asignaciones.findAll({
                include: [
                    {
                        model: Bot_1.Bot,
                        attributes: ["name", "phone"]
                    }, {
                        model: Flows_1.Flows,
                        attributes: ["name"]
                    }
                ],
                limit: 20
            });
            const format = asignaciones.map((asignacion) => ({
                id: asignacion.id,
                name: asignacion.name,
                createdAt: asignacion.createdAt,
                amountsend: asignacion.amountsend,
                botname: asignacion.bot ? asignacion.bot.name : 'BOT NO EXISTE',
                botphone: asignacion.bot ? asignacion.bot.phone : 'BOT NO EXISTE',
                flowname: asignacion.flow.name,
            }));
            return res.status(200).json({ asignaciones: format });
        });
        this.LeadsAsignacion = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!id)
                    return res.status(500).json({ message: "se necesita un id para consultar" });
                const masivosLead = yield AsignacionLead_1.AsignacionLead.findAll({
                    include: [
                        {
                            model: Leads_1.Leads,
                        }
                    ],
                    where: {
                        asignacionId: id,
                    }
                });
                const formattedAsignacion = masivosLead.map(masivolead => {
                    var _a, _b;
                    console.log("lead", masivolead.lead);
                    return ({
                        fechaenvio: masivolead.createdAt,
                        leadName: ((_a = masivolead.lead) === null || _a === void 0 ? void 0 : _a.name) ? masivolead.lead.name : 'CLIENTE NO EXISTE',
                        leadPhone: ((_b = masivolead.lead) === null || _b === void 0 ? void 0 : _b.number) ? masivolead.lead.number : 'CLIENTE NO EXISTE',
                        status: masivolead.status,
                        observaciones: masivolead.observacionstatus
                    });
                });
                return res.status(200).json({ leadsasignacion: formattedAsignacion });
            }
            catch (error) {
                console.log("error interno del sevidor");
                return res.status(500).json({ message: "error interno del servidor", error: error.message });
            }
        });
    }
}
exports.ReportsController = ReportsController;

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
exports.sendAsignacionProgramada = void 0;
const Asignaciones_1 = require("../models/Asignaciones");
const AsignacionLead_1 = require("../models/AsignacionLead");
const Bot_1 = require("../models/Bot");
const Flows_1 = require("../models/Flows");
const Leads_1 = require("../models/Leads");
const RabbitMQService_1 = __importDefault(require("./RabbitMQService"));
const sendAsignacionProgramada = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { asignacionId } = data;
    const mensajes = yield AsignacionLead_1.AsignacionLead.findAll({
        where: {
            asignacionId
        },
        include: [
            {
                model: Asignaciones_1.Asignaciones,
                include: [
                    {
                        model: Bot_1.Bot
                    },
                    {
                        model: Flows_1.Flows
                    }
                ]
            },
            {
                model: Leads_1.Leads
            }
        ],
    });
    const rabbitMQ = yield RabbitMQService_1.default.getInstance();
    const exchange = "asesores";
    const promises = mensajes.map((mensaje) => __awaiter(void 0, void 0, void 0, function* () {
        const routingKey = "51" + mensaje.asignacion.bot.phone;
        const message = { number: mensaje.lead.number, delay: mensaje.delay, flow: mensaje.asignacion.flow };
        console.log(JSON.stringify(message));
        return rabbitMQ.sendMessageToExchange(exchange, routingKey, JSON.stringify(message));
    }));
    // Esperamos a que todos los mensajes se envíen
    yield Promise.all(promises);
});
exports.sendAsignacionProgramada = sendAsignacionProgramada;

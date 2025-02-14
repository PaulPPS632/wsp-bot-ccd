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
exports.WebSocketBots = void 0;
const socket_io_1 = require("socket.io");
const Bot_1 = require("../models/Bot");
class WebSocketBots {
    constructor(httpServer, checkIntervalMs = 10000) {
        this.checkIntervalMs = checkIntervalMs;
        this.checkInterval = null;
        this.io = new socket_io_1.Server(httpServer, {
            cors: {
                origin: "*", // Ajusta el origen según tus necesidades
                methods: ["GET", "POST"],
            },
        });
        this.setupConnection();
        this.startCheck();
    }
    setupConnection() {
        this.io.on("connection", (socket) => {
            console.log(`Cliente WebSocket conectado: ${socket.id}`);
            socket.emit("message", { message: "Conectado al servidor WebSocket" });
        });
    }
    startCheck() {
        this.checkInterval = setInterval(() => {
            this.checkBotsStatus();
        }, this.checkIntervalMs);
    }
    checkBotsStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            const statuses = [];
            try {
                const bots = yield Bot_1.Bot.findAll();
                if (bots) {
                    for (const bot of bots) {
                        try {
                            const response = yield fetch(`http://localhost:${bot.port}/v1/codigo`);
                            const data = yield response.json();
                            console.log("datos: ", {
                                pairingCode: data.pairingCode,
                                status: data.status
                            });
                            if (data.pairingCode !== bot.pairingCode || !data.status) {
                                statuses.push({
                                    containerId: bot.containerId,
                                    phone: bot.phone,
                                    status: "desvinculado",
                                    newPairingCode: data.pairingCode,
                                });
                                console.log(`Emitiendo mensaje de desvinculación para el bot ${bot.containerId}`);
                                yield Bot_1.Bot.update({ pairingCode: data.pairingCode }, { where: { id: bot.id } });
                            }
                            else {
                                statuses.push({ containerId: bot.containerId, phone: bot.phone, status: "activo" });
                                yield Bot_1.Bot.update({ status: true }, { where: { id: bot.id } });
                            }
                        }
                        catch (error) {
                            if (bot.status) {
                                statuses.push({ containerId: bot.containerId, phone: bot.phone, status: "inactivo" });
                                yield Bot_1.Bot.update({ status: false }, { where: { id: bot.id } });
                            }
                            console.log(`El bot con containerId ${bot.containerId} en el puerto ${bot.port} está caído`);
                        }
                    }
                    // Una vez evaluados todos los bots, se emite un único evento con el array de estados.
                    this.io.emit("bots-status", statuses);
                }
            }
            catch (error) {
                console.error("Error al consultar el estado de los bots:", error);
            }
            //return statuses;
        });
    }
    stopCheck() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }
}
exports.WebSocketBots = WebSocketBots;

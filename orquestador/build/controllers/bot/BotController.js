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
const DatabaseManager_1 = __importDefault(require("../../config/DatabaseManager"));
const Bot_1 = require("../../models/Bot");
const DockerService_1 = __importDefault(require("../../services/DockerService"));
const WaitBot_1 = require("../../utils/WaitBot");
const getLastPort_1 = require("../../utils/getLastPort");
class BotController {
    constructor() {
        this.createBot = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { phone, imagebot } = req.body;
                if (!phone || isNaN(phone) || phone.length < 9) {
                    return res.status(400).json({ error: "Número de teléfono inválido" });
                }
                const port = yield (0, getLastPort_1.getLastPort)();
                const db_name = `bot_db_${phone}`;
                yield DatabaseManager_1.default.createDatabase(db_name);
                const docker = DockerService_1.default.getInstance().getDocker();
                // Crear y correr un contenedor
                const container = yield docker.createContainer({
                    Image: imagebot, // Imagen del bot
                    name: `bot-${imagebot}-${phone}`, // Nombre único del contenedor
                    Env: [
                        `PHONE=51${phone}`,
                        `DB_HOST=mysql-bots`,
                        `DB_USER=root`,
                        `DB_NAME=${db_name}`, // Nueva DB específica del bot
                        `DB_PASSWORD=botsito`,
                        `DB_PORT=3306`
                    ],
                    ExposedPorts: {
                        "3000/tcp": {}, // Puerto expuesto dentro del contenedor
                    },
                    HostConfig: {
                        NetworkMode: "bot-network",
                        PortBindings: {
                            "3000/tcp": [
                                {
                                    HostPort: port.toString(), // Mapea el puerto del contenedor al host
                                },
                            ],
                        },
                        Binds: [
                            // Montar un volumen para la base de datos
                            `/home/paul/Escritorio/VolumenesBot/${phone}:/app/bot_sessions`
                        ],
                        LogConfig: {
                            Type: "json-file",
                            Config: {
                                "max-size": "10m",
                                "max-file": "3"
                            }
                        },
                        RestartPolicy: {
                            Name: "on-failure",
                            MaximumRetryCount: 5
                        }
                    },
                });
                yield container.start(); // Inicia el contenedor
                const botData = yield (0, WaitBot_1.waitForBot)(port); //espera por la inicializacion del bot
                // Registrar el Bot
                const newBot = yield Bot_1.Bot.create({
                    containerId: container.id,
                    port,
                    pairingCode: botData.pairingCode,
                    phone,
                    tipo: imagebot,
                    db_name
                });
                res.status(201).json({
                    message: "Bot creado con éxito",
                    containerId: newBot.containerId,
                    port: newBot.port,
                    pairingCode: newBot.pairingCode,
                });
            }
            catch (error) {
                console.error("Error al crear el bot:", error);
                res.status(500).json({ error: "Error al crear el bot" });
            }
        });
        this.startBots = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Obtener todos los bots registrados
                const bots = yield Bot_1.Bot.findAll();
                if (!bots.length) {
                    return res
                        .status(404)
                        .json({ message: "No hay bots registrados para inicializar." });
                }
                const docker = DockerService_1.default.getInstance().getDocker();
                for (const bot of bots) {
                    const { containerId, phone } = bot;
                    try {
                        const container = docker.getContainer(containerId);
                        const containerInfo = yield container.inspect();
                        if (containerInfo.State.Running) {
                            continue;
                        }
                        yield container.restart();
                    }
                    catch (err) {
                        console.error(`Error al inicializar el contenedor ${containerId} de numbero ${phone}:`, err);
                        res.status(200).json({
                            message: `Error al inicializar el contenedor ${containerId} de numero ${phone}:`,
                            status: false,
                        });
                    }
                }
                res.status(200).json({
                    message: "Procesamiento de bots completado",
                    status: true,
                });
            }
            catch (error) {
                console.error("Error al inicializar bots:", error);
                res
                    .status(500)
                    .json({ error: "Error al inicializar bots", status: false });
            }
        });
        this.stopBots = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const bots = yield Bot_1.Bot.findAll();
                const docker = DockerService_1.default.getInstance().getDocker();
                const stopResults = yield Promise.all(bots.map((bot) => __awaiter(this, void 0, void 0, function* () {
                    const container = docker.getContainer(bot.containerId);
                    try {
                        yield container.stop();
                        return {
                            containerId: bot.containerId,
                            phone: bot.phone,
                            status: "stopped",
                        };
                    }
                    catch (error) {
                        return {
                            containerId: bot.containerId,
                            phone: bot.phone,
                            status: "error",
                            error: error.message,
                        };
                    }
                })));
                // Retornar los resultados de la operación
                res.status(200).json({
                    message: "Operación completada. Resultado de detener los bots:",
                    results: stopResults,
                    status: false,
                });
            }
            catch (error) {
                console.error("Error al detener todos los bots:", error);
                res.status(500).json({ error: "Error al detener todos los bots." });
            }
        });
        this.startBotbyContainerID = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { containerId } = req.body;
                if (!containerId) {
                    return res.status(400).json({ error: "containerId es requerido." });
                }
                const docker = DockerService_1.default.getInstance().getDocker();
                const container = docker.getContainer(containerId);
                // Verificar si el contenedor existe
                const containerInfo = yield container.inspect();
                if (containerInfo.State.Running) {
                    return res
                        .status(200)
                        .json({ message: "El bot ya está en ejecución.", status: true });
                }
                // Iniciar el contenedor
                yield container.start();
                res.status(200).json({
                    message: "Bot iniciado correctamente.",
                    containerId,
                    status: true,
                });
            }
            catch (error) {
                console.error("Error al iniciar el contenedor:", error);
                res.status(500).json({
                    error: "Error al iniciar el bot.",
                    details: error.message,
                    status: false,
                });
            }
        });
        this.stopBotbyContainerID = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { containerId } = req.body;
                if (!containerId) {
                    return res.status(400).json({ error: "containerId es requerido." });
                }
                const docker = DockerService_1.default.getInstance().getDocker();
                const container = docker.getContainer(containerId);
                // Verificar si el contenedor existe
                const containerInfo = yield container.inspect();
                if (!containerInfo.State.Running) {
                    return res
                        .status(200)
                        .json({ message: "El bot ya está detenido.", status: false });
                }
                // Detener el contenedor
                yield container.stop();
                res.status(200).json({
                    message: "Bot detenido correctamente.",
                    containerId,
                    status: true,
                });
            }
            catch (error) {
                console.error("Error al detener el contenedor:", error);
                res.status(500).json({
                    error: "Error al detener el bot.",
                    details: error.message,
                    status: false,
                });
            }
        });
        this.getBots = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const bots = yield Bot_1.Bot.findAll();
                const docker = DockerService_1.default.getInstance().getDocker();
                const botsWithStatus = yield Promise.all(bots.map((bot) => __awaiter(this, void 0, void 0, function* () {
                    const container = docker.getContainer(bot.containerId);
                    try {
                        const containerInfo = yield container.inspect();
                        return Object.assign(Object.assign({}, bot.toJSON()), { status: containerInfo.State.Running });
                    }
                    catch (error) {
                        return Object.assign(Object.assign({}, bot.toJSON()), { status: false });
                    }
                })));
                res.status(200).json(botsWithStatus);
            }
            catch (error) {
                console.error("Error al obtener los bots:", error);
                res.status(500).json({ error: "Error al obtener los bots." });
            }
        });
        this.getBotCodigo = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { port } = req.body;
            try {
                // Intentar conectarse al bot
                const response = yield fetch(`http://localhost:${port}/v1/codigo`);
                if (response.ok) {
                    const { pairingCode } = yield response.json(); // Si la respuesta es exitosa, retornamos el JSON
                    return res.status(200).json({ pairingCode });
                }
            }
            catch (error) {
                // Si falla, esperar antes del próximo intento
                console.log(`Esperando a que el bot en el puerto ${port} esté listo...`);
            }
        });
        this.getprueba = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            const port = yield (0, getLastPort_1.getLastPort)();
            return res.status(200).json({ port });
        });
    }
}
exports.default = BotController;

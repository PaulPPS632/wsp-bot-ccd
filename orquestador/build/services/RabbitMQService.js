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
const amqplib_1 = __importDefault(require("amqplib"));
const rabbitSettings = {
    protocol: "amqp",
    hostname: "localhost",
    port: 5672,
    username: "paul",
    password: "paul",
    vhost: "/",
    authMechanism: ["PLAIN", "AMQPLAIN", "EXTERNAL"],
};
const queues = ["leads", "bases"]; // Lista de colas a declarar
class RabbitMQService {
    constructor() {
        this.connection = null;
        this.channel = null;
    }
    static getInstance() {
        if (!RabbitMQService.instance) {
            RabbitMQService.instance = new RabbitMQService();
        }
        return RabbitMQService.instance;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.connection)
                return; // Si ya está inicializado, no hacer nada
            try {
                this.connection = yield amqplib_1.default.connect(rabbitSettings);
                this.channel = yield this.connection.createChannel();
                // Asegurarse de que las colas estén declaradas
                for (const queue of queues) {
                    yield this.channel.assertQueue(queue);
                }
                console.log("✅ RabbitMQ conectado correctamente.");
            }
            catch (error) {
                console.error("❌ Error al conectar con RabbitMQ:", error);
                throw error;
            }
        });
    }
    getChannel() {
        if (!this.channel) {
            throw new Error("El canal RabbitMQ no está inicializado.");
        }
        return this.channel;
    }
    sendMessage(queue, message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!queues.includes(queue)) {
                throw new Error(`❌ La cola "${queue}" no está declarada.`);
            }
            if (!this.channel) {
                throw new Error("❌ El canal RabbitMQ no está disponible.");
            }
            try {
                this.channel.sendToQueue(queue, Buffer.from(message));
                console.log(`📩 Mensaje enviado a la cola "${queue}": ${message}`);
            }
            catch (error) {
                console.error(`❌ Error al enviar mensaje a la cola "${queue}":`, error);
            }
        });
    }
    consumeMessages(queue, onMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!queues.includes(queue)) {
                throw new Error(`❌ La cola "${queue}" no está declarada.`);
            }
            if (!this.channel) {
                throw new Error("❌ El canal RabbitMQ no está disponible.");
            }
            try {
                yield this.channel.consume(queue, (msg) => {
                    if (msg !== null) {
                        const content = msg.content.toString();
                        console.log(`📥 Mensaje recibido de la cola "${queue}": ${content}`);
                        onMessage(content);
                        this.channel.ack(msg);
                    }
                });
            }
            catch (error) {
                console.error(`❌ Error al consumir mensajes de la cola "${queue}":`, error);
            }
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.channel)
                    yield this.channel.close();
                if (this.connection)
                    yield this.connection.close();
                this.channel = null;
                this.connection = null;
                console.log("✅ RabbitMQ cerrado correctamente.");
            }
            catch (error) {
                console.error("❌ Error al cerrar RabbitMQ:", error);
            }
        });
    }
}
exports.default = RabbitMQService;

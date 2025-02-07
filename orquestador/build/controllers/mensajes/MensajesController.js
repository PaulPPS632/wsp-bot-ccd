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
const Mensajes_1 = require("../../models/Mensajes");
class MensajesController {
    constructor() {
        this.create = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { mensaje } = req.body;
                console.log(`llega: ${mensaje.tipo} ${mensaje.content}`);
                yield Mensajes_1.Mensajes.create({
                    tipo: mensaje.tipo,
                    content: mensaje.content,
                });
                return res.status(200).json({ message: "creado correctamente" });
            }
            catch (err) {
                return res.status(400).json({ error: `error en servidor: ${err.message}`, });
            }
        });
        this.listar = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const mensajes = yield Mensajes_1.Mensajes.findAll();
                if (!mensajes)
                    return res.status(404).json({ error: "no se encontraron mensajes" });
                return res.status(200).json({ mensajes });
            }
            catch (error) {
                return res.status(400).json({ error: "error en servidor" });
            }
        });
        this.delete = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const mensaje = yield Mensajes_1.Mensajes.findByPk(id);
                if (!mensaje)
                    return res.status(404).json({ error: "no se encontro el mensaje" });
                yield mensaje.destroy();
                return res.status(200).json({ message: "se elimino correctamente" });
            }
            catch (error) {
                return res.status(400).json({ error: "error inesperado en servidor" });
            }
        });
    }
}
exports.default = MensajesController;

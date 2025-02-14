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
const sequelize_1 = require("sequelize");
const Flows_1 = require("../../models/Flows");
class FlowsController {
    constructor() {
        this.create = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { flow } = req.body;
                yield Flows_1.Flows.create({
                    name: flow.name.trim(),
                    mensajes: flow.mensajes,
                });
                return res.status(200).json({ message: "creado correctamente" });
            }
            catch (err) {
                return res
                    .status(400)
                    .json({ error: `error en servidor: ${err.message}` });
            }
        });
        this.listar = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const flows = yield Flows_1.Flows.findAll();
                if (!flows)
                    return res.status(404).json({ error: "no se encontraron flows" });
                return res.status(200).json({ flows });
            }
            catch (error) {
                return res.status(400).json({ error: "error en servidor" });
            }
        });
        this.delete = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const mensaje = yield Flows_1.Flows.findByPk(id);
                if (!mensaje)
                    return res.status(404).json({ error: "no se encontro el mensaje" });
                yield mensaje.destroy();
                return res.status(200).json({ message: "se elimino correctamente" });
            }
            catch (error) {
                return res.status(400).json({ error: "error inesperado en servidor" });
            }
        });
        this.search = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { search } = req.body;
                const flows = yield Flows_1.Flows.findAll({
                    where: {
                        name: {
                            [sequelize_1.Op.like]: `%${search.toLowerCase()}%`,
                        },
                    },
                });
                return res.status(200).json({ flows: flows });
            }
            catch (error) {
                console.log("error en busqueda: ", error.message);
                return res.status(500).json({ error: "error en el servidor" });
            }
        });
        this.update = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { flow } = req.body;
                yield Flows_1.Flows.update({
                    name: flow.name.trim().replace(/ /g, "_"),
                    mensajes: flow.mensajes,
                }, {
                    where: {
                        id,
                    },
                });
                return res.status(200).json({ message: "se actualizo correctamente" });
            }
            catch (error) {
                return res
                    .status(500)
                    .json({ error: `error en servidor: ${error.message}` });
            }
        });
        this.getById = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const flow = yield Flows_1.Flows.findByPk(id);
                if (!flow)
                    return res.status(404).json({ error: "no se encontro el flow" });
                return res.status(200).json({ flow: flow });
            }
            catch (error) {
                console.log("error en getbyId de flow: ", error.message);
                return res.status(500).json({ error: "error interno del servidor" });
            }
        });
    }
}
exports.default = FlowsController;

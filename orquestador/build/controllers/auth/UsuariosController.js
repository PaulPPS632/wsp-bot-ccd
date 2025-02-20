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
exports.UsuariosController = void 0;
const Roles_1 = require("../../models/Roles");
const Usuarios_1 = require("../../models/Usuarios");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class UsuariosController {
    constructor() {
        this.create = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { name, username, password, rolId } = req.body.usuario;
                const rol = yield Roles_1.Roles.findByPk(rolId);
                if (!rol)
                    return res.status(404).json({ message: 'el rol no existe' });
                const newusuario = yield Usuarios_1.Usuarios.create({
                    name, username, password, rolId
                });
                const token = jsonwebtoken_1.default.sign({ id: newusuario.id, rol: rol === null || rol === void 0 ? void 0 : rol.name }, (_a = process.env.SECRET_KEY) !== null && _a !== void 0 ? _a : '', {
                    expiresIn: 86400,
                });
                return res.status(200).json({
                    token,
                    rol: rol.name,
                    usuario: newusuario
                });
            }
            catch (error) {
                return res.status(500).json({ message: "error interno del servidor", error: error.message });
            }
        });
        this.login = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { username, password } = req.body;
            console.log(username, password);
            try {
                const EntidadEncontrada = yield Usuarios_1.Usuarios.findOne({
                    where: { username },
                    include: { model: Roles_1.Roles, attributes: ["id", "name"] },
                });
                console.log(EntidadEncontrada);
                if (!EntidadEncontrada) {
                    return res.status(404).json({ message: "Usuario not found" });
                }
                const resultado = yield Usuarios_1.Usuarios.comparePassword(password, EntidadEncontrada.password);
                if (resultado) {
                    const token = jsonwebtoken_1.default.sign({ id: EntidadEncontrada.id, rol: EntidadEncontrada.rol.name }, (_a = process.env.SECRET_KEY) !== null && _a !== void 0 ? _a : '', {
                        expiresIn: 86400,
                    });
                    return res.status(200).json({
                        token: token,
                        rol: EntidadEncontrada.rol.name,
                        usuario: EntidadEncontrada,
                    });
                }
                else {
                    return res.status(400).json({ message: resultado });
                }
            }
            catch (error) {
                return res.status(500).json({ message: "error interno del servidor", error: error.message });
            }
        });
        this.validate = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { token } = req.body;
                const decoded = jsonwebtoken_1.default.verify(token, (_a = process.env.SECRET_KEY) !== null && _a !== void 0 ? _a : '');
                const usuario = yield Usuarios_1.Usuarios.findOne({
                    where: {
                        id: decoded.id
                    },
                    include: {
                        model: Roles_1.Roles,
                        attributes: ["id", "name"]
                    }
                });
                if (!usuario)
                    return res.status(404).json({ message: 'usuario no encontrado' });
                return res.status(200).json({
                    estado: true, rol: usuario.rol.name, usuario: usuario
                });
            }
            catch (error) {
                return res.status(500).json({ message: 'error interno del servidor' });
            }
        });
        this.listar = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const usuarios = yield Usuarios_1.Usuarios.findAll({
                    include: [
                        {
                            model: Roles_1.Roles
                        }
                    ]
                });
                return res.status(200).json({ usuarios });
            }
            catch (error) {
                return res.status(500).json({
                    message: 'error interno del servidor'
                });
            }
        });
    }
}
exports.UsuariosController = UsuariosController;

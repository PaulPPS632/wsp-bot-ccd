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
const sequelize_typescript_1 = require("sequelize-typescript");
const models_1 = require("../models/models");
class Database {
    constructor() {
        this.connection = null;
        this.init();
    }
    init() {
        try {
            const name = process.env.DB_NAME || 'bots_db';
            const user = process.env.DB_USER || 'root';
            const password = process.env.DB_PASSWORD || '';
            const host = process.env.DB_HOST || 'localhost';
            const dialect = process.env.DB_DIALECT || 'mysql';
            const port = parseInt(process.env.DB_PORT || '3306');
            console.log("Detalles de la conexión:", {
                database: name,
                user: user,
                host: host,
                dialect: dialect,
                port: port,
                password: password
            });
            this.connection = new sequelize_typescript_1.Sequelize(name, user, password, {
                host,
                dialect,
                port,
                retry: { max: 3 },
                models: models_1.models
            });
        }
        catch (error) {
            console.error("Error al conectar a la base de datos:", error);
        }
    }
    sync() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                // Autenticar la conexión
                yield ((_a = this.connection) === null || _a === void 0 ? void 0 : _a.authenticate());
                console.log("Conexión a la base de datos establecida correctamente.");
                const alter = process.env.ALTER === 'true';
                // Sincronizar los modelos con la base de datos
                yield ((_b = this.connection) === null || _b === void 0 ? void 0 : _b.sync({ alter: alter }));
                console.log("Base de datos sincronizada correctamente.");
            }
            catch (err) {
                console.error("Error al conectar o sincronizar con la base de datos:", err);
                console.error("Detalles de la conexión:", {
                    database: process.env.DB_NAME,
                    user: process.env.DB_USER,
                    host: process.env.DB_HOST,
                    dialect: process.env.DB_DIALECT,
                    port: process.env.DB_PORT,
                });
            }
        });
    }
    getConnection() {
        return this.connection;
    }
}
exports.default = new Database();

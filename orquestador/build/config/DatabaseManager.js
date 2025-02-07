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
class DatabaseManager {
    constructor() {
        this.sequelize = new sequelize_1.Sequelize({
            host: process.env.DB_HOST_DOCKER || "localhost", // Conectar al contenedor
            port: parseInt(process.env.DB_PORT_DOCKER || "3307"),
            username: process.env.DB_USER_DOCKER || "root",
            password: process.env.DB_PASSWORD_DOCKER || "botsito",
            dialect: "mysql",
            logging: false, // Evita logs innecesarios
        });
    }
    static getInstance() {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance;
    }
    createDatabase(dbName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.sequelize.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
                console.log(`Base de datos ${dbName} creada exitosamente.`);
            }
            catch (error) {
                console.error("Error al crear la base de datos:", error);
            }
        });
    }
}
exports.default = DatabaseManager.getInstance();

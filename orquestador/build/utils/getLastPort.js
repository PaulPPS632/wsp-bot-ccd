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
exports.getLastPort = void 0;
const DockerService_1 = __importDefault(require("../services/DockerService"));
const getLastPort = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const docker = DockerService_1.default.getInstance().getDocker();
    const containers = yield docker.listContainers({ all: true });
    console.log(containers);
    let maxPort = 3000; // Puerto base - 1
    for (const containerInfo of containers) {
        // 1. Filtrar contenedores de la red "bot-network"
        if (containerInfo.Image === "bot" || containerInfo.Image === "responder") {
            // 2. Buscar el puerto asignado en el host (ej: 3000/tcp -> 3005)
            const port = (_a = containerInfo.Ports.find((ports) => ports.IP === "0.0.0.0")) === null || _a === void 0 ? void 0 : _a.PublicPort;
            if (port) {
                if (port > maxPort)
                    maxPort = port;
            }
        }
    }
    return maxPort + 1; // Nuevo puerto
});
exports.getLastPort = getLastPort;

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
exports.getLastPort = void 0;
const Bot_1 = require("../models/Bot");
const getLastPort = () => __awaiter(void 0, void 0, void 0, function* () {
    //const docker = DockerService.getInstance().getDocker();
    //const containers = await docker.listContainers({ all: true });
    //let maxPort = 3000; // Puerto base - 1
    const botmayorport = yield Bot_1.Bot.findAll({
        attributes: ["port"],
        limit: 1,
        order: [["port", "DESC"]]
    });
    /*
for (const containerInfo of containers) {
  // 1. Filtrar contenedores de la red "bot-network"
  if (containerInfo.Image === "bot" || containerInfo.Image === "responder") {
    // 2. Buscar el puerto asignado en el host (ej: 3000/tcp -> 3005)
    const port = containerInfo.Ports.find((ports) => ports.IP === "0.0.0.0")?.PublicPort;
    if (port) {
      if (port > maxPort) maxPort = port;
    }
  }
    }*/
    console.log("llega botmayor", botmayorport);
    if (botmayorport.length === 0)
        return 3001;
    const PuertoMayor = botmayorport[0].port;
    if (PuertoMayor === 3305) {
        return botmayorport[0].port = 3308;
    }
    return botmayorport[0].port + 1; // Nuevo puerto
});
exports.getLastPort = getLastPort;

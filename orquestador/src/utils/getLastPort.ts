import { Bot } from "../models/Bot";
export const getLastPort = async ():Promise<number> => {
    //const docker = DockerService.getInstance().getDocker();
    //const containers = await docker.listContainers({ all: true });
    //let maxPort = 3000; // Puerto base - 1
    const botmayorport = await Bot.findAll({
      attributes:["port"],
      limit:1,
      order:[["port","DESC"]]
    }) 
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
    console.log("llega botmayor",botmayorport);
    if(botmayorport.length === 0) return 3001;

    const PuertoMayor = botmayorport[0].port;
    if(PuertoMayor === 3305){
      return botmayorport[0].port = 3308;
    }
    return botmayorport[0].port + 1; // Nuevo puerto
};
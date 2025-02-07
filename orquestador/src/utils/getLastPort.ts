import DockerService from "../services/DockerService";

export const getLastPort = async ():Promise<number> => {
    const docker = DockerService.getInstance().getDocker();
    const containers = await docker.listContainers({ all: true });
    console.log(containers)
    let maxPort = 3000; // Puerto base - 1
  
    
    for (const containerInfo of containers) {
      // 1. Filtrar contenedores de la red "bot-network"
      if (containerInfo.Image === "bot" || containerInfo.Image === "responder") {
        // 2. Buscar el puerto asignado en el host (ej: 3000/tcp -> 3005)
        const port = containerInfo.Ports.find((ports) => ports.IP === "0.0.0.0")?.PublicPort;
        if (port) {
          if (port > maxPort) maxPort = port;
        }
      }
    }
    return maxPort + 1; // Nuevo puerto
};
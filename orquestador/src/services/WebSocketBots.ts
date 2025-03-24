import { Server as SocketIOServer } from "socket.io";
import { Bot } from "../models/Bot";
import DockerService from "./DockerService";
export class WebSocketBots {
  private io: SocketIOServer;
  private checkInterval: NodeJS.Timeout | null = null;

  constructor(httpServer: any, private checkIntervalMs: number = 10000) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: "*", // Ajusta el origen según tus necesidades
        methods: ["GET", "POST"],
      },
      path:"/api/websocket"
    });
    this.setupConnection();
    this.startCheck();
  }
  setupConnection() {
    this.io.on("connection", (socket: any) => {
      console.log(`Cliente WebSocket conectado: ${socket.id}`);
      socket.emit("message", { message: "Conectado al servidor WebSocket" });
    });
  }
  private startCheck(): void {
    this.checkInterval = setInterval(() => {
      this.checkBotsStatus();
    }, this.checkIntervalMs);
  }
  private async checkBotsStatus(): Promise<void> {
    try {
      
        const bots = await Bot.findAll();
        if (!bots || bots.length === 0) return;

        const statuses: Array<{ containerId: string; phone: string; status: string; newPairingCode?: string }> = [];

        await Promise.all(bots.map(async (bot) => {
          const flag = await this.isContainerRunning(bot.containerId);
          if(!flag){
            statuses.push({ containerId: bot.containerId, phone: bot.phone, status: "inactivo" });
            await Bot.update({ status: false }, { where: { id: bot.id } });
          }else{
            try {

              const data = await this.fetchWithTimeout(`http://localhost:${bot.port}/v1/codigo`, 5000); // 5 segundos de timeout
              
              //console.log("Datos recibidos:", { pairingCode: data.pairingCode, status: data.status });

              if (data.pairingCode !== bot.pairingCode || !data.status) {
                  statuses.push({
                      containerId: bot.containerId,
                      phone: bot.phone,
                      status: "desvinculado",
                      newPairingCode: data.pairingCode,
                  });

                  //console.log(`Bot ${bot.containerId} desvinculado`);

                  if (bot.pairingCode !== data.pairingCode) {
                      await Bot.update({ pairingCode: data.pairingCode }, { where: { id: bot.id } });
                  }
              } else {
                  statuses.push({ containerId: bot.containerId, phone: bot.phone, status: "activo" });

                  if (!bot.status) {
                      await Bot.update({ status: true }, { where: { id: bot.id } });
                  }
              }
          } catch (error) {
              //console.log(`Error al consultar bot ${bot.containerId}, reintentando...`);
              
              // Intentamos una segunda vez antes de marcarlo como inactivo
              try {
                  await this.fetchWithTimeout(`http://localhost:${bot.port}/v1/codigo`, 5000);
                  
                  //console.log(`Segunda verificación exitosa para bot ${bot.containerId}:`, data);
                  statuses.push({ containerId: bot.containerId, phone: bot.phone, status: "activo" });

                  if (!bot.status) {
                      await Bot.update({ status: true }, { where: { id: bot.id } });
                  }
              } catch (retryError) {
                  if (bot.status) {
                      statuses.push({ containerId: bot.containerId, phone: bot.phone, status: "inactivo" });
                      await Bot.update({ status: false }, { where: { id: bot.id } });
                  }
                  console.log(`Bot ${bot.containerId} en puerto ${bot.port} está caído tras segundo intento.`);
              }
          }
             }
        }));

        this.io.emit("bots-status", statuses);
    } catch (error) {
        console.error("Error al consultar el estado de los bots:", error);
    }
}
private async isContainerRunning(containerId: string): Promise<boolean> {
  try {
    const docker = DockerService.getInstance().getDocker();
    const container = docker.getContainer(containerId);
    const data = await container.inspect();

    return data.State.Running; // Devuelve true si está encendido, false si no
  } catch (error) {
    console.error('Error consultando el contenedor:', error);
    return false; // O puedes manejarlo diferente según tu lógica
  }
}
/**
 * Función para hacer fetch con timeout
 */
private async fetchWithTimeout(url: string, timeout: number): Promise<any> {
    return new Promise((resolve, reject) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort();
            reject(new Error("Timeout al obtener datos del bot"));
        }, timeout);

        fetch(url, { signal: controller.signal })
            .then(response => response.json())
            .then(data => {
                clearTimeout(timeoutId);
                resolve(data);
            })
            .catch(error => {
                clearTimeout(timeoutId);
                reject(error);
            });
    });
}


  public stopCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

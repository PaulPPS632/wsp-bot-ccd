import { Server as SocketIOServer } from "socket.io";
import { Bot } from "../models/Bot";

export class WebSocketBots {
  private io: SocketIOServer;
  private checkInterval: NodeJS.Timeout | null = null;

  constructor(httpServer: any, private checkIntervalMs: number = 10000) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: "*", // Ajusta el origen según tus necesidades
        methods: ["GET", "POST"],
      },
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
    const statuses: Array<{ containerId: string; phone: string; status: string; newPairingCode?: string }> = [];
  try {
    const bots = await Bot.findAll();
    if(bots){
      for (const bot of bots) {
        try {
          const response = await fetch(`http://localhost:${bot.port}/v1/codigo`);
          const data = await response.json();
          console.log("datos: ", {
            pairingCode: data.pairingCode,
            status: data.status
          })
          if (data.pairingCode !== bot.pairingCode || !data.status) {
            statuses.push({
              containerId: bot.containerId,
              phone: bot.phone,
              status: "desvinculado",
              newPairingCode: data.pairingCode,
            });
            console.log(`Emitiendo mensaje de desvinculación para el bot ${bot.containerId}`);
            await Bot.update(
              { pairingCode: data.pairingCode },
              { where: { id: bot.id } }
            );
          } else {
            statuses.push({ containerId: bot.containerId,phone: bot.phone, status: "activo" });
            await Bot.update(
              { status: true },
              { where: { id: bot.id } }
            );
          }
        } catch (error) {
          if(bot.status){
            statuses.push({ containerId: bot.containerId, phone: bot.phone, status: "inactivo" });
            await Bot.update(
              { status: false },
              { where: { id: bot.id } }
            );
          }
          
          console.log(`El bot con containerId ${bot.containerId} en el puerto ${bot.port} está caído`);
        }
      } 
      // Una vez evaluados todos los bots, se emite un único evento con el array de estados.
      this.io.emit("bots-status", statuses);
    }
  } catch (error) {
    console.error("Error al consultar el estado de los bots:", error);
  }
  //return statuses;
  }
  public stopCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

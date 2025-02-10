import { config } from "dotenv";
config();
import database from "./config/database";
import app from "./app";
import RabbitMQService from "./services/RabbitMQService";
import { GoogleSheet } from "./services/GoogleSheet";
import { createServer } from "http";
import { WebSocketBots } from "./services/WebSocketBots";
async function main(): Promise<void> {
  try {
    //sincronizacion con db
    await database.sync();

    // Inicialización del servidor
    const httpServer = createServer(app);

    //inizializacion del websocket
    new WebSocketBots(httpServer, 10000);

    //coneccion con rabbitmq
    const rabbitMQ = RabbitMQService.getInstance();
    await rabbitMQ.init();

    //coneccion con googlesheet
    await GoogleSheet.getInstance(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
      process.env.GOOGLE_PRIVATE_KEY!,
      async (sheetInstance) => {
        console.log("Hoja cargada:", sheetInstance.getDoc().title);
      }
    );

    //escucha del servidor en puerto 8000
    httpServer.listen(8000, '0.0.0.0', () => {
      console.log(`Server is running on http://localhost:8000`);
    });
    
  } catch (error) {
    console.error("Error during application initialization:", error);
    process.exit(1); // Salir del proceso si ocurre un error crítico
  }
}
main();

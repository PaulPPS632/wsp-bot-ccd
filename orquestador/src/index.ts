import { config } from "dotenv";
config();
import database from "./config/database";
import app from "./app";
import RabbitMQService from "./services/RabbitMQService";
//import { GoogleSheet } from "./services/GoogleSheet";
import { createServer } from "http";
import { WebSocketBots } from "./services/WebSocketBots";
import { Worker } from "bullmq";
import { connection } from "./config/redisconfig";
import { sendAsignacionProgramada } from "./services/SendAsignacionProgramada";

async function main(): Promise<void> {
  try {
    //sincronizacion con db
    await database.sync();

    // Inicialización del servidor
    const httpServer = createServer(app);

    //inizializacion del websocket
    const timeout = process.env.TIMEOUT_WEBSOCKET || 10000;
    new WebSocketBots(httpServer, Number(timeout));

    //coneccion con rabbitmq
    await RabbitMQService.getInstance();

    //coneccion con googlesheet
    /*
    await GoogleSheet.getInstance(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
      process.env.GOOGLE_PRIVATE_KEY!,
      "1CD5xv_1znoePcapHM2iH7cyXjwuDlllKlb4f3OJcijQ",
      2076719352
    );
*/
    new Worker(
      "taskQueue",
      async (job: any) => {
        console.log(`✅ Ejecutando tarea #${job.id} - ${new Date().toISOString()}`);
        await sendAsignacionProgramada(job.data);
      },
      { connection}
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

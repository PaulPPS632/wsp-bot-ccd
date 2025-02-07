import { config } from "dotenv";
config();
import database from "./config/database";
import app from "./app";
import RabbitMQService from "./services/RabbitMQService";

async function main(): Promise<void> {
  try {
    //const PORT = process.env.PORT ?? 8000;
    //sincronizacion de base de datos

    await database.sync();
    // Inicialización del servidor
    //await RabbitMQService.
    const rabbitMQ = RabbitMQService.getInstance();
    await rabbitMQ.init();
    app.listen(8000, '0.0.0.0', () => {
      //console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`Server is running on http://localhost:8000`);
    });
    /*
    process.on("SIGINT", async () => {
        console.log("Cerrando RabbitMQ...");
        await rabbitMQ.closeRabbitMQ();
        process.exit(0);
      });
    */
  } catch (error) {
    console.error("Error during application initialization:", error);
    process.exit(1); // Salir del proceso si ocurre un error crítico
  }
}
main();

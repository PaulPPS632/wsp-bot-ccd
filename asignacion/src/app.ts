import {
  createBot,
  createProvider,
  createFlow,
  addKeyword,
  EVENTS,
} from "@builderbot/bot";
import { MysqlAdapter as Database } from "@builderbot/database-mysql";
import { BaileysProvider as Provider } from "@builderbot/provider-baileys";
import { startRabbitConsumer } from "./rabbit/consumer";
import { LimpiezaSession } from "./LimpiezaBotSession/LimpiezaBotSession";

const PORT = 3000;
const phoneNumber = process.env.PHONE ?? "51948701436";
const ruta_local_orquestador = process.env.RUTA_LOCAL_ORQUESTADOR ?? '172.18.0.1';//"host.docker.internal";

const main = async () => {
  const adapterFlow = createFlow([]);

  const adapterProvider = await createProvider(Provider, {
    usePairingCode: true,
    phoneNumber,
  });
  const config = {
    host: process.env.DB_HOST ?? '',
    user: process.env.DB_USER ?? '',
    database: process.env.DB_NAME ?? '',
    password: process.env.DB_PASSWORD ?? '',
    port: parseInt(process.env.DB_PORT, 10) ?? 3000
  }
  console.log(config)
  const adapterDB = new Database(config);


  const { handleCtx, httpServer } = await createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });
  adapterProvider.server.get(
    "/v1/codigo",
    handleCtx(async (bot, req, res) => {
      const pairingCode = bot.provider.vendor.authState.creds.pairingCode;
      const status = bot.provider.vendor.authState.creds.registered;
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ pairingCode: pairingCode, status }));
    })
  );
  httpServer(+PORT);

  // Esperar a que el bot esté conectado antes de iniciar RabbitMQ
  const waitForBotConnection = async () => {
    while (!adapterProvider?.vendor?.authState?.creds?.registered) {
      console.log("Waiting for WhatsApp connection...");
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
    console.log("Bot conectado a WhatsApp!");
    await startRabbitConsumer(adapterProvider, ruta_local_orquestador);
    LimpiezaSession();
  };

  
  await waitForBotConnection();
};
main();

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
const ruta_local_orquestador = process.env.RUTA_LOCAL_ORQUESTADOR ?? '172.18.0.1';
//const ruta_local_orquestador = process.env.RUTA_LOCAL_ORQUESTADOR ?? 'host.docker.internal';
const interesado = addKeyword([EVENTS.ACTION, "1", "asesor","Asesor", "lista","Lista", 
  "Cursos", "precio","Precio","si","Si","SI","promoción","promo","información", "info","Info"],{ sensitive: true })
  .addAnswer(
    "📝☎Perfecto estimad@, un asesor se comunicará con usted en la brevedad posible, gracias.",
    { capture: false }
  )
  .addAction(async (ctx) => {
    const name = ctx.name;
    const phone = ctx.from;
    await fetch(`http://${ruta_local_orquestador}:8000/api/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        phone,
        respuesta: "interesado",
      }),
    });
    return;
  });
const nointeresado = addKeyword([EVENTS.ACTION, "2", "no","NO","No"], {sensitive:true}).addAnswer(
  [
    "📝Muy bien estimado, si estuviera interesado no dude en escribirnos y con gusto lo atenderemos 🙋🏻‍♀",
  ].join("\n"),
  { capture: false }
).addAction(async (ctx) => {
  const name = ctx.name;
  const phone = ctx.from;
  await fetch(`http://${ruta_local_orquestador}:8000/api/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      phone,
      respuesta: "no interesado",
    }),
  });
  return;
});

const welcome = addKeyword<Provider, Database>(EVENTS.WELCOME).addAnswer(
  [
    "🚨 Por favor, digite la opción 1 ó 2 de su interés ",
    "",
    "👉 1. SI ✅ Solicita un asesor",
    "👉 2. NO ❌ No deseo",
    "",
    "¡Transforma tu futuro hoy! ¡Certifícate ya! 🎓",
    
  ].join("\n"),
  { capture: true },
  async (ctx, { fallBack, gotoFlow }) => {
    const body = ctx.body.toLocaleLowerCase();

    if (body.includes("1")) {
      return gotoFlow(interesado);
    } else if (body.includes("2")) {
      return gotoFlow(nointeresado);
    } else {
      return fallBack();
    }
  },
  [interesado, nointeresado]
);

const main = async () => {
  const adapterFlow = createFlow([welcome, interesado, nointeresado]);

  const adapterProvider = await createProvider(Provider, {
    usePairingCode: true,
    phoneNumber,
  });
  const config = {
    host: process.env.DB_HOST ?? 'localhost',
    user: process.env.DB_USER ?? 'paul',
    database: process.env.DB_NAME ?? 'db_bot',
    password: process.env.DB_PASSWORD ?? 'paulp',
    port: parseInt(process.env.DB_PORT, 10) ?? 3000
  }
  console.log(config)
  const adapterDB = new Database(config);


  const { handleCtx, httpServer } = await createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });

  adapterProvider.server.post(
    "/v1/messages",
    handleCtx(async (bot, req, res) => {
      const { number, name } = req.body;
      try {
        await bot.dispatch("PROMO", { from: number, name });
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ status: true }));
      } catch (error) {
        res.writeHead(500, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ status: false, error: error }));
      }
    })
  );
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

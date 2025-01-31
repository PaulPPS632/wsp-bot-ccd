import {
  createBot,
  createProvider,
  createFlow,
  addKeyword,
  EVENTS,
} from "@builderbot/bot";
import { MemoryDB as Database } from "@builderbot/bot";
import { BaileysProvider as Provider } from "@builderbot/provider-baileys";
import { startRabbitConsumer } from "./rabbit/consumer";

const PORT = 3000;
const phoneNumber = process.env.PHONE ?? "51948701436";

const interesado = addKeyword([EVENTS.ACTION, "1", "2", "si"])
  .addAnswer(
    "📝☎Listo estimad@, un asesor se comunicará con usted en la brevedad posible o comunícate al número directo de Asesor 908 822 842 (WhatsApp verificado) 👩🏻‍💻.",
    { capture: false }
  )
  .addAction(async (ctx) => {
    const name = ctx.name;
    const phone = ctx.from;
    await fetch(`http://host.docker.internal:8000/api/leads`, {
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
const nointeresado = addKeyword([EVENTS.ACTION, "3", "no"]).addAnswer(
  [
    "📝Muy bien estimado, si estuviera interesado no dude en escribirnos y con gusto lo atenderemos 🙋🏻‍♀",
    "📌Le adjunto el número 908822842",
  ].join("\n"),
  { capture: false }
);

const welcome = addKeyword<Provider, Database>(EVENTS.WELCOME).addAnswer(
  [
    "Somos CCD si esta interesado en algun curso",
    "✅ ¡Responde con el número de tu opción y te atenderemos de inmediato!",
    "🚨 Selecciona una opción:",
    "👉 1 Conocer más detalles.",
    "👉 2 Hablar con un asesor.",
    "👉 3 No continuar por ahora.",
  ].join("\n"),
  { capture: true },
  async (ctx, { fallBack, gotoFlow }) => {
    const body = ctx.body.toLocaleLowerCase();

    if (body.includes("1")) {
      return gotoFlow(interesado);
    } else if (body.includes("2")) {
      return gotoFlow(interesado);
    } else if (body.includes("3")) {
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
  const adapterDB = new Database();
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
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ pairingCode: pairingCode }));
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
    await startRabbitConsumer(adapterProvider);
  };

  
  await waitForBotConnection();
};
main();


import {
  createBot,
  createProvider,
  createFlow,
  addKeyword,
  utils,
  EVENTS,
  addAnswer,
} from "@builderbot/bot";
import { MemoryDB as Database } from "@builderbot/bot";
import { BaileysProvider as Provider } from "@builderbot/provider-baileys";
import amqp from "amqplib";
const PORT = 3000;
const phoneNumber = process.env.PHONE ?? "51987842843 ";

const interesado = addKeyword<Provider, Database>(["1", "2","si"])
  .addAnswer(
    "📝☎Listo estimad@, un asesor se comunicará con usted en la brevedad posible o comunícate al número directo de Asesor 908 822 842 (WhatsApp verificado) 👩🏻‍💻.",
    { capture: false }
  )
  .addAction(async (ctx) => {
    const name = ctx.name;
    const phone = ctx.from;
    await fetch(`http://host.docker.internal:8000/bot/register-lead`, {
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
const nointeresado = addKeyword<Provider, Database>(["3","no"])
  .addAnswer(
    [
      "📝Muy bien estimado, si estuviera interesado no dude en escribirnos y con gusto lo atenderemos 🙋🏻‍♀",
      "📌Le adjunto el número 908822842",
    ].join("\n"),
    { capture: false }
  )
  .addAction(async (ctx) => {
    const name = ctx.name;
    const phone = ctx.from;
    await fetch(`http://host.docker.internal:8000/bot/register-lead`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        phone: ctx.phone,
        respuesta: "no interesado",
      }),
    });
    return;
  });

const welcomeFlow = addKeyword<Provider, Database>(utils.setEvent("PROMO"))
  .addAnswer(
    [
      "🌞 Hola somos CCD. Este verano queremos que aproveches nuestra *PROMOCIÓN en CURSOS y DIPLOMAS de Ingeniería y Minería*.",
      "💻 Clases en vivo por Zoom, con docentes expertos y certificado incluido. ¡Desde *S/299*!",
    ].join("\n")
  )
  .addAnswer(
    [
      "✅ ¡Responde con el número de tu opción y te atenderemos de inmediato!",
      "🚨 Selecciona una opción:",
      "👉 1 Conocer más detalles.",
      "👉 2 Hablar con un asesor.",
      "👉 3 No continuar por ahora.",
    ].join("\n"),
    { delay: 800, capture: true },
    async (ctx, { fallBack }) => {
      if (!ctx.body.toLocaleLowerCase().includes("1")) {
        return fallBack();
      } else if (!ctx.body.toLocaleLowerCase().includes("2")) {
        return fallBack();
      } else if (!ctx.body.toLocaleLowerCase().includes("3")) {
        return fallBack();
      }
      return;
    },
    [interesado, nointeresado]
  );

const welcome = addKeyword<Provider,Database>(EVENTS.WELCOME).addAnswer([
    "Somos CCD si esta interesado en algun curso",
    "✅ ¡Responde con el número de tu opción y te atenderemos de inmediato!",
    "🚨 Selecciona una opción:",
    "👉 1 Conocer más detalles.",
    "👉 2 Hablar con un asesor.",
    "👉 3 No continuar por ahora.",
  ].join("\n"))
const rabbitSettings = {
  protocol: "amqp",
  hostname: "rabbitmq",
  port: 5672,
  username: "paul",
  password: "paul",
  vhost: "/",
  authMechanism: ["PLAIN", "AMQPLAIN", "EXTERNAL"],
};
const main = async () => {
    const adapterFlow = createFlow([welcomeFlow, interesado, nointeresado, welcome]);
  
    const adapterProvider = createProvider(Provider, {
        usePairingCode: true,
        phoneNumber,
      });
    const adapterDB = new Database();
    const { handleCtx, httpServer,sendFlowSimple } = await createBot({
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
            return res.end(JSON.stringify({ status:false ,error: error }));
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
  
    try{
        
        const queue = 'bases';
        const connection = await amqp.connect(rabbitSettings);
        const channel = await connection.createChannel();
        await channel.assertQueue(queue);
        channel.prefetch(1); 
        channel.consume(queue, async (msg) => {
         
            if (msg !== null) {
              try {
                const content = msg.content.toString()
                const { number, delai } = JSON.parse(content);
                
                await utils.delay(+delai);
                
                const onWhats = await adapterProvider.vendor.onWhatsApp(number).catch((error) => {
                    console.log(error);
                }).catch((err) =>{
                    console.log(err)
                });
                if (onWhats[0]?.exists) {
                  try {
                    await adapterProvider.sendMessage(
                      number,
                      [
                        "🌞 Hola somos CCD. Este verano queremos que aproveches nuestra *PROMOCIÓN en CURSOS y DIPLOMAS de Ingeniería y Minería*.",
                        "💻 Clases en vivo por Zoom, con docentes expertos y certificado incluido. ¡Desde *S/299*!",
                        "✅ ¡Responde con el número de tu opción y te atenderemos de inmediato!",
                        "🚨 Selecciona una opción:",
                        "👉 1 Conocer más detalles.",
                        "👉 2 Hablar con un asesor.",
                        "👉 3 No continuar por ahora.",
                      ].join("\n")
                  ,{}).catch((err) =>{
                      console.log(err)
                  });
                  channel.ack(msg);
                  } catch (sendErr) {
                    console.error("Error al enviar mensaje:", sendErr);
                    await fetch('http://host.docker.internal:8000/failmessage', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        number: number,  
                      }),
                    }).then((response) => response.json())
                      .then((data) => {
                        console.log('Estado actualizado:', data);
                      })
                      .catch((error) => {
                        console.error('Error al actualizar el estado:', error);
                      });
                    channel.nack(msg, true, false);
                  }
                }else{
                    channel.nack(msg, true, false); 
                }
                
                channel.ack(msg); // Confirmar el mensaje solo si no hubo errores
              } catch (error) {
                
                console.error("Error processing message:", error);
                channel.nack(msg, true, false); 
              }
            }
        });
      }catch(err){
        console.log('error', err);
      }
    
};
main();

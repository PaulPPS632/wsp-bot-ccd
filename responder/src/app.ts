import { join } from 'path'
import { createBot, createProvider, createFlow, addKeyword, utils, EVENTS } from '@builderbot/bot'
import { MysqlAdapter as Database } from "@builderbot/database-mysql";
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'
import { consultayselectedCurso } from './cursosSelected'
import fs from "fs";
import { promisify } from "util";

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const PORT = 3000
const phoneNumber = process.env.PHONE ?? "51908911275";



const mensajefinal = addKeyword([EVENTS.ACTION]).addAnswer(
    [
      "📝Muy bien estimado, hemos registrado el curso que le interesa",
      "📌en unos minutos un *asesor* se estara comunicando con usted",
    ].join("\n"),
    { capture: false },async (ctx, {endFlow, blacklist}) => {
      blacklist.add(ctx.from);
      return endFlow("gracias por su comunicacion")
    }
  );
const flujo = addKeyword<Provider, Database>(["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"], { sensitive: true, capture: true })
  .addAnswer([
    'Estamos registrando tu curso.'
  ].join("\n"), {capture: false},
  async (ctx, { fallBack, gotoFlow, flowDynamic, blacklist }) => {
    const body = ctx.body.trim().toLocaleLowerCase();
    const option = parseInt(body, 10);
    if (!isNaN(option)) {
      const {flag, curso} = await consultayselectedCurso(ctx.from, option);
      console.log(curso);
      if(flag){
        await flowDynamic(`Tu curso seleccionado es: *${curso}*`)
        return gotoFlow(mensajefinal);
      }else{
        return fallBack();
      }
    } else {
      blacklist.add(ctx.from);
      await flowDynamic("Estimado(a) porfavor ingrese el numero del curso que le interesa. Puede ver los cursos en el flyer")
      return fallBack();
    }
  },
  [mensajefinal]);

  
const main = async () => {
    const adapterFlow = createFlow([flujo, mensajefinal]) //Limitar a solo enviar si es más de 1 curso
    const adapterProvider = createProvider(Provider, { usePairingCode: true, phoneNumber})
    const config = {
      host: process.env.DB_HOST ?? '127.0.0.1',
      user: process.env.DB_USER ?? 'paul',
      database: process.env.DB_NAME ?? 'bot_db_908911275',
      password: process.env.DB_PASSWORD ?? 'paulp',
      port: 3306
    }
    console.log(config)
    const adapterDB = new Database(config);

    const { handleCtx, httpServer } = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    adapterProvider.server.post(
    '/v1/messages',
    handleCtx(async (bot, req, res) => {
        const { number, name, flow, flagOneCurso } = req.body;
        console.log("Si llego Data: ", flagOneCurso);
        // Al inicio de tu manejador, normaliza la bandera
        const normalizedFlag = req.body.flagOneCurso === true || req.body.flagOneCurso === "true";
        
        // Enviar mensajes del flujo
        for(const mensaje of flow.mensajes){
          try {
            switch(mensaje.tipo){
              case("texto"):
                await bot.provider.sendMessage(
                  number, mensaje.content.body,
                  {}
                );
                break;

                case("imagen"):
                if(mensaje.content.footer !== "noenviarresponder"){
                  await bot.provider.sendMedia(number+ "@s.whatsapp.net",mensaje.content.body,"");
                }
                
                break;
              case("video"):{
                //descargamos el video
                const response = await fetch(mensaje.content.body);
                
                if (!response.ok) throw new Error(`Error al descargar el video: ${response.statusText}`);
                const videoBuffer = await response.arrayBuffer();
                const filePath = join(process.cwd(), 'assets', `temp_video_${Date.now()}.mp4`) ;
                await writeFile(filePath, Buffer.from(videoBuffer));
                await adapterProvider.sendVideo(number+ "@s.whatsapp.net", filePath, mensaje.content.footer);
                await unlink(filePath);
                break;
              }
              case("documento"):
                await adapterProvider.sendFile(number+ "@s.whatsapp.net", mensaje.content.body, mensaje.content.footer);
                break;
            }
            await utils.delay(300);
          } catch (error: any) {
            console.error(`❌ Error al enviar el mensaje de tipo '${mensaje.tipo}':`, error);
          }
        }
        
        // Verificar si el mensaje es un número para procesarlo directamente
        if(normalizedFlag !== true) {
          // Si hay un mensaje en req.body.message que es un número
          if(req.body.message && /^[0-9]+$/.test(req.body.message.trim())) {
            const option = parseInt(req.body.message.trim(), 10);
            const {flag, curso} = await consultayselectedCurso(number, option);
            
            if(flag) {
              // Si el curso existe, enviar confirmación
              await bot.provider.sendMessage(number, `Tu curso seleccionado es: *${curso}*`, {});
              await utils.delay(500);
              await bot.provider.sendMessage(
                number,
                [
                  "📝Muy bien estimado, hemos registrado el curso que le interesa",
                  "📌en unos minutos un *asesor* se estara comunicando con usted",
                ].join("\n"),
                {}
              );
              bot.blacklist.add(number+ "@s.whatsapp.net");
            } else {
              // Si el curso no existe, pedir que digite nuevamente
              await bot.provider.sendMessage(number, '👉Por favor, digite un número de curso válido (ejm 23).', {});
            }
          } else {
            // Si no es un número, pedir que digite el número
            await bot.provider.sendMessage(number, '👉Por favor, digite número del curso de su interés (ejm 23).', {});
          }
        } else {
          bot.blacklist.add(number+ "@s.whatsapp.net");
        }
        
        return res.end('sended')
    })
)

    adapterProvider.server.get(
        '/v1/codigo',
        handleCtx(async (bot, req, res) => {
            const pairingCode = bot.provider.vendor.authState.creds.pairingCode;
            const status = bot.provider.vendor.authState.creds.registered;

            res.writeHead(200, { 'Content-Type': 'application/json' })
            return res.end(JSON.stringify({ pairingCode: pairingCode, status}))
        })
    )
    httpServer(+PORT)
}

main()

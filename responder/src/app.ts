import { join } from 'path'
import { createBot, createProvider, createFlow, addKeyword, utils, EVENTS } from '@builderbot/bot'
import { MysqlAdapter as Database } from "@builderbot/database-mysql";
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'
import { consultayselectedCurso } from './cursosSelected'
import fs from "fs";
import { promisify } from "util";

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const PORT = 3003
const phoneNumber = process.env.PHONE ?? "51908911275";



const mensajefinal = addKeyword([EVENTS.ACTION]).addAnswer(
    [
      "📝Muy bien estimado, hemos registrado el curso que le interesa",
      "📌en unos minutos un *asesor* se estara comunicando con usted",
      "📌si desea cambiar de curso solo ingrese nuevamente el numero de curso de su preferencia",
    ].join("\n"),
    { capture: false },async (ctx, {endFlow}) => {
        return endFlow("gracias por su comunicacion")
    }
  );
  
const flujo = addKeyword<Provider, Database>(utils.setEvent('FLUJO'))
  .addAnswer([
    '👉Por favor, digite número del curso de su interés (ejm  23).'
  ].join("\n"), {capture: true},
  async (ctx, { fallBack, gotoFlow,flowDynamic }) => {
    const body = ctx.body.trim().toLocaleLowerCase();
    const option = parseInt(body, 10);
    if (!isNaN(option)) {
      const {flag, curso} = await consultayselectedCurso(ctx.from, option);
      if(flag){
        await flowDynamic(`Tu curso seleccionado es: *${curso}*`)
        return gotoFlow(mensajefinal);
      }else{
        await flowDynamic(`Porfavor ingresa un numero de la lista de cursos`)
        return fallBack();
      }
    } else {
      await flowDynamic("Estimado(a) porfavor ingrese el numero del curso que le interesa. Puede ver los cursos en el flyer")
      return fallBack();
    }
  },
  [mensajefinal]);

  

const welcome = addKeyword<Provider, Database>(EVENTS.WELCOME)
.addAnswer("",{capture:true}, 
  async (ctx,{ endFlow }) =>{
    const {flag, curso} = await consultayselectedCurso(ctx.from, 1);
    console.log(flag);
    if(!flag) return endFlow("")
  }
).addAnswer([
        '👉Por favor, digite número del curso de su interés (ejm  23).'
      ].join("\n"),
            { capture: true },
            async (ctx, { fallBack, gotoFlow, flowDynamic }) => {
              const body = ctx.body.trim().toLocaleLowerCase();
              const option = parseInt(body, 10);
              if (!isNaN(option)) {
                const {flag, curso} = await consultayselectedCurso(ctx.from, option);
                
                if(flag){
                  await flowDynamic(`Tu curso seleccionado es: *${curso}*`)
                  return gotoFlow(mensajefinal);
                }else{
                  await flowDynamic(`Hubo un error al seleccionar`)
                  return fallBack();
                }
              } else {
                return fallBack();
              }
            },
            [mensajefinal]);
const main = async () => {
    const adapterFlow = createFlow([flujo, welcome, mensajefinal])
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
            const { number, name, flow } = req.body;
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
            await bot.dispatch('FLUJO', { from: number, name})
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

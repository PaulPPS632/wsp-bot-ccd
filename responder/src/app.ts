import { join } from 'path'
import { createBot, createProvider, createFlow, addKeyword, utils, EVENTS } from '@builderbot/bot'
import { MysqlAdapter as Database } from "@builderbot/database-mysql";
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'
import { consultayselectedCurso, selectedCurso } from './cursosSelected'

const PORT = 3000
const phoneNumber = process.env.PHONE ?? "51948701436";



const mensajefinal = addKeyword([EVENTS.ACTION]).addAnswer(
    [
      "📝Muy bien estimado, hemos registrado el curso que le interesa",
      "📌en unos minutos un asesor se estara comunicando con usted",
    ].join("\n"),
    { capture: false },async (ctx, {endFlow}) => {
        return endFlow("gracias por su comunicacion")
    }
  );
  const promoverano = addKeyword<Provider, Database>(utils.setEvent('PROMO_VERANO'))
  .addAnswer(" ", { media: join(process.cwd(), 'assets', 'flyer_promo_verano.png')})
  .addAnswer([
      //'🌞 PROMOCIÓN VERANO - CURSOS Y DIPLOMAS DE INGENIERÍA Y MINERÍA CCD 🌟',
      '🚨BENEFICIOS INCLUIDOS🚨',
      '1 Enfoque aplicado al ámbito laboral.',
      '2 Docente expertos en minería.',
      '3 Clases en vivo - ZOOM.',
      '4 Acceso a material exclusivo.',
      '5 Sesiones prácticas con casos reales',
      '6 Aula virtual 24/7',
      '7 Certificado incluido',
      '💵 DESDE S/299.00',
      '📲 ¿Quieres aprovechar al máximo esta oportunidad'
  ].join('\n'),{delay:2000})
  .addAnswer([
    'Buen día estimado(a) ¿En qué curso estaría interesado(a) para brindarle mayor información?😊📚',
    '👉 porfavor indique el numero del curso que le interesa'
  ].join("\n"), {capture: true},
  async (ctx, { fallBack, gotoFlow,flowDynamic }) => {
    const body = ctx.body.trim().toLocaleLowerCase();
    const option = parseInt(body, 10);
    if (!isNaN(option)) {
      const {flag, curso} = await selectedCurso(ctx.from, option, 1);
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
  const armatupack = addKeyword<Provider, Database>(utils.setEvent('ARMA_TU_PACK'))
  .addAnswer(" ", { media: join(process.cwd(), 'assets', 'arma_tu_pack.png')})
  .addAnswer([
      //'🌞 PROMOCIÓN VERANO - CURSOS Y DIPLOMAS DE INGENIERÍA Y MINERÍA CCD 🌟',
      '🚀ARMA TU PACK 🚀',
      '1 Curso o diploma x  S/199 💵',
      '2 Cursos o diplomas x  S/299 💵',
      '3 Cursos o diplomas x  S/369 💵',
      '🚨 BENEFICIOS INCLUIDOS - VÁLIDOS SOLO X 24HRS🚨',
      '✅ Enfoque aplicado al ámbito laboral.',
      '✅ Certificado digital gratuito.',
      '✅ Clases disponibles 24/7.',
      '✅ Casos reales y prácticos aplicados al ámbito laboral.',
      '✅ Desct. para certificación acreditada CIP',
      '👨🏻‍🏫Estudia a tu ritmo y desde cualquier lugar⏳',
      'No dejes pasar esta oportunidad.',
      'ARMA TU PACK Y POTENCIA TU PERFIL PROFESIONAL ✅'
  ].join('\n'))
  .addAnswer([
    'Buen día estimado(a) ¿En qué curso estaría interesado(a) para brindarle mayor información?😊📚',
    '👉 porfavor indique el numero del curso que le interesa'
  ].join("\n"), {capture: true},
  async (ctx, { fallBack, gotoFlow, flowDynamic }) => {
    const body = ctx.body.trim().toLocaleLowerCase();
    const option = parseInt(body, 10);
    if (!isNaN(option)) {
      const {flag, curso} = await selectedCurso(ctx.from, option, 2);
      if(flag){
        await flowDynamic(`Tu curso seleccionado es: *${curso}*`)
        return gotoFlow(mensajefinal);
      }else{
        await flowDynamic(`Hubo un error al seleccionar`)
        return fallBack();
      }
    } else {
      await flowDynamic("Ingreso un valor no admitido")
      return fallBack();
    }
  },
  [mensajefinal]);

const welcome = addKeyword<Provider, Database>(EVENTS.WELCOME).addAnswer(
  [
    'Buen día estimado(a) ¿En qué curso estaría interesado(a) para brindarle mayor información?😊📚',
    '👉 porfavor indique el numero del curso que le interesa'
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
        [mensajefinal]
      );
const main = async () => {
    const adapterFlow = createFlow([promoverano, armatupack, welcome, mensajefinal])
    
    const adapterProvider = createProvider(Provider, { usePairingCode: true, phoneNumber})
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
    })

    adapterProvider.server.post(
        '/v1/messages',
        handleCtx(async (bot, req, res) => {
            const { number, name, flow } = req.body;
            switch(flow){
              case 1: 
                //await bot.provider.sendImage(number, join(process.cwd(), 'assets', 'flyer_promo_verano.png'),"");
                await bot.dispatch('PROMO_VERANO', { from: number, name })
                break;
              case 2: 
                //await bot.provider.sendImage(number, join(process.cwd(), 'assets', 'flyer_promo_verano.png'),"");
                await bot.dispatch('ARMA_TU_PACK', { from: number, name })
                break;
              default:
                await bot.provider.sendImage(number, join(process.cwd(), 'assets', 'flyer_promo_verano.png'),"");
                break;
            }
            
            return res.end('sended')
        })
    )

    adapterProvider.server.get(
        '/v1/codigo',
        handleCtx(async (bot, req, res) => {
            const pairingCode = bot.provider.vendor.authState.creds.pairingCode;
            res.writeHead(200, { 'Content-Type': 'application/json' })
            return res.end(JSON.stringify({ pairingCode: pairingCode}))
        })
    )
    httpServer(+PORT)
}

main()

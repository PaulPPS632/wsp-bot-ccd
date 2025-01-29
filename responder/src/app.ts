import { join } from 'path'
import { createBot, createProvider, createFlow, addKeyword, utils } from '@builderbot/bot'
import { MemoryDB as Database } from '@builderbot/bot'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'

const PORT = 3000
const phoneNumber = process.env.PHONE ?? "51948701436";

const promoverano = addKeyword<Provider, Database>(utils.setEvent('PROMO_VERANO'))
    .addAnswer(``, { media: join(process.cwd(), 'assets', 'flyer_promo_verano.jpg'),delay:3000})
    .addAnswer([
        '🌞 PROMOCIÓN VERANO - CURSOS Y DIPLOMAS DE INGENIERÍA Y MINERÍA CCD 🌟',
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
    ].join('\n'),{delay:3000})
    .addAnswer('Buen día estimado(a) ¿En qué curso estaría interesado(a) para brindarle mayor información?😊📚');

    
const main = async () => {
    const adapterFlow = createFlow([promoverano])
    
    const adapterProvider = createProvider(Provider, { usePairingCode: true, phoneNumber})
    const adapterDB = new Database()

    const { handleCtx, httpServer } = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    adapterProvider.server.post(
        '/v1/messages',
        handleCtx(async (bot, req, res) => {
            const { number, name } = req.body
            await bot.dispatch('PROMO_VERANO', { from: number, name })
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

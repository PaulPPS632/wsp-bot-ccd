import { utils } from "@builderbot/bot"
import { connectRabbitMQ } from "./rabbitmqConfig"
import { BaileysProvider } from "@builderbot/provider-baileys";
import { join } from "path";

export const startRabbitConsumer = async (adapterProvider: BaileysProvider, ruta_local_orquestador: string) => {
    try {
      const { channel } = await connectRabbitMQ();
      
      channel.consume("bases", async (msg) => {
        if (!msg) return;
  
        try {
          const content = msg.content.toString();
          const { number, delai, flow } = JSON.parse(content);
          console.log(`Esperando ${delai}ms para enviar mensaje a: ${number}`);
          await utils.delay(delai);
  
          const onWhats = await adapterProvider.vendor
            .onWhatsApp(number)
            .catch((error) => console.log("Error verificando WhatsApp:", error));
  
          if (onWhats[0]?.exists) {
            try {
              console.log(`Enviando mensaje a:`, number);
              if(flow.id == 1){
                await adapterProvider.sendMedia(number+ "@s.whatsapp.net",join(process.cwd(), 'assets', 'flyer_promo_verano.png'),'')
              }else{
                await adapterProvider.sendMedia(number+ "@s.whatsapp.net",join(process.cwd(), 'assets', 'arma_tu_pack.png'),'')
              }
              
             //const ruta ="https://resizing.flixster.com/niYOMxJrorsKHOTGcD-PzbhHo5Y=/fit-in/705x460/v2/https://resizing.flixster.com/-XZAfHZM39UwaGJIFWKAE8fS0ak=/v3/t/assets/p16473346_b_h8_ad.jpg"
             
              for(const mensaje of flow.mensajes){
                await adapterProvider.sendMessage(
                  number, mensaje.content.body,
                  {}
                );
              }
              await adapterProvider.sendMessage(
                number,
                [
                  "✅ ¡Responde con el número de tu opción y te atenderemos de inmediato!",
                  "🚨 Selecciona una opción:",
                  "👉 1 Conocer más detalles.",
                  "👉 2 Hablar con un asesor.",
                  "👉 3 No continuar por ahora.",
                ].join("\n"),
                {}
              );
              channel.ack(msg);
            } catch (sendErr) {
              console.error("Error al enviar mensaje:", sendErr);
              await fetch(`http://${ruta_local_orquestador}:8000/failmessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ number }),
              }).catch((error) => console.error("Error al actualizar estado:", error));
              channel.nack(msg, true, false);
            }
          } else {
            console.log("Número no está en WhatsApp:", number);
            channel.nack(msg, true, false);
          }
        } catch (error) {
          console.error("Error procesando mensaje:", error);
          channel.nack(msg, true, false);
        }
      });
    } catch (err) {
      console.log("Error iniciando consumidor de RabbitMQ:", err);
    }
  };
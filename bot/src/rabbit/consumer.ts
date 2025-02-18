import { utils } from "@builderbot/bot"
import { connectRabbitMQ } from "./rabbitmqConfig"
import { BaileysProvider } from "@builderbot/provider-baileys";
import fs from "fs";
import { promisify } from "util";
import { join } from "path";
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

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
              for(const mensaje of flow.mensajes){
                try {
                  switch(mensaje.tipo){
                    case("texto"):
                      await adapterProvider.sendMessage(
                        number, mensaje.content.body,
                        {}
                      );
                      break;
  
                    case("imagen"):
                      await adapterProvider.sendMedia(number+ "@s.whatsapp.net",mensaje.content.body,mensaje.content.footer);
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
            } catch (sendErr: any) {
              console.error("Error al enviar mensaje:", sendErr);
              await fetch(`http://${ruta_local_orquestador}:8000/api/masivos/failmessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ number, error: sendErr.message }),
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
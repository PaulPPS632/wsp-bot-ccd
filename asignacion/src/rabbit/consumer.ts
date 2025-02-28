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
      const queueName = process.env.PHONE;

      channel.consume(queueName, async (msg) => {
        if (!msg) return;
  
        try {
          const content = msg.content.toString();
          const { number, delai, flow, asignacion } = JSON.parse(content);
          console.log(`Esperando ${delai}ms para enviar mensaje a: ${number}`);
          await utils.delay(delai);
  
          const onWhats = await adapterProvider.vendor
            .onWhatsApp(number)
            .catch((error) => console.log("Error verificando WhatsApp:", error));
  
          if (onWhats[0]?.exists) {
            try {
             //const ruta ="https://resizing.flixster.com/niYOMxJrorsKHOTGcD-PzbhHo5Y=/fit-in/705x460/v2/https://resizing.flixster.com/-XZAfHZM39UwaGJIFWKAE8fS0ak=/v3/t/assets/p16473346_b_h8_ad.jpg"
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
              await fetch(`http://${ruta_local_orquestador}:8000/api/asignaciones/changestatus`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ asignacion ,number, status: 'ENVIADO' }),
              })
              channel.ack(msg);
            } catch (sendErr: any) {
              console.error("Error al enviar mensaje:", sendErr);
              await fetch(`http://${ruta_local_orquestador}:8000/api/asignaciones/failmessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ asignacion, number, error: sendErr.message }),
              }).catch((error) => console.error("Error al actualizar estado:", error));
              channel.nack(msg, true, false);
            }
          } else {
            console.log("Número no está en WhatsApp:", number);
            await fetch(`http://${ruta_local_orquestador}:8000/api/asignaciones/failmessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ asignacion, number, error: 'Número no está en WhatsApp' }),
            }).catch((error) => console.error("Error al actualizar estado:", error));
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
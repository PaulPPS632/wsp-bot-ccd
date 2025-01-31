import { utils } from "@builderbot/bot"
import { connectRabbitMQ } from "./rabbitmqConfig"

export const startRabbitConsumer = async (adapterProvider) => {
    try {
      const { channel } = await connectRabbitMQ();
      
      channel.consume("bases", async (msg) => {
        if (!msg) return;
  
        try {
          const content = msg.content.toString();
          const { number, delai, mensaje } = JSON.parse(content);
          console.log(`Esperando ${delai}ms para enviar mensaje a: ${number}`);
          await utils.delay(delai);
  
          const onWhats = await adapterProvider.vendor
            .onWhatsApp(number)
            .catch((error) => console.log("Error verificando WhatsApp:", error));
  
          if (onWhats[0]?.exists) {
            try {
              console.log(`Enviando mensaje a:`, number);
              /*
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
                  ].join("\n"),
                  {}
                );*/
              await adapterProvider.sendMessage(
                number, mensaje.content.body,
                {}
              );
              channel.ack(msg);
            } catch (sendErr) {
              console.error("Error al enviar mensaje:", sendErr);
              await fetch("http://host.docker.internal:8000/failmessage", {
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
import { Bases } from "../../models/Bases";
import { Bot } from "../../models/Bot";
import { Leads } from "../../models/Leads";

class LeadsController {
  RegisterLead = async (req: any, res: any) => {
    try {
      const { name, phone, respuesta } = req.body;
      if (respuesta == "interesado") {
        await Leads.create({
          name,
          phone,
          flow: null,
          respuesta,
        });
        const bot = await Bot.findAll({
          where: {
            tipo: "responder",
          },
          limit: 1,
        });
        await Bases.update(
          {
            status: true,
          },
          {
            where: {
              number: phone,
            },
          }
        );
        if (bot) {
          const botResponse = await fetch(
            `http://localhost:${bot[0].port}/v1/messages`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                number: phone,
              }),
            }
          );

          if (!botResponse.ok) {
            return res
              .status(500)
              .json({ error: "No se pudo enviar el mensaje al bot." });
          }
          await Bases.update(
            { status: true },
            {
              where: {
                phone: phone,
              },
            }
          );
        } else {
          console.warn(
            "No se encontró un bot disponible del tipo 'responder'."
          );
        }
      }

      return res
        .status(201)
        .json({ message: "Lead registrado correctamente." });
    } catch (error) {
      console.error("Error en el endpoint /bot/register-lead:", error);
      return res.status(500).json({
        error: "Ocurrió un error interno al procesar la solicitud.",
      });
    }
  };
}
export default LeadsController;

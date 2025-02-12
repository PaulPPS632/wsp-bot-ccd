import { AsignacionCliente } from "../../models/AsignacionCliente";
import { Asignaciones } from "../../models/Asignaciones";
import { Clientes } from "../../models/Clientes";
import RabbitMQService from "../../services/RabbitMQService";

export class AsignacionesController {
  sendAsignaciones = async (req: any, res: any) => {
    try {
      const { name, numeros, flow, bot, delaymin, delaymax } = req.body.asignaciones;

      if(numeros.length == 0) return res.status(400).json({error:"no puedes enviar una asignacion sin numeros de destino"})
      const numbers = numeros.map((numero: any) => ({ number: numero }));

      await Clientes.bulkCreate(numbers, {
        ignoreDuplicates: true,
      });

      const clientes = await Clientes.findAll({
        where: { number: numeros },
      });

      const newasignacion = await Asignaciones.create({
        name,
        amountsend: numbers.length,
        botId: bot.id,
        flowId: flow.id,
      }) 
      
      const asigbulk = numeros
        .map((numero: any) => {
          const cliente = clientes.find((c) => c.number === numero);
          return cliente
            ? {
                asignacionId: newasignacion.id,
                clienteId: cliente.id,
                status: "ENVIADO"
              }
            : null;
        })
        .filter((item: any) => item !== null);

      await AsignacionCliente.bulkCreate(asigbulk);

      const rabbitMQ = await RabbitMQService.getInstance();
      const exchange = "asesores";
      for (const numero of numeros) {
        const routingKey = "51"+bot.phone.toString();
        const cantdelay =
          (Math.floor(Math.random() * (delaymax - delaymin + 1)) + delaymin) *
          1000;
        const message = { number: numero, delai: cantdelay, flow };
        await rabbitMQ.sendMessageToExchange(
          exchange,
          routingKey,
          JSON.stringify(message)
        );
      }
      return res
        .status(200)
        .json({ message: "se registraron correctamente la asignacion" });
    } catch (error: any) {
      console.log("error en envio de asignaciones", error.message);
      return res
        .status(500)
        .json({
          message: "error en envio de asignaciones",
          error: error.menssage,
        });
    }
  };
  FailMessage = async (req: any, res: any) => {
    try {
      const { number, error } = req.body;
      const cliente = await Clientes.findOne({
        where: {
          number,
        },
      });
      if (!cliente)
        return res
          .status(404)
          .json({ message: "no se encontro el cliente de este numero" });
      const ultimaAsignacion = await AsignacionCliente.findOne({
        where: { clienteId: cliente.id },
        order: [["createdAt", "DESC"]], // Ordena por id en orden descendente (el más reciente primero)
      });
      if (!ultimaAsignacion) {
        return res
          .status(404)
          .json({
            message: "No se encontró ninguna asignación para este cliente",
          });
      }
      await ultimaAsignacion.update({
        status: "error al enviar el mensaje",
        observacionstatus: error,
      });

      return res.status(200).json();
    } catch (error: any) {
      console.error("Error en FailMessage:", error.message);
      return res
        .status(500)
        .json({
          message: "Error al actualizar la asignación",
          error: error.message,
        });
    }
  };
}

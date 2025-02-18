
import { Leads } from "../../models/Leads";
import RabbitMQService from "../../services/RabbitMQService";

class MasivosController {
  SendMasivos = async (req: any, res: any) => {
    const { masivos } = req.body;
    try {
      // Obtener bots y bases desde la base de datos
      const bases = await Leads.findAll({
        where: {
          status: false,
        },
        limit: masivos.cant,
      });

      if (!bases || bases.length === 0) {
        return res
          .status(404)
          .json({ error: "No se encontraron bases para enviar masivos" });
      }

      const numbers = bases.map((base) => base.number);
      if (numbers.length === 0) {
        return res
          .status(404)
          .json({ error: "No hay números disponibles para asignar" });
      }
      // Enviar mensaje a la cola para cada número
      const rabbitMQ = RabbitMQService.getInstance();
      await rabbitMQ.init();
      for (const number of numbers) {
        const queue = "bases";
        const cantdelay =(Math.floor(Math.random() * (masivos.delaymax - masivos.delaymin + 1)) + masivos.delaymin) * 1000;

        let randomIndex = Math.floor(Math.random() * masivos.flows.length);
        let flowAleatorio = masivos.flows[randomIndex];

        const message = { number: number, delai: cantdelay, flow: flowAleatorio };
        
        // Enviar mensaje a la cola "bases"
        await rabbitMQ.sendMessage(queue, JSON.stringify(message));
        await Leads.update({
          flowId:flowAleatorio.id,
          status: true
        },{where:{
          number: number
        }})
      }
      // Actualizar el estado de todas las bases a 'true'
      if (numbers.length > 0) {
        await Leads.update({ status: true }, { where: { number: numbers } });
      }
      res
        .status(200)
        .json({ message: "se registraron correctamente los queues" });
    } catch (error) {
      console.error("Error al procesar los masivos:", error);
      res
        .status(500)
        .json({ error: "Ocurrió un error al procesar la solicitud" });
    }
  };
  FailMessage = async (req: any, res: any) => {
    const { number } = req.body;
    await Leads.update(
      {
        status: false,
      },
      {
        where: {
          number: number,
        },
      }
    );
    return res.status(200).json();
  };
  
}
export default MasivosController;

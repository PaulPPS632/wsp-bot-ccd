
import { Leads } from "../../models/Leads";
import { MasivoLead } from "../../models/MasivoLead";
import { Masivos } from "../../models/Masivos";
import RabbitMQService from "../../services/RabbitMQService";

class MasivosController {
  
  SendMasivosExcel = async (req: any, res: any) => {
    try{
      const {masivos, numeros} = req.body;
      if(numeros.length == 0) return res.status(400).json({error:"no puedes enviar una asignacion sin numeros de destino"})
        for (const numero of numeros) {
          await Leads.findOrCreate({
            where: { number: numero },
            defaults: { number: numero , status: true, metodo: "MASIVO"},
          });
      }

      const leads = await Leads.findAll({
        where: { number: numeros },
      });

      console.log(masivos);
      

      // Enviar mensaje a la cola para cada número
      const rabbitMQ = await RabbitMQService.getInstance();
      console.log("funciona hasta aca");
      
      //registrando masivo
      const nuevoMasivo = await Masivos.create({
        name: masivos.name,
        amountsend: masivos.cant,
        delaymin: masivos.delaymin,
        delaymax: masivos.delaymax,
        usuarioId: req.data.id,
        amountinteres: 0,
        flagResponder: masivos.flagResponder,
        flowResponderId: masivos.flowResponder.id,
        botId: masivos.flagResponder ? masivos.bot.id : null,
        sheetId: masivos.sheet.id
      })
      // flag para saber si hay 1 curso o mas, si hay 1 curso signigica q el respondedor no hara q el cliente escoga
      // si hay mas de 1 curso el responderdor hara q el cliente escoga
      const flagresponderseleccion = masivos.flowResponder.cursos.length === 1;

      // Registrar relación con flows
      if (masivos.flows && masivos.flows.length > 0) {
        await nuevoMasivo.$set("flows", masivos.flows.map((flow: any) => flow.id));
      }

      for (const lead of leads) {
        const queue = "bases";
        const cantdelay =(Math.floor(Math.random() * (masivos.delaymax - masivos.delaymin + 1)) + masivos.delaymin) * 1000;

        let randomIndex = Math.floor(Math.random() * masivos.flows.length);
        let flowAleatorio = masivos.flows[randomIndex];

        const message = { number: lead.number, delai: cantdelay, 
          flow: {
            id: flowAleatorio.id,
            name: flowAleatorio.name,
            mensajes: flowAleatorio.mensajes
          },
          flagOneCurso: flagresponderseleccion
        };
        
        // Enviar mensaje a la cola "bases"
        await rabbitMQ.sendMessage(queue, JSON.stringify(message));
        await Leads.update({
          //flowId:flowAleatorio.id,
          status: true,
          metodo: "MASIVO"
        },{where:{
          number: lead.number
        }})
        await MasivoLead.create({
          masivoId: nuevoMasivo.id,
          leadId: lead.id,
          status: "ENVIADO"
        });
      }

      // Actualizar el estado de todas las bases a 'true'
      /*
      if (numbers.length > 0) {
        await Leads.update({ status: true }, { where: { number: numbers } });
      }*/
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

  SendMasivos = async (req: any, res: any) => {
    const { masivos } = req.body;
    try {
      // Obtener bots y bases desde la base de datos
      const leads = await Leads.findAll({
        where: {
          status: false,
        },
        limit: masivos.cant,
      });

      if (!leads || leads.length === 0) {
        return res
          .status(404)
          .json({ error: "No se encontraron leads para enviar masivos" });
      }

      // Enviar mensaje a la cola para cada número
      const rabbitMQ = await RabbitMQService.getInstance();
      
      //registrando masivo
      console.log(masivos);
      

      const nuevoMasivo = await Masivos.create({
        name: masivos.name,
        amountsend: masivos.cant,
        delaymin: masivos.delaymin,
        delaymax: masivos.delaymax,
        usuarioId: req.data.id,
        amountinteres: 0,
        flagResponder: masivos.flagResponder,
        flowResponderId: masivos.flowResponder.id,
        botId: masivos.flagResponder ? masivos.bot.Id : null,
        sheetId: masivos.sheet.id
      })
      // Registrar relación con flows
      if (masivos.flows && masivos.flows.length > 0) {
        await nuevoMasivo.$set("flows", masivos.flows.map((flow: any) => flow.id));
      }

      const flagresponderseleccion = masivos.flowResponder.cursos.length === 1;

      for (const lead of leads) {
        const queue = "bases";
        const cantdelay =(Math.floor(Math.random() * (masivos.delaymax - masivos.delaymin + 1)) + masivos.delaymin) * 1000;

        let randomIndex = Math.floor(Math.random() * masivos.flows.length);
        let flowAleatorio = masivos.flows[randomIndex];

        const message = { number: lead.number, delai: cantdelay, 
          flow: {
          id: flowAleatorio.id,
          name: flowAleatorio.name,
          mensajes: flowAleatorio.mensajes
        } ,
        flagOneCurso: flagresponderseleccion
        };
        
        // Enviar mensaje a la cola "bases"
        await rabbitMQ.sendMessage(queue, JSON.stringify(message));
        await Leads.update({
          //flowId:flowAleatorio.id,
          status: true,
          metodo: "MASIVO"
        },{where:{
          number: lead.number
        }})
        await MasivoLead.create({
          masivoId: nuevoMasivo.id,
          leadId: lead.id,
          status: "ENVIADO"
        });
      }

      // Actualizar el estado de todas las bases a 'true'
      /*
      if (numbers.length > 0) {
        await Leads.update({ status: true }, { where: { number: numbers } });
      }*/
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
    try {
          const { number, error } = req.body;
          const lead = await Leads.findOne({
            where: {
              number,
            },
          });
          if (!lead)
            return res
              .status(404)
              .json({ message: "no se encontro el cliente de este numero" });
          const ultimoMasivo = await MasivoLead.findOne({
            where: { leadId: lead.id },
            order: [["createdAt", "DESC"]], // Ordena por id en orden descendente (el más reciente primero)
          });
          if (!ultimoMasivo) {
            return res
              .status(404)
              .json({
                message: "No se encontró ningun masivo para este cliente",
              });
          }
          await ultimoMasivo.update({
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
export default MasivosController;

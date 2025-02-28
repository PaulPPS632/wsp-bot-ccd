import { Op } from "sequelize";
import { AsignacionLead } from "../../models/AsignacionLead";
import { Asignaciones } from "../../models/Asignaciones";
import { Leads } from "../../models/Leads";
import RabbitMQService from "../../services/RabbitMQService";
import { TaskQueueService } from "../../services/TaskQueueService";
import { Bot } from "../../models/Bot";
import { Flows } from "../../models/Flows";
import { Usuarios } from "../../models/Usuarios";


export class AsignacionesController {
  sendAsignaciones = async (req: any, res: any) => {
    try {
      const { name, numeros, flow, bot, delaymin, delaymax } =
        req.body.asignaciones;

      if (numeros.length == 0)
        return res.status(400).json({
          error: "no puedes enviar una asignacion sin numeros de destino",
        });
      //const numbers = numeros.map((numero: any) => ({ number: numero }));

      for (const numero of numeros) {
        await Leads.findOrCreate({
          where: { number: numero },
          defaults: { number: numero, status: true, metodo: "ASIGNACION" },
        });
      }

      const clientes = await Leads.findAll({
        where: { number: numeros },
      });

      const newasignacion = await Asignaciones.create({
        name,
        amountsend: numeros.length,
        botId: bot.id,
        flowId: flow.id,
        currentflow: flow,
        usuarioId: req.data.id,
        status: 'PENDIENTE'
      });

      const asigbulk = numeros
        .map((numero: any) => {
          const cliente = clientes.find((c) => c.number === numero);
          return cliente
            ? {
                asignacionId: newasignacion.id,
                leadId: cliente.id,
                status: "PENDIENTE",
              }
            : null;
        })
        .filter((item: any) => item !== null);

      await AsignacionLead.bulkCreate(asigbulk);

      const rabbitMQ = await RabbitMQService.getInstance();
      const exchange = "asesores";
      for (const numero of numeros) {
        const routingKey = "51" + bot.phone.toString();
        const cantdelay =
          (Math.floor(Math.random() * (delaymax - delaymin + 1)) + delaymin) *
          1000;
        const message = { number: numero, delai: cantdelay, flow, asignacion: newasignacion.id  };
        await rabbitMQ.sendMessageToExchange(
          exchange,
          routingKey,
          JSON.stringify(message)
        );
      }
      return res
        .status(200)
        .json({ message: "se registraron correctamente la asignacion" })
      /* .redirect("/newasignacion"); */


    } catch (error: any) {
      console.log("error en envio de asignaciones", error.message);
      return res.status(500).json({
        message: "error en envio de asignaciones",
        error: error.menssage,
      });
    }
  };
  FailMessage = async (req: any, res: any) => {
    try {
      const { number, error, asignacion } = req.body;
      const lead = await Leads.findOne({
        where: {
          number,
        },
      });

      if (!lead)
        return res
          .status(404)
          .json({ message: "no se encontro el cliente de este numero" });
        const ultimaAsignacion = await AsignacionLead.findOne({
          where: { leadId: lead.id,
          asignacionId: asignacion
         },
      });
      if (!ultimaAsignacion) {
        return res.status(404).json({
          message: "No se encontró ninguna asignación para este cliente",
        });
      }
      await ultimaAsignacion.update({
        status: "ERROR",
        observacionstatus: error,
      });

      return res.status(200).json();
    } catch (error: any) {
      console.error("Error en FailMessage:", error.message);
      return res.status(500).json({
        message: "Error al actualizar la asignación",
        error: error.message,
      });
    }
  };
  ProgramarAsignacion = async (req: any, res: any) => {
    try {
      const { name, numeros, flow, bot, delaymin, delaymax } =
        req.body.asignaciones;
      const { programacion } = req.body;
      console.log("fecha de programacion", programacion);
      if (numeros.length == 0)
        return res.status(400).json({
          error: "no puedes enviar una asignacion sin numeros de destino",
        });

      for (const numero of numeros) {
        await Leads.findOrCreate({
          where: { number: numero },
          defaults: { number: numero, status: true, metodo: "ASIGNACION" },
        });
      }

      const clientes = await Leads.findAll({
        where: { number: numeros },
      });

      const newasignacion = await Asignaciones.create({
        name,
        amountsend: numeros.length,
        botId: bot.id,
        flowId: flow.id,
        currentflow: flow,
        delaymin: delaymin,
        delaymax: delaymax,
        status: 'PENDIENTE'
      });

      const asigbulk = numeros
        .map((numero: any) => {
          const cliente = clientes.find((c) => c.number === numero);
          const cantdelay =
            (Math.floor(Math.random() * (delaymax - delaymin + 1)) + delaymin) *
            1000;
          return cliente
            ? {
                asignacionId: newasignacion.id,
                leadId: cliente.id,
                status: "PENDIENTE",
                delay: cantdelay,
              }
            : null;
        })
        .filter((item: any) => item !== null);

      await AsignacionLead.bulkCreate(asigbulk);

      const taskQueueService = new TaskQueueService();
      const idjob = await taskQueueService.scheduleTask(
        programacion,
        newasignacion.id
      );

      return res
        .status(200)
        .json({ message: `Asignacion programada, jobId: ${idjob}` });
    } catch (error: any) {
      console.log("error en envio de asignaciones", error.message);
      return res.status(500).json({
        message: "error en envio de asignaciones",
        error: error.menssage,
      });
    }
  };
  ChangeStatus = async (req: any, res: any) => {
    try {
      const { number, status, asignacion } = req.body;
      const lead = await Leads.findOne({
        where: {
          number,
        },
      });
      if (!lead)
        return res
          .status(404)
          .json({ message: "no se encontro el cliente de este numero" });
      const ultimaAsignacion = await AsignacionLead.findOne({
        where: { 
          leadId: lead.id,
          asignacionId: asignacion
         }
      });

      if (!ultimaAsignacion) {
        return res.status(404).json({
          message: "No se encontró ninguna asignación para este cliente",
        });
      }
      await ultimaAsignacion.update({
        status,
      });
      return res.status(200).json();
    } catch (error) {
      return res.status(500).json({
        message: "Error al actualizar la asignación",
      });
    }
  };
  searchAsignacion = async (req: any, res: any) => {
    const { search, page = 1, limit = 10 } = req.body;
    const offset = (page - 1) * limit;

    try {
        const total = await Asignaciones.count({
            where: {
                name: {
                    [Op.like]: `%${search}%`
                }
            }
        });

        const asignaciones = await Asignaciones.findAll({
            where: {
                name: {
                    [Op.like]: `%${search}%`
                }
            },
            include: [
                { model: Bot, attributes: ["name", "phone"] },
                { model: Flows, attributes: ["name"] },
                { model: Usuarios, attributes: ["name"] }
            ],
            order: [['createdAt', 'DESC']],
            limit, 
            offset
        });

        const format = asignaciones.map(asignacion => ({
            id: asignacion.id,
            name: asignacion.name,
            createdAt: asignacion.createdAt,
            amountsend: asignacion.amountsend,
            botname: asignacion.bot?.name || "BOT NO EXISTE",
            botphone: asignacion.bot?.phone || "SIN TELÉFONO",
            flowname: asignacion.flow?.name || "SIN FLUJO",
            currentflow: asignacion.currentflow,
            usuario: asignacion.usuario?.name || "USUARIO NO EXISTE",
            status: asignacion.status
        }));


        return res.status(200).json({
            asignaciones: format,
            total,  // Total de registros
            page,   // Página actual
            pages: Math.ceil(total / limit)  // Total de páginas
        });

    } catch (error: any) {
        return res.status(500).json({
            message: 'Error interno al buscar',
            error: error.message
        });
    }
};
}

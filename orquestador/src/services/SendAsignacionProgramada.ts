
import { Asignaciones } from "../models/Asignaciones";
import { AsignacionLead } from "../models/AsignacionLead";
import { Bot } from "../models/Bot";
import { Flows } from "../models/Flows";
import { Leads } from "../models/Leads";
import RabbitMQService from "./RabbitMQService";

export const sendAsignacionProgramada = async (data: any) => {
    const { asignacionId } = data;

    const mensajes = await AsignacionLead.findAll({
        where:{
            asignacionId 
        },
        include:[
            {
                model: Asignaciones,
                include:[
                    {
                        model: Bot
                    },
                    {
                        model: Flows
                    }
                ]
            },
            {
                model: Leads
            }
        ],
    });
    const rabbitMQ = await RabbitMQService.getInstance();
    const exchange = "asesores";

    const promises = mensajes.map(async (mensaje) => {
        const routingKey = "51" + mensaje.asignacion.bot.phone;
        const message = { number: mensaje.lead.number, delay: mensaje.delay, flow: mensaje.asignacion.flow, asignacion: mensaje.asignacion.id };
        console.log(JSON.stringify(message));
        return rabbitMQ.sendMessageToExchange(exchange, routingKey, JSON.stringify(message));
      });
    
      // Esperamos a que todos los mensajes se envíen
      await Promise.all(promises);
}

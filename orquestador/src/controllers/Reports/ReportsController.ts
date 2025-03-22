/* import { Op } from "sequelize";
import { Asignaciones } from "../../models/Asignaciones";
import { Flows } from "../../models/Flows";
import { Leads } from "../../models/Leads";
import { MasivoLead } from "../../models/MasivoLead";
import { Masivos } from "../../models/Masivos"
import { Bot } from "../../models/Bot";
import { AsignacionLead } from "../../models/AsignacionLead";
import { Usuarios } from "../../models/Usuarios";

export class ReportsController {

    ReporteMasivos = async (_req: any, res: any) => {
        const masivos = await Masivos.findAll({
            include:[
                {
                    model: Flows
                }
            ],
            limit:20
        });
        const formattedMasivos = masivos.map(masivo => ({
            id: masivo.id,
            name: masivo.name,
            amountsend: masivo.amountsend,
            delaymin: masivo.delaymin,
            delaymax: masivo.delaymax,
            amountinteres: masivo.amountinteres,
            flows: masivo.flows?.map(flow => flow.name) || [],  // Extrae solo los nombres de los Flows,
            createdAt: masivo.createdAt,
            updatedAt: masivo.updatedAt
        }));
        return res.status(200).json({ masivos: formattedMasivos});
    }
    LeadsInteresados= async (req: any, res: any) => {
        const { id } = req.params;
        if(!id) return res.status(500).json({message: "se necesita un id para consultar"})
        const masivosLead = await MasivoLead.findAll({
            include:[
                {
                    model: Masivos,
                },
                {
                    model: Leads,
                    include:[
                        {
                            model: Flows
                        }
                    ]
                }
            ],
            where:{
                masivoId: id,
                [Op.or]: [
                    { status: { [Op.like]: 'interesado' } },
                    { status: { [Op.like]: 'interesado asesor' } }
                ]
            },
            limit:100
        });
        const formattedMasivos = masivosLead.map(masivolead => ({
            masivo: masivolead.masivo.name,
            fechaenvio: masivolead.createdAt,
            leadName: masivolead.lead.name,
            leadPhone: masivolead.lead.number,
            leadCurso: masivolead.lead.curso,
            status: masivolead.status
        }));
        return res.status(200).json({ leadsinteresados: formattedMasivos});
    }

    ReporteAsignacion = async(_req: any, res: any) => {
        
        const asignaciones = await Asignaciones.findAll({
            include:[
                {
                    model: Bot,
                    attributes:["name","phone"]
                },{
                    model: Flows,
                    attributes: ["name"]
                },
                {
                    model: Usuarios,
                    attributes: ["name"]
                }
            ],
            limit:20,
            order: [["createdAt", "DESC"]],
            
        });
        
        const format = asignaciones.map((asignacion) => ({
            id: asignacion.id,
            name: asignacion.name,
            createdAt: asignacion.createdAt,
            amountsend: asignacion.amountsend,
            botname: asignacion.bot ? asignacion.bot.name : 'BOT NO EXISTE',
            botphone: asignacion.bot ? asignacion.bot.phone : 'BOT NO EXISTE',
            flowname: asignacion.flow.name,
            currentflow: asignacion.currentflow,
            usuario: asignacion.usuario.name,
            status: asignacion.status
        }))

        return res.status(200).json({asignaciones: format});
    }
    LeadsAsignacion = async (req: any, res: any) => {
        try {
            const { id } = req.params;
        if(!id) return res.status(500).json({message: "se necesita un id para consultar"})
        const masivosLead = await AsignacionLead.findAll({
            include:[
                {
                    model: Leads,
                }
            ],
            where:{
                asignacionId: id,
            }
        });
        
        const formattedAsignacion= masivosLead.map(masivolead => {
            console.log("lead", masivolead.lead)
            return ({
            fechaenvio: masivolead.createdAt,
            leadName: masivolead.lead?.name ? masivolead.lead.name : 'CLIENTE NO EXISTE',
            leadPhone: masivolead.lead?.number ? masivolead.lead.number : 'CLIENTE NO EXISTE',
            status: masivolead.status,
            observaciones: masivolead.observacionstatus
        })
        });
        return res.status(200).json({ leadsasignacion: formattedAsignacion});
        } catch (error: any) {
            console.log("error interno del sevidor")
            return res.status(500).json({ message: "error interno del servidor", error:error.message})
        }
        
    }
} */

    import { Op } from "sequelize";
    import { Asignaciones } from "../../models/Asignaciones";
    import { Flows } from "../../models/Flows";
    import { Leads } from "../../models/Leads";
    import { MasivoLead } from "../../models/MasivoLead";
    import { Masivos } from "../../models/Masivos";
    import { Bot } from "../../models/Bot";
    import { AsignacionLead } from "../../models/AsignacionLead";
    import { Usuarios } from "../../models/Usuarios";
import { Sequelize } from "sequelize-typescript";
    
    export class ReportsController {
        
        ReporteMasivos = async (_req: any, res: any) => {
            const masivos = await Masivos.findAll({
                include: [{ model: Flows, as: "flows" }],
                limit: 1000,
                order: [["createdAt", "DESC"]]
            });
    
            const formattedMasivos = masivos.map(masivo => ({
                id: masivo.id,
                name: masivo.name,
                amountsend: masivo.amountsend,
                delaymin: masivo.delaymin,
                delaymax: masivo.delaymax,
                amountinteres: masivo.amountinteres,
                flows: masivo.flows?.map(flow => flow.name) || [],
                createdAt: masivo.createdAt,
                updatedAt: masivo.updatedAt
            }));
    
            return res.status(200).json({ masivos: formattedMasivos });
        }
    
        LeadsInteresados = async (req: any, res: any) => {
            const { id } = req.params;
            if (!id) return res.status(400).json({ message: "Se necesita un ID para consultar" });
    
            const masivosLead = await MasivoLead.findAll({
                include: [
                    { model: Masivos },
                    { model: Leads}
                ],
                where: {
                    masivoId: id,
                    [Op.or]: [
                        { status: { [Op.like]: "interesado" } },
                        { status: { [Op.like]: "interesado asesor" } }
                    ]
                },
                limit: 100
            });
            
    
            const formattedMasivos = masivosLead.map(masivolead => ({
                masivo: masivolead.masivo?.name || "DESCONOCIDO",
                fechaenvio: masivolead.createdAt,
                leadName: masivolead.lead?.name || "CLIENTE NO EXISTE",
                leadPhone: masivolead.lead?.number || "SIN TELÉFONO",
                leadCurso: masivolead.lead?.curso || "SIN CURSO",
                status: masivolead.status
            }));
    
            return res.status(200).json({ leadsinteresados: formattedMasivos });
        }
    
        ReporteAsignacion = async (_req: any, res: any) => {
            const asignaciones = await Asignaciones.findAll({
                include: [
                    { model: Bot, attributes: ["name", "phone"] },
                    { model: Flows, attributes: ["name"] },
                    { model: Usuarios, attributes: ["name"] }
                ],
                limit: 20,
                order: [["createdAt", "DESC"]]
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
    
            return res.status(200).json({ asignaciones: format });
        }

        BuscarAsignaciones = async (req: any, res: any) => {
            try {
                const { name } = req.query;
    
                if (!name || typeof name !== "string") {
                    return res.status(400).json({ error: "El parámetro 'name' es obligatorio y debe ser un string" });
                }
    
                const asignaciones = await Asignaciones.findAll({
                    where: {
                        name: {
                            [Op.like]: `%${name}%`
                        }
                    },
                    include: [
                        { model: Bot, attributes: ["name", "phone"] },
                        { model: Flows, attributes: ["name"] },
                        { model: Usuarios, attributes: ["name"] }
                    ],
                    order: [["createdAt", "DESC"]]
                });
    
                res.json(asignaciones);
            } catch (error) {
                console.error("Error al buscar asignaciones:", error);
                res.status(500).json({ error: "Error al buscar asignaciones" });
            }
        }
    
        LeadsAsignacion = async (req: any, res: any) => {
            try {
                const { id } = req.params;
                if (!id) return res.status(400).json({ message: "Se necesita un ID para consultar" });
    
                const masivosLead = await AsignacionLead.findAll({
                    include: [{ model: Leads }],
                    where: { asignacionId: id }
                });
    
                const formattedAsignacion = masivosLead.map(masivolead => ({
                    fechaenvio: masivolead.updatedAt,
                    leadName: masivolead.lead?.name || "NOMBRE CLIENTE NO EXISTE",
                    leadPhone: masivolead.lead?.number || "SIN TELÉFONO",
                    status: masivolead.status,
                    observaciones: masivolead.observacionstatus
                }));
    
                return res.status(200).json({ leadsasignacion: formattedAsignacion });
            } catch (error: any) {
                console.error("Error interno del servidor:", error);
                return res.status(500).json({ message: "Error interno del servidor", error: error.message });
            }
        }

        cantMensajes = async (req: any, res: any) => {
            try {
                // Obtener la fecha dinámica desde los parámetros de la solicitud
                const { date } = req.body; // O req.body si prefieres enviarlo en el body
            
                if (!date) {
                  return res.status(400).json({ message: 'La fecha es requerida' });
                }
            
                // Convertir la fecha a un objeto Date
                const selectedDate = new Date(date as string);
            
                // Verificar si la fecha es válida
                if (isNaN(selectedDate.getTime())) {
                  return res.status(400).json({ message: 'Fecha no válida' });
                }
            
                // Ajustar la fecha para trabajar en la zona horaria configurada (-05:00)
                const startOfDay = new Date(selectedDate);
                startOfDay.setHours(0, 0, 0, 0);
            
                const endOfDay = new Date(selectedDate);
                endOfDay.setHours(23, 59, 59, 999);
                console.log("=========================================");
                console.log("fecha ingresada del front:", date);
                console.log("=========================================");
                console.log("fecha parseado:", selectedDate);
               
                console.log("=========================================");
                console.log(startOfDay, endOfDay);
                console.log("=========================================");
                // Consulta para obtener los registros del día seleccionado
                const masivos = await MasivoLead.findAll({
                  where: {
                    createdAt: {
                      [Op.between]: [startOfDay, endOfDay],
                    },
                  },
                });

                const asignaciones = await Asignaciones.findAll({
                    attributes:[
                        [Sequelize.fn("SUM", Sequelize.col("amountsend")), "totalEnviado"],
                    ],
                    where: {
                        createdAt: {
                          [Op.between]: [startOfDay, endOfDay],
                          
                        },
                    },
                });
            
                // Contadores para los diferentes estados
                let totalMessages = 0;
                let interesados = 0;
                let noInteresados = 0;
            
                // Recorrer los resultados y contar los estados
                masivos.forEach((masivo) => {
                  totalMessages++;
                  if (masivo.status === 'interesado') {
                    interesados++;
                  } else if (masivo.status === 'no interesado') {
                    noInteresados++;
                  }
                });

                let conteoTotal = asignaciones[0].getDataValue("totalEnviado");
                let totalEnviado = 0;
                let totalPendiente = 0;
                let totalError = 0;
            
                // Recorrer los resultados y contar los estados
                asignaciones.forEach((asignacion) => {
                  if (asignacion.status === 'ENVIADO') {
                    totalEnviado++;
                  } else if (asignacion.status === 'PENDIENTE') {
                    totalPendiente++;
                  } else if (asignacion.status === 'ERROR') {
                    totalError++;
                  }
                });
            
                // Enviar la respuesta con las estadísticas
                res.status(200).json({Masivos: {Total:totalMessages, Interesados:interesados, NoInteresados:noInteresados}, Asignaciones: {Total: conteoTotal,Enviado:totalEnviado, Pendientes:totalPendiente, Errores:totalError}});

              } catch (error) {
                console.error('Error al obtener las estadísticas:', error);
                res.status(500).json({ message: 'Error interno del servidor' });
              }
          };

        
        AsignacionesxUsuario = async (_req:any, res:any) => {
            try {
                const asignaciones = await Asignaciones.findAll({
                    include: [{
                        model: Usuarios,
                        as: "usuario",
                        attributes: ["name"],
                    }],
                    attributes: [
                        [Sequelize.fn("DATE", Sequelize.col("Asignaciones.createdAt")), "fecha"],
                        [Sequelize.fn("SUM", Sequelize.col("amountsend")), "totalEnviado"],
                    ],
                    group: ["fecha", "usuario.id"],
                    order: [["fecha", "ASC"]],
                });
        
                const result:any = {};
        
                asignaciones.forEach((asignacion) => {
                    const fecha = asignacion.getDataValue("fecha");
                    const usuario = asignacion.getDataValue("usuario");
                    const totalEnviado = asignacion.getDataValue("totalEnviado");
                    
                    if (!fecha || !usuario) return;
        
                    if (!result[usuario.name]) {
                        result[usuario.name] = { name: usuario.name, series: [] };
                    }
                    
                    result[usuario.name].series.push({
                        name: fecha, // Usamos la fecha como "name" para el formato deseado
                        value: totalEnviado
                    });
                });
                
                res.json(Object.values(result));
            } catch (error) {
                console.error("Error obteniendo las asignaciones:", error);
                res.status(500).json({ message: "Error obteniendo las asignaciones" });
            }
        };

        AsignacionesxUsuario2 = async (req:any, res:any) => {
            try {
                const { date } = req.body; // O req.body si prefieres enviarlo en el body
            
                if (!date) {
                  return res.status(400).json({ message: 'La fecha es requerida' });
                }
            
                // Convertir la fecha a un objeto Date
                const selectedDate = new Date(date as string);
            
                // Verificar si la fecha es válida
                if (isNaN(selectedDate.getTime())) {
                  return res.status(400).json({ message: 'Fecha no válida' });
                }
            
                // Ajustar la fecha para trabajar en la zona horaria configurada (-05:00)
                const startOfDay = new Date(selectedDate);
                startOfDay.setHours(0, 0, 0, 0);
            
                const endOfDay = new Date(selectedDate);
                endOfDay.setHours(23, 59, 59, 999);
                const asignaciones = await Asignaciones.findAll({
                    where: {        
                        createdAt: {
                        [Op.between]: [startOfDay, endOfDay],
                        },
                    },
                    include: [{
                        model: Usuarios,
                        as: "usuario",
                        attributes: ["name"],
                    }],
                    attributes: [
                        [Sequelize.fn("SUM", Sequelize.col("amountsend")), "totalEnviado"]
                    ],
                    group: ["usuario.id", "usuario.name"],
                    order: [[Sequelize.fn("SUM", Sequelize.col("amountsend")), "DESC"]],
                });
        
                const result = asignaciones.map((asignacion) => ({
                    name: asignacion.getDataValue("usuario").name,
                    value: asignacion.getDataValue("totalEnviado"),
                }));
        
                res.json(result);
            } catch (error) {
                console.error("Error obteniendo las asignaciones:", error);
                res.status(500).json({ message: "Error obteniendo las asignaciones" });
            }
        };

        cantMasivosPorDia = async (_req:any, res:any) => {
            try {
                const masivos = await MasivoLead.findAll({
                    attributes: [
                        [Sequelize.fn("DATE", Sequelize.col("MasivoLead.createdAt")), "fecha"],
                        [Sequelize.fn("COUNT", Sequelize.col("MasivoLead.id")), "totalEnviado"]

                    ],
                    group: ["fecha"],
                    order: [["fecha", "ASC"]],
                });
        
                const result:any = {};
        
                masivos.forEach((masivo) => {
                    const fecha = masivo.getDataValue("fecha");
                    const usuario = "Masivos";
                    const totalEnviado = masivo.getDataValue("totalEnviado");
                    
                    if (!fecha || !usuario) return;
        
                    if (!result[usuario]) {
                        result[usuario] = { name: usuario, series: [] };
                    }
                    
                    result[usuario].series.push({
                        name: fecha, // Usamos la fecha como "name" para el formato deseado
                        value: totalEnviado
                    });
                });
                
                //res.json(masivos);
                res.json(Object.values(result));
            } catch (error) {
                console.error("Error obteniendo las asignaciones:", error);
                res.status(500).json({ message: "Error obteniendo las asignaciones" });
            }
        };

        cantInteresadosPorDiav2 = async (_req:any, res:any) => {
            try {
                const interesados = await MasivoLead.findAll({
                    attributes: [
                        [Sequelize.fn("DATE", Sequelize.col("MasivoLead.createdAt")), "fecha"],
                        "status",
                        [Sequelize.fn("COUNT", Sequelize.col("MasivoLead.id")), "cantidad"]
                    ],
                    where: {
                        status: ["interesado", "no interesado"]
                    },
                    group: ["fecha", "status"],
                    order: [["fecha", "ASC"]]
                });
        
                // Objeto para agrupar por fecha
                const result:any = {};
        
                // Organizar los datos
                interesados.forEach((interesado) => {
                    const fecha = interesado.getDataValue("fecha");
                    const status = interesado.getDataValue("status");
                    const cantidad = interesado.getDataValue("cantidad");
        
                    if (!fecha) return;
        
                    // Si la fecha no existe en el objeto, la creamos
                    if (!result[fecha]) {
                        result[fecha] = {
                            name: fecha,
                            series: [
                                { name: "interesado", value: 0 },
                                { name: "no interesado", value: 0 }
                            ]
                        };
                    }
        
                    // Actualizamos los valores correspondientes
                    if (status === "interesado") {
                        result[fecha].series[0].value = cantidad;
                    } else if (status === "no interesado") {
                        result[fecha].series[1].value = cantidad;
                    }
                });
        
                // Convertimos el objeto a un array
                res.json(Object.values(result));
            } catch (error) {
                console.error("Error obteniendo las asignaciones:", error);
                res.status(500).json({ message: "Error obteniendo las asignaciones" });
            }
        };
        

        cantInteresadosPorDiav1 = async (_req:any, res:any) => {
            try {
                const interesados = await MasivoLead.findAll({
                    attributes: [
                        [Sequelize.fn("DATE", Sequelize.col("MasivoLead.createdAt")), "fecha"],
                        "status",
                        [Sequelize.fn("COUNT", Sequelize.col("MasivoLead.id")), "cantidad"]
                    ],
                    where: {
                        status: ["interesado", "no interesado"] // Filtrar solo estos valores
                    },
                    group: ["fecha", "status"],
                    order: [["fecha", "ASC"]]
                });
        
                const result:any = {};
        
                interesados.forEach((interesado) => {
                    const fecha = interesado.getDataValue("fecha");
                    const status = interesado.getDataValue("status");
                    const cantidad = interesado.getDataValue("cantidad");
        
                    if (!status || !fecha) return;
        
                    // Si no existe el status en el resultado, lo inicializamos
                    if (!result[status]) {
                        result[status] = { name: status, series: [] };
                    }
        
                    // Agregamos la fecha y cantidad al array de series
                    result[status].series.push({
                        name: fecha,
                        value: cantidad
                    });
                });
        
                res.json(Object.values(result)); // Convertimos el objeto en un array
            } catch (error) {
                console.error("Error obteniendo las asignaciones:", error);
                res.status(500).json({ message: "Error obteniendo las asignaciones" });
            }
        };

    }
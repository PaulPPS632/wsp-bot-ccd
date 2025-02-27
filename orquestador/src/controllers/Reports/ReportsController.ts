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

    BuscarAsignaciones = async (req: any, res: any) => {
        try {
            const { name } = req.query; 
        
            const asignaciones = await Asignaciones.findAll({
                where: {
                    name: {
                        [Op.like]: `%${name}%`,
                    },
                },
                include: [
                    { model: Bot, attributes: ["name", "phone"] },
                    { model: Flows, attributes: ["name"] },
                    { model: Usuarios, attributes: ["name"] }
                ],
                order: [["createdAt", "DESC"]],
            });
        
                res.json(asignaciones);
            } catch (error) {
                res.status(500).json({ error: "Error al buscar asignaciones" });
            }
        };
    

        const format = asignaciones.map((asignacion) => ({
            id: asignacion.id,
            name: asignacion.name,
            createdAt: asignacion.createdAt,
            amountsend: asignacion.amountsend,
            botname: asignacion.bot ? asignacion.bot.name : 'BOT NO EXISTE',
            botphone: asignacion.bot ? asignacion.bot.phone : 'BOT NO EXISTE',
            flowname: asignacion.flow.name,
            currentflow: asignacion.currentflow,
            usuario: asignacion.usuario.name
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
    
    export class ReportsController {
        
        ReporteMasivos = async (_req: any, res: any) => {
            const masivos = await Masivos.findAll({
                include: [{ model: Flows }],
                limit: 20
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
                    { model: Leads, include: [{ model: Flows }] }
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
                usuario: asignacion.usuario?.name || "USUARIO NO EXISTE"
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
                    fechaenvio: masivolead.createdAt,
                    leadName: masivolead.lead?.name || "CLIENTE NO EXISTE",
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
    }
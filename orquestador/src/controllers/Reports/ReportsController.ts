import { Op } from "sequelize";
import { Asignaciones } from "../../models/Asignaciones";
import { Flows } from "../../models/Flows";
import { Leads } from "../../models/Leads";
import { MasivoLead } from "../../models/MasivoLead";
import { Masivos } from "../../models/Masivos"

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
    LeadsInteresados= async (_req: any, res: any) => {
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
                status:{
                    [Op.like]: { [Op.any]: ['interesado', 'interesado asesor'] } 
                }
            },
            limit:100
        });
        const formattedMasivos = masivosLead.map(masivolead => ({
            masivo: masivolead.masivo.name,
            fechaenvio: masivolead.createdAt,
            leadName: masivolead.lead.name,
            leadPhone: masivolead.lead.number,
            leadCurso: masivolead.lead.flow.name,
            status: masivolead.status
        }));
        return res.status(200).json({ leadsinteresados: formattedMasivos});
    }
    ReporteAsignacion = async(_req: any, res: any) => {
        const asignaciones = await Asignaciones.findAll({
            limit:20
        });
        return res.status(200).json(asignaciones);
    }
}
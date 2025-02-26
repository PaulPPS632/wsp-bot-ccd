import { Temporal } from "temporal-polyfill";
import { Bot } from "../../models/Bot";
import { Flows } from "../../models/Flows";
import { Leads } from "../../models/Leads";
import XLSX from "xlsx";
import { Op, Sequelize } from "sequelize";
import { GoogleSheet } from "../../services/GoogleSheet";
import { MasivoLead } from "../../models/MasivoLead";
import { Masivos } from "../../models/Masivos";
class LeadsController {
  RegisterLead = async (req: any, res: any) => {
    try {
      const { name, phone, respuesta } = req.body;
      console.log("=============================================================");
      console.log("hay interaccion");
      console.log("=============================================================");
      const bot = await Bot.findAll({
        where: {
          tipo: "responder",
        },
        limit: 1,
      });
      const lead = await Leads.findOne({
        where:{number:phone},
        include:[
          {
            model: Flows
          }
        ]
      })
      if (bot && lead) {
        
        lead.update(
          {
            name,
            number: phone,
            respuesta,
          }
        )
        const masivolead = await MasivoLead.findOne({
          where:{
            leadId: lead.id
          },
          order: [["createdAt", "DESC"]]
        })
        if (masivolead) {
          await masivolead.update({ status: respuesta });
          if(masivolead.status != null){
            console.log("=============================================")
            console.log("AQUI LLEGA -------------------------");
            console.log("=============================================")
            await Masivos.update({
              amountinteres : Sequelize.literal("amountinteres + 1"),//aumentar en 1 al valor actual
            },{
              where:{
                id: masivolead.masivoId
              }
            })
          }
        }
        const botResponse = await fetch(
          `http://localhost:${bot[0].port}/v1/messages`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              number: phone,
              flow: lead.flow,
            }),
          }
        );
        const sheetInstance = await GoogleSheet.getInstance();
        await sheetInstance.addRow(phone, 'SIN CURSO SELECCIONADO');
        if (!botResponse.ok) {
          return res
            .status(500)
            .json({ error: "No se pudo enviar el mensaje al bot." });
        }
      } else {
        console.warn(
          "No se encontró un bot disponible del tipo 'responder'."
        );
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
  getbytNumber = async (req: any, res: any) => {
    const { number } = req.query;
    const lead = await Leads.findOne({
      where: {
        number,
      },
      include:[
        {
          model:Flows
        }
      ]
    });
    console.log(lead);
    return res.status(200).json({ lead });
  };
  updatebynumber = async (req: any, res: any) => {
    //punto final de mi proceso masivo
    try {
      const { phone, curso } = req.body;
      await Leads.update(
        {
          curso,
        },
        {
          where: {
            number: phone,
          },
        }
      );
      const sheetInstance = await GoogleSheet.getInstance();
      await sheetInstance.addRow(phone, curso);
      return res.status(201).json({ message: "actualizado correctamente" });
    } catch (error: any) {
      console.log(error.message);
      return res.status(404).json({ message: "no se encontro el lead" });
    }
  };
  downloadExcel = async (_req: any, res: any) => {
    try {
      const time = Temporal.Now.plainDateISO().toString();
      console.log(time)
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Inicio del día

      const tomorrow = new Date();
      tomorrow.setHours(24, 0, 0, 0);

      const leads = await Leads.findAll({
        where: {
          updatedAt: {
            [Op.between]: [today, tomorrow], // Mayor a hoy a las 00:00:00
          },
        },
        include: [
          {
            model: Flows,
            attributes: ["name"],
          },
        ],
      });

      const respuesta = leads.map((lead) => ({
        nombre: lead.name,
        telefono: lead.number,
        flujo: lead.flow.name,
        curso: lead.curso,
        estado: lead.respuesta,
        fechaInteraccion: time,
      }));
      // Crear un nuevo libro de Excel
      const worksheet = XLSX.utils.json_to_sheet(respuesta);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
      // Escribir el archivo en un buffer
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "buffer",
      });

      // Configurar encabezados HTTP
      res.setHeader("Content-Disposition", "attachment; filename=leads.xlsx");
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.send(excelBuffer);
    } catch (error: any) {
      console.log("error: ", error.message);
      return res
        .status(400)
        .json({
          error: "ocurrio un error en el proceso de generacion del excel",
        });
    }
  };
  cantRestanteParaMasivos = async (_req: any, res: any) => {
    try {
      const restante = await Leads.count({where:{status:false}});
      console.log(restante)
      return res.status(200).json({cant: restante});
    } catch (error: any) {
      console.log("error al obtener el restante", error);
      return res.status(500).json({message:"error interno del servidor", error: error.menssage})
    }
  }
}
export default LeadsController;

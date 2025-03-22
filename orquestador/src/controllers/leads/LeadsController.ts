import { Temporal } from "temporal-polyfill";
import { Bot } from "../../models/Bot";
import { Flows } from "../../models/Flows";
import { Leads } from "../../models/Leads";
import XLSX from "xlsx";
import { Op, Sequelize } from "sequelize";
//import { GoogleSheet } from "../../services/GoogleSheet";
import { MasivoLead } from "../../models/MasivoLead";
import { Masivos } from "../../models/Masivos";
import { GoogleSheet } from "../../services/GoogleSheet";
import { Sheets } from "../../models/Sheets";
import { log } from "console";
class LeadsController {
  RegisterLead = async (req: any, res: any) => {
    try {
      const { name, phone, respuesta } = req.body;
      console.log("=============================================================");
      console.log("hay interaccion");
      console.log("=============================================================");
      /*
      const bot = await Bot.findAll({
        where: {
          tipo: "responder",
        },
        limit: 1,
      });
      */
      const lead = await Leads.findOne({
        where:{number:phone},

      })
      if (lead) {
        
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
          include:[
            {
            model: Masivos,
            include:[
              { model: Flows, as: "flows" },
              { model: Flows, as: "flowResponder" },
              { model: Bot}
            ] 
            }
          ],  
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

        const sheetEncontrado = await Sheets.findOne({
          where: {
            id: masivolead?.masivo.sheetId
          }
        });

        const sheetInstance = await GoogleSheet.getInstance(
          process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
          process.env.GOOGLE_PRIVATE_KEY!,
          sheetEncontrado?.spreadsheetId,
          sheetEncontrado?.sheetId
        );
        //const sheetsController = SheetsController.getInstance();
        //const sheetInstance = sheetsController.getGoogleSheetInstance();

        if (!sheetInstance) {
          throw new Error("No hay una hoja activa");
        }
        //const cursos = JSON.parse(masivolead!.masivo.flowResponder!.cursos);
        console.log("cursos", masivolead!.masivo.flowResponderId);
        const flagresponderseleccion = masivolead!.masivo.flowResponder!.cursos.length === 1;
        const cursoselected = masivolead?.masivo.flagResponder ? flagresponderseleccion ? masivolead!.masivo.flowResponder!.cursos[0]: "Sin curso seleccionado"  : "Sin curso seleccionado";
        await sheetInstance.addRow(phone, cursoselected, name);

        if(masivolead?.masivo.flagResponder){

          const flowResponder = await Flows.findOne({
            where: {
              id: masivolead.masivo.flowResponderId
            }
          });

          console.log("botResponder: ", masivolead.masivo.bot.id);

          let botResponder = await Bot.findOne({
            where: { id: masivolead.masivo.botId },
          });

          if(!botResponder){
            botResponder = await Bot.findOne({
              where: {
                tipo: "responder",
              },
            });
          }

          console.log("Si llega >>>>>>>>>>>>>>");
          try {
            const botResponse = await fetch(
              `http://localhost:${botResponder!.port}/v1/messages`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  number: phone,
                  flow: flowResponder,
                  flagOneCurso: flowResponder?.cursos.length === 1,
                }),
              }
            );
            
            if (!botResponse.ok) {
              return res
                .status(500)
                .json({ error: "No se pudo enviar el mensaje al bot." });
            }
          } catch (error) {
            log("Error al enviar mensaje al bot:", error);
            return res.status(500).json({ error: "No se pudo enviar el mensaje al bot." });
          }


        }
        console.log("termino");
        

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
    const masivoLead = await MasivoLead.findOne({
      include:[
        { model: Leads, where: { number } },
        { model: Masivos, 
          include: [
            {model: Flows, as: "flowResponder"},
            { model: Flows, as: "flowResponder" },
          ] }
      ],
      order: [["createdAt", "DESC"]],
    });
      


    console.log(masivoLead);
    return res.status(200).json( masivoLead );
  };
  updatebynumber = async (req: any, res: any) => {
    //punto final de mi proceso masivo
    try {
      const { phone, curso } = req.body;

      const lead = await Leads.findOne({
        where: {
          number: phone,
        },
      });

      const masivolead = await MasivoLead.findOne({
        where:{
          leadId: lead!.id
        },
        include:[
          {
          model: Masivos,

          }
        ],  
        order: [["createdAt", "DESC"]]
      })

      const sheetEncontrado = await Sheets.findOne({
        where: {
          id: masivolead?.masivo.sheetId
        }
      });

      const sheetInstance = await GoogleSheet.getInstance(
        process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
        process.env.GOOGLE_PRIVATE_KEY!,
        sheetEncontrado?.spreadsheetId,
        sheetEncontrado?.sheetId
      );
      //const sheetsController = SheetsController.getInstance();
      //const sheetInstance = sheetsController.getGoogleSheetInstance();
      if (!sheetInstance) {
        throw new Error("No hay una hoja activa");
      }
      await sheetInstance.addRow(phone, curso, null);
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

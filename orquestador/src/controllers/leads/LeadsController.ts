import { Temporal } from "temporal-polyfill";
import { Bot } from "../../models/Bot";
import { Flows } from "../../models/Flows";
import { Leads } from "../../models/Leads";
import XLSX from "xlsx";
import { Op } from "sequelize";
import { GoogleSheet } from "../../services/GoogleSheet";
class LeadsController {
  RegisterLead = async (req: any, res: any) => {
    try {
      const { name, phone, respuesta } = req.body;
      if (respuesta == "interesado") {
        const bot = await Bot.findAll({
          where: {
            tipo: "responder",
          },
          limit: 1,
        });
        if (bot) {
          await Leads.update(
            {
              name,
              number: phone,
              respuesta,
            },
            {
              where: {
                number: phone,
              },
            }
          );
          const lead = await Leads.findOne({
            where: { number: phone },
          });

          if (lead) {
            const botResponse = await fetch(
              `http://localhost:${bot[0].port}/v1/messages`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  number: phone,
                  flow: lead.flowId ?? 0,
                }),
              }
            );
            if (!botResponse.ok) {
              return res
                .status(500)
                .json({ error: "No se pudo enviar el mensaje al bot." });
            }
          }
        } else {
          console.warn(
            "No se encontró un bot disponible del tipo 'responder'."
          );
        }
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
    console.log("el numero:", number);
    const lead = await Leads.findOne({
      where: {
        number,
      },
    });
    return res.status(200).json({ lead });
  };
  updatebynumber = async (req: any, res: any) => {
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
}
export default LeadsController;

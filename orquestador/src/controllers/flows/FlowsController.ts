import { Op } from "sequelize";
import { Flows } from "../../models/Flows";

class FlowsController {
  create = async (req: any, res: any) => {
    try {
      const { flow } = req.body;
      await Flows.create({
        name: flow.name.trim().replace(/ /g, "_"),
        mensajes: flow.mensajes,
      });
      return res.status(200).json({ message: "creado correctamente" });
    } catch (err: any) {
      return res
        .status(400)
        .json({ error: `error en servidor: ${err.message}` });
    }
  };
  listar = async (_req: any, res: any) => {
    try {
      const flows = await Flows.findAll();
      if (!flows)
        return res.status(404).json({ error: "no se encontraron flows" });
      return res.status(200).json({ flows });
    } catch (error) {
      return res.status(400).json({ error: "error en servidor" });
    }
  };
  delete = async (req: any, res: any) => {
    try {
      const { id } = req.params;

      const mensaje = await Flows.findByPk(id);
      if (!mensaje)
        return res.status(404).json({ error: "no se encontro el mensaje" });
      await mensaje.destroy();
      return res.status(200).json({ message: "se elimino correctamente" });
    } catch (error) {
      return res.status(400).json({ error: "error inesperado en servidor" });
    }
  };
  search = async (req: any, res: any) => {
    try {
      const { search } = req.body;

      const flows = await Flows.findAll({
        where: {
          name: {
            [Op.like]: `%${search.toLowerCase()}%`,
          },
        },
      });

      return res.status(200).json({ flows: flows });
    } catch (error: any) {
      console.log("error en busqueda: ", error.message);
      return res.status(500).json({ error: "error en el servidor" });
    }
  };
  update = async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const { flow } = req.body;
      await Flows.update(
        {
          name: flow.name.trim().replace(/ /g, "_"),
          mensajes: flow.mensajes,
        },
        {
          where: {
            id,
          },
        }
      );
      return res.status(200).json({ message: "se actualizo correctamente" });
    } catch (error: any) {
      return res
        .status(500)
        .json({ error: `error en servidor: ${error.message}` });
    }
  };
  getById = async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const flow = await Flows.findByPk(id);
      if (!flow)
        return res.status(404).json({ error: "no se encontro el flow" });
      return res.status(200).json({ flow: flow });
    } catch (error: any) {
      console.log("error en getbyId de flow: ", error.message);
      return res.status(500).json({ error: "error interno del servidor" });
    }
  };
}
export default FlowsController;

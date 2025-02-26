import { Op } from "sequelize";
import { Flows } from "../../models/Flows";
class FlowsController {
  create = async (req: any, res: any) => {
    try {
      const { flow } = req.body;
      await Flows.create({
        name: flow.name.trim(),
        mensajes: flow.mensajes,
        cursos: flow.cursos,
        variables: flow.variables
      });
      return res.status(200).json({ message: "creado correctamente" });
    } catch (err: any) {
      return res
        .status(400)
        .json({ error: `error en servidor: ${err.message}` });
    }
  };
  listar = async (req: any, res: any) => {
    try {
      const { masivos } = req.query;
      let flows;
      if(masivos == 'true'){
        flows = await Flows.findAll({
          where:{
            cursos: {
              [Op.and]:[
                {[Op.ne]: ''},
                {[Op.ne]: null}
              ]
            }
          }
      });
      }else{
        flows = await Flows.findAll();//todos
      }
      
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
      const { masivos } = req.query; 
      console.log(typeof masivos)
      let flows;
      if(masivos == 'true'){
        console.log('si masivo')
        flows = await Flows.findAll({
          where:{
            cursos: {
              [Op.and]:[
                {[Op.ne]: ''},
                {[Op.ne]: null}
              ]
            },
            name: {
              [Op.like]: `%${search.toLowerCase()}%`,
            },
          }
        });
      }else{
        console.log('si asignacion')
        flows = await Flows.findAll({
          where: {
            name: {
              [Op.like]: `%${search.toLowerCase()}%`,
            },
          },
        });//todos
      }
      /*
      const flows = await Flows.findAll({
        where: {
          name: {
            [Op.like]: `%${search.toLowerCase()}%`,
          },
        },
      });
*/
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
      console.log(flow);
      await Flows.update(
        {
          name: flow.name.trim(),
          mensajes: flow.mensajes,
          cursos: flow.cursos,
          variables: flow.variables
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

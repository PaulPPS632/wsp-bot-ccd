import { Mensajes } from "../../models/Mensajes";

class MensajesController {
  create = async (req: any, res: any) => {
    try {
      const { mensaje } = req.body;
      console.log(`llega: ${mensaje.tipo} ${mensaje.content}`)
      await Mensajes.create({
        tipo: mensaje.tipo,
        content: mensaje.content,
      });
      return res.status(200).json({ message: "creado correctamente" });
    } catch (err: any) {
      return res.status(400).json({ error: `error en servidor: ${err.message}`, });
    }
  };
  listar = async (_req: any, res: any) => {
    try {
      const mensajes = await Mensajes.findAll();
      if(!mensajes) return res.status(404).json({error: "no se encontraron mensajes"})
      return res.status(200).json({mensajes})
    } catch (error) {
      return res.status(400).json({error: "error en servidor"})
    }
  }
  delete = async (req: any, res: any) => {
    try {
        const { id } = req.params;

        const mensaje = await Mensajes.findByPk(id);
        if(!mensaje) return res.status(404).json({ error: "no se encontro el mensaje"});
        await mensaje.destroy()
        return res.status(200).json({ message: "se elimino correctamente"})
    } catch (error) {
        return res.status(400).json({error: "error inesperado en servidor"})
    }
  }
}
export default MensajesController;

import { Roles } from "../../models/Roles";
import { Usuarios } from "../../models/Usuarios";
import jwt from "jsonwebtoken";
export class UsuariosController {
    create = async(req: any, res: any) => {
        try {
            const { name, username, password, rolId } = req.body;
            await Usuarios.create({
                name, username, password, rolId
            })   
        } catch (error: any) {
            return res.status(500).json({message: "error interno del servidor", error: error.message});
        }
    }
    login = async (req: any, res: any) => {
        const {username, password} = req.body;
        try {
            const EntidadEncontrada = await Usuarios.findOne({
                where: { username },
                include: { model: Roles, attributes: ["id", "name"] },
            });
            console.log(EntidadEncontrada);
            if (!EntidadEncontrada) {
                return res.status(404).json({ message: "Usuario not found" });
            }
            const resultado = await Usuarios.comparePassword(
                password,
                EntidadEncontrada.password
            );

            if (resultado) {
                const token = jwt.sign(
                  { id: EntidadEncontrada.id },
                  process.env.SECRET_KEY ?? '',
                  {
                    expiresIn: 86400,
                  }
                );
                return res.status(200).json({
                  token: token,
                  rol: EntidadEncontrada.rol.name,
                  usuario: EntidadEncontrada,
                });
              } else {
                return res.status(400).json({ message: resultado });
              }
        } catch (error: any) {
            return res.status(500).json({message: "error interno del servidor", error: error.message});

        }
    }
}
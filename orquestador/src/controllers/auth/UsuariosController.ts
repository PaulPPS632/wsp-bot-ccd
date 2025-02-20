import { Roles } from "../../models/Roles";
import { Usuarios } from "../../models/Usuarios";
import jwt, { JwtPayload } from "jsonwebtoken";
export class UsuariosController {
    create = async(req: any, res: any) => {
        try {
            const { name, username, password, rolId } = req.body.usuario;
            const rol = await Roles.findByPk(rolId);
            if(!rol) return res.status(404).json({message:'el rol no existe'})
            const newusuario = await Usuarios.create({
                name, username, password, rolId
            })   
            const token = jwt.sign(
                { id: newusuario.id, rol: rol?.name },
                process.env.SECRET_KEY ?? '',
                {
                  expiresIn: 86400,
                }
              );
            return res.status(200).json({
                token,
                rol: rol.name,
                usuario: newusuario
            })
        } catch (error: any) {
            return res.status(500).json({message: "error interno del servidor", error: error.message});
        }
    }
    login = async (req: any, res: any) => {
        const {username, password} = req.body;
        console.log(username,password);
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
                  { id: EntidadEncontrada.id, rol:EntidadEncontrada.rol.name },
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

    validate = async (req: any, res: any) => {
        try {
            const { token } = req.body;
            const decoded = jwt.verify(token, process.env.SECRET_KEY ?? '') as JwtPayload;
            const usuario = await Usuarios.findOne({
                where:{
                    id: decoded.id
                },
                include: {
                    model: Roles,
                    attributes: ["id","name"]
                }
            })
            if(!usuario) return res.status(404).json({message: 'usuario no encontrado'});
            return res.status(200).json({
                estado: true, rol: usuario.rol.name, usuario: usuario
            })
        } catch (error) {
            return res.status(500).json({message: 'error interno del servidor'})
        }
    }
    listar = async (_req: any, res: any) =>{
        try {
            const usuarios = await Usuarios.findAll({
                include:[
                    {
                        model:Roles
                    }
                ]
            });
            
            return res.status(200).json({usuarios});

        } catch (error) {
            return res.status(500).json({
                message:'error interno del servidor'
            })
        }
    }
}
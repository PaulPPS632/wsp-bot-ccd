
import { Op } from "sequelize";
import DatabaseManager from "../../config/DatabaseManager";
import { Bot } from "../../models/Bot";
import DockerService from "../../services/DockerService";
import { waitForBot } from "../../utils/WaitBot";
import { getLastPort } from "../../utils/getLastPort";

class BotController {
  createBot = async (req: any, res: any) => {
    try {
      const { phone, imagebot, namebot } = req.body;
      if (!phone || isNaN(phone) || phone.length < 9) {
        return res.status(400).json({ error: "Número de teléfono inválido" });
      }
      const port = await getLastPort();

      const db_name = `bot_db_${phone}`;

      await DatabaseManager.createDatabase(db_name);

      const docker = DockerService.getInstance().getDocker();

      // Crear y correr un contenedor
      const container = await docker.createContainer({
        Image: imagebot, // Imagen del bot
        name: `bot-${imagebot}-${phone}`, // Nombre único del contenedor
        Env: [
          `PHONE=51${phone}`,
          `DB_HOST=mysql-bots`,
          `DB_USER=root`,
          `DB_NAME=${db_name}`, // Nueva DB específica del bot
          `DB_PASSWORD=botsito`,
          `DB_PORT=3306`
          ],
        ExposedPorts: {
          "3000/tcp": {}, // Puerto expuesto dentro del contenedor
        },
        HostConfig: {
          NetworkMode: "bot-network",
          PortBindings: {
            "3000/tcp": [
              {
                HostPort: port.toString(), // Mapea el puerto del contenedor al host
              },
            ],
          },
          Binds: [
            // Montar un volumen para la base de datos
            `/home/paul/Escritorio/VolumenesBot/${phone}:/app/bot_sessions`,
            //`/home/paul/Escritorio/VolumenesBot/${phone}/assets:/app/assets`,
          ],
          LogConfig:{
            Type: "json-file",
            Config:{
              "max-size": "10m",
              "max-file": "3"
            }
          },
          RestartPolicy: {
            Name: "on-failure",
            MaximumRetryCount: 5
          }
        },
      });

      await container.start(); // Inicia el contenedor

      const botData = await waitForBot(port); //espera por la inicializacion del bot
      console.log(botData);
      // Registrar el Bot
      const newBot = await Bot.create({
        containerId: container.id,
        name: namebot.toLowerCase(),
        port,
        pairingCode: botData.pairingCode,
        phone,
        tipo: imagebot,
        db_name
      });

      res.status(201).json({
        message: "Bot creado con éxito",
        containerId: newBot.containerId,
        port: newBot.port,
        pairingCode: newBot.pairingCode,
      });
    } catch (error) {
      console.error("Error al crear el bot:", error);
      res.status(500).json({ error: "Error al crear el bot" });
    }
  };

  startBots = async (_req: any, res: any) => {
    try {
      // Obtener todos los bots registrados
      const bots = await Bot.findAll();

      if (!bots.length) {
        return res
          .status(404)
          .json({ message: "No hay bots registrados para inicializar." });
      }
      const docker = DockerService.getInstance().getDocker();
      for (const bot of bots) {
        const { containerId, phone } = bot;

        try {
          const container = docker.getContainer(containerId);

          const containerInfo = await container.inspect();
          if (containerInfo.State.Running) {
            continue;
          }

          await container.restart();
        } catch (err) {
          console.error(
            `Error al inicializar el contenedor ${containerId} de numbero ${phone}:`,
            err
          );
          res.status(200).json({
            message: `Error al inicializar el contenedor ${containerId} de numero ${phone}:`,
            status: false,
          });
        }
      }
      await Bot.update({
        status: true
      },{
        where: {
          status: false
        }
      })
      res.status(200).json({
        message: "Procesamiento de bots completado",
        status: true,
      });
    } catch (error) {
      console.error("Error al inicializar bots:", error);
      res
        .status(500)
        .json({ error: "Error al inicializar bots", status: false });
    }
  };

  stopBots = async (_req: any, res: any) => {
    try {
      const bots = await Bot.findAll();

      const docker = DockerService.getInstance().getDocker();

      const stopResults = await Promise.all(
        bots.map(async (bot) => {
          const container = docker.getContainer(bot.containerId);

          try {
            await container.stop();
            return {
              containerId: bot.containerId,
              phone: bot.phone,
              status: "stopped",
            };
          } catch (error: any) {
            return {
              containerId: bot.containerId,
              phone: bot.phone,
              status: "error",
              error: error.message,
            };
          }
        })
      );
      await Bot.update({
        status: false
      },{
        where: {
          status: true
        }
      })
      // Retornar los resultados de la operación
      res.status(200).json({
        message: "Operación completada. Resultado de detener los bots:",
        results: stopResults,
        status: false,
      });
    } catch (error) {
      console.error("Error al detener todos los bots:", error);
      res.status(500).json({ error: "Error al detener todos los bots." });
    }
  };

  startBotbyContainerID = async (req: any, res: any) => {
    try {
      const { containerId } = req.body;

      if (!containerId) {
        return res.status(400).json({ error: "containerId es requerido." });
      }
      const docker = DockerService.getInstance().getDocker();

      const container = docker.getContainer(containerId);

      // Verificar si el contenedor existe
      const containerInfo = await container.inspect();

      if (containerInfo.State.Running) {
        return res
          .status(200)
          .json({ message: "El bot ya está en ejecución.", status: true });
      }

      // Iniciar el contenedor
      await container.start();
      await Bot.update({
        status: true
      },{
        where:{
          containerId
        }
      })
      res.status(200).json({
        message: "Bot iniciado correctamente.",
        containerId,
        status: true,
      });
    } catch (error: any) {
      console.error("Error al iniciar el contenedor:", error);
      res.status(500).json({
        error: "Error al iniciar el bot.",
        details: error.message,
        status: false,
      });
    }
  };

  stopBotbyContainerID = async (req: any, res: any) => {
    try {
      const { containerId } = req.body;

      if (!containerId) {
        return res.status(400).json({ error: "containerId es requerido." });
      }

      const docker = DockerService.getInstance().getDocker();

      const container = docker.getContainer(containerId);

      // Verificar si el contenedor existe
      const containerInfo = await container.inspect();

      if (!containerInfo.State.Running) {
        return res
          .status(200)
          .json({ message: "El bot ya está detenido.", status: false });
      }

      // Detener el contenedor
      await container.stop();

      await Bot.update({
        status: false
      },{
        where:{
          containerId
        }
      })

      res.status(200).json({
        message: "Bot detenido correctamente.",
        containerId,
        status: true,
      });
    } catch (error: any) {
      console.error("Error al detener el contenedor:", error);
      res.status(500).json({
        error: "Error al detener el bot.",
        details: error.message,
        status: false,
      });
    }
  };

  getBots = async (_req: any, res: any) => {
    try {
      const bots = await Bot.findAll();
      if(!bots) return res.status(404).json({message:'no hay bots'});
      const docker = DockerService.getInstance().getDocker();
      const botsWithStatus = await Promise.all(
        bots.map(async (bot) => {
          const container = docker.getContainer(bot.containerId);
          
          try {
            const containerInfo = await container.inspect();
            return {
              ...bot.toJSON(),
              status: containerInfo.State.Running, // `true` si está en ejecución
            };
          } catch (error) {
            console.log('error consultando a bot', bot.phone);
            return {
              ...bot.toJSON(),
              status: false,
            };
          }
        })
      );
      console.log(botsWithStatus);
      res.status(200).json(botsWithStatus);
    } catch (error) {
      console.error("Error al obtener los bots:", error);
      res.status(500).json({ error: "Error al obtener los bots." });
    }
  };

  getBotCodigo = async (req: any, res: any) => {
    const { port } = req.body;
    try {
      // Intentar conectarse al bot

      const response = await fetch(`http://localhost:${port}/v1/codigo`);
      if (response.ok) {
        const { pairingCode } = await response.json(); // Si la respuesta es exitosa, retornamos el JSON
        return res.status(200).json({ pairingCode });
      }
    } catch (error) {
      // Si falla, esperar antes del próximo intento
      console.log(`Esperando a que el bot en el puerto ${port} esté listo...`);
    }
  };

  getprueba = async (_req: any, res: any) => {
    const port = await getLastPort();

    return res.status(200).json({port})
  }

  search = async (req: any, res: any) => {
    const {search} = req.body;
    const { imagebot } = req.query;
    const botsSearch = await Bot.findAll({
     where:{
      name: {
        [Op.like]: `%${search.toLowerCase()}%`
      },
      tipo: imagebot
     } 
    })
    return res.status(200).json({bots: botsSearch});
  }
  deleteCache = async (req: any, res:any) => {
    const { id } = req.params;
    try {

      const bot = await Bot.findOne({where:{id}});
      
      if(!bot) return res.status(404).json({error: 'no se encuentra el bot'});
      const docker = DockerService.getInstance().getDocker();
      const container = docker.getContainer(bot.containerId);
      
      const exec = await container.exec({
        Cmd: ['sh', '-c', 'rm -rf /app/bot_sessions/* && echo "Deleted"'],
        AttachStdout: true,
        AttachStderr: true
      });
      const stream = await exec.start({});
      stream.on('data', (data: Buffer) => {
        console.log('stdout:', data.toString());
      });
      stream.on('error', (err) => {
        console.error('Error en la ejecución:', err);
      });
      stream.on('end', async () => {
        console.log('Contenido de la carpeta /app/bot_sessions borrado.');
        await container.stop();
        await bot?.update({
          status: false
        })
        // Responder al cliente después de la ejecución exitosa
        res.status(200).json({
          message: "Contenido de la carpeta 'sessions' borrado y contenedor detenido con éxito.",
        });
      });
    } catch (error) {
      console.error('Error al eliminar la caché y detener el contenedor:', error);
      res.status(500).json({ error: "Ocurrió un error al eliminar la caché o detener el contenedor." });
    }
  }
}

export default BotController;

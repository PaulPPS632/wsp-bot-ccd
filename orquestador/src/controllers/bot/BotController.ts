import { Bot } from "../../models/Bot";
import DockerService from "../../services/DockerService";
import { waitForBot } from "../../utils/WaitBot";

class BotController {
  createBot = async (req: any, res: any) => {
    try {
      const { phone, imagebot } = req.body;
      if (!phone || isNaN(phone) || phone.length < 9) {
        return res.status(400).json({ error: "Número de teléfono inválido" });
      }
      const cantBots = await Bot.count();
      const port = 3000 + cantBots;

      const docker = DockerService.getInstance().getDocker();

      // Crear y correr un contenedor
      const container = await docker.createContainer({
        Image: imagebot, // Imagen del bot
        name: `bot-${imagebot}-${phone}`, // Nombre único del contenedor
        Env: [`PORT=${port}`, `PHONE=51${phone}`],
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
        },
      });

      await container.start(); // Inicia el contenedor

      const botData = await waitForBot(port); //espera por la inicializacion del bot
      // Registrar el Bot
      const newBot = await Bot.create({
        containerId: container.id,
        port,
        pairingCode: botData.pairingCode,
        phone,
        tipo: imagebot,
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

          await container.start();
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
            return {
              ...bot.toJSON(),
              status: false,
            };
          }
        })
      );

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
}

export default BotController;

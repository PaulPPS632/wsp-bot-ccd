const express = require("express");
const Docker = require("dockerode");
const sequelize = require("./database");
const Bot = require("./models/Bot");
const waitForBot = require("./utils/WaitBot");
const Leads = require("./models/Leads");
const Base = require("./models/Base");
const { initRabbitMQ, sendMessage } = require("./rabbit");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

// Inicializamos Dockerode
const docker = new Docker({ socketPath: "//./pipe/docker_engine" });

// Registro de contenedores
// Endpoint para crear un nuevo bot
app.post("/create-bot", async (req, res) => {
  try {
    const { phone, imagebot } = req.body;
    if (!phone || isNaN(phone) || phone.length < 9) {
      return res.status(400).json({ error: "Número de teléfono inválido" });
    }
    const cantBots = await Bot.count();
    const port = 3000 + cantBots;

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

    //const queueName = `cola-bot-${bots.length + 1}`;
    //const botQueue = new Queue(queueName, { redis: { host: "localhost", port: 6379 } });

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
});
app.get("/start-bots", async (req, res) => {
  try {
    // Obtener todos los bots registrados
    const bots = await Bot.findAll();

    if (!bots.length) {
      return res
        .status(404)
        .json({ message: "No hay bots registrados para inicializar." });
    }

    const results = [];
    for (const bot of bots) {
      const { containerId, port, phone, tipo } = bot;

      try {
        const container = docker.getContainer(containerId);

        const containerInfo = await container.inspect();
        if (containerInfo.State.Running) {
          results.push({ phone, status: "Ya está en ejecución" });
          continue;
        }

        await container.start();

        results.push({
          phone,
          status: "Inicializado correctamente",
          port,
          tipo,
        });
      } catch (err) {
        console.error(
          `Error al inicializar el contenedor ${containerId}:`,
          err
        );
        results.push({
          phone,
          status: "Error al inicializar",
          error: err.message,
        });
      }
    }

    res.status(200).json({
      message: "Procesamiento de bots completado",
      status: true,
      results,
    });
  } catch (error) {
    console.error("Error al inicializar bots:", error);
    res.status(500).json({ error: "Error al inicializar bots", status: false });
  }
});
app.get("/stop-bots", async (req, res) => {
  try {
    const bots = await Bot.findAll();

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
        } catch (error) {
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
});
app.post("/start-bot", async (req, res) => {
  try {
    const { containerId } = req.body;

    if (!containerId) {
      return res.status(400).json({ error: "containerId es requerido." });
    }

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
  } catch (error) {
    console.error("Error al iniciar el contenedor:", error);
    res.status(500).json({
      error: "Error al iniciar el bot.",
      details: error.message,
      status: false,
    });
  }
});
app.post("/stop-bot", async (req, res) => {
  try {
    const { containerId } = req.body;

    if (!containerId) {
      return res.status(400).json({ error: "containerId es requerido." });
    }

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
  } catch (error) {
    console.error("Error al detener el contenedor:", error);
    res.status(500).json({
      error: "Error al detener el bot.",
      details: error.message,
      status: false,
    });
  }
});
app.get("/bots", async (req, res) => {
  try {
    const bots = await Bot.findAll();

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
});
app.post("/bot/codigo", async (req, res) => {
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
    console.log(
      `Esperando a que el bot en el puerto ${port} esté listo... (${
        i + 1
      }/${retries})`
    );
  }
});
app.post("/bot/masivos", async (req, res) => {
  const { cant } = req.body;
  try {
    // Obtener bots y bases desde la base de datos
    const bases = await Base.findAll({
      where: {
        status: false,
      },
      limit: cant,
    });

    if (!bases || bases.length === 0) {
      return res
        .status(404)
        .json({ error: "No se encontraron bases para enviar masivos" });
    }

    const numbers = bases.map((base) => base.number);
    if (numbers.length === 0) {
      return res
        .status(404)
        .json({ error: "No hay números disponibles para asignar" });
    }
    // Enviar mensaje a la cola para cada número
    numbers.forEach((number) => {
      const queue = "bases";
      const cantdelay = (Math.floor(Math.random() * (60 - 30 + 1)) + 30) * 1000;
      const message = { number: number, delai: cantdelay };

      sendMessage(queue, Buffer.from(JSON.stringify(message)));
    });
    // Actualizar el estado de todas las bases a 'true'
    await Base.update(
      { status: true },
      {
        where: {
          number: numbers, // Se asegura de actualizar solo las bases seleccionadas
        },
      }
    );
    res
      .status(200)
      .json({ message: "se registraron correctamente los queues" });
  } catch (error) {
    console.error("Error al procesar los masivos:", error);
    res
      .status(500)
      .json({ error: "Ocurrió un error al procesar la solicitud" });
  }
});
app.post("/failmessage", async (req, res) => {
  //const msg
  const { number } = req.body;
  await Base.update(
    {
      status: false,
    },
    {
      where: {
        number: number,
      },
    }
  );
  return res.status(200).json();
});
app.post("/bot/register-lead", async (req, res) => {
  try {
    const { name, phone, respuesta } = req.body;
    if (respuesta == "interesado") {
      await Leads.create({
        name,
        phone,
        flow: null,
        respuesta,
      });
      const bot = await Bot.findAll({
        where: {
          tipo: "responder",
        },
        limit: 1,
      });
      await Base.update(
        {
          status: true,
        },
        {
          where: {
            number: phone,
          },
        }
      );
      if (bot) {
        const botResponse = await fetch(
          `http://localhost:${bot[0].port}/v1/messages`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              number: phone,
            }),
          }
        );

        if (!botResponse.ok) {
          return res
            .status(500)
            .json({ error: "No se pudo enviar el mensaje al bot." });
        }
        await Base.update(
          { status: true },
          {
            where: {
              phone: phone,
            },
          }
        );
      } else {
        console.warn("No se encontró un bot disponible del tipo 'responder'.");
      }
    }

    return res.status(201).json({ message: "Lead registrado correctamente." });
  } catch (error) {
    console.error("Error en el endpoint /bot/register-lead:", error);
    return res.status(500).json({
      error: "Ocurrió un error interno al procesar la solicitud.",
    });
  }
});

// Iniciar el servidor de orquestación
const PORT = 8000;
(async () => {
  try {
    await initRabbitMQ();
    await sequelize.authenticate();
    await sequelize.sync({ alter: true }); // Sincroniza los modelos con la base de datos
    console.log("Conexión a la base de datos establecida.");
    app.listen(PORT, () => {
      console.log(`Orquestador escuchando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error al conectar con la base de datos:", error);
  }
})();

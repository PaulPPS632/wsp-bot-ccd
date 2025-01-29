const amqp = require("amqplib");

const rabbitSettings = {
  protocol: "amqp",
  hostname: "localhost",
  port: 5672,
  username: "paul",
  password: "paul",
  vhost: "/",
  authMechanism: ["PLAIN", "AMQPLAIN", "EXTERNAL"],
};

let connection = null;
let channel = null;

const queues = ["leads", "bases"]; // Lista de las colas a declarar

const initRabbitMQ = async () => {
  try {
    connection = await amqp.connect(rabbitSettings);
    channel = await connection.createChannel();

    // Asegurarse de que las colas estén declaradas
    for (const queue of queues) {
      await channel.assertQueue(queue);
    }

    console.log("RabbitMQ conectado correctamente.");
  } catch (error) {
    console.error("Error al conectar con RabbitMQ:", error);
    throw error;
  }
};

const getChannel = () => {
  if (!channel) {
    throw new Error("El canal RabbitMQ no está inicializado.");
  }
  return channel;
};

// Enviar mensajes a una cola específica
const sendMessage = async (queue, message) => {
  if (!queues.includes(queue)) {
    throw new Error(`La cola "${queue}" no está declarada.`);
  }
  try {
    await channel.sendToQueue(queue, Buffer.from(message));
    console.log(`Mensaje enviado a la cola "${queue}":`, message);
  } catch (error) {
    console.error(`Error al enviar mensaje a la cola "${queue}":`, error);
  }
};

// Consumir mensajes de una cola específica
const consumeMessages = async (queue, onMessage) => {
  if (!queues.includes(queue)) {
    throw new Error(`La cola "${queue}" no está declarada.`);
  }
  try {
    await channel.consume(queue, (msg) => {
      if (msg !== null) {
        console.log(`Mensaje recibido de la cola "${queue}":`, msg.content.toString());
        onMessage(msg.content.toString());
        channel.ack(msg); // Confirma el mensaje como procesado
      }
    });
  } catch (error) {
    console.error(`Error al consumir mensajes de la cola "${queue}":`, error);
  }
};

const closeRabbitMQ = async () => {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
    console.log("RabbitMQ cerrado correctamente.");
  } catch (error) {
    console.error("Error al cerrar RabbitMQ:", error);
  }
};

module.exports = {
  initRabbitMQ,
  getChannel,
  sendMessage,
  consumeMessages,
  closeRabbitMQ,
};
import amqp, { Connection, Channel } from "amqplib";

const rabbitSettings = {
  protocol: "amqp",
  hostname: process.env.HOST_RABBITMQ,
  port: 5672,
  username: process.env.USER_RABBITMQ,
  password: process.env.PASSWORD_RABBITMQ,
  vhost: "/",
  authMechanism: ["PLAIN", "AMQPLAIN", "EXTERNAL"],
};

const queues = ["leads", "bases", "emailQueue"]; // Lista de colas a declarar

class RabbitMQService {
  private static instance: RabbitMQService;
  private connection: Connection | null = null;
  private channel: Channel | null = null;

  private constructor() {}

  static async getInstance(): Promise<RabbitMQService> {
    if (!RabbitMQService.instance) {
      RabbitMQService.instance = new RabbitMQService();
      await RabbitMQService.instance.init(); 
    }
    return RabbitMQService.instance;
  }

  async init(): Promise<void> {
    if (this.connection) return; // Si ya está inicializado, no hacer nada

    try {
      this.connection = await amqp.connect(rabbitSettings);
      this.channel = await this.connection.createChannel();

      //const exchange = "asesores"; // Nombre del exchange
      await this.channel.assertExchange("asesores", "direct", { durable: true });
      await this.channel.assertExchange("botcrm", "direct", { durable: true });

      // Asegurarse de que las colas estén declaradas
      for (const queue of queues) {
        await this.channel.assertQueue(queue);
      }

      console.log("✅ RabbitMQ conectado correctamente.");
    } catch (error) {
      console.error("❌ Error al conectar con RabbitMQ:", error);
      throw error;
    }
  }

  getChannel(): Channel {
    if (!this.channel) {
      throw new Error("El canal RabbitMQ no está inicializado.");
    }
    return this.channel;
  }

  async sendMessage(queue: string, message: string): Promise<void> {
    if (!queues.includes(queue)) {
      throw new Error(`❌ La cola "${queue}" no está declarada.`);
    }
    if (!this.channel) {
      throw new Error("❌ El canal RabbitMQ no está disponible.");
    }

    try {
      this.channel.sendToQueue(queue, Buffer.from(message));
      console.log(`📩 Mensaje enviado a la cola "${queue}": ${message}`);
    } catch (error) {
      console.error(`❌ Error al enviar mensaje a la cola "${queue}":`, error);
    }
  }
  async sendMessageToExchange(
    exchange: string,
    routingKey: string,
    message: string
  ): Promise<void> {
    if (!this.channel) {
      throw new Error("❌ El canal RabbitMQ no está disponible.");
    }

    try {
      this.channel.publish(exchange, routingKey, Buffer.from(message));
      console.log(
        `📩 Mensaje enviado al exchange "${exchange}" con routing key "${routingKey}": ${message}`
      );
    } catch (error) {
      console.error(
        `❌ Error al enviar mensaje al exchange "${exchange}" con routing key "${routingKey}":`,
        error
      );
    }
  }
  async consumeMessages(queue: string, onMessage: (msg: string) => void): Promise<void> {
    if (!queues.includes(queue)) {
      throw new Error(`❌ La cola "${queue}" no está declarada.`);
    }
    if (!this.channel) {
      throw new Error("❌ El canal RabbitMQ no está disponible.");
    }

    try {
      await this.channel.consume(queue, (msg) => {
        if (msg !== null) {
          const content = msg.content.toString();
          console.log(`📥 Mensaje recibido de la cola "${queue}": ${content}`);
          onMessage(content);
          this.channel!.ack(msg);
        }
      });
    } catch (error) {
      console.error(`❌ Error al consumir mensajes de la cola "${queue}":`, error);
    }
  }

  async close(): Promise<void> {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
      this.channel = null;
      this.connection = null;
      console.log("✅ RabbitMQ cerrado correctamente.");
    } catch (error) {
      console.error("❌ Error al cerrar RabbitMQ:", error);
    }
  }
}

export default RabbitMQService;
     
import amqp from "amqplib";

const rabbitSettings = {
  protocol: "amqp",
  hostname: "rabbitmq",
  port: 5672,
  username: "paul",
  password: "paul",
  vhost: "/",
  authMechanism: ["PLAIN", "AMQPLAIN", "EXTERNAL"],
};

export const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(rabbitSettings);
    const channel = await connection.createChannel();
    await channel.assertQueue("bases", { durable: true });
    channel.prefetch(1);
    return { connection, channel };
  } catch (error) {
    console.error("Error connecting to RabbitMQ:", error);
    throw error;
  }
};

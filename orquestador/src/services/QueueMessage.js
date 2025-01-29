
const SendMessage = require('./SendMessage');

const registerQueue = (queue, delay) => {
    queue.process(1, async (job) => {
        const { puerto, number } = job.data;

        // Esperar antes de procesar
        await new Promise((resolve) => setTimeout(resolve, delay));

        await SendMessage(puerto, number);
    });
};
module.exports = registerQueue;
import { Worker } from "bullmq";
import { connection } from "../config/redisconfig";
import { sendAsignacionProgramada } from "./SendAsignacionProgramada";

new Worker(
  "taskQueue",
  async (job: any) => {
    console.log(`✅ Ejecutando tarea #${job.id} - ${new Date().toISOString()}`);
    await sendAsignacionProgramada(job.data);
  },
  { connection}
);
console.log("worker iniciado")

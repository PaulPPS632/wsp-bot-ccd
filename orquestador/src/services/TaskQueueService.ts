import { Queue } from "bullmq";
import { connection } from "../config/redisconfig";

export class TaskQueueService {
  private queue: Queue;

  constructor() {
    this.queue = new Queue("taskQueue", { connection });
  }

  // Programar una tarea para ejecución futura
  async scheduleTask(fecha: string, asignacionId: number) {
    const fechaEjecucion = new Date(fecha);
    if (isNaN(fechaEjecucion.getTime())) {
      throw new Error("Fecha inválida");
    }

    const delay = fechaEjecucion.getTime() - Date.now();
    console.log("delay para esperar a envio",delay);
    if (delay <= 0) {
      throw new Error("La fecha debe ser futura");
    }
    console.log("--------------------------------");
    console.log("programando tarea");
    // Agregar la tarea con retraso programado
    const job = await this.queue.add("ejecutarFuncion", { asignacionId }, { delay });
    return job.id;
  }
}

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
    if (delay <= 0) {
      throw new Error("La fecha debe ser futura");
    }

    // Agregar la tarea con retraso programado
    const job = await this.queue.add("ejecutarFuncion", { asignacionId }, { delay });
    return job.id;
  }
}

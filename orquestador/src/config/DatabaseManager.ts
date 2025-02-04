import { Sequelize } from "sequelize";

class DatabaseManager {
  private static instance: DatabaseManager;
  private sequelize: Sequelize;

  private constructor() {
    this.sequelize = new Sequelize({
      host: process.env.DB_HOST_DOCKER || "localhost", // Conectar al contenedor
      port: parseInt(process.env.DB_PORT_DOCKER || "3307"),
      username: process.env.DB_USER_DOCKER || "root",
      password: process.env.DB_PASSWORD_DOCKER || "botsito",
      dialect: "mysql",
      logging: false, // Evita logs innecesarios
    });
  }

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  async createDatabase(dbName: string) {
    try {
      await this.sequelize.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
      console.log(`Base de datos ${dbName} creada exitosamente.`);
    } catch (error) {
      console.error("Error al crear la base de datos:", error);
    }
  }
}

export default DatabaseManager.getInstance();

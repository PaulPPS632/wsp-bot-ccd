import { Router } from "express";
import { ArchivosController } from "../controllers/archivos/ArchivosController";
import { upload } from "../middlewares/upload";

const ArchivoRouter = Router();
const archivosController = new ArchivosController();

ArchivoRouter.post('', upload.single("files"), archivosController.upload);

export default ArchivoRouter;

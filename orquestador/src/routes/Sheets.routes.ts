import { Router } from "express";
import { SheetsController } from "../controllers/sheets/SheetsController";

const SheetsRouter = Router ();
const sheetsController = new SheetsController()

SheetsRouter.post("/", sheetsController.createNewSheet);
SheetsRouter.get("/", sheetsController.getAllSheets);
SheetsRouter.post("/search", sheetsController.search);
SheetsRouter.put("/:id", sheetsController.editSheet);
SheetsRouter.delete("/:id", sheetsController.deleteSheet);
//SheetsRouter.post("/setSheet", sheetsController.setActiveSheet);
//SheetsRouter.get("/getActiveSheet", sheetsController.getActiveSheet);

export default SheetsRouter;
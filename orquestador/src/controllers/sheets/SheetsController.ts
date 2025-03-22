import { Op } from "sequelize";
import { Sheets } from "../../models/Sheets";
//import { GoogleSheet } from "../../services/GoogleSheet";

export class SheetsController{
    //private googleSheetInstance: GoogleSheet | null = null;

    constructor() {
        
    }

    async createNewSheet(req: any, res: any){
        try {
            const {spreadsheetId, sheetId, name} = req.body.sheet;
            console.log("req.body", req.body);
            
            if(!spreadsheetId || !sheetId || !name){
                return res.status(400).json({error: "Faltan Datos"});
            }
            const sheet = await Sheets.create({spreadsheetId, sheetId, name});
            return res.status(201).json(sheet);
        } catch (error: any) {
            return res.status(500).json({error: error.message});   
        }
    }

    async getAllSheets(_req: any, res: any){
        try {
            const sheets = await Sheets.findAll();
            return res.status(200).json(sheets);
        } catch (error: any) {
            return res.status(500).json({error: error.message});
        }
    }

    async search(req: any, res: any){
        const {search} = req.body;
        const sheetSearch = await Sheets.findAll({
         where:{
          name: {
            [Op.like]: `%${search.toLowerCase()}%`
          },

         } 
        })
        return res.status(200).json({sheets: sheetSearch});
    }

    editSheet = async (req: any, res: any) => {
        try {
            const { id } = req.params;
            const { sheet } = req.body;
            console.log(sheet);
            await Sheets.update(
                {
                    spreadsheetId: sheet.spreadsheetId,
                    sheetId: sheet.sheetId,
                    name: sheet.name,
                },
                {
                    where: {
                        id,
                    },
                }
            );
            return res.status(200).json({ message: "Sheet updated" });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    deleteSheet = async (req: any, res: any) => {
        try {
            const { id } = req.params;
            await Sheets.destroy({
                where: {
                    id,
                },
            });
            return res.status(200).json({ message: "Sheet deleted" });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    

    
}
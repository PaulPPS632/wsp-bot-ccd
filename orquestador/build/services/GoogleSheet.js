"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleSheet = void 0;
const google_auth_library_1 = require("google-auth-library");
const google_spreadsheet_1 = require("google-spreadsheet");
class GoogleSheet {
    constructor(email, private_key) {
        const SCOPES = [
            "https://www.googleapis.com/auth/spreadsheets",
            "https://www.googleapis.com/auth/drive.file",
        ];
        const jwt = new google_auth_library_1.JWT({
            email: email,
            key: private_key.replace(/\\n/g, "\n"),
            scopes: SCOPES,
        });
        const SPREADSHEET_ID = "1PzWQDHZ9LKHi0gGFZ6ZT_9hvDG4PSCIEFt2Jm_L24E0";
        this.doc = new google_spreadsheet_1.GoogleSpreadsheet(SPREADSHEET_ID, jwt);
    }
    static getInstance(email, private_key, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!GoogleSheet.instance) {
                if (!email || !private_key) {
                    throw new Error("No hay instancia previa y faltan las credenciales.");
                }
                GoogleSheet.instance = new GoogleSheet(email, private_key);
                yield GoogleSheet.instance.doc.loadInfo();
            }
            if (callback) {
                yield callback(GoogleSheet.instance);
            }
            return GoogleSheet.instance;
        });
    }
    addRow(num, camp) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const sheet = this.doc.sheetsById[1322261515];
                // Suponiendo que "NUMERO" está en la columna A y la hoja tiene N filas
                const cellRange = `C1:C${sheet.rowCount}`; // omitiendo encabezado
                yield sheet.loadCells(cellRange);
                let rowIndex = null;
                // Iterar solo por las celdas de la columna NUMERO
                for (let row = 1; row < sheet.rowCount; row++) {
                    const cell = sheet.getCell(row, 2); // columna A = índice 0
                    if (cell.value == num) {
                        rowIndex = row;
                        break;
                    }
                }
                if (rowIndex !== null) {
                    // Si se encontró, actualiza esa fila
                    // Cargar la fila completa (o actualizar directamente las celdas correspondientes)
                    yield sheet.loadCells(`C${rowIndex + 1}:F${rowIndex + 1}`);
                    sheet.getCell(rowIndex, 2).value = num;
                    sheet.getCell(rowIndex, 4).value = camp; // Asumiendo que CAMPAÑA_PROGRAMA está en la columna B
                    sheet.getCell(rowIndex, 5).value = "WHATSAPP"; // Asumiendo que RED está en la columna C
                    yield sheet.saveUpdatedCells();
                }
                else {
                    // Si no se encontró, agrega la fila
                    yield sheet.addRow({
                        NUMERO: num,
                        PROGRAMA: camp,
                        RED: "WHATSAPP"
                    });
                }
            }
            catch (error) {
                console.log("error al enviar sheet: ", error.message);
            }
        });
    }
    getDoc() {
        return this.doc;
    }
}
exports.GoogleSheet = GoogleSheet;

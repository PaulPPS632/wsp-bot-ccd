import { JWT } from "google-auth-library";
import { GoogleSpreadsheet } from "google-spreadsheet";

export class GoogleSheet {
  private static instance: GoogleSheet;
  private doc!: GoogleSpreadsheet;
  private sheetId!: number;

  private constructor(email: string, private_key: string, SPREADSHEET_ID: string, sheetId: number) {
    const SCOPES = [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive.file",
    ];

    const jwt = new JWT({
      email: email,
      key: private_key.replace(/\\n/g, "\n"),
      scopes: SCOPES,
    });

    //const SPREADSHEET_ID = "1PzWQDHZ9LKHi0gGFZ6ZT_9hvDG4PSCIEFt2Jm_L24E0";
    this.doc = new GoogleSpreadsheet(SPREADSHEET_ID, jwt);
    this.sheetId = sheetId;
  }
  
  static async getInstance(
    email?: string,
    private_key?: string,
    spreadsheetId?: string,
    sheetId?: number,
    callback?: (instance: GoogleSheet) => Promise<void>
  ): Promise<GoogleSheet> {
    if (!GoogleSheet.instance) {
      if (!email || !private_key) {
        throw new Error("No hay instancia previa y faltan las credenciales.");
      }
      GoogleSheet.instance = new GoogleSheet(email, private_key, spreadsheetId!, sheetId!);
      await GoogleSheet.instance.doc.loadInfo();
    }

    if (callback) {
      await callback(GoogleSheet.instance);
    }

    return GoogleSheet.instance;
  }

  async addRow(num: string, camp: string, name: string | null) {
    try {
      console.log("datos que e envian a sheet: ",{num, camp, name});
      const sheet = this.doc.sheetsById[this.sheetId];

    // Suponiendo que "NUMERO" está en la columna A y la hoja tiene N filas
    const cellRange = `C1:C${sheet.rowCount}`; // omitiendo encabezado
    await sheet.loadCells(cellRange);
    
    let rowIndex: number | null = null;
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
      await sheet.loadCells(`A${rowIndex + 1}:F${rowIndex + 1}`);
      sheet.getCell(rowIndex, 0).value = new Date().toLocaleString("es-PE", { timeZone: "America/Lima" });
      if(name != null){
        sheet.getCell(rowIndex, 1).value = name;
      }
      sheet.getCell(rowIndex, 2).value = num;
      sheet.getCell(rowIndex, 4).value = camp; // Asumiendo que CAMPAÑA_PROGRAMA está en la columna B
      sheet.getCell(rowIndex, 5).value = "WHATSAPP"; // Asumiendo que RED está en la columna C
      await sheet.saveUpdatedCells();
    } else {
      // Si no se encontró, agrega la fila
      await sheet.addRow({
        FECHA: new Date().toLocaleString("es-PE", { timeZone: "America/Lima" }),
        NOMBRE: name ? name : "SIN NOMBRE",
        NUMERO: num,
        CAMPAÑA: camp,
        RED: "WHATSAPP"
      });
    }
    } catch (error: any) {
      console.log("error al enviar sheet: ", error.message)
    }
    
  }
  getDoc(): GoogleSpreadsheet{
    return this.doc;
  }
}

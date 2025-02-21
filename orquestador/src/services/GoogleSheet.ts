import { JWT } from "google-auth-library";
import { GoogleSpreadsheet } from "google-spreadsheet";

export class GoogleSheet {
  private static instance: GoogleSheet;
  private doc!: GoogleSpreadsheet;

  private constructor(email: string, private_key: string) {
    const SCOPES = [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive.file",
    ];

    const jwt = new JWT({
      email: email,
      key: private_key.replace(/\\n/g, "\n"),
      scopes: SCOPES,
    });

    const SPREADSHEET_ID = "1PzWQDHZ9LKHi0gGFZ6ZT_9hvDG4PSCIEFt2Jm_L24E0";
    this.doc = new GoogleSpreadsheet(SPREADSHEET_ID, jwt);
  }

  static async getInstance(
    email?: string,
    private_key?: string,
    callback?: (instance: GoogleSheet) => Promise<void>
  ): Promise<GoogleSheet> {
    if (!GoogleSheet.instance) {
      if (!email || !private_key) {
        throw new Error("No hay instancia previa y faltan las credenciales.");
      }
      GoogleSheet.instance = new GoogleSheet(email, private_key);
      await GoogleSheet.instance.doc.loadInfo();
    }

    if (callback) {
      await callback(GoogleSheet.instance);
    }

    return GoogleSheet.instance;
  }

  async addRow(num: string, camp: string) {
    try {
      const sheet = this.doc.sheetsById[1322261515];

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
      await sheet.loadCells(`C${rowIndex + 1}:F${rowIndex + 1}`);
      sheet.getCell(rowIndex, 2).value = num;
      sheet.getCell(rowIndex, 4).value = camp; // Asumiendo que CAMPAÑA_PROGRAMA está en la columna B
      sheet.getCell(rowIndex, 5).value = "WHATSAPP"; // Asumiendo que RED está en la columna C
      await sheet.saveUpdatedCells();
    } else {
      // Si no se encontró, agrega la fila
      await sheet.addRow({
        NUMERO: num,
        PROGRAMA: camp,
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

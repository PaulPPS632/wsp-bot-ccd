import { AllowNull, Column, DataType, Model, Table } from "sequelize-typescript";

@Table({
    tableName: "sheets"
})
export class Sheets extends Model{

    @AllowNull(true)
    @Column (DataType.STRING)
    spreadsheetId!: string;

    @AllowNull(true)
    @Column(DataType.INTEGER)
    sheetId!: number; //Hoja en especifico

    @AllowNull(true)
    @Column(DataType.STRING)
    name!: string;


}
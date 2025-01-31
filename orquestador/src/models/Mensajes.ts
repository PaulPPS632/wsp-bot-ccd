import { AllowNull, Column, DataType, Model, Table } from "sequelize-typescript";

@Table({
    tableName: "mensajes"
})
export class Mensajes extends Model {

    @AllowNull(false)
    @Column(DataType.STRING)
    tipo!: string;

    @AllowNull(false)
    @Column(DataType.JSON)
    content!: string;
}
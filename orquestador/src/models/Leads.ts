import { AllowNull, Column, DataType, Model, Table } from "sequelize-typescript";

@Table({
    tableName: "leads"
})
export class Leads extends Model{

    @AllowNull(false)
    @Column(DataType.STRING)
    name!: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    phone!: string;

    @AllowNull(true)
    @Column(DataType.STRING)
    flow!: string;

    @AllowNull(true)
    @Column(DataType.STRING)
    curso!: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    respuesta!: string;

    @AllowNull(true)
    @Column(DataType.BOOLEAN)
    status!: boolean;
}
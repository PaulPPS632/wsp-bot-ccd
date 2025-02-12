import { AllowNull, Column, DataType, Model, Table, Unique } from "sequelize-typescript";

@Table({
    tableName: "clientes"
})
export class Clientes extends Model{

    @AllowNull(true)
    @Column(DataType.STRING)
    name!: string;

    @AllowNull(false)
    @Unique
    @Column(DataType.STRING)
    number!: string;

    @AllowNull(true)
    @Column(DataType.STRING)
    email!: string;
}
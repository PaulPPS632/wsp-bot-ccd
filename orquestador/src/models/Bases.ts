import { AllowNull, Column, DataType, Model, Table } from "sequelize-typescript";

@Table({
    tableName:"bases"
})
export class Bases extends Model{

    @AllowNull(false)
    @Column(DataType.STRING)
    number!: string;

    @AllowNull(true)
    @Column(DataType.BOOLEAN)
    status!: boolean;
}
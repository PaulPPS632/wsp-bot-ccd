import { AllowNull, Column, DataType, Model, Table } from "sequelize-typescript";

@Table({
    tableName: "bot"
})
export class Bot extends Model{

    @AllowNull(true)
    @Column(DataType.STRING)
    name!: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    containerId!: string;

    @AllowNull(false)
    @Column(DataType.INTEGER)
    port!: number;

    @AllowNull(false)
    @Column(DataType.STRING)
    pairingCode!: string

    @AllowNull(false)
    @Column(DataType.STRING)
    phone!: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    tipo!: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    db_name!:string;

    @AllowNull(true)
    @Column(DataType.BOOLEAN)
    status!: boolean;
}
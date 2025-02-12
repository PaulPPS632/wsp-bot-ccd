import { AllowNull, BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { Bot } from "./Bot";
import { Flows } from "./Flows";
import { Clientes } from "./Clientes";

@Table({
    tableName: "asignaciones"
})
export class Asignaciones extends Model{

    @BelongsTo(() => Bot)
    bot!: Bot;

    @ForeignKey(() => Bot)
    @AllowNull(true)
    @Column(DataType.INTEGER)
    botId!: number; 

    @BelongsTo(() => Flows)
    flow!: Flows;

    @ForeignKey(() => Flows)
    @AllowNull(true)
    @Column(DataType.INTEGER)
    flowId!: number


    @BelongsTo(() => Clientes)
    cliente!: Clientes;

    @ForeignKey(() => Clientes)
    @AllowNull(true)
    @Column(DataType.INTEGER)
    clienteId!: number

    @AllowNull(true)
    @Column(DataType.STRING)
    status!: string;

    @AllowNull(true)
    @Column(DataType.STRING)
    observacionstatus!: string;
}
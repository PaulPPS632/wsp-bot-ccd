import { AllowNull, BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { Bot } from "./Bot";
import { Flows } from "./Flows";
import { Usuarios } from "./Usuarios";
@Table({
    tableName: "asignaciones"
})
export class Asignaciones extends Model{
    @AllowNull(false)
    @Column(DataType.STRING)
    name!: string;

    @AllowNull(false)
    @Column(DataType.INTEGER)
    amountsend!: number;

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

    @AllowNull(false)
    @Column(DataType.JSON)
    currentflow!: string

    @AllowNull(true)
    @Column(DataType.INTEGER)
    delaymin!: number;

    @AllowNull(true)
    @Column(DataType.INTEGER)
    delaymax!: number;

    @BelongsTo(() => Usuarios)
    usuario!: Usuarios;

    @ForeignKey(() => Usuarios)
    @AllowNull(true)
    @Column(DataType.INTEGER)
    usuarioId!: number

    @AllowNull(true)
    @Column(DataType.STRING)
    status!:string
}
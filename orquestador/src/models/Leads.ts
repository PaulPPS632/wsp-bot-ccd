import { AllowNull, BelongsTo, Column, DataType, ForeignKey, Model, Table, Unique } from "sequelize-typescript";
import { Flows } from "./Flows";

@Table({
    tableName: "leads"
})
export class Leads extends Model{

    @AllowNull(true)
    @Column(DataType.STRING)
    name!: string;

    @AllowNull(false)
    @Unique(true)
    @Column(DataType.STRING)
    number!: string;

    @AllowNull(true)
    @Column(DataType.STRING)
    email!: string;
    
    @BelongsTo(() => Flows)
    flow!: Flows;

    @ForeignKey(() => Flows)
    @AllowNull(true)
    @Column(DataType.INTEGER)
    flowId!: number

    @AllowNull(true)
    @Column(DataType.STRING)
    curso!: string;

    @AllowNull(true)
    @Column(DataType.STRING)
    respuesta!: string;

    @AllowNull(false)
    @Column(DataType.BOOLEAN)
    status!: boolean;
}
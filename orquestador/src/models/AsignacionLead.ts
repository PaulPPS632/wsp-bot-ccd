import { AllowNull, BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { Asignaciones } from "./Asignaciones";
import { Leads } from "./Leads";

@Table({
    tableName:'asignacioneslead'
})
export class AsignacionLead extends Model {

    @BelongsTo(() => Asignaciones)
    asignacion!: Asignaciones;

    @ForeignKey(() => Asignaciones)
    @AllowNull(true)
    @Column(DataType.INTEGER)
    asignacionId!: number

    @BelongsTo(() => Leads)
    lead!: Leads;

    @ForeignKey(() => Leads)
    @AllowNull(true)
    @Column(DataType.INTEGER)
    leadId!: number

    @AllowNull(true)
    @Column(DataType.STRING)
    status!: string;

    @AllowNull(true)
    @Column(DataType.STRING)
    observacionstatus!: string;

    @AllowNull(true)
    @Column(DataType.INTEGER)
    delay!: number;
}
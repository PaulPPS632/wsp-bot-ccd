import { AllowNull, BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { Clientes } from "./Clientes";
import { Asignaciones } from "./Asignaciones";

@Table({
    tableName:'asignacionescliente'
})
export class AsignacionCliente extends Model {

    @BelongsTo(() => Asignaciones)
    asignacion!: Asignaciones;

    @ForeignKey(() => Asignaciones)
    @AllowNull(true)
    @Column(DataType.INTEGER)
    asignacionId!: number

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
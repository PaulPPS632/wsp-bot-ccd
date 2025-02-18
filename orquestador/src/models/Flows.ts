import { AllowNull, BelongsToMany, Column, DataType, Model, Table } from "sequelize-typescript";
import { Masivos } from "./Masivos";
import { MasivosFlows } from "./MasivosDlows";

@Table({
    tableName: "flows"
})
export class Flows extends Model {
    @AllowNull(false)
    @Column(DataType.STRING)
    name!: string;

    @AllowNull(false)
    @Column(DataType.JSON)
    mensajes!: string;
    
    @AllowNull(true)
    @Column(DataType.JSON)
    cursos!: string;

    @AllowNull(true)
    @Column(DataType.JSON)
    variables!: string;
    // Relación muchos a muchos con Masivos
    @BelongsToMany(() => Masivos, () => MasivosFlows)
    masivos!: Masivos[];
}
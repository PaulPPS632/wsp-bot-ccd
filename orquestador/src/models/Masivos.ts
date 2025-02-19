import {
  AllowNull,
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { Flows } from "./Flows";
import { MasivosFlows } from "./MasivosDlows";
import { Usuarios } from "./Usuarios";

@Table({
  tableName: "masivos",
})
export class Masivos extends Model {
  @AllowNull(false)
  @Column(DataType.STRING)
  name!: string;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  amountsend!: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  delaymin!: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  delaymax!: number;

  @AllowNull(true)
  @Column(DataType.INTEGER)
  amountinteres!: number;

  @BelongsToMany(() => Flows, () => MasivosFlows)
  flows!: Flows[];


  @BelongsTo(() => Usuarios)
  usuario!: Usuarios;

  @ForeignKey(() => Usuarios)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  usuarioId!: number
}

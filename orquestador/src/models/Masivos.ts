import {
  AllowNull,
  BelongsToMany,
  Column,
  DataType,
  Model,
  Table,
} from "sequelize-typescript";
import { Flows } from "./Flows";
import { MasivosFlows } from "./MasivosDlows";

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
}

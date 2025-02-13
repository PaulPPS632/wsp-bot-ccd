import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { Masivos } from "./Masivos";
import { Leads } from "./Leads";

@Table({
  tableName: "masivolead",
})
export class MasivoLead extends Model {
  @BelongsTo(() => Masivos)
  masivo!: Masivos;

  @ForeignKey(() => Masivos)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  masivoId!: number;


  @BelongsTo(() => Leads)
  lead!: Leads;

  @ForeignKey(() => Leads)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  leadId!: number;

  @AllowNull(true)
  @Column(DataType.STRING)
  status!: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  observacionstatus!: string;
}

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
import { Bot } from "./Bot";
import { Sheets } from "./Sheets";

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

  @ForeignKey(() => Flows)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  flowResponderId!: number

  @BelongsTo(() => Flows, {as: 'flowResponder'})
  flowResponder!: Flows;

  @ForeignKey(() => Bot)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  botId!: number; 

  @BelongsTo(() => Bot)
  bot!: Bot;
  
  @Column(DataType.BOOLEAN)
  flagResponder!: boolean;

  @BelongsToMany(() => Flows, {
    through: () => MasivosFlows,
    as: 'flows',
    foreignKey: 'masivoId',
    otherKey: 'flowId'
  })
  flows!: Flows[];

  @BelongsTo(() => Usuarios)
  usuario!: Usuarios;

  @ForeignKey(() => Sheets)
  @Column(DataType.INTEGER)
  sheetId!: string; //Hoja en especifico

  @BelongsTo(() => Sheets)
  sheet!: Sheets;

  @ForeignKey(() => Usuarios)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  usuarioId!: number
}

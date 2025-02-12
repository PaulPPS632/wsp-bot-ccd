import {
    Column,
    DataType,
    ForeignKey,
    Model,
    Table,
  } from "sequelize-typescript";
  import { Masivos } from "./Masivos";
  import { Flows } from "./Flows";
  
  @Table({
    tableName: "masivosflows",
  })
  export class MasivosFlows extends Model {
    @ForeignKey(() => Masivos)
    @Column(DataType.INTEGER)
    masivoId!: number;
  
    @ForeignKey(() => Flows)
    @Column(DataType.INTEGER)
    flowId!: number;
  }
  
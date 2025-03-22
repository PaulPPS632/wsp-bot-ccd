import { AllowNull,  Column, DataType,  Model, Table, Unique } from "sequelize-typescript";

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

    @AllowNull(true)
    @Column(DataType.STRING)
    curso!: string;

    @AllowNull(true)
    @Column(DataType.STRING)
    respuesta!: string;

    @AllowNull(true)
    @Column(DataType.STRING)
    metodo!: string;    

    @AllowNull(false)
    @Column(DataType.BOOLEAN)
    status!: boolean;
}
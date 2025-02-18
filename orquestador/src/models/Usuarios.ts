import { AllowNull, BeforeCreate, BeforeUpdate, BelongsTo, Column, DataType, ForeignKey, Model, Table, Unique } from "sequelize-typescript";
import { Roles } from "./Roles";
import bcrypt from "bcryptjs";
@Table({
    tableName: "usuarios"
})
export class Usuarios extends Model{

    @AllowNull(false)
    @Column(DataType.STRING)
    name!: string;

    @AllowNull(false)
    @Unique
    @Column(DataType.STRING)
    username!: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    password!: string;

    @ForeignKey(() => Roles)
    @Column(DataType.INTEGER)
    rolId!: number;

    @BelongsTo(() => Roles)
    rol!: Roles;

    @BeforeUpdate
    @BeforeCreate
    static async encryptpassword (instance: Usuarios) {
        if(instance.password != null){
            const salt = await bcrypt.genSalt(10);
            instance.password = await bcrypt.hash(instance.password,salt);
        }
    }

    static async comparePassword(password: string, hashPassword: string) {
        return await bcrypt.compare(password, hashPassword);
    }
}
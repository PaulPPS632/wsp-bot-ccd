"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Usuarios = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Roles_1 = require("./Roles");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
let Usuarios = class Usuarios extends sequelize_typescript_1.Model {
    static encryptpassword(instance) {
        return __awaiter(this, void 0, void 0, function* () {
            if (instance.password != null) {
                const salt = yield bcryptjs_1.default.genSalt(10);
                instance.password = yield bcryptjs_1.default.hash(instance.password, salt);
            }
        });
    }
    static comparePassword(password, hashPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield bcryptjs_1.default.compare(password, hashPassword);
        });
    }
};
exports.Usuarios = Usuarios;
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Usuarios.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    sequelize_typescript_1.Unique,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Usuarios.prototype, "username", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Usuarios.prototype, "password", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Roles_1.Roles),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], Usuarios.prototype, "rolId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Roles_1.Roles),
    __metadata("design:type", Roles_1.Roles)
], Usuarios.prototype, "rol", void 0);
__decorate([
    sequelize_typescript_1.BeforeUpdate,
    sequelize_typescript_1.BeforeCreate,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Usuarios]),
    __metadata("design:returntype", Promise)
], Usuarios, "encryptpassword", null);
exports.Usuarios = Usuarios = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: "usuarios"
    })
], Usuarios);

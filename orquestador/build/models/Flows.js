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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Flows = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Masivos_1 = require("./Masivos");
const MasivosDlows_1 = require("./MasivosDlows");
let Flows = class Flows extends sequelize_typescript_1.Model {
};
exports.Flows = Flows;
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Flows.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.JSON),
    __metadata("design:type", String)
], Flows.prototype, "mensajes", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.JSON),
    __metadata("design:type", String)
], Flows.prototype, "cursos", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.JSON),
    __metadata("design:type", String)
], Flows.prototype, "variables", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsToMany)(() => Masivos_1.Masivos, () => MasivosDlows_1.MasivosFlows),
    __metadata("design:type", Array)
], Flows.prototype, "masivos", void 0);
exports.Flows = Flows = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: "flows"
    })
], Flows);

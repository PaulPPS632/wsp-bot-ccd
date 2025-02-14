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
exports.Asignaciones = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Bot_1 = require("./Bot");
const Flows_1 = require("./Flows");
let Asignaciones = class Asignaciones extends sequelize_typescript_1.Model {
};
exports.Asignaciones = Asignaciones;
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Asignaciones.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], Asignaciones.prototype, "amountsend", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Bot_1.Bot),
    __metadata("design:type", Bot_1.Bot)
], Asignaciones.prototype, "bot", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Bot_1.Bot),
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], Asignaciones.prototype, "botId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Flows_1.Flows),
    __metadata("design:type", Flows_1.Flows)
], Asignaciones.prototype, "flow", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Flows_1.Flows),
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], Asignaciones.prototype, "flowId", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], Asignaciones.prototype, "delaymin", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], Asignaciones.prototype, "delaymax", void 0);
exports.Asignaciones = Asignaciones = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: "asignaciones"
    })
], Asignaciones);

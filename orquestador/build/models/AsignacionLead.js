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
exports.AsignacionLead = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Asignaciones_1 = require("./Asignaciones");
const Leads_1 = require("./Leads");
let AsignacionLead = class AsignacionLead extends sequelize_typescript_1.Model {
};
exports.AsignacionLead = AsignacionLead;
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Asignaciones_1.Asignaciones),
    __metadata("design:type", Asignaciones_1.Asignaciones)
], AsignacionLead.prototype, "asignacion", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Asignaciones_1.Asignaciones),
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], AsignacionLead.prototype, "asignacionId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Leads_1.Leads),
    __metadata("design:type", Leads_1.Leads)
], AsignacionLead.prototype, "lead", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Leads_1.Leads),
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], AsignacionLead.prototype, "leadId", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], AsignacionLead.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], AsignacionLead.prototype, "observacionstatus", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], AsignacionLead.prototype, "delay", void 0);
exports.AsignacionLead = AsignacionLead = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'asignacioneslead'
    })
], AsignacionLead);

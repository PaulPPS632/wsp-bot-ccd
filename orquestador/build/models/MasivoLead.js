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
exports.MasivoLead = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Masivos_1 = require("./Masivos");
const Leads_1 = require("./Leads");
let MasivoLead = class MasivoLead extends sequelize_typescript_1.Model {
};
exports.MasivoLead = MasivoLead;
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Masivos_1.Masivos),
    __metadata("design:type", Masivos_1.Masivos)
], MasivoLead.prototype, "masivo", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Masivos_1.Masivos),
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], MasivoLead.prototype, "masivoId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Leads_1.Leads),
    __metadata("design:type", Leads_1.Leads)
], MasivoLead.prototype, "lead", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Leads_1.Leads),
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], MasivoLead.prototype, "leadId", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], MasivoLead.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], MasivoLead.prototype, "observacionstatus", void 0);
exports.MasivoLead = MasivoLead = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: "masivolead",
    })
], MasivoLead);

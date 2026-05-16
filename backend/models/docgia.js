'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DocGia extends Model {
    static associate(models) {
      DocGia.belongsTo(models.TaiKhoan, { foreignKey: 'IDTaiKhoan', as: 'taiKhoan' });
      DocGia.hasMany(models.PhieuMuon, { foreignKey: 'IDDocGia', as: 'phieuMuons' });
    }
  }
  DocGia.init({
    IDDocGia: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    IDTaiKhoan: { type: DataTypes.INTEGER, allowNull: false },
    HoTen: { type: DataTypes.STRING, allowNull: false },
    SoDienThoai: DataTypes.STRING,
    MaThe: DataTypes.STRING,
    NgayHetHan: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'DocGia',
    tableName: 'DocGias'
  });
  return DocGia;
};
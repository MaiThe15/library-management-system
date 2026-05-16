'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CT_PhieuMuon extends Model {
    static associate(models) {
      CT_PhieuMuon.belongsTo(models.PhieuMuon, { foreignKey: 'IDPhieuMuon', as: 'phieuMuon' });
      CT_PhieuMuon.belongsTo(models.Sach, { foreignKey: 'IDSach', as: 'Sach' });
    }
  }
  CT_PhieuMuon.init({
    IDChiTiet: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    IDPhieuMuon: DataTypes.INTEGER,
    IDSach: DataTypes.INTEGER,
    TrangThai: DataTypes.STRING,
    NgayTraThucTe: DataTypes.DATE,
    TinhTrangSachTra: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'CT_PhieuMuon',
    tableName: 'CT_PhieuMuons',
  });
  return CT_PhieuMuon;
};
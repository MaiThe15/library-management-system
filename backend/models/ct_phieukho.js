'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CT_PhieuKho extends Model {
    static associate(models) {
      CT_PhieuKho.belongsTo(models.PhieuKho, { foreignKey: 'IDPhieuKho', as: 'phieuKho' });
      CT_PhieuKho.belongsTo(models.Sach, { foreignKey: 'IDSach', as: 'sach' });
    }
  }
  CT_PhieuKho.init({
    IDCT_PhieuKho: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    IDPhieuKho: DataTypes.INTEGER,
    IDSach: DataTypes.INTEGER,
    SoLuong: DataTypes.INTEGER,
    DonGia: DataTypes.INTEGER,
    ThanhTien: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'CT_PhieuKho',
    tableName: 'CT_PhieuKhos',
  });
  return CT_PhieuKho;
};
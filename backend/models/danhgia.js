'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DanhGia extends Model {
    static associate(models) {
      // Định nghĩa quan hệ nghịch đảo
      DanhGia.belongsTo(models.DocGia, { foreignKey: 'IDDocGia', as: 'docGia' });
      DanhGia.belongsTo(models.Sach, { foreignKey: 'IDSach', as: 'sach' });
    }
  }
  DanhGia.init({
    IDDanhGia: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    IDDocGia: DataTypes.INTEGER,
    IDSach: DataTypes.INTEGER,
    SoSao: DataTypes.INTEGER,
    BinhLuan: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'DanhGia',
    tableName: 'DanhGias'
  });
  return DanhGia;
};
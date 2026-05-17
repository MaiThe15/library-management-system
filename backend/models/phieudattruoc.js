'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PhieuDatTruoc extends Model {
    static associate(models) {
      PhieuDatTruoc.belongsTo(models.DocGia, { foreignKey: 'IDDocGia', as: 'docGia' });
      PhieuDatTruoc.belongsTo(models.Sach, { foreignKey: 'IDSach', as: 'sach' });
    }
  }
  PhieuDatTruoc.init({
    IDPhieuDat: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    IDDocGia: DataTypes.INTEGER,
    IDSach: DataTypes.INTEGER,
    NgayDat: DataTypes.DATE,
    TrangThai: DataTypes.STRING // 'Đang chờ', 'Đã có sách', 'Đã hủy'
  }, {
    sequelize,
    modelName: 'PhieuDatTruoc',
    tableName: 'PhieuDatTruocs',
  });
  return PhieuDatTruoc;
};
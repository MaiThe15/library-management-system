'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PhieuMuon extends Model {
    static associate(models) {
      // Thiết lập mối quan hệ ràng buộc
      PhieuMuon.belongsTo(models.DocGia, { foreignKey: 'IDDocGia', as: 'docGia' });
      PhieuMuon.belongsTo(models.NhanVien, { foreignKey: 'IDNhanVien', as: 'nhanVien' });
      PhieuMuon.hasMany(models.CT_PhieuMuon, { foreignKey: 'IDPhieuMuon', as: 'chiTietPhieuMuons' });
    }
  }
  PhieuMuon.init({
    IDPhieuMuon: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    IDDocGia: DataTypes.INTEGER,
    IDNhanVien: DataTypes.INTEGER,
    NgayMuon: DataTypes.DATE,
    HanTra: DataTypes.DATE,
    TrangThai: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'PhieuMuon',
    tableName: 'PhieuMuons',
  });
  return PhieuMuon;
};
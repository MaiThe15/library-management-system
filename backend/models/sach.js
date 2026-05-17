'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Sach extends Model {
    static associate(models) {
      // Thuộc về 1 tác giả
      Sach.belongsTo(models.TacGia, { foreignKey: 'IDTacGia', as: 'tacGia' });
      // Thuộc về 1 vị trí
      Sach.belongsTo(models.ViTriLuuTru, { foreignKey: 'IDViTri', as: 'viTri' });
      // Có nhiều thể loại
      Sach.belongsToMany(models.TheLoai, { 
        through: 'TheLoai_Sachs', 
        foreignKey: 'IDSach', 
        as: 'theLoais' 
      });
      Sach.hasMany(models.CT_PhieuMuon, { foreignKey: 'IDSach', as: 'chiTietPhieuMuons' });
      Sach.hasMany(models.DanhGia, { foreignKey: 'IDSach', as: 'danhGias' });
    }
  }
  Sach.init({
    IDSach: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    TenSach: { type: DataTypes.STRING, allowNull: false },
    AnhBia: { type: DataTypes.STRING },
    TongSoLuong: { type: DataTypes.INTEGER, defaultValue: 0 },
    SoLuongSanSang: { type: DataTypes.INTEGER, defaultValue: 0 },
    TrangThai: { type: DataTypes.STRING, defaultValue: 'CO_SAN' },
    IDTacGia: DataTypes.INTEGER,
    IDViTri: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Sach',
    tableName: 'Sachs'
  });
  return Sach;
};
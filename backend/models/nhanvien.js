'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class NhanVien extends Model {
    static associate(models) {
      NhanVien.belongsTo(models.TaiKhoan, { foreignKey: 'IDTaiKhoan', as: 'taiKhoan' });
      NhanVien.belongsTo(models.VaiTro, { foreignKey: 'IDVaiTro', as: 'vaiTro' });
    }
  }
  NhanVien.init({
    IDNhanVien: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    IDTaiKhoan: { type: DataTypes.INTEGER, allowNull: false },
    IDVaiTro: { type: DataTypes.INTEGER, allowNull: false },
    HoTen: { type: DataTypes.STRING, allowNull: false },
    SoDienThoai: DataTypes.STRING,
    PhongBan: DataTypes.STRING,
    NgayVaoLam: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'NhanVien',
    tableName: 'NhanViens'
  });
  return NhanVien;
};
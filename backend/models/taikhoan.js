'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TaiKhoan extends Model {
    static associate(models) {
      // Một tài khoản có thể là Độc giả hoặc Nhân viên
      TaiKhoan.hasOne(models.DocGia, { foreignKey: 'IDTaiKhoan', as: 'thongTinDocGia' });
      TaiKhoan.hasOne(models.NhanVien, { foreignKey: 'IDTaiKhoan', as: 'thongTinNhanVien' });
    }
  }
  TaiKhoan.init({
    IDTaiKhoan: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Email: { type: DataTypes.STRING, allowNull: false, unique: true },
    MatKhau: { type: DataTypes.STRING, allowNull: false },
    LoaiTaiKhoan: DataTypes.STRING,
    TrangThai: { type: DataTypes.STRING, defaultValue: 'HOAT_DONG' }
  }, {
    sequelize,
    modelName: 'TaiKhoan',
    tableName: 'TaiKhoans' // Đảm bảo khớp với tên bảng trong Migration
  });
  return TaiKhoan;
};
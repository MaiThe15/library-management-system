'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PhieuKho extends Model {
    static associate(models) {
      // Một phiếu kho do một nhân viên lập
      PhieuKho.belongsTo(models.NhanVien, { foreignKey: 'IDNhanVien', as: 'nhanVien' });
      // Một phiếu kho có nhiều chi tiết phiếu kho (chưa tạo model CT_PhieuKho, bạn sẽ cần tạo thêm)
      // PhieuKho.hasMany(models.CT_PhieuKho, { foreignKey: 'IDPhieuKho', as: 'chiTietPhieuKhos' });
    }
  }
  PhieuKho.init({
    IDPhieuKho: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    IDNhanVien: DataTypes.INTEGER,
    LoaiPhieu: DataTypes.STRING, // 'Nhập' hoặc 'Xuất'
    NgayLap: DataTypes.DATE,
    TongTien: DataTypes.INTEGER, // Tổng giá trị lô hàng
    GhiChu: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'PhieuKho',
    tableName: 'PhieuKhos',
  });
  return PhieuKho;
};
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class HoaDon extends Model {
    static associate(models) {
      // Hóa đơn do nhân viên kế toán lập
      HoaDon.belongsTo(models.NhanVien, { foreignKey: 'IDNhanVien', as: 'nhanVien' });
      // Hóa đơn có thể liên kết với độc giả (nếu là hóa đơn thu tiền phạt), có thể null nếu là hóa đơn chi nội bộ
      HoaDon.belongsTo(models.DocGia, { foreignKey: 'IDDocGia', as: 'docGia' });
    }
  }
  HoaDon.init({
    IDHoaDon: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    IDNhanVien: DataTypes.INTEGER,
    IDDocGia: DataTypes.INTEGER, // Cho phép null
    LoaiHoaDon: DataTypes.STRING, // 'Thu' hoặc 'Chi'
    LyDo: DataTypes.STRING, // 'Phạt trả muộn', 'Đền bù sách', 'Mua sách mới'
    SoTien: DataTypes.INTEGER,
    NgayLap: DataTypes.DATE,
    TrangThai: DataTypes.STRING // 'Chưa thanh toán', 'Đã thanh toán'
  }, {
    sequelize,
    modelName: 'HoaDon',
    tableName: 'HoaDons',
  });
  return HoaDon;
};
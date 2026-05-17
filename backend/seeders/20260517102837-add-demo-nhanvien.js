'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // bulkInsert giúp thêm nhiều dòng dữ liệu cùng lúc
    await queryInterface.bulkInsert('NhanViens', [
      {
        IDTaiKhoan: 2, // Thay bằng IDTaiKhoan thực tế của bạn trong bảng TaiKhoans
        IDVaiTro: 1,   // Thay bằng IDVaiTro hợp lệ (VD: 1 là Admin, 2 là Thủ thư)
        HoTen: 'Nguyễn Văn Quản Kho',
        SoDienThoai: '0987654321',
        PhongBan: 'Bộ phận Kho',
        NgayVaoLam: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    // Xóa dữ liệu mẫu nếu chạy lệnh undo
    await queryInterface.bulkDelete('NhanViens', null, {});
  }
};
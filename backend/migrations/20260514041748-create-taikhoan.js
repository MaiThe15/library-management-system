'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('TaiKhoans', {
      IDTaiKhoan: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      Email: { type: Sequelize.STRING(255), allowNull: false, unique: true },
      MatKhau: { type: Sequelize.STRING(255), allowNull: false },
      LoaiTaiKhoan: { type: Sequelize.STRING(50) }, // Phân biệt 'DOC_GIA' hoặc 'NHAN_VIEN'
      TrangThai: { type: Sequelize.STRING(50), defaultValue: 'HOAT_DONG' },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('TaiKhoans');
  }
};
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('NhanViens', {
      IDNhanVien: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      IDTaiKhoan: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'TaiKhoans', key: 'IDTaiKhoan' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      IDVaiTro: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'VaiTros', key: 'IDVaiTro' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      HoTen: { type: Sequelize.STRING(255), allowNull: false },
      SoDienThoai: { type: Sequelize.STRING(20) },
      PhongBan: { type: Sequelize.STRING(255) },
      NgayVaoLam: { type: Sequelize.DATE },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('NhanViens');
  }
};
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('DocGias', {
      IDDocGia: {
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
      HoTen: { type: Sequelize.STRING(255), allowNull: false },
      SoDienThoai: { type: Sequelize.STRING(20) },
      MaThe: { type: Sequelize.STRING(50) },
      NgayHetHan: { type: Sequelize.DATE },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('DocGias');
  }
};
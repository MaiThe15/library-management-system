'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CT_PhieuKhos', {
      IDCT_PhieuKho: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      IDPhieuKho: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'PhieuKhos',
          key: 'IDPhieuKho'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // Xóa phiếu kho sẽ xóa luôn chi tiết
      },
      IDSach: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Sachs', // Lưu ý tên bảng sách trong DB của bạn (Saches hoặc Sachs)
          key: 'IDSach'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      SoLuong: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      DonGia: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      ThanhTien: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('CT_PhieuKhos');
  }
};
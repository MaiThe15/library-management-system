'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PhieuKhos', {
      IDPhieuKho: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      IDNhanVien: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'NhanViens',
          key: 'IDNhanVien'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      LoaiPhieu: {
        type: Sequelize.STRING,
        allowNull: false, // Ví dụ: 'Nhập', 'Xuất thanh lý'
      },
      NgayLap: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      TongTien: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      GhiChu: {
        type: Sequelize.TEXT,
        allowNull: true
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
    await queryInterface.dropTable('PhieuKhos');
  }
};
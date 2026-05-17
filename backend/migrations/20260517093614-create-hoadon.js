'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('HoaDons', {
      IDHoaDon: {
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
      IDDocGia: {
        type: Sequelize.INTEGER,
        allowNull: true, // Cho phép null vì hóa đơn chi (mua sách) không liên quan đến độc giả
        references: {
          model: 'DocGias',
          key: 'IDDocGia'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      LoaiHoaDon: {
        type: Sequelize.STRING,
        allowNull: false // 'Thu' hoặc 'Chi'
      },
      LyDo: {
        type: Sequelize.STRING,
        allowNull: false
      },
      SoTien: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      NgayLap: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      TrangThai: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Chưa thanh toán'
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
    await queryInterface.dropTable('HoaDons');
  }
};
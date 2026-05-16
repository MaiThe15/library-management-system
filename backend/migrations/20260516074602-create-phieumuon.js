'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PhieuMuons', {
      IDPhieuMuon: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      IDDocGia: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'DocGias', // Tên bảng Độc giả thực tế trong DB
          key: 'IDDocGia'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      IDNhanVien: {
        type: Sequelize.INTEGER,
        allowNull: true, // Cho phép null đề phòng trường hợp đăng ký trực tuyến chờ duyệt
        references: {
          model: 'NhanViens', // Tên bảng Nhân viên thực tế trong DB
          key: 'IDNhanVien'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      NgayMuon: {
        type: Sequelize.DATE,
        allowNull: false
      },
      HanTra: {
        type: Sequelize.DATE,
        allowNull: false
      },
      TrangThai: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Đang mượn'
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
    await queryInterface.dropTable('PhieuMuons');
  }
};
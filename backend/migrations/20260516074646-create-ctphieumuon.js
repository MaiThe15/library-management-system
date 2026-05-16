'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CT_PhieuMuons', {
      IDChiTiet: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      IDPhieuMuon: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'PhieuMuons',
          key: 'IDPhieuMuon'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      IDSach: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Sachs', 
          key: 'IDSach'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      TrangThai: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Đang mượn'
      },
      NgayTraThucTe: {
        type: Sequelize.DATE,
        allowNull: true // Cho phép null vì lúc mượn chưa trả
      },
      TinhTrangSachTra: {
        type: Sequelize.STRING,
        allowNull: true // Cho phép null, sẽ cập nhật khi độc giả mang sách đến trả
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
    await queryInterface.dropTable('CT_PhieuMuons');
  }
};
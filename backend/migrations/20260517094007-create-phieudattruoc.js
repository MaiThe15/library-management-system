'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PhieuDatTruocs', {
      IDPhieuDat: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      IDDocGia: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'DocGias', key: 'IDDocGia' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      IDSach: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Sachs', key: 'IDSach' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      NgayDat: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      TrangThai: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Đang chờ'
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('PhieuDatTruocs');
  }
};
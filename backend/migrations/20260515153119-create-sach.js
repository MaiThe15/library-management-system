'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Sachs', {
      IDSach: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      TenSach: { type: Sequelize.STRING, allowNull: false },
      TongSoLuong: { type: Sequelize.INTEGER, defaultValue: 0 },
      SoLuongSanSang: { type: Sequelize.INTEGER, defaultValue: 0 },
      TrangThai: { 
        type: Sequelize.STRING, 
        defaultValue: 'CO_SAN' // CO_SAN, HET_SACH, BAO_TRI
      },
      IDTacGia: {
        type: Sequelize.INTEGER,
        references: { model: 'TacGias', key: 'IDTacGia' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      IDViTri: {
        type: Sequelize.INTEGER,
        references: { model: 'ViTriLuuTrus', key: 'IDViTri' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Sachs');
  }
};
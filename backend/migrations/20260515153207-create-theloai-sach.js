'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('TheLoai_Sachs', {
      IDSach: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: { model: 'Sachs', key: 'IDSach' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      IDTheLoai: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: { model: 'TheLoais', key: 'IDTheLoai' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('TheLoai_Sachs');
  }
};
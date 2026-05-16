'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ViTriLuuTrus', {
      IDViTri: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      KhuVuc: { type: Sequelize.STRING, allowNull: false },
      Tang: { type: Sequelize.INTEGER, allowNull: false },
      KeSach: { type: Sequelize.STRING, allowNull: false },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ViTriLuuTrus');
  }
};
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('DanhGias', {
      IDDanhGia: {
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
      SoSao: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 5 }
      },
      BinhLuan: {
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
    await queryInterface.dropTable('DanhGias');
  }
};

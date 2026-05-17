'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Tạo bảng Quyền (Permissions)
    await queryInterface.createTable('Quyens', {
      IDQuyen: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      TenQuyen: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      MoTa: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });

    // 2. Tạo bảng trung gian VaiTro_Quyen (Role_Permissions)
    await queryInterface.createTable('VaiTro_Quyen', {
      IDVaiTro: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: { model: 'VaiTros', key: 'IDVaiTro' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      IDQuyen: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: { model: 'Quyens', key: 'IDQuyen' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('VaiTro_Quyen');
    await queryInterface.dropTable('Quyens');
  }
};
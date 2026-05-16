'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Thêm cột 'AnhBia' vào bảng 'Sachs'
    await queryInterface.addColumn('Sachs', 'AnhBia', {
      type: Sequelize.STRING,
      allowNull: true, // Cho phép trống vì có thể lúc mới thêm sách chưa có ảnh ngay
      defaultValue: 'https://via.placeholder.com/150' // Ảnh mặc định nếu không truyền
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Nếu rollback (undo), lệnh này sẽ xóa cột 'AnhBia' đi
    await queryInterface.removeColumn('Sachs', 'AnhBia');
  }
};
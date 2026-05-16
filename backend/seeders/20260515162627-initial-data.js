'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Thêm Tác giả mẫu
    await queryInterface.bulkInsert('TacGias', [
      { TenTacGia: 'Nguyễn Nhật Ánh', NamSinh: 1955, createdAt: new Date(), updatedAt: new Date() },
      { TenTacGia: 'Tô Hoài', NamSinh: 1920, createdAt: new Date(), updatedAt: new Date() }
    ], {});

    // 2. Thêm Thể loại mẫu
    await queryInterface.bulkInsert('TheLoais', [
      { TenTheLoai: 'Văn học Việt Nam', createdAt: new Date(), updatedAt: new Date() },
      { TenTheLoai: 'Kỹ năng sống', createdAt: new Date(), updatedAt: new Date() }
    ], {});

    // 3. Thêm Vị trí mẫu
    await queryInterface.bulkInsert('ViTriLuuTrus', [
      { KhuVuc: 'Khu A', Tang: 1, KeSach: 'Kệ 01', createdAt: new Date(), updatedAt: new Date() },
      { KhuVuc: 'Khu B', Tang: 2, KeSach: 'Kệ 05', createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    // Xóa dữ liệu khi cần rollback
    await queryInterface.bulkDelete('TacGias', null, {});
    await queryInterface.bulkDelete('TheLoais', null, {});
    await queryInterface.bulkDelete('ViTriLuuTrus', null, {});
  }
};
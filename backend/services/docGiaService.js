const { DocGia, TaiKhoan } = require('../models');

// 1. Sửa hàm lấy danh sách để lấy kèm Trạng thái của Tài khoản
exports.getAllReaders = async () => {
  return await DocGia.findAll({
    include: [{
      model: TaiKhoan,
      as: 'taiKhoan', // Đổi theo đúng alias bạn khai báo trong docgia.js
      attributes: ['TrangThai'] 
    }],
    order: [['IDDocGia', 'ASC']]
  });
};

// 2. Sửa hàm cập nhật để Update trên bảng TaiKhoan
exports.toggleReaderStatus = async (id) => {
  const docGia = await DocGia.findByPk(id, {
    include: [{ model: TaiKhoan, as: 'taiKhoan' }] // Nhớ dùng đúng as của bạn
  });

  if (!docGia || !docGia.taiKhoan) {
    throw new Error('Không tìm thấy tài khoản liên kết với độc giả này.');
  }

  // Sửa dòng này: Dùng hằng số chuẩn HOAT_DONG và BI_KHOA
  const currentStatus = docGia.taiKhoan.TrangThai;
  const newStatus = currentStatus === 'HOAT_DONG' ? 'BI_KHOA' : 'HOAT_DONG';
  
  await docGia.taiKhoan.update({ TrangThai: newStatus });
  
  return docGia;
};
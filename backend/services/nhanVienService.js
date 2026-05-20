const { NhanVien, TaiKhoan } = require('../models');
const bcrypt = require('bcryptjs');

exports.updateStaffProfile = async (idTaiKhoan, updateData) => {
  const { HoTen, SoDienThoai, PhongBan, Email, MatKhau } = updateData;

  // 1. Tìm bản ghi Nhân viên
  const nhanVien = await NhanVien.findOne({ where: { IDTaiKhoan: idTaiKhoan } });
  if (!nhanVien) {
    throw new Error('NOT_FOUND_NHANVIEN');
  }

  // Cập nhật thông tin Nhân viên
  nhanVien.HoTen = HoTen;
  nhanVien.SoDienThoai = SoDienThoai || nhanVien.SoDienThoai;
  nhanVien.PhongBan = PhongBan || nhanVien.PhongBan;
  await nhanVien.save();

  // 2. Tìm và cập nhật thông tin Tài khoản
  const taiKhoan = await TaiKhoan.findByPk(idTaiKhoan);
  if (taiKhoan) {
    if (Email) {
      // Kiểm tra trùng lặp email
      const existingEmail = await TaiKhoan.findOne({ where: { Email: Email } });
      if (existingEmail && existingEmail.IDTaiKhoan !== idTaiKhoan) {
        throw new Error('EMAIL_EXISTS');
      }
      taiKhoan.Email = Email;
    }

    // Hash mật khẩu mới nếu có
    if (MatKhau && MatKhau.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      taiKhoan.MatKhau = await bcrypt.hash(MatKhau, salt);
    }
    await taiKhoan.save();
  }

  // 3. Trả về dữ liệu để Controller phản hồi cho Client
  return {
    id: idTaiKhoan,
    HoTen: nhanVien.HoTen,
    SoDienThoai: nhanVien.SoDienThoai,
    PhongBan: nhanVien.PhongBan,
    Email: taiKhoan ? taiKhoan.Email : null,
    LoaiTaiKhoan: taiKhoan ? taiKhoan.LoaiTaiKhoan : null
  };
};
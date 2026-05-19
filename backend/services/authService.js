const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models');
const { TaiKhoan, DocGia, NhanVien, sequelize } = db;

class AuthService {
  // Logic đăng ký cho Độc giả
  async registerDocGia(data) {
    let { Email, MatKhau, HoTen, SoDienThoai } = data;

    // 1. Chuẩn hóa dữ liệu (Xóa khoảng trắng ở 2 đầu)
    Email = Email ? Email.trim() : '';
    SoDienThoai = SoDienThoai ? SoDienThoai.trim() : '';

    // 2. Kiểm tra Email
    const existingUser = await TaiKhoan.findOne({ where: { Email } });
    if (existingUser) {
      throw new Error('Email này đã được đăng ký!');
    }

    // 3. Kiểm tra Số điện thoại (chỉ kiểm tra nếu có nhập)
    if (SoDienThoai) {
      const existingPhone = await DocGia.findOne({ where: { SoDienThoai } });
      if (existingPhone) {
        throw new Error('Số điện thoại này đã được đăng ký!');
      }
    }

    // 4. MỌI THỨ HỢP LỆ -> MỚI MỞ TRANSACTION ĐỂ GHI VÀO DB
    const t = await sequelize.transaction();

    try {
      // Mã hóa mật khẩu
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(MatKhau, salt);

      // Tạo tài khoản (Truyền transaction t vào)
      const newTaiKhoan = await TaiKhoan.create({
        Email,
        MatKhau: hashedPassword,
        LoaiTaiKhoan: 'DOC_GIA',
        TrangThai: 'HOAT_DONG' // Thêm trạng thái mặc định cho chắc chắn
      }, { transaction: t });

      // Tạo thông tin độc giả (Truyền transaction t vào)
      const newDocGia = await DocGia.create({
        IDTaiKhoan: newTaiKhoan.IDTaiKhoan,
        HoTen,
        SoDienThoai
      }, { transaction: t });

      // Lưu chính thức vào DB
      await t.commit();
      
      return { 
        IDTaiKhoan: newTaiKhoan.IDTaiKhoan, 
        Email: newTaiKhoan.Email, 
        HoTen: newDocGia.HoTen 
      };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  // Logic đăng nhập tổng quát
  async login(Email, MatKhau) {
    const taiKhoan = await TaiKhoan.findOne({ where: { Email } });
    if (!taiKhoan) throw new Error('Email hoặc mật khẩu không đúng!');
    if (taiKhoan.TrangThai === 'BI_KHOA') throw new Error('Tài khoản đã bị khóa!');

    const isMatch = await bcrypt.compare(MatKhau, taiKhoan.MatKhau);
    if (!isMatch) throw new Error('Email hoặc mật khẩu không đúng!');

    let userInfo = {};
    if (taiKhoan.LoaiTaiKhoan === 'DOC_GIA') {
      const docGia = await DocGia.findOne({ where: { IDTaiKhoan: taiKhoan.IDTaiKhoan } });
      userInfo = docGia ? { IDDocGia: docGia.IDDocGia, HoTen: docGia.HoTen } : {};
    } else {
      const nhanVien = await NhanVien.findOne({ where: { IDTaiKhoan: taiKhoan.IDTaiKhoan } });
      userInfo = nhanVien ? { IDNhanVien: nhanVien.IDNhanVien, HoTen: nhanVien.HoTen, IDVaiTro: nhanVien.IDVaiTro } : {};
    }

    const payload = { IDTaiKhoan: taiKhoan.IDTaiKhoan, LoaiTaiKhoan: taiKhoan.LoaiTaiKhoan, ...userInfo };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

    return { token, user: { Email: taiKhoan.Email, LoaiTaiKhoan: taiKhoan.LoaiTaiKhoan, ...userInfo } };
  }
}

module.exports = new AuthService();
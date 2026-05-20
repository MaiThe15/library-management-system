const docGiaService = require('../services/docGiaService');
const { DocGia, TaiKhoan } = require('../models');
const bcrypt = require('bcryptjs');

exports.getAllReaders = async (req, res) => {
  try {
    const readers = await docGiaService.getAllReaders();
    return res.status(200).json({
      message: 'Lấy danh sách độc giả thành công!',
      data: readers
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.toggleStatus = async (req, res) => {
  try {
    const readerId = req.params.id;
    const updatedReader = await docGiaService.toggleReaderStatus(readerId);
    return res.status(200).json({
      message: `Đã cập nhật trạng thái tài khoản độc giả thành: ${updatedReader.TrangThai}`,
      data: updatedReader
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// update thông tin ở phần tài khoản phân hệ độc giả
exports.updateProfile = async (req, res) => {
  try {
    // req.user.id lấy từ authMiddleware sau khi giải mã JWT token
    const idTaiKhoan = req.user.IDTaiKhoan; 
    const { HoTen, SoDienThoai, Email, MatKhau } = req.body;

    if (!HoTen) {
      return res.status(400).json({ success: false, message: 'Họ tên không được để trống.' });
    }

    // 1. Tìm bản ghi Độc giả liên kết với Tài khoản này
    const docGia = await DocGia.findOne({ where: { IDTaiKhoan: idTaiKhoan } });
    if (!docGia) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin độc giả.' });
    }

    // 2. Tiến hành cập nhật thông tin cá nhân
    docGia.HoTen = HoTen;
    docGia.SoDienThoai = SoDienThoai || docGia.SoDienThoai;
    await docGia.save();

    const taiKhoan = await TaiKhoan.findByPk(idTaiKhoan);
    if (taiKhoan) {
        if (Email) {
            // Kiểm tra xem email có bị trùng với tài khoản khác không
            const existingEmail = await TaiKhoan.findOne({ where: { Email: Email } });
            if (existingEmail && existingEmail.IDTaiKhoan !== idTaiKhoan) {
                return res.status(400).json({ success: false, message: 'Email này đã được sử dụng.' });
            }
            taiKhoan.Email = Email;
        }

        // Nếu người dùng nhập mật khẩu mới, tiến hành băm (hash) và lưu lại
        if (MatKhau && MatKhau.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            taiKhoan.MatKhau = await bcrypt.hash(MatKhau, salt);
        }
        await taiKhoan.save();
    }

    // 3. Lấy lại thông tin tài khoản đầy đủ để đồng bộ với Frontend nếu cần
    const updatedUser = {
      id: idTaiKhoan,
      HoTen: docGia.HoTen,
      SoDienThoai: docGia.SoDienThoai,
      Email: taiKhoan.Email,
      LoaiTaiKhoan: 'DOC_GIA' // Hoặc giá trị từ bảng tài khoản liên kết
    };

    return res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin cá nhân thành công.',
      user: updatedUser
    });
  } catch (error) {
    console.error('Lỗi cập nhật profile:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi cập nhật thông tin.' });
  }
};
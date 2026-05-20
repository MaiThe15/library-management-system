const nhanVienService = require('../services/nhanVienService');

exports.updateProfile = async (req, res) => {
  try {
    const idTaiKhoan = req.user.IDTaiKhoan; 
    const { HoTen } = req.body;

    if (!HoTen) {
      return res.status(400).json({ success: false, message: 'Họ tên không được để trống.' });
    }

    // Gọi tới hàm ở tầng Service
    const updatedUser = await nhanVienService.updateStaffProfile(idTaiKhoan, req.body);

    // Xử lý thành công
    return res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin tài khoản thành công.',
      user: updatedUser
    });

  } catch (error) {
    console.error('Lỗi cập nhật profile nhân viên:', error);
    
    // Bắt các lỗi cụ thể ném ra từ Service
    if (error.message === 'NOT_FOUND_NHANVIEN') {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin nhân viên.' });
    }
    if (error.message === 'EMAIL_EXISTS') {
      return res.status(400).json({ success: false, message: 'Email này đã được sử dụng.' });
    }

    // Lỗi hệ thống ngoài dự kiến
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi cập nhật thông tin.' });
  }
};
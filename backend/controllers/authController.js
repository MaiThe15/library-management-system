const authService = require('../services/authService');

exports.register = async (req, res) => {
  try {
    // Gọi service xử lý
    const result = await authService.registerDocGia(req.body);
    return res.status(201).json({ message: 'Đăng ký thành công!', data: result });
  } catch (error) {
    // Phân loại lỗi để trả về status code phù hợp
    const statusCode = error.message.includes('đã được đăng ký') ? 400 : 500;
    return res.status(statusCode).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { Email, MatKhau } = req.body;
    const result = await authService.login(Email, MatKhau);
    return res.status(200).json(result);
  } catch (error) {
    const statusCode = error.message.includes('không đúng') ? 401 : 403;
    return res.status(statusCode).json({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    // Nhờ middleware, ta đã biết chính xác user là ai thông qua req.user
    return res.status(200).json({ 
      message: 'Lấy thông tin thành công', 
      user: req.user 
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
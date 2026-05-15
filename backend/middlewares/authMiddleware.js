const jwt = require('jsonwebtoken');

// 1. Middleware kiểm tra xem đã đăng nhập chưa (có Token hợp lệ không)
exports.verifyToken = (req, res, next) => {
  // Lấy token từ header 'Authorization' (Thường có dạng: "Bearer <token>")
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Bạn chưa đăng nhập hoặc không có quyền truy cập!' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Giải mã token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
    // Gắn thông tin giải mã được (IDTaiKhoan, LoaiTaiKhoan...) vào request để các Controller sau dùng
    req.user = decoded; 
    next(); // Cho phép đi tiếp vào Controller
  } catch (error) {
    return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn!' });
  }
};

// 2. Middleware kiểm tra Quyền (Role)
// Truyền vào danh sách các loại tài khoản hoặc vai trò được phép
exports.checkRole = (allowedRoles) => {
  return (req, res, next) => {
    // req.user được lấy từ bước verifyToken ở trên
    if (!req.user || !allowedRoles.includes(req.user.LoaiTaiKhoan)) {
      return res.status(403).json({ message: 'Bạn không có quyền thực hiện hành động này!' });
    }
    next();
  };
};
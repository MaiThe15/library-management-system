const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Route công khai: Lấy danh sách sách
router.get('/', bookController.getAllBooks);

// Route bảo mật: Phải đăng nhập VÀ là NHAN_VIEN mới được thêm sách
router.post(
  '/', 
  verifyToken, 
  checkRole(['NHAN_VIEN']), 
  upload.single('AnhBia'), // Tên trường file gửi từ Frontend phải là 'AnhBia'
  bookController.createBook
);

module.exports = router;
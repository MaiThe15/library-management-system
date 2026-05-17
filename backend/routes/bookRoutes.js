const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Route công khai: Lấy danh sách sách
router.get('/', bookController.getAllBooks);
router.get('/metadata', verifyToken, bookController.getBookMetadata);

// Route bảo mật: Phải đăng nhập VÀ là NHAN_VIEN mới được thêm sách
router.post(
  '/', 
  verifyToken, 
  checkRole(['NHAN_VIEN']), 
  upload.single('AnhBia'), // Tên trường file gửi từ Frontend phải là 'AnhBia'
  bookController.createBook
);

router.get('/search', bookController.searchBooks);

// Route bảo mật: Cập nhật sách (có hỗ trợ đổi ảnh)
router.put(
  '/:id', 
  verifyToken, 
  checkRole(['NHAN_VIEN']), 
  upload.single('AnhBia'), 
  bookController.updateBook
);

// Route bảo mật: Xóa sách
router.delete(
  '/:id', 
  verifyToken, 
  checkRole(['NHAN_VIEN']), 
  bookController.deleteBook
);

// Route công khai: Xem chi tiết 1 cuốn sách
router.get('/:id', bookController.getBookById);

module.exports = router;
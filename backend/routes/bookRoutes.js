const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const danhGiaController = require('../controllers/danhGiaController');

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

router.get('/newest', bookController.getNewestBooks);
router.get('/popular', bookController.getPopularBooks);

router.get('/all', bookController.getFilteredBooks);

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

// Lấy danh sách đánh giá (Mọi người đều xem được)
router.get('/:id/reviews', danhGiaController.getBookReviews);
// Kiểm tra quyền được viết đánh giá (Phải đăng nhập)
router.get('/:id/review-eligibility', verifyToken, danhGiaController.checkReviewEligibility);
// Gửi bài viết đánh giá (Phải đăng nhập và là Độc giả)
router.post('/:id/reviews', verifyToken, checkRole(['DOC_GIA']), danhGiaController.createReview);

module.exports = router;
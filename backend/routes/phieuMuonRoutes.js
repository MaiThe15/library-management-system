const express = require('express');
const router = express.Router();
const phieuMuonController = require('../controllers/phieuMuonController');

// Import đúng tên hàm từ authMiddleware của bạn
const { verifyToken, checkRole } = require('../middlewares/authMiddleware'); 

// 1. Route lấy danh sách phiếu mượn (Nên bảo vệ, chỉ Nhân viên mới được xem toàn bộ)
router.get('/', verifyToken, checkRole(['NHAN_VIEN']), phieuMuonController.getAllBorrowSlips);

// 2. Route tạo phiếu mượn (Chỉ dành cho Nhân viên)
router.post('/create', verifyToken, checkRole(['NHAN_VIEN']), phieuMuonController.createBorrowSlip);

// 3. Route xác nhận trả sách và xuất hóa đơn (CỰC KỲ QUAN TRỌNG: Phải có verifyToken)
router.put('/:id/return', verifyToken, checkRole(['NHAN_VIEN']), phieuMuonController.returnBorrowSlip);

// 4. Route xem lịch sử mượn sách cá nhân (Dành riêng cho phân hệ Độc giả)
router.get('/my-history', verifyToken, checkRole(['DOC_GIA']), phieuMuonController.getReaderHistory);

module.exports = router;
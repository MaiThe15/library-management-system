const express = require('express');
const router = express.Router();
const hoaDonController = require('../controllers/hoaDonController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

// Tất cả các tính năng tài chính yêu cầu quyền NHAN_VIEN (Cụ thể là bộ phận Kế toán)
router.use(verifyToken);
router.use(checkRole(['NHAN_VIEN']));

// Lấy danh sách hóa đơn
router.get('/', hoaDonController.getInvoices);

// Lấy báo cáo doanh thu tổng hợp
router.get('/thong-ke', hoaDonController.getFinancialSummary);

// Xác nhận thanh toán hóa đơn cụ thể
router.put('/:id/pay', hoaDonController.payInvoice);

module.exports = router;
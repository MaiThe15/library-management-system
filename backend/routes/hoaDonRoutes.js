const express = require('express');
const router = express.Router();
const hoaDonController = require('../controllers/hoaDonController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

router.use(verifyToken); // Bắt buộc đăng nhập cho tất cả route bên dưới

// --- CÁC ROUTE CỦA KẾ TOÁN (NHAN_VIEN) ---
router.get('/', checkRole(['NHAN_VIEN']), hoaDonController.getInvoices);
router.get('/thong-ke', checkRole(['NHAN_VIEN']), hoaDonController.getFinancialSummary);
router.post('/expense', checkRole(['NHAN_VIEN']), hoaDonController.createExpenseInvoice);
router.put('/:id/pay', checkRole(['NHAN_VIEN']), hoaDonController.payInvoice);

// --- ROUTE MỚI CỦA ĐỘC GIẢ (DOC_GIA) ---
router.get('/my-invoices', checkRole(['DOC_GIA']), hoaDonController.getMyInvoices);

module.exports = router;
// backend/routes/phieuKhoRoutes.js
const express = require('express');
const router = express.Router();
const phieuKhoController = require('../controllers/phieuKhoController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

// Tất cả các tuyến đường này đều yêu cầu đăng nhập và phải là tài khoản nhân viên (Staff/Admin)
router.use(verifyToken);
router.use(checkRole(['NHAN_VIEN']));

// Tuyến đường tạo phiếu nhập/xuất kho
router.post('/', phieuKhoController.createPhieuKho);

// Tuyến đường lấy toàn bộ danh sách phiếu kho (Lịch sử nhập xuất)
router.get('/', phieuKhoController.getAllPhieuKhos);

// Tuyến đường xem chi tiết 1 phiếu kho cụ thể
router.get('/:id', phieuKhoController.getPhieuKhoById);

module.exports = router;
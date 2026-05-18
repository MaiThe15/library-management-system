const express = require('express');
const router = express.Router();
const thongKeController = require('../controllers/thongKeController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

// Tạm thời cấp quyền cho QUAN_LY (hoặc Admin/Giám đốc tùy cấu hình Role của bạn)
router.use(verifyToken);
router.use(checkRole(['NHAN_VIEN'])); // Tạm để NHAN_VIEN để bạn dễ test, sau này sang phần IT ta sẽ tách Role QUAN_LY riêng

router.get('/master', thongKeController.getDashboardData);

module.exports = router;
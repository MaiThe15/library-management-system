const express = require('express');
const router = express.Router();
const phieuMuonController = require('../controllers/phieuMuonController');
const { verifyToken, isLibrarian } = require('../middlewares/authMiddleware'); // Giả định bạn có middleware phân quyền

// Route chỉ dành cho Thủ thư (hoặc nhân viên có quyền)
router.post('/create', verifyToken, phieuMuonController.createBorrowSlip);

module.exports = router;
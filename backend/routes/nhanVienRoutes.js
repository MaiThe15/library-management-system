const express = require('express');
const router = express.Router();
const nhanVienController = require('../controllers/nhanVienController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Route cập nhật thông tin cá nhân của nhân viên
router.put('/profile', verifyToken, nhanVienController.updateProfile);

module.exports = router;
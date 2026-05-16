const express = require('express');
const router = express.Router();
const docGiaController = require('../controllers/docGiaController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Các route quản lý trạng thái độc giả của Thủ thư
router.get('/', verifyToken, docGiaController.getAllReaders);
router.put('/:id/status', verifyToken, docGiaController.toggleStatus);

module.exports = router;
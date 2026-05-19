const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, checkRole, checkNhanVienRole } = require('../middlewares/authMiddleware');

// 1. Phải đăng nhập
router.use(verifyToken);
// 2. Phải là tài khoản NHAN_VIEN
router.use(checkRole(['NHAN_VIEN'])); 
// 3. IDVaiTro phải là Admin (Giả sử Admin trong bảng VaiTro của bạn có ID là 1)
router.use(checkNhanVienRole([1])); 

router.get('/employees', adminController.getEmployees);
router.post('/employees', adminController.createEmployee);
router.put('/employees/:id/role', adminController.updateEmployeeRole);
router.put('/employees/:id/status', adminController.toggleEmployeeStatus);

module.exports = router;
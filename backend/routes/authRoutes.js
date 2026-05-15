const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

// Khai báo các endpoint
router.post('/register', authController.register);
router.post('/login', authController.login);

router.get('/me', verifyToken, authController.getProfile);

module.exports = router;

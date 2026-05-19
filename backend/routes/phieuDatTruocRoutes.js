// backend/routes/phieuDatTruocRoutes.js
const express = require('express');
const router = express.Router();
const phieuDatTruocController = require('../controllers/phieuDatTruocController');
const authMiddleware = require('../middlewares/authMiddleware'); // Middleware check token

// Chỉ Độc giả mới được dùng các API này
router.post('/', authMiddleware.verifyToken, phieuDatTruocController.datTruoc);
router.get('/my-waitlist', authMiddleware.verifyToken, phieuDatTruocController.getMyWaitlist);
router.put('/:id/cancel', authMiddleware.verifyToken, phieuDatTruocController.huyDatTruoc);

module.exports = router;
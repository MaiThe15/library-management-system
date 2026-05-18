const hoaDonService = require('../services/hoaDonService');

exports.getInvoices = async (req, res) => {
    try {
        const invoices = await hoaDonService.getAllHoaDons();
        return res.status(200).json({ success: true, data: invoices });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.payInvoice = async (req, res) => {
    try {
        const idHoaDon = req.params.id;
        const updatedInvoice = await hoaDonService.thanhToanHoaDon(idHoaDon);
        return res.status(200).json({ 
            success: true, 
            message: 'Xác nhận thanh toán hóa đơn thành công!', 
            data: updatedInvoice 
        });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

exports.getFinancialSummary = async (req, res) => {
    try {
        const summary = await hoaDonService.getThongKeTaiChinh();
        return res.status(200).json({ success: true, data: summary });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMyInvoices = async (req, res) => {
    try {
        const idDocGia = req.user.IDDocGia; 
        if (!idDocGia) {
            return res.status(403).json({ success: false, message: 'Tài khoản không có quyền độc giả.' });
        }
        const invoices = await hoaDonService.getHoaDonByDocGia(idDocGia);
        return res.status(200).json({ success: true, data: invoices });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
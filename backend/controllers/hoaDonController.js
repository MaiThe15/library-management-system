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

exports.createExpenseInvoice = async (req, res) => {
    try {
        // Lấy ID Nhân viên (kế toán) đang đăng nhập từ token
        const idNhanVien = req.user.IDNhanVien; 
        
        if (!idNhanVien) {
            return res.status(403).json({ success: false, message: 'Chỉ nhân viên mới có quyền tạo hóa đơn chi.' });
        }

        const result = await hoaDonService.taoHoaDonChiThuCong(req.body, idNhanVien);
        return res.status(201).json({ 
            success: true, 
            message: 'Tạo hóa đơn chi thành công!', 
            data: result 
        });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};
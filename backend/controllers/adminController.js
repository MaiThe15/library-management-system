const adminService = require('../services/adminService');

exports.getEmployees = async (req, res) => {
    try {
        const list = await adminService.layDanhSachNhanVien();
        return res.status(200).json({ success: true, data: list });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.createEmployee = async (req, res) => {
    try {
        const newEmployee = await adminService.taoMoiNhanVien(req.body);
        return res.status(201).json({ 
            success: true, 
            message: 'Tạo tài khoản nhân viên thành công!', 
            data: newEmployee 
        });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

exports.updateEmployeeRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { idVaiTro } = req.body; // Lấy idVaiTro từ request
        
        if (!idVaiTro) {
            return res.status(400).json({ success: false, message: 'Vui lòng cung cấp Vai trò mới.' });
        }

        const updated = await adminService.capNhatVaiTroNhanVien(id, idVaiTro);
        return res.status(200).json({ 
            success: true, 
            message: 'Cập nhật phân quyền thành công!', 
            data: updated 
        });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

exports.toggleEmployeeStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { TrangThai } = req.body;
        const updated = await adminService.thayDoiTrangThaiNhanVien(id, TrangThai);
        return res.status(200).json({ 
            success: true, 
            message: 'Cập nhật trạng thái tài khoản thành công!', 
            data: updated 
        });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};
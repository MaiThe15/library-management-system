const phieuKhoService = require('../services/phieuKhoService');
const { NhanVien } = require('../models');

const createPhieuKho = async (req, res) => {
    try {
        // 1. Lấy IDTaiKhoan từ token (đã được middleware verifyToken giải mã)
        const idTaiKhoan = req.user.IDTaiKhoan || req.user.id; 

        // 2. Tìm IDNhanVien thực tế dựa trên IDTaiKhoan này
        const nhanVien = await NhanVien.findOne({ where: { IDTaiKhoan: idTaiKhoan } });
         
        if (!nhanVien) {
            return res.status(403).json({
                success: false,
                message: 'Tài khoản của bạn không được liên kết với hồ sơ nhân viên nào. Không thể lập phiếu!'
            });
        }

        const IDNhanVien = nhanVien.IDNhanVien;

        const { LoaiPhieu, GhiChu, chiTietSachs } = req.body;

        if (!LoaiPhieu || !chiTietSachs || chiTietSachs.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp đầy đủ thông tin loại phiếu và danh sách sách nhập/xuất.'
            });
        }

        const phieuKho = await phieuKhoService.createPhieuKho({
            IDNhanVien,
            LoaiPhieu,
            GhiChu,
            chiTietSachs
        });

        return res.status(201).json({
            success: true,
            message: `Tạo phiếu ${LoaiPhieu.toLowerCase()} kho và cập nhật số lượng sách thành công.`,
            data: phieuKho
        });
    } catch (error) {
        console.error('Error in createPhieuKho Controller:', error);
        return res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi hệ thống khi xử lý phiếu kho.',
            error: error.message
        });
    }
};

const getAllPhieuKhos = async (req, res) => {
    try {
        const phieuKhos = await phieuKhoService.getAllPhieuKhos();
        return res.status(200).json({
            success: true,
            data: phieuKhos
        });
    } catch (error) {
        console.error('Error in getAllPhieuKhos Controller:', error);
        return res.status(500).json({
            success: false,
            message: 'Không thể lấy danh sách phiếu kho.',
            error: error.message
        });
    }
};

const getPhieuKhoById = async (req, res) => {
    try {
        const { id } = req.params;
        const phieuKho = await phieuKhoService.getPhieuKhoById(id);
        
        if (!phieuKho) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy phiếu kho yêu cầu.'
            });
        }

        return res.status(200).json({
            success: true,
            data: phieuKho
        });
    } catch (error) {
        console.error('Error in getPhieuKhoById Controller:', error);
        return res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi lấy chi tiết phiếu kho.',
            error: error.message
        });
    }
};

module.exports = {
    createPhieuKho,
    getAllPhieuKhos,
    getPhieuKhoById
};
const { PhieuKho, CT_PhieuKho, Sach, NhanVien, sequelize, HoaDon } = require('../models');

const createPhieuKho = async (data) => {
    // Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu
    const t = await sequelize.transaction();

    try {
        const { IDNhanVien, LoaiPhieu, GhiChu, chiTietSachs } = data;

        // 1. Tính tổng tiền từ chi tiết sách
        const TongTien = chiTietSachs.reduce((sum, item) => sum + (item.SoLuong * item.DonGia), 0);

        // 2. Tạo Phiếu Kho
        const phieuKho = await PhieuKho.create({
            IDNhanVien,
            LoaiPhieu, // 'Nhập' hoặc 'Xuất'
            TongTien,
            GhiChu
        }, { transaction: t });

        // 3. Thêm Chi tiết Phiếu Kho và cập nhật số lượng Sách
        for (const item of chiTietSachs) {
            await CT_PhieuKho.create({
                IDPhieuKho: phieuKho.IDPhieuKho,
                IDSach: item.IDSach,
                SoLuong: item.SoLuong,
                DonGia: item.DonGia,
                ThanhTien: item.SoLuong * item.DonGia
            }, { transaction: t });

            // Cập nhật số lượng sách trong kho
            const sach = await Sach.findByPk(item.IDSach, { transaction: t });
            if (sach) {
                let tongMoi = sach.TongSoLuong;
                let sanSangMoi = sach.SoLuongSanSang;

                if (LoaiPhieu === 'Nhập') {
                    // Nhập sách mới: Tăng cả tổng số lượng và số lượng sẵn sàng
                    tongMoi += item.SoLuong;
                    sanSangMoi += item.SoLuong;
                } else if (LoaiPhieu === 'Xuất') {
                    // Xuất sách (thanh lý/hỏng): Giảm cả hai
                    tongMoi -= item.SoLuong;
                    sanSangMoi -= item.SoLuong;
                }

                // Tự động cập nhật trạng thái nếu cần
                let trangThaiMoi = sach.TrangThai;
                if (sanSangMoi > 0 && trangThaiMoi === 'HET_SACH') {
                    trangThaiMoi = 'CO_SAN';
                } else if (sanSangMoi <= 0) {
                    trangThaiMoi = 'HET_SACH';
                }

                // Cập nhật lại đúng tên cột trong model
                await sach.update({ 
                    TongSoLuong: tongMoi, 
                    SoLuongSanSang: sanSangMoi,
                    TrangThai: trangThaiMoi
                }, { transaction: t });
            }
        }

        if (LoaiPhieu === 'Nhập') {
            await HoaDon.create({
                IDNhanVien: IDNhanVien,    // ID nhân viên kho lập phiếu nhập
                IDDocGia: null,            // Hóa đơn chi không liên quan đến độc giả
                LoaiHoaDon: 'Chi',         // Đánh dấu đây là hóa đơn chi tiền quỹ
                LyDo: `Chi trả tiền nhập sách mới theo Phiếu Kho #${phieuKho.IDPhieuKho}`,
                SoTien: TongTien,          // Tổng số tiền cần thanh toán cho nhà cung cấp
                TrangThai: 'Chưa thanh toán' // Chờ kế toán xuất quỹ bấm xác nhận duyệt chi
            }, { transaction: t });
        }

        // Commit transaction nếu tất cả đều thành công
        await t.commit();
        return phieuKho;

    } catch (error) {
        // Rollback nếu có bất kỳ lỗi nào xảy ra
        await t.rollback();
        throw error;
    }
};

const getAllPhieuKhos = async () => {
    return await PhieuKho.findAll({
        include: [
            { model: NhanVien, as: 'nhanVien', attributes: ['IDNhanVien', 'HoTen', 'Email'] }
        ],
        order: [['createdAt', 'DESC']]
    });
};

const getPhieuKhoById = async (id) => {
    return await PhieuKho.findByPk(id, {
        include: [
            { model: NhanVien, as: 'nhanVien', attributes: ['IDNhanVien', 'HoTen', 'Email'] },
            { 
                model: CT_PhieuKho, 
                as: 'chiTietPhieuKhos',
                include: [{ model: Sach, as: 'sach', attributes: ['IDSach', 'TieuDe', 'AnhBia'] }]
            }
        ]
    });
};

module.exports = {
    createPhieuKho,
    getAllPhieuKhos,
    getPhieuKhoById
};
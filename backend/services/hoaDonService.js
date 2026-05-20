const { HoaDon, DocGia, NhanVien, sequelize } = require('../models');

// 1. Lấy toàn bộ danh sách hóa đơn
exports.getAllHoaDons = async () => {
    return await HoaDon.findAll({
        include: [
            { model: DocGia, as: 'docGia', attributes: ['IDDocGia', 'HoTen', 'SoDienThoai'] },
            { model: NhanVien, as: 'nhanVien', attributes: ['HoTen'] }
        ],
        order: [['createdAt', 'DESC']]
    });
};

// 2. Xác nhận độc giả đã nộp tiền (Cập nhật trạng thái hóa đơn)
exports.thanhToanHoaDon = async (idHoaDon) => {
    const hoaDon = await HoaDon.findByPk(idHoaDon);
    if (!hoaDon) throw new Error('Không tìm thấy hóa đơn này trong hệ thống.');
    if (hoaDon.TrangThai === 'Đã thanh toán') throw new Error('Hóa đơn này đã được thanh toán trước đó.');

    await hoaDon.update({ TrangThai: 'Đã thanh toán' });
    return hoaDon;
};

// 3. Lấy số liệu thống kê tài chính (Tổng Thu / Tổng Chi) cho Dashboard Kế toán
exports.getThongKeTaiChinh = async () => {
    // Tổng tiền thu (Chỉ tính các hóa đơn đã thu được tiền)
    const tongThu = await HoaDon.sum('SoTien', {
        where: { LoaiHoaDon: 'Thu', TrangThai: 'Đã thanh toán' }
    }) || 0;

    // Tổng tiền chi (Ví dụ chi mua sách từ phiếu kho)
    const tongChi = await HoaDon.sum('SoTien', {
        where: { LoaiHoaDon: 'Chi', TrangThai: 'Đã thanh toán' }
    }) || 0;

    return {
        tongThu,
        tongChi,
        doanhThuThuan: tongThu - tongChi
    };
};

// Lấy danh sách hóa đơn theo ID Độc giả
exports.getHoaDonByDocGia = async (idDocGia) => {
    return await HoaDon.findAll({
        where: { IDDocGia: idDocGia },
        order: [['createdAt', 'DESC']]
    });
};

exports.taoHoaDonChiThuCong = async (data, idNhanVienKetoan) => {
    // Đảm bảo bạn đã có sẵn const { HoaDon } = require('../models'); ở đầu file nhé
    const { HoaDon } = require('../models'); // Thêm dòng này nếu model HoaDon chưa được khai báo
    
    const { lyDo, soTien, trangThai } = data;

    if (!lyDo || !soTien) throw new Error('Vui lòng nhập đầy đủ lý do chi và số tiền!');
    if (soTien <= 0) throw new Error('Số tiền chi phải lớn hơn 0đ!');

    return await HoaDon.create({
        IDNhanVien: idNhanVienKetoan,
        IDDocGia: null,
        LoaiHoaDon: 'Chi',
        LyDo: lyDo,
        SoTien: soTien,
        TrangThai: trangThai || 'Chưa thanh toán'
    });
};
const { DocGia, Sach, PhieuMuon, CT_PhieuMuon, TheLoai, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.getMasterDashboardStats = async () => {
    // 1. TOP CARDS: Thông số tổng quan
    const tongCuonSach = await Sach.sum('TongSoLuong') || 0;
    const tongDocGia = await DocGia.count();
    const dangChoMuon = await PhieuMuon.count({ where: { TrangThai: 'Đang mượn' } });
    
    // Đếm số phiếu mượn đã quá hạn
    const sachQuaHan = await PhieuMuon.count({
        where: {
            TrangThai: 'Đang mượn',
            HanTra: { [Op.lt]: new Date() } // Hạn trả nhỏ hơn ngày hiện tại
        }
    });

    // 2. BIỂU ĐỒ TRÒN (Doughnut): Sách theo thể loại
    // Vì truy vấn qua bảng trung gian TheLoai_Sachs phức tạp, ta dùng raw query hoặc include
    const theLoaiData = await TheLoai.findAll({
        include: [{
            model: Sach,
            as: 'sachs',
            attributes: ['IDSach'],
            through: { attributes: [] }
        }]
    });

    const bieuDoTheLoai = theLoaiData.map(tl => ({
        name: tl.TenTheLoai,
        value: tl.sachs.length
    })).filter(item => item.value > 0); // Chỉ lấy thể loại có sách

    // 3. BIỂU ĐỒ CỘT (Bar Chart): Lượt mượn 6 tháng gần nhất
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const phieuMuons = await PhieuMuon.findAll({
        where: { NgayMuon: { [Op.gte]: sixMonthsAgo } },
        attributes: ['NgayMuon']
    });

    // Gom nhóm bằng JavaScript cho an toàn (tránh lỗi múi giờ hoặc cú pháp DB khác nhau)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let monthlyStats = {};
    phieuMuons.forEach(pm => {
        const d = new Date(pm.NgayMuon);
        const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        monthlyStats[key] = (monthlyStats[key] || 0) + 1;
    });

    const bieuDoMuonTra = Object.keys(monthlyStats).map(key => ({
        name: key,
        borrows: monthlyStats[key]
    }));

    // 4. BẢNG GẦN ĐÂY: 5 phiếu mượn mới nhất
    const recentBorrows = await PhieuMuon.findAll({
        limit: 5,
        order: [['NgayMuon', 'DESC']],
        include: [
            { model: DocGia, as: 'docGia', attributes: ['HoTen'] },
            { 
                model: CT_PhieuMuon, as: 'chiTietPhieuMuons', 
                include: [{ model: Sach, as: 'Sach', attributes: ['TenSach'] }] 
            }
        ]
    });

    // Format lại dữ liệu cho Frontend dễ dùng
    return {
        summary: {
            tongCuonSach,
            tongDocGia,
            dangChoMuon,
            sachQuaHan
        },
        bieuDoTheLoai,
        bieuDoMuonTra,
        recentBorrows
    };
};
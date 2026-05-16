const { sequelize, PhieuMuon, CT_PhieuMuon, Sach } = require('../models');

exports.taoPhieuMuon = async (data) => {
  const { idDocGia, idNhanVien, danhSachIdSach } = data;

  // BẮT ĐẦU TRANSACTION
  const t = await sequelize.transaction();

  try {
    // 1. Tạo Phiếu mượn gốc
    const phieuMuon = await PhieuMuon.create({
      IDDocGia: idDocGia,
      IDNhanVien: idNhanVien,
      NgayMuon: new Date(),
      HanTra: new Date(new Date().setDate(new Date().getDate() + 14)), // Hạn trả mặc định 14 ngày
      TrangThai: 'Đang mượn'
    }, { transaction: t });

    // 2. Xử lý từng cuốn sách trong danh sách
    for (const idSach of danhSachIdSach) {
      // 2.1 Kiểm tra tồn kho của cuốn sách này
      const sach = await Sach.findByPk(idSach, { transaction: t });
      
      if (!sach) {
        throw new Error(`Sách có ID ${idSach} không tồn tại trong hệ thống.`);
      }
      if (sach.SoLuongSanSang <= 0) {
        throw new Error(`Sách "${sach.TenSach}" hiện đã hết trong kho.`);
      }

      // 2.2 Tạo chi tiết phiếu mượn
      await CT_PhieuMuon.create({
        IDPhieuMuon: phieuMuon.IDPhieuMuon,
        IDSach: idSach,
        TrangThai: 'Đang mượn'
      }, { transaction: t });

      // 2.3 Cập nhật giảm số lượng sách sẵn sàng
      await sach.update({
        SoLuongSanSang: sach.SoLuongSanSang - 1
      }, { transaction: t });
    }

    // COMMIT TRANSACTION: Nếu mọi thứ suôn sẻ, lưu toàn bộ thay đổi vào DB
    await t.commit();
    return phieuMuon;

  } catch (error) {
    // ROLLBACK TRANSACTION: Nếu có MỘT lỗi bất kỳ (hết sách, lỗi mạng...), hủy bỏ TOÀN BỘ thay đổi
    await t.rollback();
    throw error; // Ném lỗi ra để Controller xử lý
  }
};
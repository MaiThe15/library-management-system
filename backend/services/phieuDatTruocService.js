const db = require('../models');
const { PhieuDatTruoc, Sach, HoaDon } = db;
const { Op } = db.Sequelize;

class PhieuDatTruocService {
  // 1. Độc giả đặt trước sách
  async taoPhieuDatTruoc(IDDocGia, IDSach) {
    // Kiểm tra độc giả có nợ hay không
    const noDong = await HoaDon.findOne({
      where: { 
        IDDocGia, 
        TrangThai: 'Chưa thanh toán' 
      }
    });
    if (noDong) {
      throw new Error('Bạn đang có khoản nợ/phạt chưa thanh toán nên không thể đặt trước sách!');
    }

    // Kiểm tra xem đã đặt cuốn này và đang chờ chưa để tránh spam
    const existing = await PhieuDatTruoc.findOne({
      where: { 
        IDDocGia, 
        IDSach, 
        TrangThai: {
          [Op.in]: ['DANG_CHO', 'CO_SAN'] // Chặn cả 2 trạng thái này
        }
      }
    });
    
    if (existing) {
      if (existing.TrangThai === 'CO_SAN') {
        throw new Error('Sách này đã có sẵn cho bạn ở thư viện, vui lòng đến nhận thay vì đặt lại!');
      }
      throw new Error('Bạn đã đặt trước cuốn sách này và đang chờ rồi!');
    }

    // Nếu qua được các cửa kiểm tra trên thì mới cho phép tạo
    const phieu = await PhieuDatTruoc.create({
      IDDocGia,
      IDSach,
      NgayDat: new Date(),
      TrangThai: 'DANG_CHO'
    });
    return phieu;
  }

  // 2. Lấy danh sách đặt trước của 1 độc giả (để hiện thông báo)
  async getWaitlistCuaDocGia(IDDocGia) {
    return await PhieuDatTruoc.findAll({
      where: { IDDocGia },
      include: [{ model: Sach, as: 'sach', attributes: ['TenSach', 'AnhBia'] }],
      order: [['NgayDat', 'DESC']]
    });
  }

  // 3. Logic tự động gọi khi CÓ NGƯỜI TRẢ SÁCH
  async xuLyKhiTraSach(IDSach, transaction) {
    // Tìm người đặt trước sớm nhất
    const nguoiCho = await PhieuDatTruoc.findOne({
      where: { IDSach, TrangThai: 'DANG_CHO' },
      order: [['NgayDat', 'ASC']],
      transaction
    });

    if (nguoiCho) {
      // Cập nhật trạng thái thành có sẵn để báo cho độc giả
      await nguoiCho.update({ TrangThai: 'CO_SAN' }, { transaction });
      return true; // Trả về true nghĩa là sách đã được giữ cho người này
    }
    return false; // Trả về false nghĩa là không ai chờ, có thể tăng số lượng sách trên kệ
  }

  // 4. Hủy phiếu đặt trước
  async huyPhieuDatTruoc(IDPhieuDat, IDDocGia) {
    const phieu = await PhieuDatTruoc.findOne({ 
      where: { IDPhieuDat, IDDocGia } 
    });

    if (!phieu) throw new Error('Không tìm thấy phiếu đặt trước này!');
    if (phieu.TrangThai === 'HOAN_THANH' || phieu.TrangThai === 'DA_HUY') {
      throw new Error('Không thể hủy phiếu ở trạng thái này!');
    }

    // NẾU SÁCH ĐÃ CÓ SẴN (đang bị trừ số lượng trên kệ để giữ cho độc giả này)
    if (phieu.TrangThai === 'CO_SAN') {
      // Tìm xem có ai khác ĐANG CHỜ cuốn này không
      const nguoiTiepTheo = await PhieuDatTruoc.findOne({
        where: { IDSach: phieu.IDSach, TrangThai: 'DANG_CHO' },
        order: [['NgayDat', 'ASC']]
      });

      if (nguoiTiepTheo) {
        // Nhường quyền "CO_SAN" cho người tiếp theo
        await nguoiTiepTheo.update({ TrangThai: 'CO_SAN' });
      } else {
        // Nếu không có ai đợi nữa, trả lại 1 cuốn lên kệ cho mọi người mượn
        const sach = await Sach.findByPk(phieu.IDSach);
        if (sach) {
          await sach.update({ SoLuongSanSang: sach.SoLuongSanSang + 1 });
        }
      }
    }

    // Cuối cùng, cập nhật phiếu hiện tại thành Đã hủy
    await phieu.update({ TrangThai: 'DA_HUY' });
    return true;
  }
}



module.exports = new PhieuDatTruocService();
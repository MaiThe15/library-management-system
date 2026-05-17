const { DanhGia, DocGia, PhieuMuon, CT_PhieuMuon } = require('../models');

// 1. Lấy toàn bộ đánh giá của 1 cuốn sách (Công khai)
exports.getBookReviews = async (req, res) => {
  try {
    const { id } = req.params; // id của sách từ URL

    const reviews = await DanhGia.findAll({
      where: { IDSach: id },
      include: [
        {
          model: DocGia,
          as: 'docGia',
          attributes: ['HoTen'] // Chỉ lấy họ tên hiển thị kèm đánh giá
        }
      ],
      order: [['createdAt', 'DESC']] // Đánh giá mới nhất xếp lên đầu
    });

    return res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Kiểm tra điều kiện được đánh giá của độc giả hiện tại
exports.checkReviewEligibility = async (req, res) => {
  try {
    const idDocGia = req.user.IDDocGia; // Lấy từ token sau khi đăng nhập
    const { id } = req.params; // id của sách

    // A. Kiểm tra xem độc giả đã từng mượn cuốn sách này chưa
    const hasBorrowed = await PhieuMuon.findOne({
      where: { IDDocGia: idDocGia },
      include: [{
        model: CT_PhieuMuon,
        as: 'chiTietPhieuMuons',
        where: { IDSach: id }
      }]
    });

    // B. Kiểm tra xem độc giả đã viết đánh giá cho sách này chưa
    const alreadyReviewed = await DanhGia.findOne({
      where: { IDDocGia: idDocGia, IDSach: id }
    });

    return res.status(200).json({
      success: true,
      canReview: !!hasBorrowed && !alreadyReviewed,
      reason: alreadyReviewed ? 'ALREADY_REVIEWED' : (!hasBorrowed ? 'NOT_BORROWED' : 'ELIGIBLE')
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Đăng bài đánh giá mới
exports.createReview = async (req, res) => {
  try {
    const idDocGia = req.user.IDDocGia;
    const { id } = req.params;
    const { SoSao, BinhLuan } = req.body;

    if (!SoSao || SoSao < 1 || SoSao > 5) {
      return res.status(400).json({ success: false, message: 'Số sao hợp lệ phải từ 1 đến 5.' });
    }

    // Kiểm tra bảo mật chéo ở Backend
    const hasBorrowed = await PhieuMuon.findOne({
      where: { IDDocGia: idDocGia },
      include: [{ model: CT_PhieuMuon, as: 'chiTietPhieuMuons', where: { IDSach: id } }]
    });

    if (!hasBorrowed) {
      return res.status(403).json({ success: false, message: 'Bạn không thể đánh giá cuốn sách chưa từng mượn.' });
    }

    const alreadyReviewed = await DanhGia.findOne({ where: { IDDocGia: idDocGia, IDSach: id } });
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'Bạn đã để lại đánh giá cho sách này rồi.' });
    }

    const newReview = await DanhGia.create({
      IDDocGia: idDocGia,
      IDSach: id,
      SoSao,
      BinhLuan
    });

    return res.status(201).json({ success: true, message: 'Gửi đánh giá thành công!', data: newReview });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
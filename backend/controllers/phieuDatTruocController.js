const phieuDatTruocService = require('../services/phieuDatTruocService');

exports.datTruoc = async (req, res) => {
  try {
    // Lấy IDDocGia từ token (req.user) nhờ authMiddleware
    const { IDSach } = req.body;
    const IDDocGia = req.user.IDDocGia; 
    
    const result = await phieuDatTruocService.taoPhieuDatTruoc(IDDocGia, IDSach);
    return res.status(201).json({ message: 'Đặt trước thành công!', data: result });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.getMyWaitlist = async (req, res) => {
  try {
    const IDDocGia = req.user.IDDocGia;
    const result = await phieuDatTruocService.getWaitlistCuaDocGia(IDDocGia);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.huyDatTruoc = async (req, res) => {
  try {
    const IDPhieuDat = req.params.id; // Lấy ID phiếu từ URL
    const IDDocGia = req.user.IDDocGia; // Bảo mật: Chỉ người tạo mới được hủy
    
    await phieuDatTruocService.huyPhieuDatTruoc(IDPhieuDat, IDDocGia);
    return res.status(200).json({ message: 'Đã hủy phiếu đặt trước thành công!' });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
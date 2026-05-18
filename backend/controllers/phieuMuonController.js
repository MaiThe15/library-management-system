const phieuMuonService = require('../services/phieuMuonService');

exports.createBorrowSlip = async (req, res) => {
  try {
    const { idDocGia, danhSachIdSach } = req.body;
    
    // Lấy ID Nhân viên từ token đăng nhập (thông qua middleware auth)
    const idNhanVien = req.user.IDNhanVien; // Giả định req.user đã được gán bởi middleware

    // Validate cơ bản
    if (!idDocGia || !danhSachIdSach || danhSachIdSach.length === 0) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đủ thông tin độc giả và sách.' });
    }

    // Gọi Service thực thi nghiệp vụ
    const newSlip = await phieuMuonService.taoPhieuMuon({
      idDocGia,
      idNhanVien,
      danhSachIdSach
    });

    return res.status(201).json({ 
      message: 'Tạo phiếu mượn thành công!', 
      data: newSlip 
    });

  } catch (error) {
    // Bắt lỗi từ Service (ví dụ: lỗi hết sách)
    const statusCode = error.message.includes('không tồn tại') || error.message.includes('hết trong kho') ? 400 : 500;
    return res.status(statusCode).json({ message: error.message });
  }
};

exports.getAllBorrowSlips = async (req, res) => {
  try {
    const slips = await phieuMuonService.getAllBorrowSlips();
    return res.status(200).json({ 
      message: 'Lấy danh sách phiếu mượn thành công!', 
      data: slips 
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.returnBorrowSlip = async (req, res) => {
  try {
    const idPhieuMuon = req.params.id;
    const idNhanVien = req.user.IDNhanVien;

    if (!idNhanVien) {
      return res.status(403).json({ message: 'Chỉ nhân viên thư viện mới có quyền xử lý trả sách.' });
    }

    const result = await phieuMuonService.traPhieuMuon(idPhieuMuon, idNhanVien);
    
    return res.status(200).json({ 
      message: 'Xác nhận trả sách thành công! Kho đã được cập nhật.', 
      data: result 
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.getReaderHistory = async (req, res) => {
  try {
    // Middleware verifyToken giải mã token độc giả sẽ gán thông tin vào req.user
    const idDocGia = req.user.IDDocGia; 
    
    if (!idDocGia) {
      return res.status(403).json({ message: 'Tài khoản không có quyền truy cập chức năng độc giả.' });
    }

    const history = await phieuMuonService.getReaderBorrowHistory(idDocGia);
    return res.status(200).json({
      message: 'Lấy lịch sử mượn sách cá nhân thành công!',
      data: history
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
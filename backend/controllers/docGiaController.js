const docGiaService = require('../services/docGiaService');

exports.getAllReaders = async (req, res) => {
  try {
    const readers = await docGiaService.getAllReaders();
    return res.status(200).json({
      message: 'Lấy danh sách độc giả thành công!',
      data: readers
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.toggleStatus = async (req, res) => {
  try {
    const readerId = req.params.id;
    const updatedReader = await docGiaService.toggleReaderStatus(readerId);
    return res.status(200).json({
      message: `Đã cập nhật trạng thái tài khoản độc giả thành: ${updatedReader.TrangThai}`,
      data: updatedReader
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
const { Sach, TacGia, TheLoai, ViTriLuuTru } = require('../models');

class BookService {
  // 1. Lấy danh sách toàn bộ sách
  async getAllBooks() {
    return await Sach.findAll({
      include: [
        { model: TacGia, as: 'tacGia', attributes: ['TenTacGia'] },
        { model: ViTriLuuTru, as: 'viTri', attributes: ['KhuVuc', 'Tang', 'KeSach'] },
        { 
          model: TheLoai, 
          as: 'theLoais', 
          attributes: ['TenTheLoai'],
          through: { attributes: [] } // Ẩn các cột thừa của bảng trung gian
        }
      ]
    });
  }

  // 2. Thêm sách mới
  async createBook(data) {
    const { TenSach, AnhBia, TongSoLuong, IDTacGia, IDViTri, theLoaiIds } = data;

    const newBook = await Sach.create({
      TenSach,
      AnhBia: AnhBia || 'https://via.placeholder.com/150', // Nếu không gửi link ảnh, dùng ảnh mặc định
      TongSoLuong,
      SoLuongSanSang: TongSoLuong, 
      TrangThai: TongSoLuong > 0 ? 'CO_SAN' : 'HET_SACH',
      IDTacGia,
      IDViTri
    });

    // Nếu có mảng ID Thể loại truyền lên, tự động thêm vào bảng trung gian TheLoai_Sachs
    if (theLoaiIds && theLoaiIds.length > 0) {
      await newBook.setTheLoais(theLoaiIds); // Hàm đặc biệt của Sequelize khi dùng belongsToMany
    }

    return newBook;
  }
}

module.exports = new BookService();
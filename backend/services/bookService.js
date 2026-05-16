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

  // 3. Cập nhật thông tin sách
  async updateBook(id, data) {
    const book = await Sach.findByPk(id);
    if (!book) throw new Error('Không tìm thấy sách!');

    // Tách riêng mảng thể loại ra khỏi data cập nhật
    const { theLoaiIds, ...updateData } = data;

    // Nếu TongSoLuong thay đổi, cần tính lại SoLuongSanSang (logic cơ bản: lấy số lượng sẵn sàng hiện tại + phần chênh lệch)
    if (updateData.TongSoLuong !== undefined && updateData.TongSoLuong !== book.TongSoLuong) {
      const difference = updateData.TongSoLuong - book.TongSoLuong;
      updateData.SoLuongSanSang = book.SoLuongSanSang + difference;
      updateData.TrangThai = updateData.SoLuongSanSang > 0 ? 'CO_SAN' : 'HET_SACH';
    }

    await book.update(updateData);

    // Cập nhật lại danh sách Thể loại nếu có truyền lên
    if (theLoaiIds) {
      await book.setTheLoais(theLoaiIds);
    }

    return book;
  }

  // 4. Xóa sách
  async deleteBook(id) {
    const book = await Sach.findByPk(id);
    if (!book) throw new Error('Không tìm thấy sách!');
    
    // Sequelize sẽ tự động xóa các bản ghi liên quan trong bảng trung gian TheLoai_Sachs nhờ onDelete: 'CASCADE'
    await book.destroy();
    return true;
  }
}

module.exports = new BookService();
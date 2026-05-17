const { Sach, TacGia, TheLoai, ViTriLuuTru, sequelize } = require('../models');

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
          // Sửa ở dòng dưới đây: Thêm 'IDTheLoai' vào attributes
          attributes: ['IDTheLoai', 'TenTheLoai'], 
          through: { attributes: [] } 
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

  // 3. Cập nhật thông tin sách (File: backend/services/bookService.js)
  async updateBook(id, data) {
    const book = await Sach.findByPk(id);
    if (!book) throw new Error('Không tìm thấy sách!');

    // Tách riêng mảng thể loại ra khỏi data cập nhật
    const { theLoaiIds, ...updateData } = data;

    // Phòng thủ lỗi chuỗi rỗng gửi từ form sửa khi tác giả/vị trí bị bỏ trống
    if (updateData.IDTacGia === '') updateData.IDTacGia = null;
    if (updateData.IDViTri === '') updateData.IDViTri = null;

    // Nếu TongSoLuong thay đổi, cần tính lại SoLuongSanSang
    if (updateData.TongSoLuong !== undefined && updateData.TongSoLuong !== book.TongSoLuong) {
      const difference = updateData.TongSoLuong - book.TongSoLuong;
      updateData.SoLuongSanSang = book.SoLuongSanSang + difference;
      updateData.TrangThai = updateData.SoLuongSanSang > 0 ? 'CO_SAN' : 'HET_SACH';
    }

    // Tiến hành cập nhật các trường cơ bản của sách
    await book.update(updateData);

    // Cập nhật lại danh sách Thể loại trong bảng trung gian nếu có truyền lên
    if (theLoaiIds) {
      await book.setTheLoais(theLoaiIds);
    }

    // === ĐOẠN SỬA QUAN TRỌNG: Truy vấn lại toàn bộ thông tin đầy đủ kèm liên kết bảng trước khi trả về ===
    const updatedBookFull = await Sach.findByPk(id, {
      include: [
        { model: TacGia, as: 'tacGia', attributes: ['TenTacGia'] },
        { model: ViTriLuuTru, as: 'viTri', attributes: ['KhuVuc', 'Tang', 'KeSach'] },
        { 
          model: TheLoai, 
          as: 'theLoais', 
          attributes: ['IDTheLoai', 'TenTheLoai'], // Đảm bảo lấy đủ cả ID và Tên để React render
          through: { attributes: [] }
        }
      ]
    });

    return updatedBookFull;
  }

  // 4. Xóa sách
  async deleteBook(id) {
    const book = await Sach.findByPk(id);
    if (!book) throw new Error('Không tìm thấy sách!');
    
    // Sequelize sẽ tự động xóa các bản ghi liên quan trong bảng trung gian TheLoai_Sachs nhờ onDelete: 'CASCADE'
    await book.destroy();
    return true;
  }

  // Lấy danh sách 5 cuốn sách mới nhập nhất
  async getNewestBooks(limit = 5) {
    return await Sach.findAll({
      include: [
        { model: TacGia, as: 'tacGia', attributes: ['TenTacGia'] },
        { model: TheLoai, as: 'theLoais', attributes: ['TenTheLoai'], through: { attributes: [] } }
      ],
      order: [['createdAt', 'DESC']], // Sắp xếp theo ngày tạo giảm dần
      limit: limit
    });
  }

  // Lấy danh sách 3 cuốn sách được mượn nhiều nhất
  async getPopularBooks(limit = 3) {
    return await Sach.findAll({
      attributes: {
        include: [
          [
            // Đếm số lượt xuất hiện của đầu sách này trong bảng chi tiết phiếu mượn
            sequelize.literal(`(
              SELECT COUNT(*)::int
              FROM "CT_PhieuMuons" AS ct
              WHERE ct."IDSach" = "Sach"."IDSach"
            )`),
            'LuotMuon'
          ]
        ]
      },
      include: [
        { model: TacGia, as: 'tacGia', attributes: ['TenTacGia'] }
      ],
      order: [[sequelize.literal('"LuotMuon"'), 'DESC']], // Xếp từ mượn nhiều đến ít
      limit: limit
    });
  }
}

module.exports = new BookService();
const bookService = require('../services/bookService');
const { TacGia, ViTriLuuTru, TheLoai } = require('../models');

exports.getAllBooks = async (req, res) => {
  try {
    const books = await bookService.getAllBooks();
    return res.status(200).json({ message: 'Lấy danh sách thành công', data: books });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.createBook = async (req, res) => {
  try {
    // Lấy dữ liệu text từ req.body
    const bookData = req.body;
    
    // Ép kiểu chuỗi "[2]" trở lại thành mảng [2]
    if (bookData.theLoaiIds) {
      bookData.theLoaiIds = JSON.parse(bookData.theLoaiIds);
    }

    // Nếu có file ảnh được tải lên, tạo đường dẫn để lưu vào DB
    if (req.file) {
      // Đường dẫn sẽ có dạng: /uploads/167890123-tenanh.jpg
      bookData.AnhBia = `/${req.file.path.replace(/\\/g, '/')}`; 
    }

    const newBook = await bookService.createBook(bookData);
    return res.status(201).json({ message: 'Thêm sách thành công', data: newBook });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    const bookData = req.body;

    if (bookData.theLoaiIds) {
      bookData.theLoaiIds = JSON.parse(bookData.theLoaiIds);
    }

    if (bookData.IDTacGia === '') bookData.IDTacGia = null;
    if (bookData.IDViTri === '') bookData.IDViTri = null;

    // Nếu có upload ảnh mới, cập nhật đường dẫn ảnh
    if (req.file) {
      bookData.AnhBia = `/${req.file.path.replace(/\\/g, '/')}`;
    }

    const updatedBook = await bookService.updateBook(bookId, bookData);
    return res.status(200).json({ message: 'Cập nhật sách thành công', data: updatedBook });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    await bookService.deleteBook(bookId);
    return res.status(200).json({ message: 'Xóa sách thành công' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getBookMetadata = async (req, res) => {
  try {
    const authors = await TacGia.findAll({ attributes: ['IDTacGia', 'TenTacGia'] });
    const locations = await ViTriLuuTru.findAll({ attributes: ['IDViTri', 'KhuVuc', 'Tang', 'KeSach'] });
    const genres = await TheLoai.findAll({ attributes: ['IDTheLoai', 'TenTheLoai'] });
    
    return res.status(200).json({ authors, locations, genres });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getBookById = async (req, res) => {
  try {
    const bookId = req.params.id;
    const { Sach, TacGia, ViTriLuuTru, TheLoai } = require('../models');

    const book = await Sach.findByPk(bookId, {
      include: [
        { model: TacGia, as: 'tacGia', attributes: ['TenTacGia'] },
        { model: ViTriLuuTru, as: 'viTri', attributes: ['KhuVuc', 'Tang', 'KeSach'] },
        { 
          model: TheLoai, 
          as: 'theLoais', 
          attributes: ['TenTheLoai'],
          through: { attributes: [] } 
        }
      ]
    });

    if (!book) return res.status(404).json({ message: 'Không tìm thấy sách!' });
    return res.status(200).json({ data: book });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
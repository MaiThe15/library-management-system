const bookService = require('../services/bookService');

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
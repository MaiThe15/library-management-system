import api from '../api/axios';

// Hàm lấy danh sách toàn bộ sách
export const fetchAllBooks = async () => {
  const response = await api.get('/books');
  // Backend trả về dạng { message: '...', data: [danh_sach_sach] }
  return response.data.data; 
};

// Thêm sách mới (Nhận vào FormData)
export const createBook = async (formData) => {
  // Axios tự động nhận diện FormData và cấu hình header multipart/form-data
  const response = await api.post('/books', formData);
  return response.data;
};

// Cập nhật sách (Nhận vào FormData)
export const updateBook = async (id, formData) => {
  const response = await api.put(`/books/${id}`, formData);
  return response.data;
};

// Xóa sách
export const deleteBook = async (id) => {
  const response = await api.delete(`/books/${id}`);
  return response.data;
};

// Hàm lấy toàn bộ danh mục Tác giả, Vị trí, Thể loại
export const fetchBookMetadata = async () => {
  const response = await api.get('/books/metadata');
  return response.data; // Trả về { authors: [...], locations: [...], genres: [...] }
};

// Lấy chi tiết 1 cuốn sách
export const fetchBookById = async (id) => {
  const response = await api.get(`/books/${id}`);
  return response.data.data;
};

export const searchBooksAPI = async (keyword) => {
  try {
    const response = await api.get(`/books/search?q=${keyword}`);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Lỗi khi tìm kiếm sách');
  }
};
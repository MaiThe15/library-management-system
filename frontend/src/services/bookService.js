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

// Lấy toàn bộ đánh giá của sách
export const fetchBookReviews = async (idSach) => {
  const response = await api.get(`/books/${idSach}/reviews`);
  return response.data.data;
};

// Kiểm tra xem độc giả có quyền đánh giá sách này không
export const checkReviewEligibility = async (idSach) => {
  const response = await api.get(`/books/${idSach}/review-eligibility`);
  return response.data; // Trả về dạng { success: true, canReview: true/false, reason: '...' }
};

// Đăng bài đánh giá mới lên hệ thống
export const createBookReview = async (idSach, reviewData) => {
  const response = await api.post(`/books/${idSach}/reviews`, reviewData);
  return response.data;
};

// Lấy 5 cuốn mới nhất
export const fetchNewestBooks = async () => {
  const response = await api.get('/books/newest');
  return response.data.data;
};

// Lấy 3 cuốn mượn nhiều nhất
export const fetchPopularBooks = async () => {
  const response = await api.get('/books/popular');
  return response.data.data;
};
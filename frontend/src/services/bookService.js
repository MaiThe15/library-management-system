import api from '../api/axios';

// Hàm lấy danh sách toàn bộ sách
export const fetchAllBooks = async () => {
  const response = await api.get('/books');
  // Backend trả về dạng { message: '...', data: [danh_sach_sach] }
  return response.data.data; 
};
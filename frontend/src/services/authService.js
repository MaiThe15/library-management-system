import api from '../api/axios'; // Nhúng cấu hình axios đã tạo

// Hàm xử lý đăng nhập
export const loginUser = async (credentials) => {
  // credentials chính là formData { Email, MatKhau }
  const response = await api.post('/auth/login', credentials);
  return response.data; // Trả về thẳng data (gồm token và user) để Component dễ dùng
};

// Hàm xử lý đăng ký
export const registerUser = async (userData) => {
  // userData gồm Email, MatKhau, HoTen, SoDienThoai
  const response = await api.post('/auth/register', userData);
  return response; // Trả về toàn bộ response để Component check status (201)
};
import api from '../api/axios';

// API lấy danh sách độc giả
export const fetchAllReaders = async () => {
  try {
    const response = await api.get('/docgia');
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể tải dữ liệu độc giả.');
  }
};

// API kích hoạt Khóa / Mở khóa
export const toggleReaderStatus = async (id) => {
  try {
    const response = await api.put(`/docgia/${id}/status`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Lỗi xử lý cập nhật trạng thái tài khoản.');
  }
};

// API cập nhật thông tin cá nhân của độc giả
export const updateReaderProfile = async (profileData) => {
  try {
    const response = await api.put('/docgia/profile', profileData);
    return response.data; // Trả về data gồm thông tin user mới
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể cập nhật thông tin cá nhân.');
  }
};
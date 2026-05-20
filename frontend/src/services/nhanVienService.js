import api from '../api/axios';

export const updateStaffProfile = async (profileData) => {
  try {
    const response = await api.put('/nhanvien/profile', profileData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể cập nhật thông tin cá nhân.');
  }
};
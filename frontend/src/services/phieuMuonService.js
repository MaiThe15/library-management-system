import api from '../api/axios'; // Đổi tên thành api cho đồng nhất với các service khác (nếu bạn đang dùng tên này)

export const fetchAllBorrowSlips = async () => {
  try {
    const response = await api.get('/phieumuon');
    return response.data.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Không thể tải danh sách phiếu mượn từ máy chủ.');
  }
};

export const createBorrowSlip = async (borrowData) => {
  try {
    // Lưu ý: Nếu api/axios.js đã cấu hình baseURL là '/api', bạn chỉ cần gọi '/phieumuon/create'
    const response = await api.post('/phieumuon/create', borrowData);
    return response.data;
  } catch (error) {
    // Bắt và ném lỗi từ backend (ví dụ: lỗi 400 hết sách) để UI có thể hiển thị thông báo
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Lỗi kết nối đến máy chủ khi tạo phiếu mượn.');
  }
};

export const returnBorrowSlip = async (id) => {
  try {
    const response = await api.put(`/phieumuon/${id}/return`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Lỗi kết nối máy chủ khi xử lý trả sách.');
  }
};

export const fetchMyBorrowHistory = async () => {
  try {
    const response = await api.get('/phieumuon/my-history');
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể tải lịch sử mượn sách.');
  }
};
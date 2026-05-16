import axios from '../api/axios'; // Đảm bảo bạn import đúng file config axios của dự án

export const createBorrowSlip = async (borrowData) => {
  // borrowData sẽ có dạng: { idDocGia: 1, danhSachIdSach: [1, 2] }
  const response = await axios.post('/api/phieumuon/create', borrowData);
  return response.data;
};
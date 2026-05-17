import axios from '../api/axios'; // Đảm bảo đường dẫn này trỏ đúng tới file cấu hình axios của bạn

const createPhieuKho = async (data) => {
    const response = await axios.post('/phieu-kho', data);
    return response.data;
};

const getAllPhieuKhos = async () => {
    const response = await axios.get('/phieu-kho');
    return response.data;
};

const getPhieuKhoById = async (id) => {
    const response = await axios.get(`/phieu-kho/${id}`);
    return response.data;
};

export const phieuKhoService = {
    createPhieuKho,
    getAllPhieuKhos,
    getPhieuKhoById
};
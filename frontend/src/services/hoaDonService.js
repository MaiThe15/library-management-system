import axios from '../api/axios';

export const fetchAllInvoices = async () => {
    const response = await axios.get('/hoa-don');
    return response.data.data; // Lấy mảng dữ liệu từ { success: true, data: [...] }
};

export const fetchFinancialSummary = async () => {
    const response = await axios.get('/hoa-don/thong-ke');
    return response.data.data;
};

export const payInvoice = async (id) => {
    const response = await axios.put(`/hoa-don/${id}/pay`);
    return response.data;
};
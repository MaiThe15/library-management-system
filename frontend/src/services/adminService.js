import axios from '../api/axios';

// 1. Lấy danh sách tất cả nhân viên nội bộ
const getAllEmployees = async () => {
    const response = await axios.get('/admin/employees');
    return response.data.data;
};

// 2. Cấp tài khoản cho nhân viên mới
const createEmployee = async (employeeData) => {
    const response = await axios.post('/admin/employees', employeeData);
    return response.data;
};

// 3. Thay đổi vai trò/chức vụ nhân viên
const updateEmployeeRole = async (idNhanVien, idVaiTro) => {
    const response = await axios.put(`/admin/employees/${idNhanVien}/role`, { idVaiTro });
    return response.data;
};

// 4. Khóa hoặc Mở khóa tài khoản nhân viên
const toggleEmployeeStatus = async (idNhanVien, trangThaiMoi) => {
    const response = await axios.put(`/admin/employees/${idNhanVien}/status`, { TrangThai: trangThaiMoi });
    return response.data;
};

export const adminService = {
    getAllEmployees,
    createEmployee,
    updateEmployeeRole,
    toggleEmployeeStatus
};
import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import styles from './EmployeeManagement.module.css';

// Danh sách vai trò cố định tương ứng với ID dưới DB để render dropdown chọn nhanh
const AVAILABLE_ROLES = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'Thủ thư' },
    { id: 3, name: 'Kế toán' },
    { id: 4, name: 'Thủ kho' },
    { id: 5, name: 'Quản lý' }
];

const EmployeeManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // State cho form tạo mới nhân viên
    const [formData, setFormData] = useState({
        Email: '',
        MatKhau: '',
        HoTen: '',
        SoDienThoai: '',
        PhongBan: '',
        NgayVaoLam: new Date().toISOString().split('T')[0],
        idVaiTro: 2 // Mặc định ban đầu chọn Thủ thư
    });

    const loadEmployees = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAllEmployees();
            setEmployees(data);
        } catch (error) {
            console.error('Lỗi khi tải danh sách nhân viên:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEmployees();
    }, []);

    // Xử lý đổi input form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'idVaiTro' ? Number(value) : value
        });
    };

    // Xử lý gửi Form thêm mới nhân viên
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await adminService.createEmployee(formData);
            alert('✅ Cấp tài khoản nhân viên mới thành công!');
            setIsModalOpen(false);
            // Reset form
            setFormData({
                Email: '',
                MatKhau: '',
                HoTen: '',
                SoDienThoai: '',
                PhongBan: '',
                NgayVaoLam: new Date().toISOString().split('T')[0],
                idVaiTro: 2
            });
            loadEmployees(); // Reload bảng dữ liệu
        } catch (error) {
            alert(`Lỗi: ${error.response?.data?.message || error.message}`);
        }
    };

    // Xử lý thay đổi Vai trò trực tiếp trên hàng của bảng dữ liệu
    const handleRoleChangeOnTable = async (idNhanVien, currentRoleName, targetRoleId) => {
        const targetRole = AVAILABLE_ROLES.find(r => r.id === targetRoleId);
        if (window.confirm(`Xác nhận chuyển vai trò của nhân viên từ "${currentRoleName}" sang "${targetRole?.name}"?`)) {
            try {
                await adminService.updateEmployeeRole(idNhanVien, targetRoleId);
                alert('✅ Cập nhật vai trò thành công!');
                loadEmployees();
            } catch (error) {
                alert(`Lỗi: ${error.response?.data?.message || error.message}`);
            }
        }
    };

    // Xử lý Khóa/Mở khóa tài khoản liên kết
    const handleToggleStatus = async (idNhanVien, currentStatus) => {
        const targetStatus = currentStatus === 'HOAT_DONG' ? 'BI_KHOA' : 'HOAT_DONG';
        const actionText = targetStatus === 'BI_KHOA' ? 'KHÓA' : 'MỞ KHÓA';
        
        if (window.confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản nhân viên này?`)) {
            try {
                await adminService.toggleEmployeeStatus(idNhanVien, targetStatus);
                alert(`✅ Đã ${actionText.toLowerCase()} tài khoản thành công!`);
                loadEmployees();
            } catch (error) {
                alert(`Lỗi: ${error.response?.data?.message || error.message}`);
            }
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.headerAction}>
                <h2>🛠️ Quản Trị Hệ Thống Nhân Sự</h2>
                <button className={styles.btnAddNew} onClick={() => setIsModalOpen(true)}>
                    + Cấp Tài Khoản Mới
                </button>
            </div>

            {loading ? (
                <div className={styles.loading}>Đang tải danh sách nhân sự...</div>
            ) : (
                <div className={styles.tableWrapper}>
                    <table className={styles.employeeTable}>
                        <thead>
                            <tr>
                                <th>Họ Tên</th>
                                <th>Email Đăng Nhập</th>
                                <th>Số Điện Thoại</th>
                                <th>Phòng Ban</th>
                                <th>Ngày Vào Làm</th>
                                <th>Vai Trò Hạn Quyền</th>
                                <th>Trạng Thái</th>
                                <th>Thao Tác Hệ Thống</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((emp) => (
                                <tr key={emp.IDNhanVien}>
                                    <td><strong>{emp.HoTen}</strong></td>
                                    <td>{emp.taiKhoan?.Email}</td>
                                    <td>{emp.SoDienThoai || '---'}</td>
                                    <td><span className={styles.badgeDept}>{emp.PhongBan || '---'}</span></td>
                                    <td>{emp.NgayVaoLam ? new Date(emp.NgayVaoLam).toLocaleDateString('vi-VN') : '---'}</td>
                                    <td>
                                        <select
                                            className={styles.tableSelectRole}
                                            value={emp.IDVaiTro}
                                            onChange={(e) => handleRoleChangeOnTable(emp.IDNhanVien, emp.vaiTro?.TenVaiTro, Number(e.target.value))}
                                        >
                                            {AVAILABLE_ROLES.map(role => (
                                                <option key={role.id} value={role.id}>
                                                    {role.name}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        <span className={emp.taiKhoan?.TrangThai === 'HOAT_DONG' ? styles.statusActive : styles.statusBlocked}>
                                            {emp.taiKhoan?.TrangThai === 'HOAT_DONG' ? 'Đang hoạt động' : 'Bị Khóa'}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className={emp.taiKhoan?.TrangThai === 'HOAT_DONG' ? styles.btnActionLock : styles.btnActionUnlock}
                                            onClick={() => handleToggleStatus(emp.IDNhanVien, emp.taiKhoan?.TrangThai)}
                                        >
                                            {emp.taiKhoan?.TrangThai === 'HOAT_DONG' ? 'Khóa tài khoản' : 'Mở khóa'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* MODAL FORM THÊM MỚI TÀI KHOẢN NHÂN VIÊN */}
            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h3>Cấp Tài Khoản Nhân Viên Mới</h3>
                            <button className={styles.btnClose} onClick={() => setIsModalOpen(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit} className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label>Họ và tên nhân viên:</label>
                                <input type="text" name="HoTen" value={formData.HoTen} onChange={handleInputChange} required placeholder="Ví dụ: Nguyễn Văn A" />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Số điện thoại:</label>
                                <input type="text" name="SoDienThoai" value={formData.SoDienThoai} onChange={handleInputChange} placeholder="Ví dụ: 0912345678" />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Email (Tài khoản đăng nhập):</label>
                                <input type="email" name="Email" value={formData.Email} onChange={handleInputChange} required placeholder="username@library.com" />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Mật khẩu ban đầu:</label>
                                <input type="password" name="MatKhau" value={formData.MatKhau} onChange={handleInputChange} required placeholder="Nhập mật khẩu bảo mật" />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Phòng ban làm việc:</label>
                                <input type="text" name="PhongBan" value={formData.PhongBan} onChange={handleInputChange} placeholder="Ví dụ: Ban Quản Lý, Phòng Kế Toán" />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Ngày vào làm chính thức:</label>
                                <input type="date" name="NgayVaoLam" value={formData.NgayVaoLam} onChange={handleInputChange} required />
                            </div>
                            <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                                <label>Phân quyền chức vụ (Hạn quyền hệ thống):</label>
                                <select name="idVaiTro" value={formData.idVaiTro} onChange={handleInputChange}>
                                    {AVAILABLE_ROLES.map(role => (
                                        <option key={role.id} value={role.id}>{role.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.formActions} style={{ gridColumn: 'span 2' }}>
                                <button type="button" className={styles.btnCancel} onClick={() => setIsModalOpen(false)}>Hủy bỏ</button>
                                <button type="submit" className={styles.btnSubmit}>Xác nhận cấp tài khoản</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeManagement;
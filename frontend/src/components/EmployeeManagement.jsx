import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import sharedStyles from '../pages/StaffHome.module.css';

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
        <div className={sharedStyles.tablePanel}>
            {/* THANH ĐIỀU KHIỂN CHÍNH */}
            <div className={sharedStyles.tableControls}>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>Quản Lý Tài Khoản Nhân Viên</h3>
                <button className={sharedStyles.btnAddBook} onClick={() => setIsModalOpen(true)}>
                    <span>Thêm Tài Khoản Mới</span>
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Đang tải danh sách nhân sự...</div>
            ) : (
                <table className={sharedStyles.dataTable}>
                    <thead>
                        <tr>
                            <th>Họ Tên</th>
                            <th>Email Đăng Nhập</th>
                            <th>Số Điện Thoại</th>
                            <th>Phòng Ban</th>
                            <th>Ngày Vào Làm</th>
                            <th>Vai Trò Hạn Quyền</th>
                            <th style={{ textAlign: 'center' }}>Trạng Thái</th>
                            <th style={{ textAlign: 'center' }}>Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((emp) => (
                            <tr key={emp.IDNhanVien}>
                                <td style={{ fontWeight: '600', color: '#1e293b' }}>{emp.HoTen}</td>
                                <td>{emp.taiKhoan?.Email}</td>
                                <td>{emp.SoDienThoai || '---'}</td>
                                <td>
                                    <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>
                                        {emp.PhongBan || '---'}
                                    </span>
                                </td>
                                <td>{emp.NgayVaoLam ? new Date(emp.NgayVaoLam).toLocaleDateString('vi-VN') : '---'}</td>
                                <td>
                                    <select
                                        className={sharedStyles.formSelect}
                                        style={{ padding: '6px 10px', fontSize: '13px', width: 'auto', minWidth: '120px' }}
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
                                <td style={{ textAlign: 'center' }}>
                                    <span className={`${sharedStyles.statusBadge} ${emp.taiKhoan?.TrangThai === 'HOAT_DONG' ? sharedStyles.statusAvailable : sharedStyles.statusEmpty}`}>
                                        {emp.taiKhoan?.TrangThai === 'HOAT_DONG' ? 'Hoạt động' : 'Bị Khóa'}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <button
                                        onClick={() => handleToggleStatus(emp.IDNhanVien, emp.taiKhoan?.TrangThai)}
                                        style={{
                                            backgroundColor: emp.taiKhoan?.TrangThai === 'HOAT_DONG' ? '#fee2e2' : '#10b981',
                                            color: emp.taiKhoan?.TrangThai === 'HOAT_DONG' ? '#dc2626' : 'white',
                                            border: 'none',
                                            padding: '6px 12px',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontWeight: '500',
                                            fontSize: '13px',
                                            transition: '0.2s'
                                        }}
                                    >
                                        {emp.taiKhoan?.TrangThai === 'HOAT_DONG' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* MODAL FORM THÊM MỚI TÀI KHOẢN NHÂN VIÊN */}
            {isModalOpen && (
                <div className={sharedStyles.modalOverlay}>
                    <div className={sharedStyles.modalContent} style={{ maxWidth: '650px' }}>
                        <h3 style={{ marginTop: 0, color: '#2563eb', marginBottom: '20px' }}>➕ Cấp Tài Khoản Nhân Viên Mới</h3>
                        
                        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className={sharedStyles.formGroup} style={{ marginBottom: 0 }}>
                                <label>Họ và tên nhân viên (*)</label>
                                <input type="text" name="HoTen" value={formData.HoTen} onChange={handleInputChange} className={sharedStyles.formInput} required placeholder="Ví dụ: Nguyễn Văn A" />
                            </div>
                            <div className={sharedStyles.formGroup} style={{ marginBottom: 0 }}>
                                <label>Số điện thoại</label>
                                <input type="text" name="SoDienThoai" value={formData.SoDienThoai} onChange={handleInputChange} className={sharedStyles.formInput} placeholder="Ví dụ: 0912345678" />
                            </div>
                            <div className={sharedStyles.formGroup} style={{ marginBottom: 0 }}>
                                <label>Email (Đăng nhập) (*)</label>
                                <input type="email" name="Email" value={formData.Email} onChange={handleInputChange} className={sharedStyles.formInput} required placeholder="username@library.com" />
                            </div>
                            <div className={sharedStyles.formGroup} style={{ marginBottom: 0 }}>
                                <label>Mật khẩu ban đầu (*)</label>
                                <input type="password" name="MatKhau" value={formData.MatKhau} onChange={handleInputChange} className={sharedStyles.formInput} required placeholder="Nhập mật khẩu bảo mật" />
                            </div>
                            <div className={sharedStyles.formGroup} style={{ marginBottom: 0 }}>
                                <label>Phòng ban làm việc</label>
                                <input type="text" name="PhongBan" value={formData.PhongBan} onChange={handleInputChange} className={sharedStyles.formInput} placeholder="Ví dụ: Ban Quản Lý, Phòng Kế Toán..." />
                            </div>
                            <div className={sharedStyles.formGroup} style={{ marginBottom: 0 }}>
                                <label>Ngày vào làm (*)</label>
                                <input type="date" name="NgayVaoLam" value={formData.NgayVaoLam} onChange={handleInputChange} className={sharedStyles.formInput} required />
                            </div>
                            <div className={sharedStyles.formGroup} style={{ gridColumn: 'span 2', marginBottom: 0 }}>
                                <label>Phân quyền chức vụ (Hạn quyền hệ thống)</label>
                                <select name="idVaiTro" value={formData.idVaiTro} onChange={handleInputChange} className={sharedStyles.formSelect}>
                                    {AVAILABLE_ROLES.map(role => (
                                        <option key={role.id} value={role.id}>{role.name}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '12px', marginTop: '16px' }}>
                                <button type="submit" className={sharedStyles.btnSubmit} style={{ flex: 1, backgroundColor: '#2563eb' }}>
                                    Xác nhận cấp tài khoản
                                </button>
                                <button type="button" onClick={() => setIsModalOpen(false)} className={sharedStyles.btnCancel} style={{ flex: 1 }}>
                                    Hủy bỏ
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeManagement;
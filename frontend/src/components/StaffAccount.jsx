import React, { useState } from 'react';
import { updateStaffProfile } from '../services/nhanVienService';

const StaffAccount = ({ onUpdateSuccess }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    HoTen: user?.HoTen || '',
    Email: user?.Email || '',
    SoDienThoai: user?.SoDienThoai || '',
    PhongBan: user?.PhongBan || '',
    MatKhau: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (formData.SoDienThoai) {
      const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
      if (!phoneRegex.test(formData.SoDienThoai)) {
        alert("Số điện thoại không hợp lệ! Vui lòng nhập đúng 10 chữ số.");
        return;
      }
    }

    try {
      const response = await updateStaffProfile(formData);
      if (response.success) {
        const updatedUser = { ...user, ...response.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        setIsEditing(false);
        setMessage({ type: 'success', text: 'Cập nhật tài khoản cá nhân thành công!' });
        setFormData(prev => ({ ...prev, MatKhau: '' }));
        
        // Gọi callback để thông báo cho StaffHome cập nhật lại tên trên Header
        if (onUpdateSuccess) {
          onUpdateSuccess(updatedUser);
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
      {message.text && (
        <div style={{
          padding: '12px', marginBottom: '20px', borderRadius: '4px',
          backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
          color: message.type === 'success' ? '#155724' : '#721c24',
          border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message.text}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
        <h3 style={{ margin: 0 }}>Cấu hình tài khoản</h3>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} style={{ padding: '6px 14px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Chỉnh sửa thông tin
          </button>
        )}
      </div>

      {!isEditing ? (
        <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#e2e8f0', color: '#1e3a8a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold' }}>
            {user?.HoTen?.charAt(0) || 'S'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 40px', width: '100%', maxWidth: '600px' }}>
            <p><strong>Họ và tên:</strong> {user?.HoTen}</p>
            <p><strong>Email:</strong> {user?.Email || 'Chưa cập nhật'}</p>
            <p><strong>Số điện thoại:</strong> {user?.SoDienThoai || 'Chưa cập nhật'}</p>
            <p><strong>Phòng ban:</strong> {user?.PhongBan || 'Chưa cập nhật'}</p>
            <p><strong>Chức vụ:</strong> Nhân viên hệ thống</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '550px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label>Họ và tên <span style={{ color: 'red' }}>*</span></label>
            <input type="text" name="HoTen" value={formData.HoTen} onChange={handleInputChange} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label>Email đăng nhập <span style={{ color: 'red' }}>*</span></label>
            <input type="email" name="Email" value={formData.Email} onChange={handleInputChange} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label>Mật khẩu mới (Để trống nếu giữ nguyên)</label>
            <input type="password" name="MatKhau" value={formData.MatKhau} onChange={handleInputChange} placeholder="Nhập mật khẩu mới..." style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label>Số điện thoại</label>
            <input type="text" name="SoDienThoai" value={formData.SoDienThoai} onChange={handleInputChange} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label>Phòng ban</label>
            <input type="text" name="PhongBan" value={formData.PhongBan} onChange={handleInputChange} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button type="submit" style={{ padding: '8px 20px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Lưu thay đổi</button>
            <button 
              type="button" 
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  HoTen: user?.HoTen,
                  Email: user?.Email,
                  SoDienThoai: user?.SoDienThoai,
                  PhongBan: user?.PhongBan,
                  MatKhau: ''
                });
              }}
              style={{ padding: '8px 20px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Hủy
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default StaffAccount;
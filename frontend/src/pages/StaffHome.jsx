import React from 'react';
import { useNavigate } from 'react-router-dom';

const StaffHome = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div style={{ padding: '20px' }}>
      <h1>Khu vực Nhân viên: {user?.HoTen}</h1>
      <p>Vai trò ID: {user?.IDVaiTro} | Phòng ban: {user?.PhongBan}</p>
      <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="btn-submit" style={{ width: 'auto' }}>Đăng xuất</button>
    </div>
  );
};
export default StaffHome;
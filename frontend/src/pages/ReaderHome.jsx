import React from 'react';
import { useNavigate } from 'react-router-dom';

const ReaderHome = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Chào mừng Độc giả: {user?.HoTen}</h1>
      <p>Email: {user?.Email}</p>
      <button onClick={handleLogout} className="btn-submit" style={{ width: 'auto' }}>Đăng xuất</button>
    </div>
  );
};
export default ReaderHome;
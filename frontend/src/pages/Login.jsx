import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import heroImg from '../assets/hero.png';
import '../index.css';
import { loginUser } from '../services/authService';

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    Email: '',
    MatKhau: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // const response = await api.post('/auth/login', formData);
      // const { token, user } = response.data;

      const data = await loginUser(formData);

      // Lưu vào trình duyệt
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Điều hướng dựa trên LoaiTaiKhoan từ ERD
      if (data.user.LoaiTaiKhoan === 'DOC_GIA') {
        navigate('/reader-home');
      } else {
        navigate('/staff-home');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Đăng nhập thất bại');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-image">
        <img src={heroImg} alt="Library Hero" />
      </div>
      <div className="auth-form-container">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Đăng Nhập</h2>
          <p>Chào mừng bạn quay lại hệ thống quản lý thư viện</p>

          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              name="Email"
              placeholder="Nhập email của bạn" 
              value={formData.Email}
              onChange={handleChange}
              required 
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <input 
              type="password" 
              name="MatKhau"
              placeholder="Nhập mật khẩu" 
              value={formData.MatKhau}
              onChange={handleChange}
              required 
            />
          </div>

          <button type="submit" className="btn-submit">Đăng Nhập</button>
          
          <div className="auth-redirect">
            Bạn chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
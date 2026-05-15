import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/authService';
import heroImg from '../assets/hero.png';
import '../index.css';

const Register = () => {
  const navigate = useNavigate(); // Dùng để chuyển trang sau khi đăng ký thành công
  const [formData, setFormData] = useState({
    HoTen: '',
    SoDienThoai: '',
    Email: '',
    MatKhau: '',
    XacNhanMatKhau: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!phoneRegex.test(formData.SoDienThoai)) {
      alert("Số điện thoại không hợp lệ! Vui lòng nhập đúng 10 chữ số (VD: 0912345678).");
      return; // Dừng lại luôn, không gọi API backend nữa
    }

    if (formData.MatKhau !== formData.XacNhanMatKhau) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }
    // console.log('Dữ liệu đăng ký:', formData);
    
    // TODO: Tích hợp Axios gọi API đăng ký tại đây
    try {
      const response = await registerUser({
        Email: formData.Email,
        MatKhau: formData.MatKhau,
        HoTen: formData.HoTen,
        SoDienThoai: formData.SoDienThoai
      });

      if (response.status === 201) {
        alert('Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.');
        navigate('/login'); // Chuyển hướng người dùng về trang đăng nhập
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại!');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-image">
        <img src={heroImg} alt="Library Hero" />
      </div>
      <div className="auth-form-container">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Đăng Ký Tài Khoản</h2>
          <p>Tạo tài khoản độc giả mới để mượn sách</p>

          <div className="form-group">
            <label>Họ và Tên</label>
            <input type="text" name="HoTen" placeholder="Nhập họ tên" value={formData.HoTen} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Số điện thoại</label>
            <input type="text" name="SoDienThoai" placeholder="Nhập số điện thoại" value={formData.SoDienThoai} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" name="Email" placeholder="Nhập email" value={formData.Email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <input type="password" name="MatKhau" placeholder="Tạo mật khẩu" value={formData.MatKhau} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Xác nhận mật khẩu</label>
            <input type="password" name="XacNhanMatKhau" placeholder="Nhập lại mật khẩu" value={formData.XacNhanMatKhau} onChange={handleChange} required />
          </div>

          <button type="submit" className="btn-submit">Đăng Ký</button>
          
          <div className="auth-redirect">
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
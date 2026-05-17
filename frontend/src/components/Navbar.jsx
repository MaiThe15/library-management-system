import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import styles from './Navbar.module.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  // State để quản lý số lượng phần tử trong giỏ mượn
  const [cartCount, setCartCount] = useState(0);
  useEffect(() => {
    // Hàm cập nhật số lượng sách từ localStorage
    const updateCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      setCartCount(cart.length);
    };
    // Chạy lần đầu khi component mount
    updateCount();
    // Lắng nghe sự kiện thay đổi giỏ hàng
    window.addEventListener('cartUpdated', updateCount);
    return () => window.removeEventListener('cartUpdated', updateCount);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <header className={styles.mainHeader}>
      <div className={styles.logo} onClick={() => navigate('/reader-home')} style={{ cursor: 'pointer' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
        <span>Thư viện Số</span>
      </div>
      <nav className={styles.mainNav}>
        <Link to="/reader-home" className={location.pathname === '/reader-home' ? styles.active : ''}>Trang chủ</Link>
        <Link to="/cart" className={location.pathname === '/cart' ? styles.active : ''}>
          Giỏ mượn
          {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
        </Link>
        <Link to="/account" className={location.pathname === '/account' ? styles.active : ''}>Tài khoản</Link>
      </nav>
      <div className={styles.headerActions}>
        <button onClick={handleLogout} className={styles.btnOutline}>Đăng xuất</button>
        <div className={styles.avatar}>{user?.HoTen?.charAt(0) || 'U'}</div>
      </div>
    </header>
  );
};

export default Navbar;
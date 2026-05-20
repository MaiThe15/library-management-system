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
        <span>Thư Viện Số</span>
      </div>
      <nav className={styles.mainNav}>
        {/* <Link to="/reader-home" className={location.pathname === '/reader-home' ? styles.active : ''}>Trang chủ</Link>
        <Link to="/cart" className={location.pathname === '/cart' ? styles.active : ''}>
          Giỏ mượn
          {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
        </Link>
        <Link to="/account" className={location.pathname === '/account' ? styles.active : ''}>Tài khoản</Link> */}
        
        <Link to="/" className={location.pathname === '/' || location.pathname === '/reader-home' ? styles.active : ''}>Trang chủ</Link>
        <Link to="/all-books" className={location.pathname === '/all-books' ? styles.active : ''}>Tủ sách</Link>
        
        {/* Chỉ hiển thị Giỏ mượn và Tài khoản cá nhân khi đã đăng nhập thành công */}
        {user && user.LoaiTaiKhoan === 'DOC_GIA' && (
          <>
            <Link to="/cart" className={location.pathname === '/cart' ? styles.active : ''}>
              Giỏ mượn
              {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
            </Link>
            <Link to="/account" className={location.pathname === '/account' ? styles.active : ''}>Tài khoản</Link>
          </>
        )}
      </nav>
      <div className={styles.headerActions}>
        {/* <button onClick={handleLogout} className={styles.btnOutline}>Đăng xuất</button>
        <div className={styles.avatar}>{user?.HoTen?.charAt(0) || 'U'}</div> */}

        {user ? (
          // Khối hiển thị khi Độc giả đã đăng nhập hệ thống
          <div className={styles.userInfo}>
            <span>Độc giả: <strong style={{ color: '#2563eb' }}>{user.HoTen}</strong></span>
            <button onClick={handleLogout} className={styles.btnLogout}>Đăng xuất</button>
          </div>
        ) : (
          // Khối điều hướng Đăng nhập / Đăng ký dành riêng cho Khách vãng lai
          <div className={styles.guestInfo} style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => navigate('/login')} 
              style={{ 
                padding: '6px 14px', 
                background: 'transparent', 
                border: '1px solid #2563eb', 
                color: '#2563eb', 
                borderRadius: '4px', 
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Đăng nhập
            </button>
            <button 
              onClick={() => navigate('/register')} 
              style={{ 
                padding: '6px 14px', 
                backgroundColor: '#2563eb', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Đăng ký
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
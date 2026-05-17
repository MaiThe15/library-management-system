import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import styles from './Cart.module.css';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('cart')) || [];
    setCartItems(items);
  }, []);

  // Xóa một cuốn sách khỏi giỏ mượn
  const handleRemoveItem = (idSach) => {
    const updatedCart = cartItems.filter(item => item.IDSach !== idSach);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    // Bắn sự kiện đồng bộ số lượng lên Navbar
    window.dispatchEvent(new Event('cartUpdated'));
  };

  // Xóa sạch giỏ mượn
  const handleClearCart = () => {
    if (window.confirm('Bạn có chắc chắn muốn hủy toàn bộ giỏ sách chờ mượn này không?')) {
      localStorage.removeItem('cart');
      setCartItems([]);
      window.dispatchEvent(new Event('cartUpdated'));
    }
  };

  return (
    <div className={styles['cart-layout']}>
      <Navbar />
      
      <div className={styles['cart-container']}>
        <h2>Giỏ sách chờ mượn</h2>
        
        {cartItems.length === 0 ? (
          <div className={styles['empty-cart']}>
            <p>Giỏ sách của bạn đang trống.</p>
            <button className={styles['btn-back']} onClick={() => navigate('/reader-home')}>
              Quay lại trang chủ để chọn sách
            </button>
          </div>
        ) : (
          <div className={styles['cart-content']}>
            {/* DANH SÁCH SÁCH ĐÃ CHỌN */}
            <div className={styles['cart-list']}>
              {cartItems.map((item) => (
                <div key={item.IDSach} className={styles['cart-item']}>
                  <img 
                    src={`http://localhost:5000${item.AnhBia}`} 
                    alt={item.TenSach} 
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/80x110' }}
                  />
                  <div className={styles['item-info']}>
                    <h4>{item.TenSach}</h4>
                    <p>Tác giả: {item.TacGia || 'Đang cập nhật'}</p>
                  </div>
                  <button 
                    className={styles['btn-delete']} 
                    onClick={() => handleRemoveItem(item.IDSach)}
                  >
                    Xóa khỏi giỏ
                  </button>
                </div>
              ))}
              <button className={styles['btn-clear']} onClick={handleClearCart}>
                Xóa toàn bộ giỏ mượn
              </button>
            </div>

            {/* KHUNG HƯỚNG DẪN QUY TRÌNH RA QUẦY */}
            <div className={styles['cart-summary']}>
              <h3>Hướng dẫn mượn sách</h3>
              <div className={styles['guide-box']}>
                <p>📌 <strong>Bước 1:</strong> Rà soát kỹ danh sách các cuốn sách cần mượn ở bên cạnh.</p>
                <p>📌 <strong>Bước 2:</strong> Mang theo thiết bị di động (đã đăng nhập tài khoản này) hoặc thẻ độc giả đến quầy làm việc trực tiếp của thư viện.</p>
                <p>📌 <strong>Bước 3:</strong> Xuất trình mã tài khoản cho Thủ thư để đối chiếu, duyệt phiếu và nhận sách vật lý xuất kho.</p>
              </div>
              <p className={styles['note']}>* Giỏ hàng này lưu trữ cục bộ để bạn dễ dàng quản lý trước khi làm thủ tục mượn trực tiếp tại thư viện.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
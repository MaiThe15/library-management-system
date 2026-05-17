import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchBookById } from '../services/bookService';
import Navbar from '../components/Navbar';
import styles from './BookDetail.module.css';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBook = async () => {
      try {
        const data = await fetchBookById(id);
        setBook(data);
      } catch (error) {
        alert("Không thể tải thông tin sách!");
        navigate('/reader-home');
      } finally {
        setLoading(false);
      }
    };
    loadBook();
  }, [id, navigate]);

  const handleAddToCart = () => {
    const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
    const isExist = currentCart.find(item => item.IDSach === book.IDSach);
    if (isExist) return alert('Sách này đã có trong giỏ mượn!');
    
    currentCart.push({
      IDSach: book.IDSach,
      TenSach: book.TenSach,
      AnhBia: book.AnhBia,
      TacGia: book.tacGia?.TenTacGia
    });
    localStorage.setItem('cart', JSON.stringify(currentCart));
    window.dispatchEvent(new Event('cartUpdated'));
    alert('🛒 Đã thêm vào giỏ mượn thành công!');
  };

  const handleReserve = () => {
    alert('⏳ Yêu cầu Đặt trước đã được ghi nhận.');
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Đang tải thông tin sách...</div>;
  if (!book) return null;

  return (
    <div className={styles.detailContainer}>
      <Navbar />

      <div className={styles.detailWrapper}>
        <div className={styles.detailCard}>
          {/* Cột Trái: Ảnh bìa */}
          <div className={styles.leftColumn}>
            <img 
              src={`http://localhost:5000${book.AnhBia}`} 
              alt={book.TenSach} 
              className={styles.coverImage}
              onError={(e) => { e.target.src = 'https://via.placeholder.com/300x450' }}
            />
          </div>

          {/* Cột Phải: Thông tin chi tiết */}
          <div className={styles.rightColumn}>
            <h1 className={styles.bookTitle}>{book.TenSach}</h1>
            
            <p className={styles.bookAuthor}>
              Tác giả: <strong>{book.tacGia?.TenTacGia || 'Đang cập nhật'}</strong>
            </p>

            {/* Khối thể loại nằm ngay dưới tên tác giả */}
            <div className={styles.genresWrapper}>
              {book.theLoais?.map(t => (
                <span key={t.IDTheLoai} className={styles.genreBadge}>
                  {t.TenTheLoai}
                </span>
              ))}
            </div>
            
            {/* Khối thông tin lưu trữ tĩnh */}
            <div className={styles.infoBlock}>
              <h3 className={styles.infoTitle}>Thông tin lưu trữ</h3>
              <p className={styles.infoText}>📌 <strong>Vị trí:</strong> {book.viTri ? `${book.viTri.KhuVuc} - Tầng ${book.viTri.Tang} (${book.viTri.KeSach})` : 'Chưa xếp kệ'}</p>
              <p className={styles.infoText}>
                📚 <strong>Tình trạng:</strong> {book.SoLuongSanSang > 0 
                  ? <span style={{ color: '#16a34a', fontWeight: 'bold' }}>Còn sẵn {book.SoLuongSanSang} cuốn</span> 
                  : <span style={{ color: '#dc2626', fontWeight: 'bold' }}>Đã hết sách</span>}
              </p>
            </div>

            {/* Khối hành động mượn / đặt trước */}
            <div className={styles.actionBlock}>
              {book.SoLuongSanSang > 0 ? (
                <button onClick={handleAddToCart} className={styles.btnPrimary}>
                  🛒 Thêm vào Giỏ mượn
                </button>
              ) : (
                <button onClick={handleReserve} className={styles.btnSecondary}>
                  ⏳ Đặt trước sách này
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
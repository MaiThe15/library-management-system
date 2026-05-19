import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchBookById, fetchBookReviews, checkReviewEligibility, createBookReview } from '../services/bookService';
import phieuDatTruocService from '../services/phieuDatTruocService';
import Navbar from '../components/Navbar';
import styles from './BookDetail.module.css';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  // State của form viết bình luận
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

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
    alert('Đã thêm vào giỏ mượn thành công!');
  };

  const handleReserve = async () => {
    try {
        await phieuDatTruocService.datTruocSach(book.IDSach);
        alert('Đặt trước thành công! Chúng tôi sẽ thông báo khi sách có sẵn.');
    } catch (error) {
        alert(error.response?.data?.message || 'Lỗi khi đặt trước');
    }
  };

  const loadData = async () => {
    try {
      const bookData = await fetchBookById(id);
      setBook(bookData);

      const reviewData = await fetchBookReviews(id);
      setReviews(reviewData);

      // Nếu đã đăng nhập thì kiểm tra quyền viết đánh giá
      if (localStorage.getItem('token')) {
        const eligibility = await checkReviewEligibility(id);
        setCanReview(eligibility.canReview);
      }
    } catch (error) {
      console.error("Lỗi tải dữ liệu chi tiết sách:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      const response = await createBookReview(id, { SoSao: rating, BinhLuan: comment });
      if (response.success) {
        alert('Cảm ơn bạn đã gửi đánh giá!');
        setComment('');
        setCanReview(false); // Đánh giá xong thì ẩn form đi
        loadData(); // Tải lại danh sách đánh giá mới
      }
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Đang tải thông tin sách...</div>;
  if (!book) return null;

  return (
    <div className={styles.detailContainer}>
      <Navbar />
      {/* 1. KHỐI THÔNG TIN CHI TIẾT SÁCH HIỆN TẠI */}
      <section className={styles['book-info-container']}>
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
                <p className={styles.infoText}><strong>Vị trí:</strong> {book.viTri ? `${book.viTri.KhuVuc} - Tầng ${book.viTri.Tang} (${book.viTri.KeSach})` : 'Chưa xếp kệ'}</p>
                <p className={styles.infoText}>
                  <strong>Tình trạng:</strong> {book.SoLuongSanSang > 0 
                    ? <span style={{ color: '#16a34a', fontWeight: 'bold' }}>Còn sẵn {book.SoLuongSanSang} cuốn</span> 
                    : <span style={{ color: '#dc2626', fontWeight: 'bold' }}>Đã hết sách</span>}
                </p>
              </div>

              {/* Khối hành động mượn / đặt trước */}
              <div className={styles.actionBlock}>
                {book.SoLuongSanSang > 0 ? (
                  <button onClick={handleAddToCart} className={styles.btnPrimary}>
                    Thêm vào Giỏ mượn
                  </button>
                ) : (
                  <button onClick={handleReserve} className={styles.btnSecondary}>
                    Đặt trước sách này
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. KHỐI TÍCH HỢP ĐÁNH GIÁ SÁCH MỚI BỔ SUNG */}
      <section className={styles['reviews-section']}>
        <h3>Độc giả đánh giá ({reviews.length})</h3>

        {/* PHẦN FORM VIẾT ĐÁNH GIÁ (Chỉ hiện nếu đủ điều kiện) */}
        {canReview && (
          <form onSubmit={handleSubmitReview} className={styles['review-form']}>
            <h4>Để lại ý kiến của bạn về cuốn sách này</h4>
            <div className={styles['form-group']}>
              <label>Chọn số sao: </label>
              <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                <option value="5">⭐⭐⭐⭐⭐ 5 Sao</option>
                <option value="4">⭐⭐⭐⭐ 4 Sao</option>
                <option value="3">⭐⭐⭐ 3 Sao</option>
                <option value="2">⭐⭐ 2 Sao</option>
                <option value="1">⭐ 1 Sao</option>
              </select>
            </div>
            <div className={styles['form-group']}>
              <textarea 
                placeholder="Nhập nội dung nhận xét của bạn về sách tại đây..." 
                value={comment} 
                onChange={(e) => setComment(e.target.value)}
                required
              />
            </div>
            <button type="submit" className={styles['btn-submit-review']}>Gửi đánh giá</button>
          </form>
        )}

        {/* DANH SÁCH BÌNH LUẬN HIỆN CÓ */}
        <div className={styles['reviews-list']}>
          {reviews.length === 0 ? (
            <p className={styles['no-review']}>Chưa có lượt đánh giá nào cho cuốn sách này.</p>
          ) : (
            reviews.map((rev) => (
              <div key={rev.IDDanhGia} className={styles['review-item']}>
                <div className={styles['review-header']}>
                  <span className={styles['reviewer-name']}>{rev.docGia?.HoTen}</span>
                  <span className={styles['review-stars']}>{'⭐'.repeat(rev.SoSao)}</span>
                  <span className={styles['review-date']}>
                    {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <p className={styles['review-comment']}>{rev.BinhLuan || 'Không có bình luận văn bản.'}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default BookDetail;
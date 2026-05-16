import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchBookById } from '../services/bookService';
import Navbar from '../components/Navbar'; // 1. Import Navbar dùng chung

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
    alert('🛒 Đã thêm vào giỏ mượn thành công!');
  };

  const handleReserve = () => {
    alert('⏳ Yêu cầu Đặt trước đã được ghi nhận.');
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Đang tải thông tin sách...</div>;
  if (!book) return null;

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* 2. NHÚNG NAVBAR CỐ ĐỊNH VÀO ĐẦU TRANG */}
      <Navbar />

      {/* 3. NỘI DUNG CHÍNH (ĐÃ XÓA NÚT QUAY LẠI THƯ VIỆN) */}
      <div style={{ padding: '40px 10%' }}>
        <div style={{ display: 'flex', gap: '50px', backgroundColor: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          {/* Cột Trái: Ảnh bìa */}
          <div style={{ width: '300px', flexShrink: 0 }}>
            <img 
              src={`http://localhost:5000${book.AnhBia}`} 
              alt={book.TenSach} 
              style={{ width: '100%', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              onError={(e) => { e.target.src = 'https://via.placeholder.com/300x450' }}
            />
          </div>

          {/* Cột Phải: Thông tin chi tiết */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ fontSize: '32px', margin: '0 0 10px 0', color: '#0f172a' }}>{book.TenSach}</h1>
            <p style={{ fontSize: '18px', color: '#64748b', margin: '0 0 30px 0' }}>Tác giả: <strong style={{ color: '#334155' }}>{book.tacGia?.TenTacGia || 'Đang cập nhật'}</strong></p>
            
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              {book.theLoais?.map(t => (
                  <span key={t.IDTheLoai} style={{ fontSize: '12px', background: '#eff6ff', color: '#2563eb', padding: '4px 12px', borderRadius: '20px', fontWeight: '600' }}>
                  {t.TenTheLoai}
                </span>
              ))}
            </div>
            
            <div style={{ backgroundColor: '#f1f5f9', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#334155' }}>Thông tin lưu trữ</h3>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>📌 <strong>Vị trí:</strong> {book.viTri ? `${book.viTri.KhuVuc} - Tầng ${book.viTri.Tang} (${book.viTri.KeSach})` : 'Chưa xếp kệ'}</p>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                📚 <strong>Tình trạng:</strong> {book.SoLuongSanSang > 0 
                  ? <span style={{ color: '#16a34a', fontWeight: 'bold' }}>Còn sẵn {book.SoLuongSanSang} cuốn</span> 
                  : <span style={{ color: '#dc2626', fontWeight: 'bold' }}>Đã hết sách</span>}
              </p>
            </div>

            <div style={{ marginTop: 'auto', borderTop: '1px solid #e2e8f0', paddingTop: '30px' }}>
              {book.SoLuongSanSang > 0 ? (
                <button onClick={handleAddToCart} style={{ width: '100%', padding: '16px', fontSize: '16px', fontWeight: 'bold', color: 'white', backgroundColor: '#2563eb', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  🛒 Thêm vào Giỏ mượn
                </button>
              ) : (
                <button onClick={handleReserve} style={{ width: '100%', padding: '16px', fontSize: '16px', fontWeight: 'bold', color: '#b45309', backgroundColor: '#fef3c7', border: '1px solid #fde68a', borderRadius: '8px', cursor: 'pointer' }}>
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
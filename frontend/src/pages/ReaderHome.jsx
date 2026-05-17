import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchAllBooks, searchBooksAPI } from '../services/bookService';
import styles from './ReaderHome.module.css';
import Navbar from '../components/Navbar';

const ReaderHome = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // States phục vụ tính năng tìm kiếm
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const getBooks = async () => {
      try {
        const data = await fetchAllBooks();
        setBooks(data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu sách:", error);
      } finally {
        setLoading(false);
      }
    };
    getBooks();
  }, []);

  // Xử lý khi bấm nút "Tìm kiếm" hoặc nhấn Enter
  const handleSearch = async (e) => {
    e?.preventDefault(); // Chặn reload trang nếu bọc trong form
    if (!searchQuery.trim()) {
      setSearchResults(null); // Trở về trạng thái màn hình chính
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchBooksAPI(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra khi tìm kiếm.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Lấy ra 5 cuốn sách đầu tiên cho phần "Sách mới nhập"
  const newBooks = books.slice(0, 5);
  
  // Tạm thời lấy 3 cuốn làm dữ liệu giả lập cho "Sách mượn nhiều nhất"
  const popularBooks = books.slice(0, 3);

  return (
    <div className={styles['reader-layout']}>
      {/* 1. HEADER */}
      <Navbar />

      {/* 2. HERO SECTION */}
      <section className={styles['hero-banner']}>
        <div className={styles['hero-overlay']}></div>
        <div className={styles['hero-content']}>
          <h1>Khám phá kho tàng tri thức<br/>vô tận</h1>
          <p>Tìm kiếm hàng ngàn cuốn sách, tài liệu học thuật và tiểu thuyết mới nhất từ khắp nơi trên thế giới.</p>
          {/* thanh tìm kiếm */}
          <form className={styles['search-bar']} onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', background: 'white', padding: '10px', borderRadius: '8px', marginTop: '20px' }}>
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" style={{ margin: 'auto 10px' }}>
               <circle cx="11" cy="11" r="8"></circle>
               <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
             </svg>
            <input 
              type="text" 
              placeholder="Nhập tên sách..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: '1rem' }}
            />
            <button type="submit" className={styles['btn-search']} disabled={isSearching}>
              {isSearching ? 'Đang tìm...' : 'Tìm kiếm'}
            </button>
          </form>
          {/* Nút xóa từ khóa nếu đang có kết quả tìm kiếm */}
          {searchResults !== null && (
             <button 
               onClick={() => { setSearchQuery(''); setSearchResults(null); }} 
               style={{ marginTop: '10px', background: 'transparent', color: 'white', border: '1px solid white', padding: '5px 15px', borderRadius: '5px', cursor: 'pointer' }}
             >
               Quay lại danh sách nổi bật
             </button>
          )}
        </div>
      </section>
      {/* RENDER KẾT QUẢ TÌM KIẾM NẾU CÓ, NẾU KHÔNG THÌ RENDER SÁCH MẶC ĐỊNH */}
      {searchResults !== null ? (
        <section className={styles['content-section']}>
          <div className={styles['section-header']}>
            <h2>Kết quả tìm kiếm cho: "{searchQuery}"</h2>
          </div>
          
          {searchResults.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>Không tìm thấy sách nào phù hợp với từ khóa của bạn.</p>
          ) : (
            <div className={styles['books-row']}>
              {searchResults.map((book) => (
                <div 
                  className={styles['book-card-modern']} 
                  key={book.IDSach}
                  onClick={() => navigate(`/book/${book.IDSach}`)} 
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles['book-image-wrapper']}>
                    <img 
                      src={`http://localhost:5000${book.AnhBia}`} 
                      alt={book.TenSach} 
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/180x260' }} 
                    />
                  </div>
                  <div className={styles['book-card-info']}>
                    <h4 title={book.TenSach}>{book.TenSach}</h4>
                    <p className={styles.author}>{book.tacGia?.TenTacGia || 'Đang cập nhật'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : (<>
      {/* 3. SÁCH MỚI NHẬP */}
      <section className={styles['content-section']}>
        <div className={styles['section-header']}>
          <div className={styles['title-wrapper']}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            <h2>Sách mới nhập</h2>
          </div>
          <Link to="#" className={styles['view-all']}>Xem tất cả</Link>
        </div>

        {loading ? <p>Đang tải dữ liệu...</p> : (
          <div className={styles['books-row']}>
            {newBooks.map((book) => (
              <div 
                className={styles['book-card-modern']} 
                key={book.IDSach}
                onClick={() => navigate(`/book/${book.IDSach}`)} 
                style={{ cursor: 'pointer' }}
              >
                <div className={styles['book-image-wrapper']}>
                  <img 
                    src={`http://localhost:5000${book.AnhBia}`} 
                    alt={book.TenSach} 
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/180x260' }} // Hiện ảnh thay thế nếu link lỗi
                  />
                </div>
                <div className={styles['book-card-info']}>
                  <h4 title={book.TenSach}>{book.TenSach}</h4>
                  <p className={styles.author}>{book.tacGia?.TenTacGia || 'Đang cập nhật'}</p>
                  {book.theLoais && book.theLoais.length > 0 && (
                    <span className={styles['category-badge']}>{book.theLoais[0].TenTheLoai}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. SÁCH MƯỢN NHIỀU NHẤT */}
      <section className={styles["content-section"]}>
        <div className={styles["section-header"]}>
          <div className={styles["title-wrapper"]}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
            <h2>Sách mượn nhiều nhất</h2>
          </div>
        </div>

        <div className={styles["popular-list"]}>
          {popularBooks.map((book, index) => (
            <div className={styles["popular-item"]} key={book.IDSach}>
              <div className={styles["rank"]}>0{index + 1}</div>
              <img 
                src={`http://localhost:5000${book.AnhBia}`} 
                alt={book.TenSach} 
                className={styles['tiny-cover']} 
                onError={(e) => { e.target.src = 'https://via.placeholder.com/40x55' }}
              />
              <div className={styles["popular-info"]}>
                <h4>{book.TenSach}</h4>
                <p>{book.tacGia?.TenTacGia || 'Đang cập nhật'}</p>
              </div>
              <div className={styles["popular-stats"]}>
                <span className={styles["stat"]}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg> 1,204</span>
                <span className={styles["stat"]}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg> 850</span>
              </div>
              <button className={styles["btn-icon"]}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </button>
            </div>
          ))}
        </div>
      </section>
      </>)}


      {/* 5. FOOTER */}
      <footer className={styles["main-footer"]}>
        <div className={styles["footer-cols"]}>
          <div className={styles["col-brand"]}>
            <div className={styles["logo"]}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
              <span>Thư viện Số</span>
            </div>
            <p>Kết nối tri thức, khơi nguồn sáng tạo qua hàng triệu đầu sách số hóa chất lượng cao.</p>
          </div>
          <div className={styles["col-links"]}>
            <h4>Liên kết</h4>
            <a href="#">Về chúng tôi</a>
            <a href="#">Chính sách mượn sách</a>
            <a href="#">Câu hỏi thường gặp</a>
          </div>
          <div className={styles["col-contact"]}>
            <h4>Liên hệ</h4>
            <p>✉️ contact@library.vn</p>
            <p>📞 +84 123 456 789</p>
          </div>
        </div>
        <div className={styles["footer-bottom"]}>
          <p>© 2026 Thư viện Số. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ReaderHome;
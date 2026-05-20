import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import styles from './AllBooks.module.css';
import api from '../api/axios';
import { fetchBookMetadata, fetchFilteredBooks } from '../services/bookService';

const AllBooks = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  
  const [filters, setFilters] = useState({ category: [], status: '', sort: 'newest' });
  const [genres, setGenres] = useState([]);

  const [limit, setLimit] = useState(6);

  // Hàm tải dữ liệu sách và metadata
  const loadData = async () => {
    try {
      // 1. Tải danh sách sách theo bộ lọc thông qua Service
      // const params = new URLSearchParams({ ...filters, page, limit: limit });
      const params = new URLSearchParams({ 
        ...filters, 
        category: filters.category.join(','), 
        page, 
        limit: limit 
      });
      const resData = await fetchFilteredBooks(params.toString()); // Gọi hàm Service
      
      setBooks(resData.books || []);
      setTotal(resData.total || 0);

      // 2. Tải danh sách Thể loại (Chỉ tải 1 lần đầu tiên)
      if (genres.length === 0) {
        const meta = await fetchBookMetadata();
        setGenres(meta.genres || []); 
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu trang Tất cả sách:", error);
    }
  };

  // Tự động load lại sách mỗi khi page, category, hoặc sort thay đổi
  useEffect(() => { 
    loadData(); 
  }, [page, filters.sort, filters.category]);

  // Logic xử lý khi chọn/bỏ chọn Thể loại
  const handleCategoryChange = (id, isChecked) => {
    // setFilters(prev => ({
    //   ...prev,
    //   // Nếu click vào chính thể loại đang chọn thì sẽ bỏ chọn (Reset bộ lọc)
    //   category: prev.category === idTheLoai ? '' : idTheLoai 
    // }));
    // setPage(1); // Luôn reset về trang 1 khi đổi bộ lọc
    setFilters(prevFilters => {
    // Đảm bảo prevFilters.category luôn là mảng (phòng hờ undefined)
      const currentCategories = prevFilters.category || []; 

      if (isChecked) {
        // Nếu check: Giữ các giá trị cũ, thêm id mới vào cuối mảng
        return { ...prevFilters, category: [...currentCategories, id] };
      } else {
        // Nếu uncheck: Lọc mảng, bỏ đi id vừa bị uncheck
        return { ...prevFilters, category: currentCategories.filter(item => item !== id) };
      }
    });
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className={styles.layout}>
      <Navbar />
      <div className={styles.container}>
        {/* SIDEBAR BỘ LỌC ĐỘNG */}
        <aside className={styles.sidebar}>
          <h3>Bộ lọc</h3>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>THỂ LOẠI</label>
            
            {/* Map danh sách thể loại tự động từ DB */}
            {genres.map((genre) => (
              <div key={genre.IDTheLoai} className={styles.checkbox}>
                <input 
                  type="checkbox" 
                  id={`genre-${genre.IDTheLoai}`}
                  checked={filters.category.includes(genre.IDTheLoai)}
                  onChange={(e) => handleCategoryChange(genre.IDTheLoai, e.target.checked)}
                /> 
                <label htmlFor={`genre-${genre.IDTheLoai}`}>{genre.TenTheLoai}</label>
              </div>
            ))}
            
            {genres.length === 0 && <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Đang tải thể loại...</p>}
          </div>
        </aside>

        {/* NỘI DUNG CHÍNH (LƯỚI SÁCH) */}
        <main className={styles.content}>
          <div className={styles.header}>
            <h1>Tất cả sách</h1>
            <select className={styles.sortSelect} value={filters.sort} onChange={(e) => { setFilters({...filters, sort: e.target.value}); setPage(1); }}>
              <option value="newest">Mới nhất</option>
              <option value="rating">Mượn nhiều nhất</option>
            </select>
          </div>

          {books.length === 0 ? (
            <div className={styles.emptyState}>Không tìm thấy sách phù hợp với bộ lọc.</div>
          ) : (
            <div className={styles.grid}>
              {books.map(book => (
                <div 
                  key={book.IDSach} 
                  className={styles.card}
                  onClick={() => navigate(`/book/${book.IDSach}`)}
                >
                  <img src={`http://localhost:5000${book.AnhBia}`} alt={book.TenSach} onError={(e) => { e.target.src = 'https://via.placeholder.com/200x280' }}/>
                  <h4>{book.TenSach}</h4>
                  <p>{book.tacGia?.TenTacGia || 'Đang cập nhật'}</p>
                  
                  {/* Nếu đang lọc theo lượt mượn (rating), hiển thị số lượt mượn thực tế */}
                  <div className={styles.rating}>
                    {filters.sort === 'rating' ? (
                       <span> {book.LuotMuon} lượt mượn</span>
                    ) : (
                       <span>{book.theLoais?.[0]?.TenTheLoai || 'Chưa phân loại'}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PHÂN TRANG */}
          {total > 0 && (
            <div className={styles.pagination}>
              <span>Hiển thị {books.length} trong tổng số {total} cuốn sách</span>
              <div className={styles.pages}>
                {[...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i} 
                    className={page === i + 1 ? styles.active : ''} 
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AllBooks;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllBooks, createBook, updateBook, deleteBook, fetchBookMetadata } from '../services/bookService';
import styles from './StaffHome.module.css';

const StaffHome = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  
  // Điều hướng phân hệ Actor & Lọc từ khóa tìm kiếm
  const [activeTab, setActiveTab] = useState('quan-ly-danh-muc');
  const [searchTerm, setSearchTerm] = useState('');

  // Quản lý đóng/mở Modal Form
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Lưu trữ danh mục tổng hợp
  const [books, setBooks] = useState([]);
  const [metadata, setMetadata] = useState({ authors: [], locations: [], genres: [] });
  const [loading, setLoading] = useState(true);

  // Trạng thái Form bên trong Modal
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    TenSach: '',
    TongSoLuong: '',
    IDTacGia: '',
    IDViTri: '',
  });
  
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [imageFile, setImageFile] = useState(null);

  const initData = async () => {
    try {
      const [booksData, metaData] = await Promise.all([
        fetchAllBooks(),
        fetchBookMetadata()
      ]);
      setBooks(booksData);
      setMetadata(metaData);
      
      if (metaData.authors.length > 0 && metaData.locations.length > 0) {
        setFormData(prev => ({
          ...prev,
          IDTacGia: metaData.authors[0].IDTacGia,
          IDViTri: metaData.locations[0].IDViTri,
        }));
      }
    } catch (error) {
      console.error("Lỗi đồng bộ dữ liệu hệ thống:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initData();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenreCheckboxChange = (genreId) => {
    if (selectedGenres.includes(genreId)) {
      setSelectedGenres(selectedGenres.filter(id => id !== genreId));
    } else {
      setSelectedGenres([...selectedGenres, genreId]);
    }
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  // Kích hoạt Modal Sửa thông tin
  const handleEditClick = (book) => {
    setIsEditing(true);
    setEditingId(book.IDSach);
    setFormData({
      TenSach: book.TenSach,
      TongSoLuong: book.TongSoLuong,
      IDTacGia: book.IDTacGia || '',
      IDViTri: book.IDViTri || '',
    });
    const genreIds = book.theLoais ? book.theLoais.map(t => t.IDTheLoai) : [];
    setSelectedGenres(genreIds);
    setIsModalOpen(true); // Mở popup lên
  };

  const closeModalAndReset = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      TenSach: '',
      TongSoLuong: '',
      IDTacGia: metadata.authors[0]?.IDTacGia || '',
      IDViTri: metadata.locations[0]?.IDViTri || '',
    });
    setSelectedGenres([]);
    setImageFile(null);
    const fileInput = document.getElementById('file-input');
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.TenSach || !formData.TongSoLuong) return alert('Vui lòng điền các trường bắt buộc!');

    const submitData = new FormData();
    submitData.append('TenSach', formData.TenSach);
    submitData.append('TongSoLuong', formData.TongSoLuong);
    submitData.append('IDTacGia', formData.IDTacGia);
    submitData.append('IDViTri', formData.IDViTri);
    submitData.append('theLoaiIds', JSON.stringify(selectedGenres));
    
    if (imageFile) {
      submitData.append('AnhBia', imageFile);
    }

    try {
      if (isEditing) {
        await updateBook(editingId, submitData);
        alert('Cập nhật thông tin thành công!');
      } else {
        await createBook(submitData);
        alert('Thêm sách mới thành công!');
      }
      closeModalAndReset();
      const updatedBooks = await fetchAllBooks();
      setBooks(updatedBooks);
    } catch (error) {
      alert(error.response?.data?.message || 'Giao dịch thất bại');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa cuốn sách này khỏi kho quản lý?')) {
      try {
        await deleteBook(id);
        const updatedBooks = await fetchAllBooks();
        setBooks(updatedBooks);
      } catch (error) {
        alert(error.response?.data?.message || 'Lỗi xử lý xóa sách');
      }
    }
  };

  // Logic lọc tìm kiếm sách theo tên sách hoặc tên tác giả trực tiếp ở Client
  const filteredBooks = books.filter(book => {
    const matchTitle = book.TenSach.toLowerCase().includes(searchTerm.toLowerCase());
    const matchAuthor = (book.tacGia?.TenTacGia || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchTitle || matchAuthor;
  });

  return (
    <div className={styles.staffContainer}>
      {/* SIDEBAR NAVIGATION - PHÂN RÃ ACTOR */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h3>Hệ thống Quản trị</h3>
          <small>Library Smart System</small>
        </div>

        <div className={styles.actorGroup}>
          <div className={styles.actorTitle}>Bộ phận kho</div>
          <button 
            className={`${styles.navItem} ${activeTab === 'quan-ly-danh-muc' ? styles.navItemActive : ''}`}
            onClick={() => setActiveTab('quan-ly-danh-muc')}
          >
            📦 Quản lý danh mục sách
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'quan-ly-ton-kho' ? styles.navItemActive : ''}`}
            onClick={() => setActiveTab('quan-ly-ton-kho')}
          >
            📊 Quản lý tồn kho
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'nhap-xuat-sach' ? styles.navItemActive : ''}`}
            onClick={() => setActiveTab('nhap-xuat-sach')}
          >
            🔄 Nhập / Xuất sách
          </button>
        </div>

        <div className={styles.actorGroup}>
          <div className={styles.actorTitle}>Thủ thư</div>
          <button 
            className={`${styles.navItem} ${activeTab === 'quan-ly-muon-tra' ? styles.navItemActive : ''}`}
            onClick={() => setActiveTab('quan-ly-muon-tra')}
          >
            📖 Quản lý mượn trả
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'thong-tin-doc-gia' ? styles.navItemActive : ''}`}
            onClick={() => setActiveTab('thong-tin-doc-gia')}
          >
            👥 Thông tin độc giả
          </button>
        </div>
      </aside>

      {/* KHU VỰC KHÔNG GIAN LÀM VIỆC CHÍNH */}
      <main className={styles.mainContent}>
        <header className={styles.topHeader}>
          <h2>
            {activeTab === 'quan-ly-danh-muc' && 'Quản lý danh mục sách'}
            {activeTab === 'quan-ly-ton-kho' && 'Báo cáo tồn kho chi tiết'}
            {activeTab === 'nhap-xuat-sach' && 'Lịch sử nhập xuất kho'}
            {activeTab === 'quan-ly-muon-tra' && 'Quản lý mượn trả sách'}
            {activeTab === 'thong-tin-doc-gia' && 'Quản lý tài khoản độc giả'}
          </h2>
          <div className={styles.userInfo}>
            <span>Nhân viên: <strong style={{ color: '#2563eb' }}>{user?.HoTen}</strong></span>
            <button onClick={() => { localStorage.clear(); navigate('/login'); }} className={styles.btnLogout}>Đăng xuất</button>
          </div>
        </header>

        <div className={styles.workspace}>
          {activeTab === 'quan-ly-danh-muc' ? (
            <div className={styles.tablePanel}>
              
              {/* THANH TÌM KIẾM VÀ NÚT TẠO FORM THEO ĐÚNG ĐỀ XUẤT */}
              <div className={styles.tableControls}>
                <div className={styles.searchWrapper}>
                  <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  <input 
                    type="text" 
                    placeholder="Tìm theo tên sách hoặc tên tác giả..." 
                    className={styles.searchInput}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button className={styles.btnAddBook} onClick={() => setIsModalOpen(true)}>
                  <span>➕ Thêm sách mới</span>
                </button>
              </div>

              {/* BẢNG DỮ LIỆU HIỂN THỊ CHÍNH (FULL RỘNG) */}
              {loading ? <p>Đang liên kết dữ liệu...</p> : (
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Bìa</th>
                      <th>Tên đầu sách</th>
                      <th>Tác giả / Thể loại</th>
                      <th>Vị trí kho</th>
                      <th style={{ textAlign: 'center' }}>Khả dụng / Tổng</th>
                      <th style={{ textAlign: 'center' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBooks.map((book) => (
                      <tr key={book.IDSach}>
                        <td>
                          <img 
                            src={`http://localhost:5000${book.AnhBia}`} 
                            alt="" 
                            style={{ width: '42px', height: '60px', objectFit: 'cover', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/42x60' }}
                          />
                        </td>
                        <td style={{ fontWeight: '600', color: '#1e293b' }}>{book.TenSach}</td>
                        <td>
                          <div className={styles.bookMetaWrapper}>
                            <span className={styles.authorName}>{book.tacGia?.TenTacGia || 'Chưu rõ'}</span>
                            <div className={styles.genreBadges}>
                              {book.theLoais && book.theLoais.length > 0 ? (
                                book.theLoais.map(t => (
                                  <span key={t.IDTheLoai} className={styles.badge}>{t.TenTheLoai}</span>
                                ))
                              ) : (
                                <span className={styles.badge} style={{ color: '#64748b', background: '#f1f5f9' }}>Khác</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ color: '#475569' }}>
                          {book.viTri ? `${book.viTri.KhuVuc} - T${book.viTri.Tang} (${book.viTri.KeSach})` : 'N/A'}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`${styles.statusBadge} ${book.SoLuongSanSang > 0 ? styles.statusAvailable : styles.statusEmpty}`}>
                            {book.SoLuongSanSang} / {book.TongSoLuong}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div className={styles.actionGroup}>
                            <button onClick={() => handleEditClick(book)} className={styles.btnEdit}>Sửa</button>
                            <button onClick={() => handleDelete(book.IDSach)} className={styles.btnDelete}>Xóa</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredBooks.length === 0 && (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Không tìm thấy cuốn sách nào khớp với từ khóa.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          ) : (
            <div className={styles.emptyFeature}>
              <h3>Hệ thống đang kết nối dữ liệu...</h3>
              <p>Màn hình nghiệp vụ của phân hệ <strong>"{activeTab}"</strong> đang chờ tích hợp logic APIs ở các bước sau.</p>
            </div>
          )}
        </div>
      </main>

      {/* BLOCK MODAL DIALOG - BẮN POPUP FORM KHI BẤM THÊM HOẶC SỬA */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 style={{ color: isEditing ? '#d97706' : '#2563eb', margin: '0 0 20px 0' }}>
              {isEditing ? '📝 Hiệu chỉnh thông tin sách' : '➕ Nhập sách vào kho'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Tên đầu sách (*)</label>
                <input type="text" name="TenSach" value={formData.TenSach} onChange={handleInputChange} className={styles.formInput} />
              </div>

              <div className={styles.formGroup}>
                <label>Tổng số lượng nhập (*)</label>
                <input type="number" name="TongSoLuong" value={formData.TongSoLuong} onChange={handleInputChange} className={styles.formInput} />
              </div>

              <div className={styles.formGroup}>
                <label>Tác giả</label>
                <select name="IDTacGia" value={formData.IDTacGia} onChange={handleInputChange} className={styles.formSelect}>
                  {metadata.authors.map(author => (
                    <option key={author.IDTacGia} value={author.IDTacGia}>{author.TenTacGia}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Thể loại sách (Chọn nhiều)</label>
                <div className={styles.checkboxGrid}>
                  {metadata.genres.map(genre => (
                    <label key={genre.IDTheLoai} className={styles.checkboxLabel}>
                      <input 
                        type="checkbox" 
                        checked={selectedGenres.includes(genre.IDTheLoai)}
                        onChange={() => handleGenreCheckboxChange(genre.IDTheLoai)}
                      />
                      {genre.TenTheLoai}
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Vị trí lưu trữ trên kệ</label>
                <select name="IDViTri" value={formData.IDViTri} onChange={handleInputChange} className={styles.formSelect}>
                  {metadata.locations.map(loc => (
                    <option key={loc.IDViTri} value={loc.IDViTri}>{`${loc.KhuVuc} - Tầng ${loc.Tang} (${loc.KeSach})`}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Ảnh bìa đầu sách</label>
                <input type="file" id="file-input" accept="image/*" onChange={handleFileChange} style={{ fontSize: '13px' }} />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className={styles.btnSubmit} style={{ backgroundColor: isEditing ? '#d97706' : '#2563eb' }}>
                  {isEditing ? 'Cập nhật' : 'Lưu lại'}
                </button>
                <button type="button" onClick={closeModalAndReset} className={styles.btnCancel}>
                  Đóng lại
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffHome;
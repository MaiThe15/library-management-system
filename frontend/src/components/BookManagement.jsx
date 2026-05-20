import React, { useState, useEffect } from 'react';
import { createBook, updateBook, deleteBook } from '../services/bookService';
import styles from './BookManagement.module.css'; // Sử dụng CSS Module riêng biệt của component

const BookManagement = ({ books, metadata, loading, onRefreshBooks }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Trạng thái Form bên trong Modal
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    TenSach: '',
    TongSoLuong: 0,
    IDTacGia: '',
    IDViTri: '',
  });
  
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [imageFile, setImageFile] = useState(null);

  // Tự động cập nhật ID tác giả và vị trí mặc định khi metadata tải xong
  useEffect(() => {
    if (!isEditing && metadata.authors?.length > 0 && metadata.locations?.length > 0) {
      setFormData(prev => ({
        ...prev,
        IDTacGia: metadata.authors[0].IDTacGia,
        IDViTri: metadata.locations[0].IDViTri,
      }));
    }
  }, [metadata, isEditing]);

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

  const handleEditClick = (book) => {
    setIsEditing(true);
    setEditingId(book.IDSach);
    setFormData({
      TenSach: book.TenSach,
      // TongSoLuong: book.TongSoLuong,
      IDTacGia: book.IDTacGia || '',
      IDViTri: book.IDViTri || '',
    });
    const genreIds = book.theLoais ? book.theLoais.map(t => t.IDTheLoai) : [];
    setSelectedGenres(genreIds);
    setIsModalOpen(true);
  };

  const closeModalAndReset = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      TenSach: '',
      // TongSoLuong: '',
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
    if (!formData.TenSach) return alert('Vui lòng điền các trường bắt buộc!');

    const submitData = new FormData();
    submitData.append('TenSach', formData.TenSach);
    // submitData.append('TongSoLuong', formData.TongSoLuong);
    if (formData.IDTacGia && formData.IDTacGia !== '') {
    submitData.append('IDTacGia', formData.IDTacGia);
    }
    if (formData.IDViTri && formData.IDViTri !== '') {
    submitData.append('IDViTri', formData.IDViTri);
    }
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
      onRefreshBooks();
    } catch (error) {
      alert(error.response?.data?.message || 'Giao dịch thất bại');
    }
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa cuốn sách này khỏi kho quản lý?')) {
      try {
        await deleteBook(id);
        onRefreshBooks();
      } catch (error) {
        alert(error.response?.data?.message || 'Lỗi xử lý xóa sách');
      }
    }
  };

  const filteredBooks = books.filter(book => {
    const matchTitle = book.TenSach.toLowerCase().includes(searchTerm.toLowerCase());
    const matchAuthor = (book.tacGia?.TenTacGia || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchTitle || matchAuthor;
  });

  return (
    <div className={styles.tablePanel}>
      {/* THANH TÌM KIẾM VÀ NÚT TẠO FORM */}
      <div className={styles.tableControls}>
        <div className={styles.searchWrapper}>
          <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
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

      {/* BẢNG DỮ LIỆU HIỂN THỊ CHÍNH */}
      {loading ? <p className={styles.loadingText}>Đang liên kết dữ liệu...</p> : (
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
                    className={styles.bookCover}
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/42x60' }}
                  />
                </td>
                <td className={styles.bookTitle}>{book.TenSach}</td>
                <td>
                  <div className={styles.bookMetaWrapper}>
                    <span className={styles.authorName}>{book.tacGia?.TenTacGia || 'Chưa rõ'}</span>
                    <div className={styles.genreBadges}>
                        {book.theLoais && book.theLoais.length > 0 ? (
                            book.theLoais.map(t => (
                            // Sử dụng toán tử ?. để nếu t bị trống thì UI vẫn không bị sập
                            <span key={t?.IDTheLoai} className={styles.badge}>
                                {t?.TenTheLoai || 'Không xác định'}
                            </span>
                            ))
                        ) : (
                            <span className={styles.badge} style={{ color: '#64748b', background: '#f1f5f9' }}>Khác</span>
                        )}
                    </div>
                  </div>
                </td>
                <td className={styles.bookLocation}>
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
                    <button onClick={() => handleDeleteClick(book.IDSach)} className={styles.btnDelete}>Xóa</button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredBooks.length === 0 && (
              <tr>
                <td colSpan="6" className={styles.emptyText}>Không tìm thấy cuốn sách nào khớp với từ khóa.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* BLOCK MODAL DIALOG POPUP */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={isEditing ? styles.modalHeaderEdit : styles.modalHeaderAdd}>
              {isEditing ? '📝 Hiệu chỉnh thông tin sách' : '➕ Nhập sách vào kho'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Tên đầu sách (*)</label>
                <input type="text" name="TenSach" value={formData.TenSach} onChange={handleInputChange} className={styles.formInput} />
              </div>

              {/* <div className={styles.formGroup}>
                <label>Tổng số lượng nhập (*)</label>
                <input type="number" name="TongSoLuong" value={formData.TongSoLuong} onChange={handleInputChange} className={styles.formInput} />
              </div> */}

              <div className={styles.formGroup}>
                <label>Tác giả</label>
                <select name="IDTacGia" value={formData.IDTacGia} onChange={handleInputChange} className={styles.formSelect}>
                  {metadata.authors?.map(author => (
                    <option key={author.IDTacGia} value={author.IDTacGia}>{author.TenTacGia}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Thể loại sách (Chọn nhiều)</label>
                <div className={styles.checkboxGrid}>
                  {metadata.genres?.map(genre => (
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
                  {metadata.locations?.map(loc => (
                    <option key={loc.IDViTri} value={loc.IDViTri}>{`${loc.KhuVuc} - Tầng ${loc.Tang} (${loc.KeSach})`}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Ảnh bìa đầu sách</label>
                <input type="file" id="file-input" accept="image/*" onChange={handleFileChange} className={styles.fileInputWrapper} />
              </div>

              <div className={styles.modalActions}>
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

export default BookManagement;
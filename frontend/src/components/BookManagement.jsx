import React, { useState, useEffect } from 'react';
import { createBook, updateBook, deleteBook } from '../services/bookService';
import sharedStyles from '../pages/StaffHome.module.css'; // Sử dụng CSS chuẩn của StaffHome

const BookManagement = ({ books, metadata, loading, onRefreshBooks }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    TenSach: '',
    IDTacGia: '',
    IDViTri: '',
  });
  
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [imageFile, setImageFile] = useState(null);

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
    if (formData.IDTacGia && formData.IDTacGia !== '') submitData.append('IDTacGia', formData.IDTacGia);
    if (formData.IDViTri && formData.IDViTri !== '') submitData.append('IDViTri', formData.IDViTri);
    submitData.append('theLoaiIds', JSON.stringify(selectedGenres));
    if (imageFile) submitData.append('AnhBia', imageFile);

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
    <div className={sharedStyles.tablePanel}>
      <h3 style={{ margin: 10, fontSize: '20px', fontWeight: '600' }}>Quản Lý Danh Mục Sách</h3>
      {/* THANH TÌM KIẾM VÀ NÚT TẠO FORM */}
      <div className={sharedStyles.tableControls}>
        <div className={sharedStyles.searchWrapper} style={{ maxWidth: '450px' }}>
          <svg className={sharedStyles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Tìm theo tên sách hoặc tên tác giả..." 
            className={sharedStyles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className={sharedStyles.btnAddBook} onClick={() => setIsModalOpen(true)}>
          <span>Thêm sách mới</span>
        </button>
      </div>

      {/* BẢNG DỮ LIỆU HIỂN THỊ CHÍNH */}
      {loading ? (
        <p style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Đang liên kết dữ liệu...</p>
      ) : (
        <table className={sharedStyles.dataTable}>
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
                    style={{ width: '42px', height: '60px', objectFit: 'cover', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/42x60' }}
                  />
                </td>
                <td style={{ fontWeight: '600', color: '#1e293b' }}>{book.TenSach}</td>
                <td>
                  <div className={sharedStyles.bookMetaWrapper}>
                    <span className={sharedStyles.authorName}>{book.tacGia?.TenTacGia || 'Chưa rõ'}</span>
                    <div className={sharedStyles.genreBadges}>
                        {book.theLoais && book.theLoais.length > 0 ? (
                            book.theLoais.map(t => (
                            <span key={t?.IDTheLoai} className={sharedStyles.badge}>
                                {t?.TenTheLoai || 'Không xác định'}
                            </span>
                            ))
                        ) : (
                            <span className={sharedStyles.badge} style={{ color: '#64748b', background: '#f1f5f9' }}>Khác</span>
                        )}
                    </div>
                  </div>
                </td>
                <td style={{ color: '#475569' }}>
                  {book.viTri ? `${book.viTri.KhuVuc} - T${book.viTri.Tang} (${book.viTri.KeSach})` : 'N/A'}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className={`${sharedStyles.statusBadge} ${book.SoLuongSanSang > 0 ? sharedStyles.statusAvailable : sharedStyles.statusEmpty}`}>
                    {book.SoLuongSanSang} / {book.TongSoLuong}
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <div className={sharedStyles.actionGroup}>
                    <button onClick={() => handleEditClick(book)} className={sharedStyles.btnEdit}>Sửa</button>
                    <button onClick={() => handleDeleteClick(book.IDSach)} className={sharedStyles.btnDelete}>Xóa</button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredBooks.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                  Không tìm thấy cuốn sách nào khớp với từ khóa.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* BLOCK MODAL DIALOG POPUP */}
      {isModalOpen && (
        <div className={sharedStyles.modalOverlay}>
          <div className={sharedStyles.modalContent} style={{ maxWidth: '520px' }}>
            <h3 style={{ color: isEditing ? '#d97706' : '#2563eb', margin: '0 0 20px 0' }}>
              {isEditing ? 'Hiệu chỉnh thông tin sách' : 'Nhập sách vào kho'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className={sharedStyles.formGroup}>
                <label>Tên đầu sách (*)</label>
                <input type="text" name="TenSach" value={formData.TenSach} onChange={handleInputChange} className={sharedStyles.formInput} />
              </div>

              <div className={sharedStyles.formGroup}>
                <label>Tác giả</label>
                <select name="IDTacGia" value={formData.IDTacGia} onChange={handleInputChange} className={sharedStyles.formSelect}>
                  {metadata.authors?.map(author => (
                    <option key={author.IDTacGia} value={author.IDTacGia}>{author.TenTacGia}</option>
                  ))}
                </select>
              </div>

              <div className={sharedStyles.formGroup}>
                <label>Thể loại sách (Chọn nhiều)</label>
                <div className={sharedStyles.checkboxGrid}>
                  {metadata.genres?.map(genre => (
                    <label key={genre.IDTheLoai} className={sharedStyles.checkboxLabel}>
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

              <div className={sharedStyles.formGroup}>
                <label>Vị trí lưu trữ trên kệ</label>
                <select name="IDViTri" value={formData.IDViTri} onChange={handleInputChange} className={sharedStyles.formSelect}>
                  {metadata.locations?.map(loc => (
                    <option key={loc.IDViTri} value={loc.IDViTri}>{`${loc.KhuVuc} - Tầng ${loc.Tang} (${loc.KeSach})`}</option>
                  ))}
                </select>
              </div>

              <div className={sharedStyles.formGroup}>
                <label>Ảnh bìa đầu sách</label>
                <input type="file" id="file-input" accept="image/*" onChange={handleFileChange} style={{ fontSize: '13px', color: '#475569' }} />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="submit" className={sharedStyles.btnSubmit} style={{ flex: 1, backgroundColor: isEditing ? '#d97706' : '#2563eb' }}>
                  {isEditing ? 'Cập nhật' : 'Lưu lại'}
                </button>
                <button type="button" onClick={closeModalAndReset} className={sharedStyles.btnCancel} style={{ flex: 1 }}>
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
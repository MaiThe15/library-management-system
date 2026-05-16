import React, { useState, useEffect } from 'react';
import sharedStyles from '../pages/StaffHome.module.css'; // Layout gốc của hệ thống
import styles from './BorrowManagement.module.css'; // CSS Module riêng biệt của component
import { createBorrowSlip, fetchAllBorrowSlips } from '../services/phieuMuonService';

const BorrowManagement = ({ books }) => {
  // Trạng thái kiểm soát đóng/mở Modal Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [docGiaId, setDocGiaId] = useState('');
  const [bookSearchText, setBookSearchText] = useState('');
  const [borrowCart, setBorrowCart] = useState([]); 
  
  const [borrowSlips, setBorrowSlips] = useState([]);
  const [loadingSlips, setLoadingSlips] = useState(true);

  const [ngayMuon, setNgayMuon] = useState(new Date().toISOString().split('T')[0]);
  const [hanTra, setHanTra] = useState(() => {
    const defaultReturn = new Date();
    defaultReturn.setDate(defaultReturn.getDate() + 14);
    return defaultReturn.toISOString().split('T')[0];
  });

  const loadBorrowSlips = async () => {
    try {
      setLoadingSlips(true);
      const data = await fetchAllBorrowSlips();
      setBorrowSlips(data);
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoadingSlips(false);
    }
  };

  useEffect(() => {
    loadBorrowSlips();
  }, []);

  const searchResults = bookSearchText.trim() === '' ? [] : books
    .filter(b => b.SoLuongSanSang > 0)
    .filter(b => 
      b.TenSach.toLowerCase().includes(bookSearchText.toLowerCase()) || 
      b.IDSach.toString() === bookSearchText.trim()
    )
    .slice(0, 5);

  const addToBorrowCart = (book) => {
    if (borrowCart.find(item => item.IDSach === book.IDSach)) {
      return alert('Cuốn sách này đã có trong danh sách mượn!');
    }
    setBorrowCart([...borrowCart, book]);
    setBookSearchText('');
  };

  const removeFromBorrowCart = (bookId) => {
    setBorrowCart(borrowCart.filter(item => item.IDSach !== bookId));
  };

  // Hàm đóng Modal và xóa sạch dữ liệu form cũ
  const closeModalAndReset = () => {
    setIsModalOpen(false);
    setDocGiaId('');
    setBorrowCart([]);
    setBookSearchText('');
    const defaultReturn = new Date();
    defaultReturn.setDate(defaultReturn.getDate() + 14);
    setHanTra(defaultReturn.toISOString().split('T')[0]);
  };

  const handleConfirmBorrow = async () => {
    const payload = { 
      idDocGia: docGiaId, 
      danhSachIdSach: borrowCart.map(b => b.IDSach) 
    };

    try {
      await createBorrowSlip(payload);
      alert('🎉 Tạo phiếu mượn thành công!');
      closeModalAndReset();
      loadBorrowSlips(); // Tải lại nhật ký hoạt động
    } catch (error) {
      alert(`Lỗi: ${error.message}`);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className={styles.container}>
      {/* THANH ĐIỀU KHIỂN CHÍNH */}
      <div className={styles.tableControls}>
        <h3 className={styles.tableTitle}>📜 Nhật Ký Hoạt Động Mượn Trả</h3>
        <button className={styles.btnOpenModal} onClick={() => setIsModalOpen(true)}>
          <span>➕ Tạo phiếu mượn mới</span>
        </button>
      </div>

      {/* --- PHẦN KHỐI BẢNG LỊCH SỬ HIỂN THỊ PHIẾU MƯỢN --- */}
      {loadingSlips ? (
        <p className={styles.loadingText}>Đang liên kết danh sách phiếu mượn...</p>
      ) : (
        <table className={styles.historyTable}>
          <thead>
            <tr>
              <th>Mã phiếu</th>
              <th>Độc giả</th>
              <th>Sách mượn</th>
              <th>Ngày mượn</th>
              <th>Hạn trả</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {borrowSlips.map((slip) => (
              <tr key={slip.IDPhieuMuon}>
                <td className={styles.slipId}>#{slip.IDPhieuMuon}</td>
                <td>
                  <div className={styles.readerName}>{slip.docGia?.HoTen || `ID: ${slip.IDDocGia}`}</div>
                  <span className={styles.readerPhone}>{slip.docGia?.SoDienThoai}</span>
                </td>
                <td>
                  <ul className={styles.bookList}>
                    {slip.chiTietPhieuMuons?.map((ct, idx) => (
                      <li key={idx}>
                        {ct.Sach?.TenSach || `Mã sách: ${ct.IDSach}`}
                      </li>
                    ))}
                  </ul>
                </td>
                <td>{formatDate(slip.NgayMuon)}</td>
                <td>{formatDate(slip.HanTra)}</td>
                <td>
                  <span className={`${styles.statusBadge} ${
                    slip.TrangThai === 'Đang mượn' ? styles.statusBorrowing : styles.statusReturned
                  }`}>
                    {slip.TrangThai}
                  </span>
                </td>
              </tr>
            ))}
            {borrowSlips.length === 0 && (
              <tr>
                <td colSpan="6" className={styles.emptyText}>
                  Chưa có hoạt động giao dịch mượn sách nào được ghi nhận.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* --- BLOCK MODAL DIALOG POPUP TẠO PHIẾU MƯỢN --- */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalHeader}>➕ Nhập thông tin Phiếu Mượn</h3>
            
            <div className={sharedStyles.formGroup}>
              <label className={styles.formLabel}>Mã Thẻ Độc Giả (*)</label>
              <input 
                type="number" 
                placeholder="Nhập ID Độc giả (VD: 1, 2, 3...)" 
                className={sharedStyles.formInput}
                value={docGiaId}
                onChange={(e) => setDocGiaId(e.target.value)}
              />
            </div>

            <div className={`${sharedStyles.formGroup} ${styles.relativeGroup}`}>
              <label className={styles.formLabel}>Thêm Sách Vào Phiếu (*)</label>
              <div className={sharedStyles.searchWrapper}>
                <input 
                  type="text" 
                  placeholder="Nhập tên sách hoặc ID..." 
                  className={sharedStyles.searchInput}
                  value={bookSearchText}
                  onChange={(e) => setBookSearchText(e.target.value)}
                />
              </div>
              
              {searchResults.length > 0 && (
                <ul className={styles.suggestionList}>
                  {searchResults.map(book => (
                    <li key={book.IDSach} onClick={() => addToBorrowCart(book)} className={styles.suggestionItem}>
                      <span><strong>[{book.IDSach}]</strong> {book.TenSach}</span>
                      <span className={styles.stockText}>Còn {book.SoLuongSanSang} cuốn</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className={styles.cartContainer}>
              <h4 className={styles.cartTitle}>Danh sách mượn ({borrowCart.length} cuốn)</h4>
              {borrowCart.length === 0 ? (
                <p className={styles.emptyCartText}>Chưa có sách nào được chọn.</p>
              ) : (
                <ul className={styles.cartList}>
                  {borrowCart.map(item => (
                    <li key={item.IDSach} className={styles.cartItem}>
                      <span>📘 {item.TenSach}</span>
                      <button onClick={() => removeFromBorrowCart(item.IDSach)} className={styles.btnRemove}>Xóa</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className={styles.timeGroupContainer}>
              <div className={`${sharedStyles.formGroup} ${styles.timeGroup}`}>
                <label className={styles.formLabel}>Ngày mượn</label>
                <input type="date" className={`${sharedStyles.formInput} ${styles.disabledInput}`} value={ngayMuon} disabled />
              </div>
              <div className={`${sharedStyles.formGroup} ${styles.timeGroup}`}>
                <label className={styles.formLabel}>Hạn trả dự kiến</label>
                <input type="date" className={sharedStyles.formInput} value={hanTra} onChange={(e) => setHanTra(e.target.value)} min={ngayMuon} />
              </div>
            </div>

            <div className={styles.modalActions}>
              <button 
                className={sharedStyles.btnSubmit} 
                disabled={borrowCart.length === 0 || !docGiaId}
                onClick={handleConfirmBorrow}
                style={{ backgroundColor: '#2563eb' }}
              >
                Xác Nhận Tạo
              </button>
              <button type="button" onClick={closeModalAndReset} className={styles.btnCancel}>
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BorrowManagement;
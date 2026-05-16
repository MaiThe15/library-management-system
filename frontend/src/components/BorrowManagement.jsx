import React, { useState } from 'react';
import sharedStyles from '../pages/StaffHome.module.css'; // Layout form gốc
import styles from './BorrowManagement.module.css'; // CSS riêng vừa tạo

const BorrowManagement = ({ books }) => {
  const [docGiaId, setDocGiaId] = useState('');
  const [bookSearchText, setBookSearchText] = useState('');
  const [borrowCart, setBorrowCart] = useState([]); 
  
  const [ngayMuon, setNgayMuon] = useState(new Date().toISOString().split('T')[0]);
  const [hanTra, setHanTra] = useState(() => {
    const defaultReturn = new Date();
    defaultReturn.setDate(defaultReturn.getDate() + 14);
    return defaultReturn.toISOString().split('T')[0];
  });

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

  const handleConfirmBorrow = () => {
    console.log({ docGiaId, hanTra, danhSachIdSach: borrowCart.map(b => b.IDSach) });
  };

  return (
    <div className={`${sharedStyles.tablePanel} ${styles.container}`}>
      <h3 className={styles.headerTitle}>Tạo Phiếu Mượn Mới</h3>
      
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
              <li 
                key={book.IDSach} 
                onClick={() => addToBorrowCart(book)}
                className={styles.suggestionItem}
              >
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
                <button 
                  onClick={() => removeFromBorrowCart(item.IDSach)} 
                  className={styles.btnRemove}
                >
                  Xóa
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={styles.timeGroupContainer}>
        <div className={`${sharedStyles.formGroup} ${styles.timeGroup}`}>
          <label className={styles.formLabel}>Ngày mượn</label>
          <input 
            type="date" 
            className={`${sharedStyles.formInput} ${styles.disabledInput}`} 
            value={ngayMuon} 
            disabled 
          />
        </div>
        <div className={`${sharedStyles.formGroup} ${styles.timeGroup}`}>
          <label className={styles.formLabel}>Hạn trả dự kiến</label>
          <input 
            type="date" 
            className={sharedStyles.formInput} 
            value={hanTra} 
            onChange={(e) => setHanTra(e.target.value)} 
            min={ngayMuon} 
          />
        </div>
      </div>

      <button 
        className={`${sharedStyles.btnSubmit} ${styles.btnSubmitFull}`} 
        disabled={borrowCart.length === 0 || !docGiaId}
        onClick={handleConfirmBorrow}
      >
        Xác Nhận Tạo Phiếu Mượn
      </button>
    </div>
  );
};

export default BorrowManagement;
import React, { useState, useEffect } from 'react';
import sharedStyles from '../pages/StaffHome.module.css'; // Dùng CSS Layout chuẩn
import styles from './BorrowManagement.module.css'; // Chỉ giữ lại CSS đặc thù (giỏ hàng, gợi ý)
import { createBorrowSlip, fetchAllBorrowSlips, returnBorrowSlip } from '../services/phieuMuonService';

const BorrowManagement = ({ books }) => {
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
  const [returnReceipt, setReturnReceipt] = useState(null);

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

  useEffect(() => { loadBorrowSlips(); }, []);

  const searchResults = bookSearchText.trim() === '' ? [] : books
    .filter(b => b.TenSach.toLowerCase().includes(bookSearchText.toLowerCase()) || b.IDSach.toString() === bookSearchText.trim())
    .slice(0, 5);

  const addToBorrowCart = (book) => {
    if (borrowCart.find(item => item.IDSach === book.IDSach)) return alert('Sách đã có trong danh sách!');
    setBorrowCart([...borrowCart, book]);
    setBookSearchText('');
  };

  const removeFromBorrowCart = (bookId) => setBorrowCart(borrowCart.filter(item => item.IDSach !== bookId));

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
    try {
      await createBorrowSlip({ idDocGia: docGiaId, danhSachIdSach: borrowCart.map(b => b.IDSach) });
      alert('Tạo phiếu mượn thành công!');
      closeModalAndReset();
      loadBorrowSlips();
    } catch (error) {
      alert(`Lỗi: ${error.message}`);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const handleReturnSlip = async (idPhieuMuon) => {
    if (window.confirm('Xác nhận độc giả đã trả đủ sách cho phiếu này?')) {
      try {
        const response = await returnBorrowSlip(idPhieuMuon); 
        setReturnReceipt(response.data); 
        loadBorrowSlips(); 
      } catch (error) {
        alert(`Lỗi: ${error.message}`);
      }
    }
  };

  return (
    <div className={sharedStyles.tablePanel}>
      <div className={sharedStyles.tableControls}>
        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>Quản Lý Mượn Trả Sách</h3>
        <button className={sharedStyles.btnAddBook} onClick={() => setIsModalOpen(true)}>
          <span>Tạo phiếu mượn mới</span>
        </button>
      </div>

      {loadingSlips ? (
        <p style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>Đang liên kết danh sách phiếu mượn...</p>
      ) : (
        <table className={sharedStyles.dataTable}>
          <thead>
            <tr>
              <th>Mã phiếu</th>
              <th>Độc giả</th>
              <th>Sách mượn</th>
              <th>Ngày mượn</th>
              <th>Hạn trả</th>
              <th style={{ textAlign: 'center' }}>Trạng thái</th>
              <th style={{ textAlign: 'center' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {borrowSlips.map((slip) => (
              <tr key={slip.IDPhieuMuon}>
                <td style={{ fontWeight: 'bold', color: '#2563eb' }}>#{slip.IDPhieuMuon}</td>
                <td>
                  <div style={{ fontWeight: '500', color: '#0f172a' }}>{slip.docGia?.HoTen || `ID: ${slip.IDDocGia}`}</div>
                  <span style={{ color: '#64748b', fontSize: '12px' }}>{slip.docGia?.SoDienThoai}</span>
                </td>
                <td>
                  <ul style={{ margin: 0, paddingLeft: '18px', color: '#1e293b' }}>
                    {slip.chiTietPhieuMuons?.map((ct, idx) => (
                      <li key={idx} style={{ marginBottom: '4px' }}>
                        {ct.Sach?.TenSach || `Mã sách: ${ct.IDSach}`}
                      </li>
                    ))}
                  </ul>
                </td>
                <td>{formatDate(slip.NgayMuon)}</td>
                <td>{formatDate(slip.HanTra)}</td>
                <td style={{ textAlign: 'center' }}>
                  <span className={`${sharedStyles.statusBadge} ${
                    slip.TrangThai === 'Đang mượn' ? styles.statusBorrowing : sharedStyles.statusAvailable
                  }`}>
                    {slip.TrangThai}
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  {slip.TrangThai === 'Đang mượn' && (
                    <button 
                      onClick={() => handleReturnSlip(slip.IDPhieuMuon)}
                      style={{
                        backgroundColor: '#10b981', color: 'white', border: 'none', 
                        padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500'
                      }}
                    >
                      Nhận Trả Sách
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {borrowSlips.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                  Chưa có hoạt động giao dịch mượn sách nào được ghi nhận.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* MODAL TẠO PHIẾU MƯỢN */}
      {isModalOpen && (
        <div className={sharedStyles.modalOverlay}>
          <div className={sharedStyles.modalContent} style={{ maxWidth: '550px' }}>
            <h3 style={{ marginTop: 0, color: '#2563eb' }}>Nhập thông tin Phiếu Mượn</h3>
            
            <div className={sharedStyles.formGroup}>
              <label>Mã Thẻ Độc Giả (*)</label>
              <input 
                type="number" 
                placeholder="Nhập ID Độc giả (VD: 1, 2, 3...)" 
                className={sharedStyles.formInput}
                value={docGiaId}
                onChange={(e) => setDocGiaId(e.target.value)}
              />
            </div>

            <div className={`${sharedStyles.formGroup} ${styles.relativeGroup}`}>
              <label>Thêm Sách Vào Phiếu (*)</label>
              <div className={sharedStyles.searchWrapper} style={{ maxWidth: '100%' }}>
                <input 
                  type="text" 
                  placeholder="Nhập tên sách hoặc ID..." 
                  className={sharedStyles.formInput}
                  value={bookSearchText}
                  onChange={(e) => setBookSearchText(e.target.value)}
                />
              </div>
              
              {searchResults.length > 0 && (
                <ul className={styles.suggestionList}>
                  {searchResults.map(book => (
                    <li key={book.IDSach} onClick={() => addToBorrowCart(book)} className={styles.suggestionItem}>
                      <span><strong>[{book.IDSach}]</strong> {book.TenSach}</span>
                      <span className={styles.stockText} style={{ color: book.SoLuongSanSang === 0 ? 'red' : 'inherit' }}>
                        Còn {book.SoLuongSanSang}
                      </span>
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
                      <span>+ {item.TenSach}</span>
                      <button onClick={() => removeFromBorrowCart(item.IDSach)} className={styles.btnRemove}>Xóa</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className={styles.timeGroupContainer}>
              <div className={sharedStyles.formGroup} style={{ flex: 1 }}>
                <label>Ngày mượn</label>
                <input type="date" className={sharedStyles.formInput} style={{ backgroundColor: '#f1f5f9' }} value={ngayMuon} disabled />
              </div>
              <div className={sharedStyles.formGroup} style={{ flex: 1 }}>
                <label>Hạn trả dự kiến</label>
                <input type="date" className={sharedStyles.formInput} value={hanTra} onChange={(e) => setHanTra(e.target.value)} min={ngayMuon} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button 
                className={sharedStyles.btnSubmit} 
                disabled={borrowCart.length === 0 || !docGiaId}
                onClick={handleConfirmBorrow}
                style={{ backgroundColor: (borrowCart.length === 0 || !docGiaId) ? '#94a3b8' : '#2563eb' }}
              >
                Xác Nhận Tạo
              </button>
              <button type="button" onClick={closeModalAndReset} className={sharedStyles.btnCancel}>
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL BIÊN LAI TRẢ SÁCH */}
      {returnReceipt && (
        <div className={sharedStyles.modalOverlay}>
          <div className={sharedStyles.modalContent} style={{ maxWidth: '400px' }}>
            <h3 style={{ color: '#10b981', textAlign: 'center', marginTop: 0 }}>
              Trả Sách Thành Công
            </h3>
            
            <div style={{ padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', margin: '15px 0', border: '1px solid #e2e8f0' }}>
              <p style={{ margin: '5px 0' }}><strong>Mã phiếu:</strong> #{returnReceipt.phieuMuon?.IDPhieuMuon}</p>
              <p style={{ margin: '5px 0' }}><strong>Mã hóa đơn:</strong> #{returnReceipt.hoaDon?.IDHoaDon}</p>
              
              <hr style={{ margin: '10px 0', borderTop: '1px dashed #cbd5e1' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '5px 0' }}>
                <span>Phí mượn cơ bản:</span>
                <span>{returnReceipt.chiTietToan?.phiCoBan?.toLocaleString('vi-VN')} đ</span>
              </div>

              {returnReceipt.chiTietToan?.soNgayTre > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '5px 0', color: '#ef4444' }}>
                  <span>Phạt trễ hạn ({returnReceipt.chiTietToan?.soNgayTre} ngày):</span>
                  <span>+ {returnReceipt.chiTietToan?.tienPhat?.toLocaleString('vi-VN')} đ</span>
                </div>
              )}

              <hr style={{ margin: '10px 0', borderTop: '1px solid #cbd5e1' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold' }}>
                <span>Tổng cần thu:</span>
                <span style={{ color: '#2563eb' }}>
                  {returnReceipt.chiTietToan?.tongTien?.toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>

            <button 
              onClick={() => setReturnReceipt(null)} 
              className={sharedStyles.btnSubmit}
              style={{ backgroundColor: '#10b981', marginTop: '10px' }}
            >
              Xác nhận & Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BorrowManagement;
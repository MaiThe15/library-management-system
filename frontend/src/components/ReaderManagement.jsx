import React, { useState, useEffect } from 'react';
import sharedStyles from '../pages/StaffHome.module.css'; // CSS dùng chung của trang nhân viên
import styles from './BorrowManagement.module.css'; // Tái sử dụng cấu trúc style dạng bảng sạch sẽ
import { fetchAllReaders, toggleReaderStatus } from '../services/docGiaService';

const ReaderManagement = () => {
  const [readers, setReaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadReaders = async () => {
    try {
      setLoading(false);
      const data = await fetchAllReaders();
      setReaders(data);
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReaders();
  }, []);

  // Logic xử lý Khóa / Mở khóa tài khoản độc giả
  const handleToggleStatus = async (id, currentStatus) => {
    // So sánh với chuỗi BI_KHOA
    const actionText = currentStatus === 'BI_KHOA' ? 'MỞ KHÓA' : 'KHÓA';
    if (window.confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản độc giả này không?`)) {
      try {
        await toggleReaderStatus(id);
        alert('Cập nhật trạng thái tài khoản thành công!');
        loadReaders(); 
      } catch (error) {
        alert(`Lỗi: ${error.message}`);
      }
    }
  };

  // Bộ lọc tìm kiếm độc giả theo Tên hoặc Số điện thoại
  const filteredReaders = readers.filter(reader => {
    const matchName = (reader.HoTen || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchPhone = (reader.SoDienThoai || '').includes(searchTerm);
    return matchName || matchPhone;
  });

  return (
    <div className={styles.container}>
      {/* THANH ĐIỀU KHIỂN & Ô TÌM KIẾM */}
      <div className={styles.tableControls}>
        <h3 className={styles.tableTitle}>👥 Quản Lý Tài Khoản Độc Giả</h3>
        <div className={sharedStyles.searchWrapper}>
          <input 
            type="text" 
            placeholder="Tìm theo tên hoặc số điện thoại độc giả..." 
            className={sharedStyles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '320px', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>
      </div>

      {/* BẢNG DỮ LIỆU HIỂN THỊ CHÍNH */}
      {loading ? (
        <p className={styles.loadingText}>Đang liên kết danh sách độc giả...</p>
      ) : (
        <div className={styles.tableResponsive}>
          <table className={styles.historyTable}>
            <thead>
              <tr>
                <th>Mã Độc Giả</th>
                <th>Họ Và Tên</th>
                <th>Số Điện Thoại</th>
                <th>Trạng Thái Tài Khoản</th>
                <th style={{ textAlign: 'center' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredReaders.map((reader) => (
                <tr key={reader.IDDocGia}>
                  <td className={styles.slipId}>#{reader.IDDocGia}</td>
                  <td style={{ fontWeight: '500', color: '#0f172a' }}>{reader.HoTen}</td>
                  <td>{reader.SoDienThoai || 'Chưa cập nhật'}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${
                    reader.taiKhoan?.TrangThai === 'BI_KHOA' ? styles.statusBorrowing : styles.statusReturned
                    }`}>
                        {reader.taiKhoan?.TrangThai === 'HOAT_DONG' ? 'Hoạt động' : 'Bị khóa'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => handleToggleStatus(reader.IDDocGia, reader.taiKhoan?.TrangThai)}
                      style={{
                        backgroundColor: reader.taiKhoan?.TrangThai === 'BI_KHOA' ? '#10b981' : '#ef4444',
                        color: 'white',
                        border: 'none',
                        padding: '6px 14px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        fontSize: '13px',
                        transition: 'opacity 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                      onMouseLeave={(e) => e.target.style.opacity = '1'}
                    >
                      {reader.taiKhoan?.TrangThai === 'BI_KHOA' ? '🔓 Mở khóa' : '🔒 Khóa tài khoản'}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredReaders.length === 0 && (
                <tr>
                  <td colSpan="5" className={styles.emptyText}>
                    Không tìm thấy độc giả nào khớp với từ khóa tìm kiếm.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReaderManagement;
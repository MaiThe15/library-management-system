import React, { useState, useEffect } from 'react';
import sharedStyles from '../pages/StaffHome.module.css'; // Dùng CSS chung của StaffHome
import { fetchAllReaders, toggleReaderStatus } from '../services/docGiaService';

const ReaderManagement = () => {
  const [readers, setReaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadReaders = async () => {
    try {
      setLoading(true);
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

  const handleToggleStatus = async (id, currentStatus) => {
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

  const filteredReaders = readers.filter(reader => {
    const matchName = (reader.HoTen || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchPhone = (reader.SoDienThoai || '').includes(searchTerm);
    return matchName || matchPhone;
  });

  return (
    <div className={sharedStyles.tablePanel}>
      {/* THANH ĐIỀU KHIỂN & Ô TÌM KIẾM */}
      <div className={sharedStyles.tableControls}>
        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>Quản Lý Tài Khoản Độc Giả</h3>
        <div className={sharedStyles.searchWrapper}>
          <svg className={sharedStyles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Tìm theo tên hoặc số điện thoại..." 
            className={sharedStyles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* BẢNG DỮ LIỆU HIỂN THỊ CHÍNH */}
      {loading ? (
        <p style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>Đang liên kết danh sách độc giả...</p>
      ) : (
        <table className={sharedStyles.dataTable}>
          <thead>
            <tr>
              <th>Mã Độc Giả</th>
              <th>Họ Và Tên</th>
              <th>Số Điện Thoại</th>
              <th style={{ textAlign: 'center' }}>Trạng Thái</th>
              <th style={{ textAlign: 'center' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredReaders.map((reader) => (
              <tr key={reader.IDDocGia}>
                <td style={{ fontWeight: 'bold', color: '#2563eb' }}>#{reader.IDDocGia}</td>
                <td style={{ fontWeight: '500', color: '#0f172a' }}>{reader.HoTen}</td>
                <td>{reader.SoDienThoai || 'Chưa cập nhật'}</td>
                <td style={{ textAlign: 'center' }}>
                  <span className={`${sharedStyles.statusBadge} ${
                  reader.taiKhoan?.TrangThai === 'BI_KHOA' ? sharedStyles.statusEmpty : sharedStyles.statusAvailable
                  }`}>
                      {reader.taiKhoan?.TrangThai === 'HOAT_DONG' ? 'Hoạt động' : 'Bị khóa'}
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <button
                    onClick={() => handleToggleStatus(reader.IDDocGia, reader.taiKhoan?.TrangThai)}
                    style={{
                      backgroundColor: reader.taiKhoan?.TrangThai === 'BI_KHOA' ? '#10b981' : '#fee2e2',
                      color: reader.taiKhoan?.TrangThai === 'BI_KHOA' ? 'white' : '#dc2626',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontSize: '13px',
                      transition: '0.2s'
                    }}
                  >
                    {reader.taiKhoan?.TrangThai === 'BI_KHOA' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                  </button>
                </td>
              </tr>
            ))}
            {filteredReaders.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                  Không tìm thấy độc giả nào khớp với từ khóa tìm kiếm.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ReaderManagement;
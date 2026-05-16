import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { fetchMyBorrowHistory } from '../services/phieuMuonService';
import { updateReaderProfile } from '../services/docGiaService';
import styles from './ReaderAccount.module.css';

const ReaderAccount = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [borrowHistory, setBorrowHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // State phục vụ việc chỉnh sửa thông tin cá nhân
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    HoTen: user?.HoTen || '',
    SoDienThoai: user?.SoDienThoai || '',
    DiaChi: user?.DiaChi || ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const getHistory = async () => {
      try {
        const data = await fetchMyBorrowHistory();
        setBorrowHistory(data);
      } catch (error) {
        console.error("Lỗi khi tải lịch sử mượn sách:", error);
      } finally {
        setLoading(false);
      }
    };
    getHistory();
  }, []);

  // Xử lý thay đổi dữ liệu trong ô input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Gửi dữ liệu cập nhật lên backend
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!phoneRegex.test(formData.SoDienThoai)) {
      alert("Số điện thoại không hợp lệ! Vui lòng nhập đúng 10 chữ số (VD: 0912345678).");
      return; // Dừng lại luôn, không gọi API backend nữa
    }
    try {
      const response = await updateReaderProfile(formData);
      if (response.success) {
        // 1. Cập nhật vào localStorage để đồng bộ toàn ứng dụng (bao gồm cả Navbar)
        const updatedUser = { ...user, ...response.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // 2. Cập nhật state cục bộ để UI thay đổi
        setUser(updatedUser);
        setIsEditing(false);
        setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  return (
    <div className={styles['account-layout']}>
      <Navbar />
      
      <div className={styles['account-container']}>
        {message.text && (
          <div className={`${styles.alert} ${styles[message.type]}`}>
            {message.text}
          </div>
        )}

        {/* PHẦN THÔNG TIN TÀI KHOẢN */}
        <section className={styles['user-info-section']}>
          <div className={styles['section-header-inline']}>
            <h2>Thông tin cá nhân</h2>
            {!isEditing && (
              <button className={styles['btn-edit']} onClick={() => setIsEditing(true)}>
                Chỉnh sửa thông tin
              </button>
            )}
          </div>

          {!isEditing ? (
            // CHẾ ĐỘ XEM THÔNG TIN
            <div className={styles['info-card']}>
              <div className={styles['avatar-large']}>
                {user?.HoTen?.charAt(0) || 'U'}
              </div>
              <div className={styles['details']}>
                <p><strong>Họ và tên:</strong> {user?.HoTen}</p>
                <p><strong>Số điện thoại:</strong> {user?.SoDienThoai || 'Chưa cập nhật'}</p>
                <p><strong>Địa chỉ:</strong> {user?.DiaChi || 'Chưa cập nhật'}</p>
                <p><strong>Loại tài khoản:</strong> Độc giả</p>
              </div>
            </div>
          ) : (
            // CHẾ ĐỘ CHỈNH SỬA (FORM)
            <form onSubmit={handleSaveProfile} className={styles['edit-form']}>
              <div className={styles['form-group']}>
                <label>Họ và tên <span style={{ color: 'red' }}>*</span></label>
                <input 
                  type="text" 
                  name="HoTen" 
                  value={formData.HoTen} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className={styles['form-group']}>
                <label>Số điện thoại</label>
                <input 
                  type="text" 
                  name="SoDienThoai" 
                  value={formData.SoDienThoai} 
                  onChange={handleInputChange} 
                />
              </div>
              <div className={styles['form-group']}>
                <label>Địa chỉ</label>
                <input 
                  type="text" 
                  name="DiaChi" 
                  value={formData.DiaChi} 
                  onChange={handleInputChange} 
                />
              </div>
              <div className={styles['form-actions']}>
                <button type="submit" className={styles['btn-submit']}>Lưu thay đổi</button>
                <button 
                  type="button" 
                  className={styles['btn-cancel']} 
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({ HoTen: user?.HoTen, SoDienThoai: user?.SoDienThoai, DiaChi: user?.DiaChi });
                  }}
                >
                  Hủy
                </button>
              </div>
            </form>
          )}
        </section>

        {/* LỊCH SỬ MƯỢN SÁCH (Giữ nguyên như đã thiết kế) */}
        <section className={styles['history-section']}>
          <h2>Lịch sử mượn sách</h2>
          {loading ? (
            <p>Đang tải dữ liệu...</p>
          ) : borrowHistory.length === 0 ? (
            <p>Bạn chưa có lịch sử mượn sách nào.</p>
          ) : (
            <div className={styles['table-responsive']}>
              <table className={styles['history-table']}>
                <thead>
                  <tr>
                    <th>Mã Phiếu</th>
                    <th>Ngày Mượn</th>
                    <th>Hạn Trả</th>
                    <th>Trạng Thái</th>
                  </tr>
                </thead>
                <tbody>
                  {borrowHistory.map((slip) => (
                    <tr key={slip.IDPhieuMuon}>
                      <td>{slip.IDPhieuMuon}</td>
                      <td>{new Date(slip.NgayMuon).toLocaleDateString('vi-VN')}</td>
                      <td>{new Date(slip.HanTra).toLocaleDateString('vi-VN')}</td>
                      <td>
                        <span className={`${styles.badge} ${styles[slip.TrangThai] || styles.default}`}>
                          {slip.TrangThai}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ReaderAccount;
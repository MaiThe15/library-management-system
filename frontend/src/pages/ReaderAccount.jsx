import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { fetchMyBorrowHistory } from '../services/phieuMuonService';
import { updateReaderProfile } from '../services/docGiaService';
import { fetchMyInvoices } from '../services/hoaDonService';
import phieuDatTruocService from '../services/phieuDatTruocService';
import styles from './ReaderAccount.module.css';

const ReaderAccount = () => {
  const PHI_PHAT_MOI_NGAY = 5000;

  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [borrowHistory, setBorrowHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // State phục vụ việc chỉnh sửa thông tin cá nhân
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    HoTen: user?.HoTen || '',
    SoDienThoai: user?.SoDienThoai || '',
    Email: user?.Email || '',
    MatKhau: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  const [myInvoices, setMyInvoices] = useState([]);

  const [danhSachDatTruoc, setDanhSachDatTruoc] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

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

    const loadInvoices = async () => {
        try {
            const data = await fetchMyInvoices();
            setMyInvoices(data);
        } catch (error) {
            console.error("Lỗi khi tải hóa đơn cá nhân:", error);
        }
    };
    loadInvoices();
  }, []);

  const fetchWaitlist = async () => {
      try {
          const res = await phieuDatTruocService.getMyWaitlist();
          // Lọc ra những phiếu đang có trạng thái CO_SAN
          const listActive = res.data.filter(p => p.TrangThai === 'CO_SAN' || p.TrangThai === 'DANG_CHO');
          setDanhSachDatTruoc(listActive);
      } catch (error) {
          console.error('Lỗi khi tải danh sách đặt trước', error);
      }
  };
  useEffect(() => {
    fetchWaitlist();
  }, []);

  const unpaidInvoices = myInvoices.filter(inv => inv.TrangThai === 'Chưa thanh toán');
  const invoiceDebt = unpaidInvoices.reduce((sum, inv) => sum + inv.SoTien, 0);

  const activeOverdueDebt = borrowHistory.reduce((sum, slip) => {
    if (slip.TrangThai === 'Đang mượn') {
        const ngayHienTai = new Date();
        const hanTra = new Date(slip.HanTra);
        
        // Nếu đã quá hạn trả
        if (ngayHienTai > hanTra) {
            const timeDiff = ngayHienTai.getTime() - hanTra.getTime();
            const soNgayTre = Math.ceil(timeDiff / (1000 * 3600 * 24)); // Quy đổi ra số ngày
            return sum + (soNgayTre * PHI_PHAT_MOI_NGAY);
        }
    }
    return sum;
  }, 0);

  const totalDebt = invoiceDebt + activeOverdueDebt;

  // Xử lý thay đổi dữ liệu trong ô input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Gửi dữ liệu cập nhật lên backend
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    // const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    // if (phoneRegex && !phoneRegex.test(formData.SoDienThoai)) {
    //   alert("Số điện thoại không hợp lệ! Vui lòng nhập đúng 10 chữ số (VD: 0912345678).");
    //   return; // Dừng lại luôn, không gọi API backend nữa
    // }
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

  const handleHuyDatTruoc = async (IDPhieuDat, e) => {
    e.currentTarget.blur();
    if (isProcessing) return;
    if (window.confirm('Bạn có chắc chắn muốn hủy đặt trước cuốn sách này?')) {
      setIsProcessing(true);
      try {
        await phieuDatTruocService.huyDatTruoc(IDPhieuDat);
        alert('Đã hủy thành công!');
        fetchWaitlist(); // Tải lại danh sách
      } catch (error) {
        alert(error.response?.data?.message || 'Lỗi khi hủy');
      } finally {
        setIsProcessing(false);
      }
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
                <p><strong>Email:</strong> {user?.Email || 'Chưa cập nhật'}</p>
                <p><strong>Số điện thoại:</strong> {user?.SoDienThoai || 'Chưa cập nhật'}</p>
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
                <label>Email <span style={{ color: 'red' }}>*</span></label>
                <input 
                  type="email" 
                  name="Email" 
                  value={formData.Email} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className={styles['form-group']}>
                <label>Đổi mật khẩu mới (Bỏ trống nếu không đổi)</label>
                <input 
                  type="password" 
                  name="MatKhau" 
                  value={formData.MatKhau} 
                  onChange={handleInputChange} 
                  placeholder="Nhập mật khẩu mới..."
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
              <div className={styles['form-actions']}>
                <button type="submit" className={styles['btn-submit']}>Lưu thay đổi</button>
                <button 
                  type="button" 
                  className={styles['btn-cancel']} 
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({ HoTen: user?.HoTen, SoDienThoai: user?.SoDienThoai, Email: user?.Email, MatKhau: '' });
                  }}
                >
                  Hủy
                </button>
              </div>
            </form>
          )}
        </section>

        {danhSachDatTruoc.length > 0 && (
          <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '5px', marginBottom: '20px', border: '1px solid #ddd' }}>
              <h4 style={{ margin: '0 0 10px 0' }}>📚 Sách bạn đang đặt trước</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                  {danhSachDatTruoc.map(phieu => (
                      <li key={phieu.IDPhieuDat} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                          <div>
                              <b style={{ color: phieu.TrangThai === 'CO_SAN' ? '#10b981' : '#f59e0b' }}>
                                  {phieu.TrangThai === 'CO_SAN' ? '[ĐÃ CÓ SẴN] ' : '[ĐANG CHỜ] '}
                              </b>
                              Cuốn "{phieu.sach?.TenSach}"
                          </div>
                          
                          <button 
                              onClick={(e) => handleHuyDatTruoc(phieu.IDPhieuDat, e)}
                              disabled={isProcessing}
                              style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }}
                          >
                              Hủy
                          </button>
                      </li>
                  ))}
              </ul>
              {danhSachDatTruoc.some(p => p.TrangThai === 'CO_SAN') && (
                  <p style={{ color: '#155724', backgroundColor: '#d4edda', padding: '8px', borderRadius: '4px', fontSize: '14px' }}>
                      🎉 Có sách đã về! Vui lòng đến thư viện để nhận sách sớm nhất.
                  </p>
              )}
          </div>
        )}

        {/* --- BANNER CẢNH BÁO NỢ PHẠT --- */}
        {unpaidInvoices.length > 0 && (
            <div style={{
                backgroundColor: '#fef2f2', 
                borderLeft: '5px solid #ef4444', 
                padding: '15px 20px', 
                marginBottom: '20px',   
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(239, 68, 68, 0.1)'
            }}>
                <h3 style={{ color: '#b91c1c', margin: '0 0 10px 0', display: 'flex', alignItems: 'center' }}>
                    Cảnh báo nợ phí thư viện!
                </h3>
                <p style={{ margin: '5px 0', color: '#7f1d1d' }}>
                    Bạn hiện đang có <strong>{unpaidInvoices.length}</strong> hóa đơn chưa thanh toán. 
                    Tổng số tiền cần nộp: <strong style={{ fontSize: '1.2rem' }}>{totalDebt.toLocaleString('vi-VN')} VNĐ</strong>.
                </p>
                <p style={{ margin: '0', color: '#7f1d1d', fontSize: '0.9rem' }}>
                    Vui lòng đến quầy Kế toán hoặc gặp Thủ thư để hoàn tất thanh toán, tránh việc tài khoản bị khóa tính năng mượn sách.
                </p>
            </div>
        )}

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
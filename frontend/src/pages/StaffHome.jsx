import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllBooks, fetchBookMetadata } from '../services/bookService';
import styles from './StaffHome.module.css';
import BorrowManagement from '../components/BorrowManagement';
import BookManagement from '../components/BookManagement';
import ReaderManagement from '../components/ReaderManagement';
import InventoryManagement from '../components/InventoryManagement';
import AccountingManagement from '../components/AccountingManagement';
import ManagerDashboard from '../components/ManagerDashboard';
import EmployeeManagement from '../components/EmployeeManagement';

const StaffHome = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  
  const [activeTab, setActiveTab] = useState('quan-ly-danh-muc');

  // Lưu trữ danh mục tổng hợp cấp cao
  const [books, setBooks] = useState([]);
  const [metadata, setMetadata] = useState({ authors: [], locations: [], genres: [] });
  const [loading, setLoading] = useState(true);

  const roleId = user?.IDVaiTro;
  const canViewThuThu = roleId === 1 || roleId === 5 || roleId === 2;
  const canViewKeToan = roleId === 1 || roleId === 5 || roleId === 3;
  const canViewKho    = roleId === 1 || roleId === 5 || roleId === 4;
  const canViewQuanLy = roleId === 1 || roleId === 5;                
  const canViewIT     = roleId === 1;

  // Hàm đồng bộ và làm mới dữ liệu từ server
  const initData = async () => {
    setLoading(true);
    try {
      const [booksData, metaData] = await Promise.all([
        fetchAllBooks(),
        fetchBookMetadata()
      ]);
      setBooks(booksData);
      setMetadata(metaData);
    } catch (error) {
      console.error("Lỗi đồng bộ dữ liệu hệ thống:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initData();
  }, []);

  return (
    <div className={styles.staffContainer}>
      {/* SIDEBAR NAVIGATION - PHÂN RÃ ACTOR */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h3>Hệ thống Quản trị</h3>
          <small>Library Smart System</small>
        </div>
        {canViewThuThu && (
          <div className={styles.actorGroup}>
            <div className={styles.actorTitle}>Thủ thư</div>
            <button 
              className={`${styles.navItem} ${activeTab === 'quan-ly-muon-tra' ? styles.navItemActive : ''}`}
              onClick={() => setActiveTab('quan-ly-muon-tra')}
            >
              Quản lý mượn trả
            </button>
            <button 
              className={`${styles.navItem} ${activeTab === 'thong-tin-doc-gia' ? styles.navItemActive : ''}`}
              onClick={() => setActiveTab('thong-tin-doc-gia')}
            >
              Thông tin độc giả
            </button>
          </div>
        )}

        {canViewKho && (
          <div className={styles.actorGroup}>
            <div className={styles.actorTitle}>Bộ phận kho</div>
            <button 
              className={`${styles.navItem} ${activeTab === 'quan-ly-danh-muc' ? styles.navItemActive : ''}`}
              onClick={() => setActiveTab('quan-ly-danh-muc')}
            >
              Quản lý danh mục sách
            </button>
            {/* <button 
              className={`${styles.navItem} ${activeTab === 'quan-ly-ton-kho' ? styles.navItemActive : ''}`}
              onClick={() => setActiveTab('quan-ly-ton-kho')}
            >
              Quản lý tồn kho
            </button> */}
            <button 
              className={`${styles.navItem} ${activeTab === 'nhap-xuat-sach' ? styles.navItemActive : ''}`}
              onClick={() => setActiveTab('nhap-xuat-sach')}
            >
              Nhập / Xuất sách
            </button>
          </div>
        )}

        {canViewKeToan && (
          <div className={styles.actorGroup}>
            <div className={styles.actorTitle}>Bộ phận kế toán</div>
            <button 
              className={`${styles.navItem} ${activeTab === 'quan-ly-hoa-don' ? styles.navItemActive : ''}`}
              onClick={() => setActiveTab('quan-ly-hoa-don')}
            >
              Quản lý hóa đơn
            </button>
          </div>
        )}

        {canViewQuanLy && (
          <div className={styles.actorGroup}>
            <div className={styles.actorTitle}>Quản lý</div>
            <button 
              className={`${styles.navItem} ${activeTab === 'thong-ke' ? styles.navItemActive : ''}`}
              onClick={() => setActiveTab('thong-ke')}
            >
              Thống kê
            </button>
          </div>
        )}

        {canViewIT && (
          <div className={styles.actorGroup}>
            <div className={styles.actorTitle}>IT</div>
            <button 
              className={`${styles.navItem} ${activeTab === 'quan-ly-tk-nhan-vien' ? styles.navItemActive : ''}`}
              onClick={() => setActiveTab('quan-ly-tk-nhan-vien')}
            >
              Quản lý tài khoản nhân viên
            </button>
          </div>
        )}
      </aside>

      {/* KHU VỰC KHÔNG GIAN LÀM VIỆC CHÍNH */}
      <main className={styles.mainContent}>
        <header className={styles.topHeader}>
          <h2>
            {activeTab === 'quan-ly-muon-tra' && 'Quản lý mượn trả sách'}
            {activeTab === 'thong-tin-doc-gia' && 'Quản lý tài khoản độc giả'}
            {activeTab === 'quan-ly-danh-muc' && 'Quản lý danh mục sách'}
            {activeTab === 'quan-ly-ton-kho' && 'Báo cáo tồn kho chi tiết'}
            {activeTab === 'nhap-xuat-sach' && 'Lịch sử nhập xuất kho'}
            {activeTab === 'quan-ly-hoa-don' && 'Quản lý hóa đơn'}
            {activeTab === 'thong-ke' && 'Thống kê'}
            {activeTab === 'quan-ly-tk-nhan-vien' && 'Quản lý tài khoản nhân viên'}
          </h2>
          <div className={styles.userInfo}>
            <span>Nhân viên: <strong style={{ color: '#2563eb' }}>{user?.HoTen}</strong></span>
            <button onClick={() => { localStorage.clear(); navigate('/login'); }} className={styles.btnLogout}>Đăng xuất</button>
          </div>
        </header>

        <div className={styles.workspace}>
          {/* TAB 1: THỦ THƯ */}
          {activeTab === 'quan-ly-muon-tra' && (
            <BorrowManagement books={books} />
          )}

          {activeTab === 'thong-tin-doc-gia' && (
            <ReaderManagement />
          )}

          {/* TAB 2: BỘ PHẬN KHO */}
          {activeTab === 'quan-ly-danh-muc' && (
            <BookManagement 
              books={books} 
              metadata={metadata} 
              loading={loading} 
              onRefreshBooks={initData} 
            />
          )}
          {activeTab === 'nhap-xuat-sach' && (
            <InventoryManagement />
          )}

          {/*  TAB 3: BỘ PHẬN KẾ TOÁN */}
          {activeTab === 'quan-ly-hoa-don' && (
            <AccountingManagement />
          )}

          {/*  TAB 4: QUẢN LÝ */}
          {activeTab === 'thong-ke' && (
            <ManagerDashboard />
          )}

          {/*  TAB 5: IT */}
          {activeTab === 'quan-ly-tk-nhan-vien' && (
            <EmployeeManagement />
          )}
        </div>
      </main>
    </div>
  );
};

export default StaffHome;
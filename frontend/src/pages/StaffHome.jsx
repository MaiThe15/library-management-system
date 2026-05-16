import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllBooks, fetchBookMetadata } from '../services/bookService';
import styles from './StaffHome.module.css';
import BorrowManagement from '../components/BorrowManagement';
import BookManagement from '../components/BookManagement';
import ReaderManagement from '../components/ReaderManagement';

const StaffHome = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  
  const [activeTab, setActiveTab] = useState('quan-ly-danh-muc');

  // Lưu trữ danh mục tổng hợp cấp cao
  const [books, setBooks] = useState([]);
  const [metadata, setMetadata] = useState({ authors: [], locations: [], genres: [] });
  const [loading, setLoading] = useState(true);

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

        <div className={styles.actorGroup}>
          <div className={styles.actorTitle}>Bộ phận kho</div>
          <button 
            className={`${styles.navItem} ${activeTab === 'quan-ly-danh-muc' ? styles.navItemActive : ''}`}
            onClick={() => setActiveTab('quan-ly-danh-muc')}
          >
            📦 Quản lý danh mục sách
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'quan-ly-ton-kho' ? styles.navItemActive : ''}`}
            onClick={() => setActiveTab('quan-ly-ton-kho')}
          >
            📊 Quản lý tồn kho
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'nhap-xuat-sach' ? styles.navItemActive : ''}`}
            onClick={() => setActiveTab('nhap-xuat-sach')}
          >
            🔄 Nhập / Xuất sách
          </button>
        </div>

        <div className={styles.actorGroup}>
          <div className={styles.actorTitle}>Thủ thư</div>
          <button 
            className={`${styles.navItem} ${activeTab === 'quan-ly-muon-tra' ? styles.navItemActive : ''}`}
            onClick={() => setActiveTab('quan-ly-muon-tra')}
          >
            📖 Quản lý mượn trả
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'thong-tin-doc-gia' ? styles.navItemActive : ''}`}
            onClick={() => setActiveTab('thong-tin-doc-gia')}
          >
            👥 Thông tin độc giả
          </button>
        </div>
      </aside>

      {/* KHU VỰC KHÔNG GIAN LÀM VIỆC CHÍNH */}
      <main className={styles.mainContent}>
        <header className={styles.topHeader}>
          <h2>
            {activeTab === 'quan-ly-danh-muc' && 'Quản lý danh mục sách'}
            {activeTab === 'quan-ly-ton-kho' && 'Báo cáo tồn kho chi tiết'}
            {activeTab === 'nhap-xuat-sach' && 'Lịch sử nhập xuất kho'}
            {activeTab === 'quan-ly-muon-tra' && 'Quản lý mượn trả sách'}
            {activeTab === 'thong-tin-doc-gia' && 'Quản lý tài khoản độc giả'}
          </h2>
          <div className={styles.userInfo}>
            <span>Nhân viên: <strong style={{ color: '#2563eb' }}>{user?.HoTen}</strong></span>
            <button onClick={() => { localStorage.clear(); navigate('/login'); }} className={styles.btnLogout}>Đăng xuất</button>
          </div>
        </header>

        <div className={styles.workspace}>
          {/* TAB 1: QUẢN LÝ DANH MỤC SÁCH */}
          {activeTab === 'quan-ly-danh-muc' && (
            <BookManagement 
              books={books} 
              metadata={metadata} 
              loading={loading} 
              onRefreshBooks={initData} 
            />
          )}

          {/* TAB 2: QUẢN LÝ MƯỢN TRẢ SÁCH */}
          {activeTab === 'quan-ly-muon-tra' && (
            <BorrowManagement books={books} />
          )}

          {activeTab === 'thong-tin-doc-gia' && (
            <ReaderManagement />
          )}

          {/* CÁC PHÂN HỆ CHỜ TÍCH HỢP KHÁC */}
          {activeTab !== 'quan-ly-danh-muc' && activeTab !== 'quan-ly-muon-tra'
          && activeTab !== 'thong-tin-doc-gia'
          && (
            <div className={styles.emptyFeature}>
              <h3>Hệ thống đang kết nối dữ liệu...</h3>
              <p>Màn hình nghiệp vụ của phân hệ <strong>"{activeTab}"</strong> đang chờ tích hợp logic APIs ở các bước sau.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StaffHome;
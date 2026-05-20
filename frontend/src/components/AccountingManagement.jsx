import React, { useState, useEffect } from 'react';
import { fetchAllInvoices, fetchFinancialSummary, payInvoice, createExpenseInvoice } from '../services/hoaDonService';
import styles from './AccountingManagement.module.css';
import sharedStyles from '../pages/StaffHome.module.css';

const AccountingManagement = () => {
    const [invoices, setInvoices] = useState([]);
    const [summary, setSummary] = useState({ tongThu: 0, tongChi: 0, doanhThuThuan: 0 });
    const [loading, setLoading] = useState(true);
    const [filterParams, setFilterParams] = useState('All'); // 'All', 'Chưa thanh toán', 'Đã thanh toán'
    
    // STATE MỚI CHO HÓA ĐƠN CHI
    const [activeTab, setActiveTab] = useState('Thu'); // 'Thu' hoặc 'Chi'
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [lyDo, setLyDo] = useState('');
    const [soTien, setSoTien] = useState('');
    const [isProcessing, setIsProcessing] = useState(false); // Chống click nhiều lần

    const loadData = async () => {
        try {
            setLoading(true);
            const [invoiceData, summaryData] = await Promise.all([
                fetchAllInvoices(),
                fetchFinancialSummary()
            ]);
            setInvoices(invoiceData);
            setSummary(summaryData);
        } catch (error) {
            console.error("Lỗi tải dữ liệu kế toán:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handlePay = async (id, loaiHoaDon) => {
        const actionText = loaiHoaDon === 'Thu' ? 'thu đủ tiền mặt từ độc giả' : 'xuất quỹ chi tiền';
        if (window.confirm(`Xác nhận đã ${actionText} cho hóa đơn này?`)) {
            try {
                await payInvoice(id);
                alert(`✅ ${loaiHoaDon === 'Thu' ? 'Thu' : 'Chi'} tiền thành công!`);
                loadData(); // Tải lại bảng và cập nhật lại Dashboard
            } catch (error) {
                alert(`Lỗi: ${error.response?.data?.message || error.message}`);
            }
        }
    };

    // HÀM TẠO HÓA ĐƠN CHI THỦ CÔNG
    const handleCreateExpense = async (e) => {
        e.preventDefault();
        if (isProcessing) return;

        if (!lyDo || !soTien) return alert("Vui lòng nhập đầy đủ lý do và số tiền!");

        setIsProcessing(true);
        try {
            await createExpenseInvoice({ lyDo, soTien: Number(soTien) });
            alert('🎉 Tạo hóa đơn chi thành công!');
            setIsModalOpen(false);
            setLyDo('');
            setSoTien('');
            loadData(); // Cập nhật lại danh sách
        } catch (error) {
            alert(`Lỗi: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    // Lọc hóa đơn theo Tab và Trạng thái
    const filteredInvoices = invoices.filter(inv => {
        const matchTab = inv.LoaiHoaDon === activeTab;
        const matchStatus = filterParams === 'All' ? true : inv.TrangThai === filterParams;
        return matchTab && matchStatus;
    });

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleString('vi-VN');
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.pageTitle}>💰 Bảng Điều Khiển Kế Toán</h2>

            {/* Khối Thống kê Tổng quan (Dashboard) */}
            <div className={styles.summaryCards}>
                <div className={`${styles.card} ${styles.cardIncome}`}>
                    <h4>Tổng Thu (Đã thanh toán)</h4>
                    <p>{summary.tongThu?.toLocaleString('vi-VN')} đ</p>
                </div>
                <div className={`${styles.card} ${styles.cardExpense}`}>
                    <h4>Tổng Chi</h4>
                    <p>{summary.tongChi?.toLocaleString('vi-VN')} đ</p>
                </div>
                <div className={`${styles.card} ${styles.cardNet}`}>
                    <h4>Doanh Thu Thuần</h4>
                    <p>{summary.doanhThuThuan?.toLocaleString('vi-VN')} đ</p>
                </div>
            </div>

            {/* Bảng Quản lý Hóa đơn */}
            <div className={styles.tableSection}>
                <div className={styles.tableControls} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    
                    {/* TAB ĐIỀU HƯỚNG */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                            onClick={() => setActiveTab('Thu')} 
                            style={{ 
                                padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold',
                                backgroundColor: activeTab === 'Thu' ? '#10b981' : '#e5e7eb',
                                color: activeTab === 'Thu' ? 'white' : '#374151'
                            }}
                        >
                            📥 Hóa Đơn Thu
                        </button>
                        <button 
                            onClick={() => setActiveTab('Chi')} 
                            style={{ 
                                padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold',
                                backgroundColor: activeTab === 'Chi' ? '#ef4444' : '#e5e7eb',
                                color: activeTab === 'Chi' ? 'white' : '#374151'
                            }}
                        >
                            📤 Hóa Đơn Chi
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <select 
                            value={filterParams} 
                            onChange={(e) => setFilterParams(e.target.value)}
                            className={styles.filterSelect}
                        >
                            <option value="All">Tất cả trạng thái</option>
                            <option value="Chưa thanh toán">{activeTab === 'Thu' ? 'Chờ thu tiền' : 'Chờ duyệt chi'}</option>
                            <option value="Đã thanh toán">Đã thanh toán</option>
                        </select>

                        {/* NÚT TẠO HÓA ĐƠN CHI HIỆN RA KHI Ở TAB "CHI" */}
                        {activeTab === 'Chi' && (
                            <button 
                                onClick={() => setIsModalOpen(true)}
                                style={{ backgroundColor: '#2563eb', color: 'white', padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: '500' }}
                            >
                                ➕ Tạo phiếu chi mới
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <p>Đang tải dữ liệu kế toán...</p>
                ) : (
                    <table className={styles.invoiceTable}>
                        <thead>
                            <tr>
                                <th>Mã HĐ</th>
                                <th>Người nộp / Nhận</th>
                                <th>Loại</th>
                                <th>Lý do</th>
                                <th>Số tiền</th>
                                <th>Ngày lập</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInvoices.map((inv) => (
                                <tr key={inv.IDHoaDon}>
                                    <td><strong>#{inv.IDHoaDon}</strong></td>
                                    <td>
                                        {inv.docGia ? (
                                            <div>
                                                <span className={styles.readerName}>{inv.docGia.HoTen}</span>
                                                <br />
                                                <small>{inv.docGia.SoDienThoai}</small>
                                            </div>
                                        ) : (
                                            <span style={{ color: '#888' }}>Đối tác / Nội bộ</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={inv.LoaiHoaDon === 'Thu' ? styles.tagIncome : styles.tagExpense}>
                                            {inv.LoaiHoaDon}
                                        </span>
                                    </td>
                                    <td style={{ maxWidth: '200px' }}>{inv.LyDo}</td>
                                    <td className={styles.amount} style={{ color: inv.LoaiHoaDon === 'Thu' ? '#10b981' : '#ef4444' }}>
                                        {inv.LoaiHoaDon === 'Thu' ? '+' : '-'}{inv.SoTien.toLocaleString('vi-VN')} đ
                                    </td>
                                    <td>{formatDate(inv.createdAt)}</td>
                                    <td>
                                        <span className={inv.TrangThai === 'Đã thanh toán' ? styles.statusPaid : styles.statusUnpaid}>
                                            {inv.TrangThai}
                                        </span>
                                    </td>
                                    <td>
                                        {inv.TrangThai === 'Chưa thanh toán' && (
                                            <button 
                                                className={styles.btnPay}
                                                style={{ backgroundColor: inv.LoaiHoaDon === 'Thu' ? '#10b981' : '#ef4444' }}
                                                onClick={() => handlePay(inv.IDHoaDon, inv.LoaiHoaDon)}
                                            >
                                                {inv.LoaiHoaDon === 'Thu' ? 'Thu Tiền' : 'Chi Tiền'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredInvoices.length === 0 && (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                                        Không tìm thấy hóa đơn nào phù hợp.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* MODAL TẠO HÓA ĐƠN CHI THỦ CÔNG */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', width: '400px', maxWidth: '90%' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#1f2937' }}>➕ Lập Hóa Đơn Chi (Xuất Quỹ)</h3>
                        
                        <form onSubmit={handleCreateExpense}>
                            <div className={sharedStyles.formGroup}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Lý do chi tiền (*)</label>
                                <input 
                                    type="text" 
                                    className={sharedStyles.formInput}
                                    placeholder="VD: Tiền bảo trì điều hòa, mua văn phòng phẩm..." 
                                    value={lyDo}
                                    onChange={(e) => setLyDo(e.target.value)}
                                    required
                                />
                            </div>
                            
                            <div className={sharedStyles.formGroup} style={{ marginTop: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Số tiền (VNĐ) (*)</label>
                                <input 
                                    type="number" 
                                    className={sharedStyles.formInput}
                                    placeholder="Nhập số tiền..." 
                                    value={soTien}
                                    onChange={(e) => setSoTien(e.target.value)}
                                    min="1"
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '25px' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: 'white', cursor: 'pointer' }}>
                                    Hủy
                                </button>
                                <button type="submit" disabled={isProcessing} style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', backgroundColor: '#2563eb', color: 'white', cursor: isProcessing ? 'not-allowed' : 'pointer' }}>
                                    {isProcessing ? 'Đang xử lý...' : 'Xác Nhận Tạo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountingManagement;
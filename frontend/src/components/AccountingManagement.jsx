import React, { useState, useEffect } from 'react';
import { fetchAllInvoices, fetchFinancialSummary, payInvoice } from '../services/hoaDonService';
import styles from './AccountingManagement.module.css';
import sharedStyles from '../pages/StaffHome.module.css';

const AccountingManagement = () => {
    const [invoices, setInvoices] = useState([]);
    const [summary, setSummary] = useState({ tongThu: 0, tongChi: 0, doanhThuThuan: 0 });
    const [loading, setLoading] = useState(true);
    const [filterParams, setFilterParams] = useState('All'); // 'All', 'Chưa thanh toán', 'Đã thanh toán'

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

    const handlePay = async (id) => {
        if (window.confirm('Xác nhận đã thu đủ tiền mặt từ độc giả cho hóa đơn này?')) {
            try {
                await payInvoice(id);
                alert('✅ Thu tiền thành công!');
                loadData(); // Tải lại bảng và cập nhật lại Dashboard tổng thu
            } catch (error) {
                alert(`Lỗi: ${error.response?.data?.message || error.message}`);
            }
        }
    };

    const filteredInvoices = invoices.filter(inv => {
        if (filterParams === 'All') return true;
        return inv.TrangThai === filterParams;
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
                <div className={styles.tableControls}>
                    <h3>Danh sách Hóa đơn & Biên lai</h3>
                    <select 
                        value={filterParams} 
                        onChange={(e) => setFilterParams(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="All">Tất cả trạng thái</option>
                        <option value="Chưa thanh toán">Chờ thu tiền</option>
                        <option value="Đã thanh toán">Đã thanh toán</option>
                    </select>
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
                                            <span style={{ color: '#888' }}>Nội bộ / Khác</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={inv.LoaiHoaDon === 'Thu' ? styles.tagIncome : styles.tagExpense}>
                                            {inv.LoaiHoaDon}
                                        </span>
                                    </td>
                                    <td style={{ maxWidth: '200px' }}>{inv.LyDo}</td>
                                    <td className={styles.amount}>
                                        {inv.SoTien.toLocaleString('vi-VN')} đ
                                    </td>
                                    <td>{formatDate(inv.createdAt)}</td>
                                    <td>
                                        <span className={inv.TrangThai === 'Đã thanh toán' ? styles.statusPaid : styles.statusUnpaid}>
                                            {inv.TrangThai}
                                        </span>
                                    </td>
                                    <td>
                                        {inv.LoaiHoaDon === 'Thu' && inv.TrangThai === 'Chưa thanh toán' && (
                                            <button 
                                                className={styles.btnPay}
                                                onClick={() => handlePay(inv.IDHoaDon)}
                                            >
                                                Thu Tiền
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
        </div>
    );
};

export default AccountingManagement;
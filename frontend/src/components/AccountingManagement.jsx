import React, { useState, useEffect } from 'react';
import { fetchAllInvoices, fetchFinancialSummary, payInvoice, createExpenseInvoice } from '../services/hoaDonService';
import sharedStyles from '../pages/StaffHome.module.css';

const AccountingManagement = () => {
    const [invoices, setInvoices] = useState([]);
    const [summary, setSummary] = useState({ tongThu: 0, tongChi: 0, doanhThuThuan: 0 });
    const [loading, setLoading] = useState(true);
    const [filterParams, setFilterParams] = useState('All'); 
    
    const [activeTab, setActiveTab] = useState('Thu'); 
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [lyDo, setLyDo] = useState('');
    const [soTien, setSoTien] = useState('');
    const [isProcessing, setIsProcessing] = useState(false); 

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

    useEffect(() => { loadData(); }, []);

    const handlePay = async (id, loaiHoaDon) => {
        const actionText = loaiHoaDon === 'Thu' ? 'thu đủ tiền mặt từ độc giả' : 'xuất quỹ chi tiền';
        if (window.confirm(`Xác nhận đã ${actionText} cho hóa đơn này?`)) {
            try {
                await payInvoice(id);
                alert(`✅ ${loaiHoaDon === 'Thu' ? 'Thu' : 'Chi'} tiền thành công!`);
                loadData(); 
            } catch (error) {
                alert(`Lỗi: ${error.response?.data?.message || error.message}`);
            }
        }
    };

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
            loadData(); 
        } catch (error) {
            alert(`Lỗi: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const filteredInvoices = invoices.filter(inv => {
        const matchTab = inv.LoaiHoaDon === activeTab;
        const matchStatus = filterParams === 'All' ? true : inv.TrangThai === filterParams;
        return matchTab && matchStatus;
    });

    const formatDate = (dateStr) => new Date(dateStr).toLocaleString('vi-VN');

    return (
        <div style={{ width: '100%' }}>
            <h2 style={{ color: '#1f2937', marginBottom: '24px', fontSize: '22px' }}>Quản Lý Hóa Đơn</h2>

            {/* THỐNG KÊ TỔNG QUAN */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '250px', padding: '24px', borderRadius: '12px', color: 'white', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontWeight: '500', fontSize: '1.1rem', opacity: 0.9 }}>Tổng Thu</h4>
                    <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>{summary.tongThu?.toLocaleString('vi-VN')} đ</p>
                </div>
                <div style={{ flex: 1, minWidth: '250px', padding: '24px', borderRadius: '12px', color: 'white', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontWeight: '500', fontSize: '1.1rem', opacity: 0.9 }}>Tổng Chi</h4>
                    <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>{summary.tongChi?.toLocaleString('vi-VN')} đ</p>
                </div>
                <div style={{ flex: 1, minWidth: '250px', padding: '24px', borderRadius: '12px', color: 'white', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontWeight: '500', fontSize: '1.1rem', opacity: 0.9 }}>Doanh Thu</h4>
                    <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>{summary.doanhThuThuan?.toLocaleString('vi-VN')} đ</p>
                </div>
            </div>

            {/* BẢNG QUẢN LÝ HÓA ĐƠN */}
            <div className={sharedStyles.tablePanel}>
                <div className={sharedStyles.tableControls} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    
                    {/* TAB ĐIỀU HƯỚNG */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                            onClick={() => setActiveTab('Thu')} 
                            style={{ 
                                padding: '10px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px', transition: '0.2s',
                                backgroundColor: activeTab === 'Thu' ? '#10b981' : '#f1f5f9',
                                color: activeTab === 'Thu' ? 'white' : '#475569'
                            }}
                        >
                            Hóa Đơn Thu
                        </button>
                        <button 
                            onClick={() => setActiveTab('Chi')} 
                            style={{ 
                                padding: '10px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px', transition: '0.2s',
                                backgroundColor: activeTab === 'Chi' ? '#ef4444' : '#f1f5f9',
                                color: activeTab === 'Chi' ? 'white' : '#475569'
                            }}
                        >
                            Hóa Đơn Chi
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <select 
                            value={filterParams} 
                            onChange={(e) => setFilterParams(e.target.value)}
                            className={sharedStyles.formSelect}
                            style={{ width: 'auto', minWidth: '180px' }}
                        >
                            <option value="All">Tất cả trạng thái</option>
                            <option value="Chưa thanh toán">{activeTab === 'Thu' ? 'Chờ thu tiền' : 'Chờ duyệt chi'}</option>
                            <option value="Đã thanh toán">Đã thanh toán</option>
                        </select>

                        {activeTab === 'Chi' && (
                            <button className={sharedStyles.btnAddBook} onClick={() => setIsModalOpen(true)}>
                                <span>➕ Tạo phiếu chi mới</span>
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <p style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Đang tải dữ liệu kế toán...</p>
                ) : (
                    <table className={sharedStyles.dataTable}>
                        <thead>
                            <tr>
                                <th>Mã HĐ</th>
                                <th>Người nộp / Nhận</th>
                                <th>Loại</th>
                                <th>Lý do</th>
                                <th>Số tiền</th>
                                <th>Ngày lập</th>
                                <th style={{ textAlign: 'center' }}>Trạng thái</th>
                                <th style={{ textAlign: 'center' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInvoices.map((inv) => (
                                <tr key={inv.IDHoaDon}>
                                    <td style={{ fontWeight: 'bold', color: '#2563eb' }}>#{inv.IDHoaDon}</td>
                                    <td>
                                        {inv.docGia ? (
                                            <div>
                                                <span style={{ fontWeight: '600', color: '#1f2937' }}>{inv.docGia.HoTen}</span><br />
                                                <small style={{ color: '#64748b' }}>{inv.docGia.SoDienThoai}</small>
                                            </div>
                                        ) : (
                                            <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Đối tác / Nội bộ</span>
                                        )}
                                    </td>
                                    <td>
                                        <span style={{ 
                                            backgroundColor: inv.LoaiHoaDon === 'Thu' ? '#dcfce7' : '#fee2e2', 
                                            color: inv.LoaiHoaDon === 'Thu' ? '#166534' : '#991b1b', 
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' 
                                        }}>
                                            {inv.LoaiHoaDon}
                                        </span>
                                    </td>
                                    <td style={{ maxWidth: '220px', color: '#334155' }}>{inv.LyDo}</td>
                                    <td style={{ fontWeight: 'bold', color: inv.LoaiHoaDon === 'Thu' ? '#10b981' : '#ef4444' }}>
                                        {inv.LoaiHoaDon === 'Thu' ? '+' : '-'}{inv.SoTien.toLocaleString('vi-VN')} đ
                                    </td>
                                    <td style={{ color: '#475569' }}>{formatDate(inv.createdAt)}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span className={`${sharedStyles.statusBadge} ${inv.TrangThai === 'Đã thanh toán' ? sharedStyles.statusAvailable : sharedStyles.statusEmpty}`}>
                                            {inv.TrangThai}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        {inv.TrangThai === 'Chưa thanh toán' && (
                                            <button 
                                                onClick={() => handlePay(inv.IDHoaDon, inv.LoaiHoaDon)}
                                                style={{ 
                                                    backgroundColor: inv.LoaiHoaDon === 'Thu' ? '#10b981' : '#ef4444', 
                                                    color: 'white', border: 'none', padding: '6px 14px', borderRadius: '6px', 
                                                    cursor: 'pointer', fontWeight: '500', fontSize: '13px' 
                                                }}
                                            >
                                                {inv.LoaiHoaDon === 'Thu' ? 'Nhận Tiền' : 'Chi Tiền'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredInvoices.length === 0 && (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
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
                <div className={sharedStyles.modalOverlay}>
                    <div className={sharedStyles.modalContent} style={{ maxWidth: '450px' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#ef4444' }}>➕ Lập Hóa Đơn Chi (Xuất Quỹ)</h3>
                        
                        <form onSubmit={handleCreateExpense}>
                            <div className={sharedStyles.formGroup}>
                                <label>Lý do chi tiền (*)</label>
                                <input 
                                    type="text" 
                                    className={sharedStyles.formInput}
                                    placeholder="VD: Tiền bảo trì điều hòa, mua văn phòng phẩm..." 
                                    value={lyDo}
                                    onChange={(e) => setLyDo(e.target.value)}
                                    required
                                />
                            </div>
                            
                            <div className={sharedStyles.formGroup}>
                                <label>Số tiền (VNĐ) (*)</label>
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

                            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                <button type="submit" className={sharedStyles.btnSubmit} disabled={isProcessing} style={{ flex: 1, backgroundColor: '#ef4444', opacity: isProcessing ? 0.7 : 1 }}>
                                    {isProcessing ? 'Đang xử lý...' : 'Xác Nhận Tạo'}
                                </button>
                                <button type="button" onClick={() => setIsModalOpen(false)} className={sharedStyles.btnCancel} style={{ flex: 1 }}>
                                    Đóng lại
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
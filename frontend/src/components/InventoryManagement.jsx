import React, { useState, useEffect } from 'react';
import { phieuKhoService } from '../services/phieuKhoService';
import { fetchAllBooks } from '../services/bookService'; 
import sharedStyles from '../pages/StaffHome.module.css'; // Sử dụng Layout chuẩn

const InventoryManagement = () => {
    const [books, setBooks] = useState([]);
    const [loaiPhieu, setLoaiPhieu] = useState('Nhập');
    const [ghiChu, setGhiChu] = useState('');
    const [chiTietSachs, setChiTietSachs] = useState([{ IDSach: '', SoLuong: 1, DonGia: 0 }]);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('success');

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const res = await fetchAllBooks();
                const bookData = res.data?.data || res.data || res; 
                if (Array.isArray(bookData)) {
                    setBooks(bookData);
                }
            } catch (error) {
                console.error("Lỗi khi tải danh sách sách:", error);
            }
        };
        fetchBooks();
    }, []);

    const handleAddRow = () => setChiTietSachs([...chiTietSachs, { IDSach: '', SoLuong: 1, DonGia: 0 }]);
    const handleRemoveRow = (index) => setChiTietSachs([...chiTietSachs].filter((_, i) => i !== index));

    const handleChangeRow = (e, index) => {
        const { name, value } = e.target;
        const list = [...chiTietSachs];
        list[index][name] = name === 'IDSach' ? value : Number(value);
        setChiTietSachs(list);
    };

    const tongTien = chiTietSachs.reduce((sum, item) => sum + (item.SoLuong * item.DonGia), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const isValid = chiTietSachs.every(item => item.IDSach !== '' && item.SoLuong > 0);
        if (!isValid) {
            setMessage('Vui lòng chọn sách và nhập số lượng hợp lệ cho tất cả các dòng.');
            setMessageType('error');
            return;
        }

        const formattedChiTiet = chiTietSachs.map(item => ({ ...item, IDSach: Number(item.IDSach) }));
        const payload = { LoaiPhieu: loaiPhieu, GhiChu: ghiChu, chiTietSachs: formattedChiTiet };

        try {
            const res = await phieuKhoService.createPhieuKho(payload);
            setMessage(res.message || 'Tạo phiếu kho thành công!');
            setMessageType('success');
            setLoaiPhieu('Nhập');
            setGhiChu('');
            setChiTietSachs([{ IDSach: '', SoLuong: 1, DonGia: 0 }]);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Đã xảy ra lỗi khi tạo phiếu kho.');
            setMessageType('error');
        }
    };

    return (
        <div className={sharedStyles.tablePanel}>
            <div className={sharedStyles.tableControls}>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>Quản Lý Nhập / Xuất Kho</h3>
            </div>
            
            {message && (
                <div style={{
                    padding: '12px 16px',
                    borderRadius: '6px',
                    marginBottom: '20px',
                    fontWeight: '500',
                    backgroundColor: messageType === 'success' ? '#dcfce7' : '#fee2e2',
                    color: messageType === 'success' ? '#166534' : '#b91c1c',
                    borderLeft: `4px solid ${messageType === 'success' ? '#22c55e' : '#ef4444'}`
                }}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
                    <div className={sharedStyles.formGroup} style={{ flex: 1 }}>
                        <label>Loại phiếu:</label>
                        <select value={loaiPhieu} onChange={(e) => setLoaiPhieu(e.target.value)} className={sharedStyles.formSelect}>
                            <option value="Nhập">Nhập sách (Tăng kho)</option>
                            <option value="Xuất">Xuất thanh lý/hỏng (Giảm kho)</option>
                        </select>
                    </div>

                    <div className={sharedStyles.formGroup} style={{ flex: 2 }}>
                        <label>Ghi chú:</label>
                        <input 
                            type="text"
                            value={ghiChu} 
                            onChange={(e) => setGhiChu(e.target.value)}
                            placeholder="Ví dụ: Nhập lô sách tháng 5..."
                            className={sharedStyles.formInput}
                        />
                    </div>
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                    <h4 style={{ margin: '0 0 16px 0', color: '#334155' }}>Chi tiết danh mục sách trong phiếu</h4>
                    <table className={sharedStyles.dataTable} style={{ marginBottom: '16px' }}>
                        <thead>
                            <tr>
                                <th style={{ width: '40%' }}>Tên Sách</th>
                                <th style={{ width: '15%' }}>Số lượng</th>
                                <th style={{ width: '20%' }}>Đơn giá (VNĐ)</th>
                                <th style={{ width: '15%' }}>Thành tiền</th>
                                <th style={{ width: '10%', textAlign: 'center' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {chiTietSachs.map((item, index) => (
                                <tr key={index}>
                                    <td>
                                        <select name="IDSach" value={item.IDSach} onChange={(e) => handleChangeRow(e, index)} required className={sharedStyles.formSelect}>
                                            <option value="">-- Chọn sách --</option>
                                            {books.map(book => (
                                                <option key={book.IDSach} value={book.IDSach}>{book.TenSach}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        <input type="number" name="SoLuong" min="1" value={item.SoLuong} onChange={(e) => handleChangeRow(e, index)} required className={sharedStyles.formInput} />
                                    </td>
                                    <td>
                                        <input type="number" name="DonGia" min="0" step="1000" value={item.DonGia} onChange={(e) => handleChangeRow(e, index)} className={sharedStyles.formInput} />
                                    </td>
                                    <td style={{ fontWeight: '500', color: '#2563eb' }}>
                                        {(item.SoLuong * item.DonGia).toLocaleString('vi-VN')} đ
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        {chiTietSachs.length > 1 && (
                                            <button type="button" className={sharedStyles.btnDelete} onClick={() => handleRemoveRow(index)}>Xóa</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button type="button" className={sharedStyles.btnAddBook} onClick={handleAddRow} style={{ backgroundColor: '#f1f5f9', color: '#2563eb', border: '1px dashed #2563eb' }}>
                            + Thêm dòng sách
                        </button>
                        
                        <div style={{ fontSize: '15px' }}>
                            <strong style={{ color: '#475569' }}>Tổng giá trị phiếu: </strong> 
                            <span style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '18px', marginLeft: '8px' }}>
                                {tongTien.toLocaleString('vi-VN')} VNĐ
                            </span>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '30px', borderTop: '1px solid #e2e8f0', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" className={sharedStyles.btnSubmit} style={{ width: 'auto', padding: '10px 24px', backgroundColor: '#10b981', fontSize: '15px' }}>
                        Lưu Chốt Phiếu Kho
                    </button>
                </div>
            </form>
        </div>
    );
};

export default InventoryManagement;
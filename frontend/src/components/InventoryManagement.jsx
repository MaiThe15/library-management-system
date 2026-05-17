import React, { useState, useEffect } from 'react';
import { phieuKhoService } from '../services/phieuKhoService';
import { fetchAllBooks } from '../services/bookService'; // Giả sử bạn đã có service này
import styles from './InventoryManagement.module.css';

const InventoryManagement = () => {
    const [books, setBooks] = useState([]);
    const [loaiPhieu, setLoaiPhieu] = useState('Nhập');
    const [ghiChu, setGhiChu] = useState('');
    const [chiTietSachs, setChiTietSachs] = useState([
        { IDSach: '', SoLuong: 1, DonGia: 0 } // Khởi tạo 1 dòng trống mặc định
    ]);
    const [message, setMessage] = useState('');

    // Lấy danh sách sách để đưa vào Dropdown
    useEffect(() => {
        const fetchBooks = async () => {
            try {
                // Tùy thuộc vào cấu trúc trả về của bookService hiện tại của bạn
                const res = await fetchAllBooks();
                console.log("Dữ liệu sách tải về:", res);
                const bookData = res.data?.data || res.data || res; 
                
                if (Array.isArray(bookData)) {
                    setBooks(bookData);
                } else {
                    console.error("Dữ liệu sách không phải là mảng:", bookData);
                } 
            } catch (error) {
                console.error("Lỗi khi tải danh sách sách:", error);
            }
        };
        fetchBooks();
    }, []);

    // Xử lý thêm 1 dòng sách mới vào form
    const handleAddRow = () => {
        setChiTietSachs([...chiTietSachs, { IDSach: '', SoLuong: 1, DonGia: 0 }]);
    };

    // Xử lý xóa 1 dòng sách khỏi form
    const handleRemoveRow = (index) => {
        const list = [...chiTietSachs];
        list.splice(index, 1);
        setChiTietSachs(list);
    };

    // Cập nhật dữ liệu khi người dùng nhập vào 1 dòng cụ thể
    const handleChangeRow = (e, index) => {
        const { name, value } = e.target;
        const list = [...chiTietSachs];
        list[index][name] = name === 'IDSach' ? value : Number(value);
        setChiTietSachs(list);
    };

    // Tính tổng tiền realtime
    const tongTien = chiTietSachs.reduce((sum, item) => sum + (item.SoLuong * item.DonGia), 0);

    // Gửi dữ liệu lên API
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Nút submit đã được bấm!"); // Kiểm tra xem hàm có chạy không
        
        const isValid = chiTietSachs.every(item => item.IDSach !== '' && item.SoLuong > 0);
        if (!isValid) {
            setMessage('Vui lòng chọn sách và nhập số lượng hợp lệ cho tất cả các dòng.');
            return;
        }

        // Ép kiểu IDSach thành Number để an toàn đưa xuống Database
        const formattedChiTiet = chiTietSachs.map(item => ({
            ...item,
            IDSach: Number(item.IDSach)
        }));

        const payload = {
            LoaiPhieu: loaiPhieu,
            GhiChu: ghiChu,
            chiTietSachs: formattedChiTiet
        };

        console.log("Dữ liệu chuẩn bị gửi đi:", payload);

        try {
            const res = await phieuKhoService.createPhieuKho(payload);
            setMessage(res.message || 'Tạo phiếu kho thành công!');
            setLoaiPhieu('Nhập');
            setGhiChu('');
            setChiTietSachs([{ IDSach: '', SoLuong: 1, DonGia: 0 }]);
        } catch (error) {
            console.error("Lỗi API:", error);
            setMessage(error.response?.data?.message || 'Đã xảy ra lỗi khi tạo phiếu kho.');
        }
    };

    return (
        <div className={styles.container}>
            <h2>Quản lý Nhập / Xuất Kho</h2>
            
            {message && <div className={styles.alert}>{message}</div>}

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label>Loại phiếu:</label>
                    <select value={loaiPhieu} onChange={(e) => setLoaiPhieu(e.target.value)}>
                        <option value="Nhập">Nhập sách (Tăng kho)</option>
                        <option value="Xuất">Xuất thanh lý/hỏng (Giảm kho)</option>
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label>Ghi chú:</label>
                    <textarea 
                        rows="3" 
                        value={ghiChu} 
                        onChange={(e) => setGhiChu(e.target.value)}
                        placeholder="Ví dụ: Nhập lô sách tháng 5..."
                    />
                </div>

                <div className={styles.detailsSection}>
                    <h3>Chi tiết sách</h3>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Sách</th>
                                <th>Số lượng</th>
                                <th>Đơn giá (VNĐ)</th>
                                <th>Thành tiền</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {chiTietSachs.map((item, index) => (
                                <tr key={index}>
                                    <td>
                                        <select 
                                            name="IDSach" 
                                            value={item.IDSach} 
                                            onChange={(e) => handleChangeRow(e, index)}
                                            required
                                        >
                                            <option value="">-- Chọn sách --</option>
                                            {books.map(book => (
                                                <option key={book.IDSach} value={book.IDSach}>
                                                    {book.TenSach}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        <input 
                                            type="number" 
                                            name="SoLuong" 
                                            min="1" 
                                            value={item.SoLuong} 
                                            onChange={(e) => handleChangeRow(e, index)} 
                                            required 
                                        />
                                    </td>
                                    <td>
                                        <input 
                                            type="number" 
                                            name="DonGia" 
                                            min="0" 
                                            step="1000"
                                            value={item.DonGia} 
                                            onChange={(e) => handleChangeRow(e, index)} 
                                        />
                                    </td>
                                    <td>
                                        {(item.SoLuong * item.DonGia).toLocaleString('vi-VN')} đ
                                    </td>
                                    <td>
                                        {chiTietSachs.length > 1 && (
                                            <button 
                                                type="button" 
                                                className={styles.btnRemove} 
                                                onClick={() => handleRemoveRow(index)}
                                            >
                                                Xóa
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    <button type="button" className={styles.btnAdd} onClick={handleAddRow}>
                        + Thêm dòng sách
                    </button>
                </div>

                <div className={styles.summary}>
                    <strong>Tổng giá trị phiếu: </strong> 
                    <span className={styles.totalPrice}>{tongTien.toLocaleString('vi-VN')} VNĐ</span>
                </div>

                <button type="submit" className={styles.btnSubmit}>Lưu Phiếu Kho</button>
            </form>
        </div>
    );
};

export default InventoryManagement;
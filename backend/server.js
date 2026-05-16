const express = require('express');
const cors = require('cors'); // 1. Import thư viện cors
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const phieuMuonRoutes = require('./routes/phieuMuonRoutes');
const docGiaRoutes = require('./routes/docGiaRoutes');
const path = require('path');

const app = express();

// 2. Sử dụng Middleware CORS (Cho phép tất cả các nguồn truy cập)
// Nên đặt nó ở trên cùng, trước khi xử lý JSON hay Routes
app.use(cors()); 
app.use(express.json()); 

// Khi Frontend gọi link http://localhost:5000/uploads/ten_anh.jpg thì sẽ xem được ảnh
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Cấu hình đường dẫn API
app.use('/api/auth', authRoutes);

app.use('/api/books', bookRoutes);

app.use('/api/phieumuon', phieuMuonRoutes);

app.use('/api/docgia', docGiaRoutes);

// Khởi chạy server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});
const express = require('express');
const cors = require('cors'); // 1. Import thư viện cors
require('dotenv').config();

const app = express();

// 2. Sử dụng Middleware CORS (Cho phép tất cả các nguồn truy cập)
// Nên đặt nó ở trên cùng, trước khi xử lý JSON hay Routes
app.use(cors()); 

app.use(express.json()); 

// Import các Routes
const authRoutes = require('./routes/authRoutes');

// Cấu hình đường dẫn API
app.use('/api/auth', authRoutes);

// Khởi chạy server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});
const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync(process.env.DB_SSL_CA).toString(),
  },
});

// Kiểm tra kết nối khi khởi động
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Lỗi kết nối PostgreSQL:', err.stack);
  }
  console.log('Đã kết nối thành công tới Aiven PostgreSQL!');
  release();
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
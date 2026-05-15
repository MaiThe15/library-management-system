require('dotenv').config();

module.exports = {
  development: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Bắt buộc cho Aiven PostgreSQL
      }
    },
    logging: false // Tắt log SQL cho đỡ rối terminal (có thể bật lại khi cần debug)
  },
  // Có thể copy cấu hình này cho test và production sau
};
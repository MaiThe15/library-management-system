'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TheLoai_Sach extends Model {
    static associate(models) {
      // Thường bảng trung gian không cần cấu hình thêm associate 
      // vì đã được định nghĩa ở belongsToMany của Sach và TheLoai
    }
  }
  TheLoai_Sach.init({
    IDSach: { type: DataTypes.INTEGER, primaryKey: true },
    IDTheLoai: { type: DataTypes.INTEGER, primaryKey: true }
  }, {
    sequelize,
    modelName: 'TheLoai_Sach',
    tableName: 'TheLoai_Sachs'
  });
  return TheLoai_Sach;
};
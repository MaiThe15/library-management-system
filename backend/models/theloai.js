'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TheLoai extends Model {
    static associate(models) {
      // Quan hệ nhiều - nhiều với Sách thông qua bảng trung gian TheLoai_Sachs
      TheLoai.belongsToMany(models.Sach, { 
        through: 'TheLoai_Sachs', 
        foreignKey: 'IDTheLoai', 
        as: 'sachs' 
      });
    }
  }
  TheLoai.init({
    IDTheLoai: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    TenTheLoai: { type: DataTypes.STRING, allowNull: false, unique: true }
  }, {
    sequelize,
    modelName: 'TheLoai',
    tableName: 'TheLoais'
  });
  return TheLoai;
};
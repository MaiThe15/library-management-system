'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TacGia extends Model {
    static associate(models) {
      // Một tác giả có nhiều sách
      TacGia.hasMany(models.Sach, { foreignKey: 'IDTacGia', as: 'sachs' });
    }
  }
  TacGia.init({
    IDTacGia: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    TenTacGia: { type: DataTypes.STRING, allowNull: false },
    NamSinh: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'TacGia',
    tableName: 'TacGias'
  });
  return TacGia;
};
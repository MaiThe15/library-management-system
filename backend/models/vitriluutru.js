'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ViTriLuuTru extends Model {
    static associate(models) {
      // Một vị trí có thể chứa nhiều sách
      ViTriLuuTru.hasMany(models.Sach, { foreignKey: 'IDViTri', as: 'sachs' });
    }
  }
  ViTriLuuTru.init({
    IDViTri: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    KhuVuc: { type: DataTypes.STRING, allowNull: false },
    Tang: { type: DataTypes.INTEGER, allowNull: false },
    KeSach: { type: DataTypes.STRING, allowNull: false }
  }, {
    sequelize,
    modelName: 'ViTriLuuTru',
    tableName: 'ViTriLuuTrus'
  });
  return ViTriLuuTru;
};
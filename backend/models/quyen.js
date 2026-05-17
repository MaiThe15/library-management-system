'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Quyen extends Model {
    static associate(models) {
      // Mối quan hệ n-n với VaiTro thông qua bảng trung gian VaiTro_Quyen
      Quyen.belongsToMany(models.VaiTro, { 
        through: 'VaiTro_Quyen', 
        foreignKey: 'IDQuyen', 
        otherKey: 'IDVaiTro',
        as: 'vaiTros' 
      });
    }
  }
  Quyen.init({
    IDQuyen: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    TenQuyen: DataTypes.STRING, // vd: 'CREATE_BOOK', 'DELETE_USER'
    MoTa: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Quyen',
    tableName: 'Quyens',
  });
  return Quyen;
};
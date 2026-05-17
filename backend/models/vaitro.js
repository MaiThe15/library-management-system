'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class VaiTro extends Model {
    static associate(models) {
      VaiTro.hasMany(models.NhanVien, { foreignKey: 'IDVaiTro', as: 'nhanViens' });
      VaiTro.belongsToMany(models.Quyen, { 
          through: 'VaiTro_Quyen', 
          foreignKey: 'IDVaiTro', 
          otherKey: 'IDQuyen',
          as: 'quyens' 
      });
    }
  }
  VaiTro.init({
    IDVaiTro: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    TenVaiTro: { type: DataTypes.STRING, allowNull: false },
    MoTa: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'VaiTro',
    tableName: 'VaiTros'
  });
  return VaiTro;
};
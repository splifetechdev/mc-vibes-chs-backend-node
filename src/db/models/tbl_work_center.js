"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tbl_work_center extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.tbl_mch, {
        foreignKey: "work_center_id"
      });
      this.hasMany(models.tbl_routing, {
        foreignKey: 'id'
      });

      this.belongsTo(models.tbl_work_center_group, {
        foreignKey: 'wc_group',
        targetKey:"work_center_group_id"
      });
      
    }
  }
  tbl_work_center.init(
    {
      wc_id: DataTypes.STRING,
      wc_name: DataTypes.STRING,
      wc_group: DataTypes.STRING,
      labor_rate: DataTypes.FLOAT,
      foh_rate: DataTypes.INTEGER,
      voh_rate: DataTypes.INTEGER,
      total_plan_hour: DataTypes.DECIMAL,
      company_id: DataTypes.INTEGER,
      user_create: DataTypes.INTEGER,
      user_update: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "tbl_work_center",
      underscored: true,
      freezeTableName: true,
      underscoreAll: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return tbl_work_center;
};

"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tbl_work_center_group extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.tbl_work_center, {
        foreignKey: "wc_group" ,
        sourceKey:"work_center_group_id"
      })
    }
  }
  tbl_work_center_group.init(
    {
      work_center_group_id: DataTypes.STRING,
      work_center_group_name: DataTypes.STRING,
      company_id: DataTypes.INTEGER,
      user_create: DataTypes.INTEGER,
      user_update: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "tbl_work_center_group",
      underscored: true,
      freezeTableName: true,
      underscoreAll: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return tbl_work_center_group;
};

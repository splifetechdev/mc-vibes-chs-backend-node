"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tbl_setting_menu_detail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  tbl_setting_menu_detail.init(
    {
      setting_group_menu_id: DataTypes.INTEGER,
      group_menu_id: DataTypes.INTEGER,
      menu_detail_id: DataTypes.INTEGER,
      smd_view: DataTypes.BOOLEAN,
      smd_add: DataTypes.BOOLEAN,
      smd_edit: DataTypes.BOOLEAN,
      smd_del: DataTypes.BOOLEAN,
      user_create: DataTypes.INTEGER,
      user_update: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "tbl_setting_menu_detail",
      underscored: true,
      freezeTableName: true,
      underscoreAll: true,
      createdAt: "created_at",
      updateAt: "updated_at",
    }
  );
  return tbl_setting_menu_detail;
};

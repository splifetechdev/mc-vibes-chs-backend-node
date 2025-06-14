"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tbl_config_menu_detail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  tbl_config_menu_detail.init(
    {
      cmd_name: DataTypes.STRING,
      cmd_route: DataTypes.STRING,
      group_menu_id: DataTypes.INTEGER,
      user_create: DataTypes.INTEGER,
      user_update: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "tbl_config_menu_detail",
      underscored: true,
      freezeTableName: true,
      underscoreAll: true,
      createdAt: "created_at",
      updateAt: "updated_at",
    }
  );
  return tbl_config_menu_detail;
};

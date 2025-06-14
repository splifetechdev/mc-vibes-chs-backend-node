"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tbl_item_dimgroup extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  tbl_item_dimgroup.init(
    {
      dimgroup_id: DataTypes.STRING,
      dimgroup_name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "tbl_item_dimgroup",
      underscored: true,
      freezeTableName: true,
      underscoreAll: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return tbl_item_dimgroup;
};

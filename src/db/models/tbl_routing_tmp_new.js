"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tbl_routing_tmp_new extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {}
  }
  tbl_routing_tmp_new.init(
    {
      rtg_main_id: DataTypes.STRING,
      no_of_machine: DataTypes.STRING,
      new_machine_id: DataTypes.STRING,
      user_create: DataTypes.INTEGER,
      user_update: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "tbl_routing_tmp_new",
      underscored: true,
      freezeTableName: true,
      underscoreAll: true,
      timestamps: false,
      //   createdAt: "created_at",
      //   updatedAt: "updated_at",
    }
  );

  //   tbl_routing_tmp_new.removeAttribute("id");
  return tbl_routing_tmp_new;
};

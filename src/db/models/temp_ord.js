"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class temp_ord extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  temp_ord.init(
    {
      doc_module_name: DataTypes.STRING,
      doc_running_no: DataTypes.STRING,
      item_master_id: DataTypes.INTEGER,
      order_qty: DataTypes.INTEGER,
      rtg_id: DataTypes.STRING,
      order_date: DataTypes.DATE,
      due_date: DataTypes.DATE,
      due_time: DataTypes.TIME,
      company_id: DataTypes.INTEGER,
      qty_receive: DataTypes.INTEGER,
      qty_remain: DataTypes.INTEGER,
      user_create: DataTypes.INTEGER,
      user_update: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "temp_ord",
      underscored: true,
      freezeTableName: true,
      underscoreAll: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return temp_ord;
};

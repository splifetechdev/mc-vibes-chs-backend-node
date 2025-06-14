"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tbl_ord extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  tbl_ord.init(
    {
      doc_module_name: DataTypes.STRING,
      doc_running_no: DataTypes.STRING,
      item_master_id: DataTypes.INTEGER,
      order_qty: DataTypes.DECIMAL,
      rtg_id: DataTypes.STRING,
      line_of_mch: DataTypes.STRING,
      order_date: DataTypes.DATE,
      due_date: DataTypes.DATE,
      due_time: DataTypes.TIME,
      status: DataTypes.STRING,
      company_id: DataTypes.INTEGER,
      qty_receive: DataTypes.DECIMAL,
      qty_remain: DataTypes.DECIMAL,
      qty_kg: DataTypes.DECIMAL,
      user_create: DataTypes.INTEGER,
      user_update: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "tbl_ord",
      underscored: true,
      freezeTableName: true,
      underscoreAll: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return tbl_ord;
};

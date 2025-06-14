"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class invent_trans extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  invent_trans.init(
    {
      item_id: DataTypes.STRING,
      status_issue: DataTypes.INTEGER,
      qty: DataTypes.INTEGER,
      qty_kg: DataTypes.DECIMAL,
      date_receive: DataTypes.DATE,
      production_ord_no: DataTypes.STRING,
      currency: DataTypes.STRING,
      transtype: DataTypes.INTEGER,
      costamount: DataTypes.INTEGER,
      inventdim_id: DataTypes.INTEGER,
      batch: DataTypes.STRING,
      lot: DataTypes.STRING,
      user_create: DataTypes.INTEGER,
      user_update: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "invent_trans",
      underscored: true,
      freezeTableName: true,
      underscoreAll: true,
      //   timestamps: false,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  // invent_trans.removeAttribute("id");
  return invent_trans;
};

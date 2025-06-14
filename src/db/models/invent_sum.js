"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class invent_sum extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  invent_sum.init(
    {
      item_id: DataTypes.INTEGER,
      inventdim_id: DataTypes.INTEGER,
      qty: DataTypes.INTEGER,
      qty_kg: DataTypes.DECIMAL,
      user_create: DataTypes.INTEGER,
      user_update: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "invent_sum",
      underscored: true,
      freezeTableName: true,
      underscoreAll: true,
      //   timestamps: false,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  invent_sum.removeAttribute("id");
  return invent_sum;
};

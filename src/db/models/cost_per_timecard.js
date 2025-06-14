"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class cost_per_timecard extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  cost_per_timecard.init(
    {
      timecard_detail_id: DataTypes.INTEGER,
      opn_ord_id: DataTypes.INTEGER,
      timecard_date: DataTypes.DATE,
      act_foh: DataTypes.DECIMAL,
      act_voh: DataTypes.DECIMAL,
      act_labor: DataTypes.DECIMAL,
    },
    {
      sequelize,
      modelName: "cost_per_timecard",
      underscored: true,
      freezeTableName: true,
      underscoreAll: true,
      timestamps: false,
       //   createdAt: "created_at",
    //   updatedAt: "updated_at",
    }
  );
  cost_per_timecard.removeAttribute('id');
  return cost_per_timecard;
};

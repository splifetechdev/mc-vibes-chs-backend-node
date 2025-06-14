"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class cost_labor_per_opn extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  cost_labor_per_opn.init(
    {
      tc_date: DataTypes.DATE,
      worker_id: DataTypes.INTEGER,
      opn_count: DataTypes.INTEGER,
      emp_rate: DataTypes.DECIMAL,
      labor_per_opn: DataTypes.DECIMAL,
    },
    {
      sequelize,
      modelName: "cost_labor_per_opn",
      underscored: true,
      freezeTableName: true,
      underscoreAll: true,
      timestamps: false,
       //   createdAt: "created_at",
    //   updatedAt: "updated_at",
    }
  );
  cost_labor_per_opn.removeAttribute('id');
  return cost_labor_per_opn;
};

"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class cost_foh_per_opn extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  cost_foh_per_opn.init(
    {
      tcdate: DataTypes.DATE,
      mch_id: DataTypes.INTEGER,
      wc_id: DataTypes.INTEGER,
      opn_count: DataTypes.INTEGER,
      foh_per_opn: DataTypes.DECIMAL,
      voh_per_opn: DataTypes.DECIMAL,
    },
    {
      sequelize,
      modelName: "cost_foh_per_opn",
      underscored: true,
      freezeTableName: true,
      underscoreAll: true,
      timestamps: false,
       //   createdAt: "created_at",
    //   updatedAt: "updated_at",
    }
  );
  cost_foh_per_opn.removeAttribute('id');
  return cost_foh_per_opn;
};

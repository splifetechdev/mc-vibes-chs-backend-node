"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tbl_time_card extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.tbl_time_card_detail, {
        foreignKey: "time_card_detail_id",
      });

      this.belongsTo(models.tbl_worker, {
        foreignKey: "worker_id",
      });
    }
  }
  tbl_time_card.init(
    {
      time_card_detail_id: DataTypes.INTEGER,
      worker_id: DataTypes.INTEGER,
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "tbl_time_card_detail_worker",
      underscored: true,
      freezeTableName: true,
      underscoreAll: true,
      createdAt: "created_at",
      updateAt: "updated_at",
    }
  );
  return tbl_time_card;
};

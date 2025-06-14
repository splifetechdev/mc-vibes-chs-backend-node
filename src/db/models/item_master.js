"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class item_master extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.tbl_routing, {
        foreignKey: "id",
      });
    }
  }
  item_master.init(
    {
      company_id: DataTypes.INTEGER,
      item_group_id: DataTypes.INTEGER,
      item_type: DataTypes.INTEGER,
      item_id: DataTypes.STRING,
      item_name: DataTypes.STRING,
      unit_id: DataTypes.INTEGER,
      alias_name: DataTypes.STRING,
      sheft_id: DataTypes.INTEGER,
      dim_group_id: DataTypes.INTEGER,
      model_group_id: DataTypes.INTEGER,
      last_purchase_price: DataTypes.DECIMAL,
      last_purchase_price_date: DataTypes.DATE,
      cost_price: DataTypes.DECIMAL,
      cost_price_date: DataTypes.DATE,
      sales_price: DataTypes.DECIMAL,
      sales_price_date: DataTypes.DATE,
      raw_material: DataTypes.DECIMAL,
      std_dl: DataTypes.DECIMAL,
      std_foh: DataTypes.DECIMAL,
      std_voh: DataTypes.DECIMAL,
      std_setup_time_pc: DataTypes.DECIMAL,
      user_create: DataTypes.INTEGER,
      user_update: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "item_master",
      underscored: true,
      freezeTableName: true,
      underscoreAll: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return item_master;
};

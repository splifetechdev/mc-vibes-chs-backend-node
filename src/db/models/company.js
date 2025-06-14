"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class company extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.tbl_mch, {
        foreignKey: 'id'
      });
      this.hasMany(models.tbl_users, {
        foreignKey: 'id'
      });
      this.hasMany(models.tbl_plc_mapping_machine, {
        foreignKey: 'id'
      });
      this.hasMany(models.tbl_routing, {
        foreignKey: 'id'
      });
    }
  }
  company.init(
    {
      code: DataTypes.STRING,
      name_th: DataTypes.STRING,
      name_en: DataTypes.STRING,
      address_th: DataTypes.STRING,
      address_en: DataTypes.STRING,
      tax_id: DataTypes.STRING,
      branch_id: DataTypes.STRING,
      branch_name: DataTypes.STRING,
      email: DataTypes.STRING,
      tel: DataTypes.STRING,
      logo: DataTypes.STRING,
      status: DataTypes.STRING,
      expire_date: DataTypes.STRING,
      user_create: DataTypes.INTEGER,
      user_update: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "company",
      underscored: true,
      freezeTableName: true,
      underscoreAll: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return company;
};

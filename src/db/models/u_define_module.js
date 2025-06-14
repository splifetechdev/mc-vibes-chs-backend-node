"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class u_define_module extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  u_define_module.init(
    {
      module_name: DataTypes.INTEGER,
      company_id: DataTypes.INTEGER,
      define_numeric1: DataTypes.STRING,
      define_numeric2: DataTypes.STRING,
      define_date1: DataTypes.STRING,
      define_date2: DataTypes.STRING,
      define_boolean1: DataTypes.STRING,
      define_boolean2: DataTypes.STRING,
      define_char1: DataTypes.STRING,
      define_char2: DataTypes.STRING,
      define_text1: DataTypes.STRING,
      define_text2: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "u_define_module",
      underscored: true,
      freezeTableName: true,
      underscoreAll: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return u_define_module;
};

"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class doc_running extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  doc_running.init(
    {
      doc_group_name: DataTypes.STRING,
      module: DataTypes.STRING,
      id_prefix: DataTypes.STRING,
      running_year: DataTypes.INTEGER,
      running_len: DataTypes.INTEGER,
      running_next: DataTypes.INTEGER,
      status: DataTypes.STRING,
      user_create: DataTypes.INTEGER,
      user_update: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "doc_running",
      underscored: true,
      freezeTableName: true,
      underscoreAll: true,
      createdAt: "created_at",
      updateAt: "updated_at",
    }
  );
  return doc_running;
};

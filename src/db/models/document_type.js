'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class document_type extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  document_type.init({
    doc_type_name: { type: DataTypes.STRING, defaultValue: "" },
  }, {
    sequelize,
    modelName: 'document_type',
    underscored: true,
    freezeTableName: true,
    underscoreAll: true,
    createdAt: "created_at",
    updateAt: "updated_at",
  });
  return document_type;
};
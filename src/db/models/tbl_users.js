'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tbl_users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.tbl_mch_shift, {
        foreignKey: "supervisor_id"
      });

      this.belongsTo(models.company, {
        foreignKey: "company_id"
      });

      this.hasMany(models.tbl_ord_receive, {
        foreignKey: "user_id"
      });
    }
  }
  tbl_users.init({
    emp_id: DataTypes.STRING,
    user_role: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    email: DataTypes.STRING,
    // phone: DataTypes.STRING,
    emailVerified: { type: DataTypes.STRING, defaultValue: 0 },
    prename_th: DataTypes.STRING,
    firstname_en: DataTypes.STRING,
    lastname_en: DataTypes.STRING,
    prename_en: DataTypes.STRING,
    firstname: DataTypes.STRING,
    lastname: DataTypes.STRING,
    abbname_en: DataTypes.STRING,
    company_id: DataTypes.INTEGER,
    department_id: DataTypes.INTEGER,
    position_id: DataTypes.INTEGER,
    division_id: DataTypes.INTEGER,
    section_id: DataTypes.INTEGER,
    level: DataTypes.STRING,
    entry_date: DataTypes.DATE,
    authorize_id: DataTypes.INTEGER,
    emp_rate: DataTypes.DECIMAL,
    emp_status: DataTypes.STRING,
    image: DataTypes.STRING,
    user_create: { type: DataTypes.INTEGER, defaultValue: 0 },
    created_at: DataTypes.DATE,
    user_update: { type: DataTypes.INTEGER, defaultValue: 0 },
    updated_at: DataTypes.DATE,
    role: DataTypes.STRING,
    imagesignature: DataTypes.STRING,
    approver_level1: DataTypes.INTEGER,
    approver_level2: DataTypes.INTEGER,
    approver_level3: DataTypes.INTEGER,
  },
    {
      sequelize,
      modelName: "tbl_users",
      underscored: true,
      freezeTableName: true,
      underscoreAll: true,
      createdAt: "created_at",
      updateAt: "updated_at",
    });
  return tbl_users;
};
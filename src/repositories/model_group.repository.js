const db = require("../db/models");
// const dbquery = require("../db/db");

exports.findModelGroupAll = async (id) =>
  await db.sequelize.query(
    `SELECT * FROM tbl_model_group
     WHERE tbl_model_group.company_id = :id`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findModelGroupAllByID = async (id) =>
  await db.sequelize.query(
    `SELECT * FROM tbl_model_group
     WHERE tbl_model_group.id = :id`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findListByCompany = async (company_id) =>
  await db.sequelize.query(
    `SELECT 
        CONVERT(id, CHAR(50)) as id,
        model_group_id,
        model_group_name,
        CONVERT(company_id, CHAR(50)) as companyId,
        created_at as createdAt,
        updated_at as updatedAt 
        FROM tbl_model_group
     WHERE tbl_model_group.company_id = :company_id`,
    {
      replacements: { company_id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findListAll = async () =>
  await db.sequelize.query(
    `SELECT 
        CONVERT(id, CHAR(50)) as id,
        model_group_id,
        model_group_name,
        CONVERT(company_id, CHAR(50)) as companyId,
        created_at as createdAt,
        updated_at as updatedAt 
        FROM tbl_model_group`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.getAlldata = async () =>
  await db.sequelize.query(
    `SELECT d.id,d.model_group_id as model_group_id,
        d.company_id,
        c.code AS company_code,
        d.model_group_name  AS model_group_name,
        c.name_th AS company_name,
        c.status 
        FROM tbl_model_group d 
        LEFT JOIN company c ON d.company_id = c.id`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.create = async (data) => await db.tbl_model_group.create(data);

exports.update = async (id, data) =>
  await db.tbl_model_group.update(data, {
    where: {
      id: id,
    },
  });

exports.getAlldatabycompany = async (id) =>
  await db.sequelize.query(
    `SELECT d.id,d.model_group_id as model_group_id,
        d.company_id,
        c.code AS company_code,
        d.model_group_name  AS model_group_name,
        c.name_th AS company_name,
        c.status 
        FROM tbl_model_group d 
        LEFT JOIN company c ON d.company_id = c.id
        WHERE d.company_id=${id}`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.delete = async (id) =>
  await db.tbl_model_group.destroy({
    where: {
      id: id,
    },
  });

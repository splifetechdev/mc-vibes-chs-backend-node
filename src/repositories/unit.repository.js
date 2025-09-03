const db = require("../db/models");
// const dbquery = require("../db/db");

exports.findUnitAll = async (id) =>
  await db.sequelize.query(
    `SELECT * FROM tbl_unit
     WHERE tbl_unit.company_id = :id`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findUnitAllByID = async (id) =>
  await db.sequelize.query(
    `SELECT * FROM tbl_unit
     WHERE tbl_unit.id = :id`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findListByCompany = async (company_id) =>
  await db.sequelize.query(
    `SELECT 
        CONVERT(id, CHAR(50)) as id,
        unit_name,
        CONVERT(company_id, CHAR(50)) as companyId,
        created_at as createdAt,
        updated_at as updatedAt 
        FROM tbl_group_item
     WHERE tbl_unit.company_id = :company_id`,
    {
      replacements: { company_id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findListAll = async () =>
  await db.sequelize.query(
    `SELECT 
        CONVERT(id, CHAR(50)) as id,
        unit_name,
        CONVERT(company_id, CHAR(50)) as companyId,
        created_at as createdAt,
        updated_at as updatedAt 
        FROM tbl_unit`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.getAlldata = async () =>
  await db.sequelize.query(
    `SELECT d.id,d.unit_name as unit_name,
        d.company_id,
        c.code AS company_code,
        c.name_th AS company_name,
        c.status 
        FROM tbl_unit d 
        LEFT JOIN company c ON d.company_id = c.id`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.create = async (data) => await db.tbl_unit.create(data);

exports.update = async (id, data) =>
  await db.tbl_unit.update(data, {
    where: {
      id: id,
    },
  });

exports.getAlldatabycompany = async (id) =>
  await db.sequelize.query(
    `SELECT d.id,d.unit_name as unit_name,
        d.company_id,
        c.code AS company_code,
        c.name_th AS company_name,
        c.status 
        FROM tbl_unit d 
        LEFT JOIN company c ON d.company_id = c.id
        WHERE d.company_id=${id}`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.delete = async (id) =>
  await db.tbl_unit.destroy({
    where: {
      id: id,
    },
  });

  exports.findUnitByunit_name = async (unit_name,company_id) =>
  await db.tbl_unit.findOne({
     where: {
      unit_name:unit_name,
      company_id:company_id,
    },
  });
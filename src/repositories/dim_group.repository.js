const db = require("../db/models");
// const dbquery = require("../db/db");

exports.findDimGroupAll = async (id) =>
  await db.sequelize.query(
    `SELECT * FROM tbl_item_dimgroup
     WHERE tbl_item_dimgroup.company_id = :id`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findDimGroupAllByID = async (id) =>
  await db.sequelize.query(
    `SELECT * FROM tbl_item_dimgroup
     WHERE tbl_item_dimgroup.id = :id`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findListByCompany = async (company_id) =>
  await db.sequelize.query(
    `SELECT 
        CONVERT(id, CHAR(50)) as id,
        dimgroup_id,
        dimgroup_name,
        CONVERT(company_id, CHAR(50)) as companyId,
        created_at as createdAt,
        updated_at as updatedAt 
        FROM tbl_item_dimgroup
     WHERE tbl_item_dimgroup.company_id = :company_id`,
    {
      replacements: { company_id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findListAll = async () =>
  await db.sequelize.query(
    `SELECT 
        CONVERT(id, CHAR(50)) as id,
        dimgroup_id,
        dimgroup_name,
        CONVERT(company_id, CHAR(50)) as companyId,
        created_at as createdAt,
        updated_at as updatedAt 
        FROM tbl_item_dimgroup`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.getAlldata = async () =>
  await db.sequelize.query(
    `SELECT d.id,d.dimgroup_id as dimgroup_id,
        d.company_id,
        c.code AS company_code,
        d.dimgroup_name  AS dimgroup_name,
        c.name_th AS company_name,
        c.status 
        FROM tbl_item_dimgroup d 
        LEFT JOIN company c ON d.company_id = c.id`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.create = async (data) => await db.tbl_item_dimgroup.create(data);

exports.update = async (id, data) =>
  await db.tbl_item_dimgroup.update(data, {
    where: {
      id: id,
    },
  });

exports.getAlldatabycompany = async (id) =>
  await db.sequelize.query(
    `SELECT d.id,d.dimgroup_id as dimgroup_id,
        d.company_id,
        c.code AS company_code,
        d.dimgroup_name  AS dimgroup_name,
        c.name_th AS company_name,
        c.status 
        FROM tbl_item_dimgroup d 
        LEFT JOIN company c ON d.company_id = c.id
        WHERE d.company_id=${id}`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.delete = async (id) =>
  await db.tbl_item_dimgroup.destroy({
    where: {
      id: id,
    },
  });

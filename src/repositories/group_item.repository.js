const db = require("../db/models");
// const dbquery = require("../db/db");

exports.findGroupItemAll = async (id) =>
  await db.sequelize.query(
    `SELECT * FROM tbl_group_item
     WHERE tbl_group_item.company_id = :id`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findGroupItemAllByID = async (id) =>
  await db.sequelize.query(
    `SELECT * FROM tbl_group_item
     WHERE tbl_group_item.id = :id`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findListByCompany = async (company_id) =>
  await db.sequelize.query(
    `SELECT 
        CONVERT(id, CHAR(50)) as id,
        group_item,
        group_name,
        CONVERT(company_id, CHAR(50)) as companyId,
        created_at as createdAt,
        updated_at as updatedAt 
        FROM tbl_group_item
     WHERE tbl_group_item.company_id = :company_id`,
    {
      replacements: { company_id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findListAll = async () =>
  await db.sequelize.query(
    `SELECT 
        CONVERT(id, CHAR(50)) as id,
        group_item,
        group_name,
        CONVERT(company_id, CHAR(50)) as companyId,
        created_at as createdAt,
        updated_at as updatedAt 
        FROM tbl_group_item`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.getAlldata = async () =>
  await db.sequelize.query(
    `SELECT d.id,d.group_item as group_item,
        d.company_id,
        c.code AS company_code,
        d.group_name  AS group_name,
        c.name_th AS company_name,
        c.status 
        FROM tbl_group_item d 
        LEFT JOIN company c ON d.company_id = c.id`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.create = async (data) => await db.tbl_group_item.create(data);

exports.update = async (id, data) =>
  await db.tbl_group_item.update(data, {
    where: {
      id: id,
    },
  });

exports.getAlldatabycompany = async (id) =>
  await db.sequelize.query(
    `SELECT d.id,d.group_item as group_item,
        d.company_id,
        c.code AS company_code,
        d.group_name  AS group_name,
        c.name_th AS company_name,
        c.status 
        FROM tbl_group_item d 
        LEFT JOIN company c ON d.company_id = c.id
        WHERE d.company_id=${id}`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.delete = async (id) =>
  await db.tbl_group_item.destroy({
    where: {
      id: id,
    },
  });

exports.findGroupItemBygroup_item = async (group_item,company_id) =>
await db.tbl_group_item.findOne({
  where: {
    group_item:group_item,
    company_id:company_id,
  },
});
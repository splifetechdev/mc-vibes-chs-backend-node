const db = require("../db/models");
// const dbquery = require("../db/db");

exports.findItemTypeAll = async (id) =>
  await db.sequelize.query(
    `SELECT * FROM tbl_item_type
     WHERE tbl_item_type.company_id = :id`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findItemTypeAllByID = async (id) =>
  await db.sequelize.query(
    `SELECT * FROM tbl_item_type
     WHERE tbl_item_type.id = :id`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findListByCompany = async (company_id) =>
  await db.sequelize.query(
    `SELECT 
        CONVERT(id, CHAR(50)) as id,
        item_type,
        type_name,
        CONVERT(company_id, CHAR(50)) as companyId,
        created_at as createdAt,
        updated_at as updatedAt 
        FROM tbl_item_type
     WHERE tbl_item_type.company_id = :company_id`,
    {
      replacements: { company_id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findListAll = async () =>
  await db.sequelize.query(
    `SELECT 
        CONVERT(id, CHAR(50)) as id,
        item_type,
        type_name,
        CONVERT(company_id, CHAR(50)) as companyId,
        created_at as createdAt,
        updated_at as updatedAt 
        FROM tbl_item_type`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.getAlldata = async () =>
  await db.sequelize.query(
    `SELECT d.id,d.item_type as item_type,
        d.company_id,
        c.code AS company_code,
        d.type_name  AS type_name,
        c.name_th AS company_name,
        c.status 
        FROM tbl_item_type d 
        LEFT JOIN company c ON d.company_id = c.id`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.create = async (data) => await db.tbl_item_type.create(data);

exports.update = async (id, data) =>
  await db.tbl_item_type.update(data, {
    where: {
      id: id,
    },
  });

exports.getAlldatabycompany = async (id) =>
  await db.sequelize.query(
    `SELECT d.id,d.item_type as item_type,
        d.company_id,
        c.code AS company_code,
        d.type_name  AS type_name,
        c.name_th AS company_name,
        c.status 
        FROM tbl_item_type d 
        LEFT JOIN company c ON d.company_id = c.id
        WHERE d.company_id=${id}`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.delete = async (id) =>
  await db.tbl_item_type.destroy({
    where: {
      id: id,
    },
  });

exports.findItemTypeByitem_type = async (item_type,company_id) =>
await db.tbl_item_type.findOne({
   where: {
    item_type:item_type,
    company_id:company_id,
  },
});
const db = require("../db/models");
// const dbquery = require("../db/db");

exports.findKPITitleAll = async (id) =>
  await db.sequelize.query(
    `SELECT * FROM tbl_kpi_title
     WHERE tbl_kpi_title.company_id = :id`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findKPITitleAllByID = async (id, u_define_id) =>
  await db.sequelize.query(
    `SELECT w.*,udm.* 
        FROM tbl_kpi_title w
        LEFT JOIN u_define_master udm 
        ON  w.id=udm.module_master_id
        and udm.u_define_module_id = :u_define_id
        WHERE w.id = :id`,
    {
      replacements: { id, u_define_id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findListByCompany = async (company_id) =>
  await db.sequelize.query(
    `SELECT 
        CONVERT(id, CHAR(50)) as id,
        kpi_title,
        CONVERT(company_id, CHAR(50)) as companyId,
        created_at as createdAt,
        updated_at as updatedAt 
        FROM tbl_kpi_title
     WHERE tbl_kpi_title.company_id = :company_id`,
    {
      replacements: { company_id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findListAll = async () =>
  await db.sequelize.query(
    `SELECT 
        CONVERT(id, CHAR(50)) as id,
        kpi_title,
        CONVERT(company_id, CHAR(50)) as companyId,
        created_at as createdAt,
        updated_at as updatedAt 
        FROM tbl_kpi_title`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.getAlldata = async () =>
  await db.sequelize.query(
    `SELECT d.id,d.kpi_title as kpi_title,
        d.company_id,
        c.code AS company_code,
        c.name_th AS company_name,
        c.status 
        FROM tbl_kpi_title d 
        LEFT JOIN company c ON d.company_id = c.id`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.create = async (data) => await db.tbl_kpi_title.create(data);

exports.update = async (id, data) =>
  await db.tbl_kpi_title.update(data, {
    where: {
      id: id,
    },
  });

exports.getAlldatabycompany = async (id) =>
  await db.sequelize.query(
    `SELECT d.id,d.kpi_title as kpi_title,
        d.company_id,
        c.code AS company_code,
        c.name_th AS company_name,
        c.status 
        FROM tbl_kpi_title d 
        LEFT JOIN company c ON d.company_id = c.id
        WHERE d.company_id=${id}`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.delete = async (id) =>
  await db.tbl_kpi_title.destroy({
    where: {
      id: id,
    },
  });

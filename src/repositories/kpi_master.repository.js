const db = require("../db/models");
// const dbquery = require("../db/db");

exports.findKPIMasterAll = async (id) =>
  await db.sequelize.query(
    `SELECT * FROM tbl_kpi_master
     WHERE tbl_kpi_master.company_id = :id`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findKPIMasterAllByID = async (id, u_define_id) =>
  await db.sequelize.query(
    `SELECT w.*,udm.*,
          convert(varchar(10),date_start,120) as fdate_start,
          convert(varchar(10),date_end,120) as fdate_end
        FROM tbl_kpi_master w
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
        set_up_by,
        wcg_id, wc_id, title_id,
        CONVERT(company_id, CHAR(50)) as companyId,
        created_at as createdAt,
        updated_at as updatedAt 
        FROM tbl_kpi_master
     WHERE tbl_kpi_master.company_id = :company_id`,
    {
      replacements: { company_id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findListAll = async () =>
  await db.sequelize.query(
    `SELECT 
        CONVERT(id, CHAR(50)) as id,
        set_up_by,
        wcg_id, wc_id, title_id,
        CONVERT(company_id, CHAR(50)) as companyId,
        created_at as createdAt,
        updated_at as updatedAt 
        FROM tbl_kpi_master`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.getAlldata = async () =>
  await db.sequelize.query(
    `SELECT d.id,d.set_up_by as set_up_by,
        d.company_id,
        c.code AS company_code,
        d.wcg_id, wc_id, title_id  AS wcg_id, wc_id, title_id,
        c.name_th AS company_name,
        c.status 
        FROM tbl_kpi_master d 
        LEFT JOIN company c ON d.company_id = c.id`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.create = async (data) => await db.tbl_kpi_master.create(data);

exports.update = async (id, data) =>
  await db.tbl_kpi_master.update(data, {
    where: {
      id: id,
    },
  });

exports.getAlldatabycompany = async (id) =>
  await db.sequelize.query(
    `SELECT d.id,d.set_up_by as set_up_by,
        d.company_id,
        c.code AS company_code,
        d.wcg_id, wc_id, title_id  AS wcg_id, wc_id, title_id,
        c.name_th AS company_name,
        c.status 
        FROM tbl_kpi_master d 
        LEFT JOIN company c ON d.company_id = c.id
        WHERE d.company_id=${id}`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.getKPIMasterList = async (company_id) =>
  await db.sequelize.query(
    `SELECT km.id,kt.kpi_title,
          concat(cast(target as decimal(10,2)),' ',uom) as target,
          convert(varchar(10),date_start,103) as date_start,
          convert(varchar(10),date_end,103) as date_end,
          CASE
              WHEN km.set_up_by = 'wcg' THEN wcg.work_center_group_id
              ELSE wc.wc_id
          END as wcg,
          CASE
              WHEN km.set_up_by = 'wcg' THEN wcg.work_center_group_name
              ELSE wc.wc_name
          END as wcg_name
          FROM tbl_kpi_master km
          left join tbl_work_center_group wcg
          on wcg.work_center_group_id = km.wcg_id
          left join tbl_work_center wc
          on wc.wc_id = km.wc_id
          left join tbl_kpi_title kt
          on kt.id = km.title_id
          where km.company_id = ${company_id}`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

// `SELECT km.id,kt.kpi_title,
//         concat(cast(target as decimal(10,2)),' ',uom) as target,
//         date_start,date_end,
//         CASE
//             WHEN km.set_up_by = 'wcg' THEN wcg.work_center_group_id
//             ELSE wc.wc_id
//         END as wcg,
//         CASE
//             WHEN km.set_up_by = 'wcg' THEN wcg.work_center_group_name
//             ELSE wc.wc_name
//         END as wcg_name
//         FROM tbl_kpi_master km
//         left join tbl_work_center_group wcg
//         on wcg.work_center_group_id = km.wcg_id
//         left join tbl_work_center wc
//         on wc.wc_id = km.wc_id
//         left join tbl_kpi_title kt
//         on kt.id = km.title_id
//         where km.id = ${id} and km.company_id = ${company_id}`,

exports.delete = async (id) =>
  await db.tbl_kpi_master.destroy({
    where: {
      id: id,
    },
  });

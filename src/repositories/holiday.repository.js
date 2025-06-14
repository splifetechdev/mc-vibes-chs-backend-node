const db = require("../db/models");
// const dbquery = require("../db/db");

exports.findHolidayAll = async (id) =>
  await db.sequelize.query(
    `SELECT h.*,convert(varchar(10),date_from,103) as fdate_from ,isnull(mch.machine_id ,'') as machine_name
        FROM tbl_holiday h
        left join tbl_holiday_mch hm
        on h.id = hm.holiday_id
        left join tbl_mch mch
        on hm.machine_id = mch.id
        WHERE h.company_id = :id`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findHolidayAndName = async (id) =>
  await db.sequelize.query(
    `SELECT wcg_id,
      concat(wcg_id,':',date_from, holiday_type, hours) as date_from, holiday_type, hours 
      FROM tbl_holiday
      WHERE tbl_holiday.company_id = :id`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

/*
  `SELECT wcg_id,
      concat(wcg_id,':',date_from, holiday_type, hours) as date_from, holiday_type, hours 
      FROM tbl_holiday
      WHERE tbl_holiday.company_id = :id
      and wc_group = '${wc_group}'`,
  */

exports.findHolidayAllByID = async (id, u_define_id) =>
  await db.sequelize.query(
    `SELECT w.*,udm.* ,convert(varchar(10),date_from,120) as fdate_from
        FROM tbl_holiday w
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
        wcg_id,
        date_from, holiday_type, hours,
        CONVERT(company_id, CHAR(50)) as companyId,
        created_at as createdAt,
        updated_at as updatedAt 
        FROM tbl_holiday
     WHERE tbl_holiday.company_id = :company_id`,
    {
      replacements: { company_id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findListAll = async () =>
  await db.sequelize.query(
    `SELECT 
        CONVERT(id, CHAR(50)) as id,
        wcg_id,
        date_from, holiday_type, hours,
        CONVERT(company_id, CHAR(50)) as companyId,
        created_at as createdAt,
        updated_at as updatedAt 
        FROM tbl_holiday`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.getAlldata = async () =>
  await db.sequelize.query(
    `SELECT d.id,d.wcg_id as wcg_id,
        d.company_id,
        c.code AS company_code,
        d.date_from, holiday_type, hours  AS date_from, holiday_type, hours,
        c.name_th AS company_name,
        c.status 
        FROM tbl_holiday d 
        LEFT JOIN company c ON d.company_id = c.id`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.create = async (data) => await db.tbl_holiday.create(data);

exports.update = async (id, data) =>
  await db.tbl_holiday.update(data, {
    where: {
      id: id,
    },
  });

exports.getAlldatabycompany = async (id) =>
  await db.sequelize.query(
    `SELECT d.id,d.wcg_id as wcg_id,
        d.company_id,
        c.code AS company_code,
        d.date_from, holiday_type, hours  AS date_from, holiday_type, hours,
        c.name_th AS company_name,
        c.status 
        FROM tbl_holiday d 
        LEFT JOIN company c ON d.company_id = c.id
        WHERE d.company_id=${id}`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.delete = async (id) =>
  await db.tbl_holiday.destroy({
    where: {
      id: id,
    },
  });

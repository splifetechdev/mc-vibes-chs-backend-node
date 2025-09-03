const db = require("../db/models");
const { Op } = require("sequelize");
// const dbquery = require("../db/db");

exports.findWorkCenterAll = async (id) =>
  // date_format(SEC_TO_TIME(SUM( TIME_TO_SEC(TIMEDIFF(s.end_time, s.start_time)))),'%H:%i') as sum_total_plan_hour
  //date_format(SEC_TO_TIME(SUM( TIME_TO_SEC(isnull(date_format(SEC_TO_TIME(TIME_TO_SEC(s.summary_time)) ,'%H:%i'),date_format(SEC_TO_TIME((wc.total_plan_hour*60)*60),'%H:%i')   )) ) ),'%H:%i') as sum_total_plan_hour

  // `SELECT wc.*,mch.machine_id,
  //   mch.work_center_id,
  //   mch.name,
  //   mch.is_active,IF(mch.id IS NOT NULL, date_format(SEC_TO_TIME(SUM( TIME_TO_SEC( isnull(date_format(SEC_TO_TIME(TIME_TO_SEC(s.summary_time)) ,'%H:%i'),date_format(SEC_TO_TIME((wc.total_plan_hour*60)*60),'%H:%i')   )) ) ),'%H:%i'), "00:00") as sum_total_plan_hour
  //   FROM tbl_work_center  wc
  //   LEFT JOIN tbl_mch mch ON mch.work_center_id=wc.id
  //   LEFT JOIN tbl_mch_shift mch_s ON mch.id=mch_s.machine_id
  //   LEFT JOIN tbl_shift s ON mch_s.shift_id=s.id
  //    WHERE wc.company_id = :id
  //    GROUP BY wc.id;`,
  exports.findWorkCenterAll = async (id) =>
    await db.sequelize.query(
     `select id,wc_id,wc_name,wc_group,labor_rate,foh_rate,voh_rate,
     sum(sum_total_plan_hour) as sum_total_plan_hour_second,
     FORMAT(FLOOR(convert(varchar(5),CONVERT(varchar,sum(sum_total_plan_hour)/60/60), 108))*100 + (convert(varchar(5),CONVERT(varchar,sum(sum_total_plan_hour)/60/60), 108)-FLOOR(convert(varchar(5),CONVERT(varchar,sum(sum_total_plan_hour)/60/60), 108)))*60,'00:00') as sum_total_plan_hour
      from 
     (SELECT wc.id,wc.wc_id,wc.wc_name,wc.wc_group,wc.labor_rate,wc.foh_rate,wc.voh_rate,mch.id as mchid,s.id as sid,
       CASE 
       WHEN mch.id IS NOT NULL AND s.id IS NOT NULL
           THEN convert(float,convert(DECIMAL,(DATEPART(hour,s.summary_time) * 60)* 60), 108)
           WHEN mch.id IS NOT NULL AND wc.id IS NOT NULL AND s.id IS NULL
           THEN convert(float,convert(DECIMAL,(wc.total_plan_hour * 60)* 60), 108)
           ELSE 0 
       END AS sum_total_plan_hour
       FROM tbl_work_center wc
       LEFT JOIN tbl_mch mch ON mch.work_center_id=wc.id
       LEFT JOIN tbl_mch_shift mch_s ON mch.id=mch_s.machine_id
       LEFT JOIN tbl_shift s ON mch_s.shift_id=s.id
       WHERE wc.company_id = :id) b
       group by id,wc_id,wc_name,wc_group,labor_rate,foh_rate,voh_rate
      `,
     {
       replacements: { id },
       type: db.sequelize.QueryTypes.SELECT,
     }
   );

exports.findWorkCenterAndName = async (id) =>
  await db.sequelize.query(
    `SELECT wc_id,
      concat(wc_id,':',wc_name) as wc_name 
      FROM tbl_work_center
      WHERE tbl_work_center.company_id = :id`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.getbyWorkcentergroup = async (wc_group) =>
  await db.sequelize.query(
    `SELECT id,wc_id,wc_name 
      FROM tbl_work_center
      WHERE tbl_work_center.wc_group = :wc_group`,
    {
      replacements: { wc_group },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

/*
  `SELECT wc_id,
      concat(wc_id,':',wc_name) as wc_name 
      FROM tbl_work_center
      WHERE tbl_work_center.company_id = :id
      and wc_group = '${wc_group}'`,
  */

exports.findWorkCenterAllByID = async (id, u_define_id) =>
  await db.sequelize.query(
    `SELECT w.*,udm.* 
        FROM tbl_work_center w
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
        wc_id,
        wc_name,
        CONVERT(company_id, CHAR(50)) as companyId,
        created_at as createdAt,
        updated_at as updatedAt 
        FROM tbl_work_center
     WHERE tbl_work_center.company_id = :company_id`,
    {
      replacements: { company_id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findListAll = async () =>
  await db.sequelize.query(
    `SELECT 
        CONVERT(id, CHAR(50)) as id,
        wc_id,
        wc_name,
        CONVERT(company_id, CHAR(50)) as companyId,
        created_at as createdAt,
        updated_at as updatedAt 
        FROM tbl_work_center`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.getAlldata = async () =>
  await db.sequelize.query(
    `SELECT d.id,d.wc_id as wc_id,
        d.company_id,
        c.code AS company_code,
        d.wc_name  AS wc_name,
        c.name_th AS company_name,
        c.status 
        FROM tbl_work_center d 
        LEFT JOIN company c ON d.company_id = c.id`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.create = async (data) => await db.tbl_work_center.create(data);

exports.update = async (id, data) =>
  await db.tbl_work_center.update(data, {
    where: {
      id: id,
    },
  });

exports.getAlldatabycompany = async (id) =>
  await db.sequelize.query(
    `SELECT d.id,d.wc_id as wc_id,
        d.company_id,
        c.code AS company_code,
        d.wc_name  AS wc_name,
        c.name_th AS company_name,
        c.status 
        FROM tbl_work_center d 
        LEFT JOIN company c ON d.company_id = c.id
        WHERE d.company_id=${id}`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.delete = async (id) =>
  await db.tbl_work_center.destroy({
    where: {
      id: id,
    },
  });

exports.findWorkCenterAllforganttchart = async (id, data) =>
  await db.tbl_work_center.findAll({
    where: {
      company_id: id,
    },
    group: [["id"]],
    include: [
      {
        model: db.tbl_mch,
        required: true,
        include: [
          {
            model: db.tbl_opn_ord,
            required: true,
            attributes: {
              include: [
                // [db.sequelize.fn('timediff',db.sequelize.col('opn_end_date_time'),db.sequelize.col('opn_start_date_time')),'duration'],
                [
                  db.sequelize.fn(
                    "date_format",
                    db.sequelize.col("opn_start_date_time"),
                    "%Y-%m-%dT%H:%i:%s.000Z"
                  ),
                  "opn_start_date_time",
                ],
                [
                  db.sequelize.fn(
                    "date_format",
                    db.sequelize.col("opn_end_date_time"),
                    "%Y-%m-%dT%H:%i:%s.000Z"
                  ),
                  "opn_end_date_time",
                ],
              ],
            },
            where: {
              [Op.and]: [
                db.sequelize.where(
                  db.sequelize.fn(
                    "MONTH",
                    db.sequelize.col("opn_start_date_time")
                  ),
                  data.month
                ),
                db.sequelize.where(
                  db.sequelize.fn(
                    "YEAR",
                    db.sequelize.col("opn_start_date_time")
                  ),
                  data.year
                ),
              ],
              [Op.and]: [
                db.sequelize.where(
                  db.sequelize.fn(
                    "MONTH",
                    db.sequelize.col("opn_end_date_time")
                  ),
                  data.month
                ),
                db.sequelize.where(
                  db.sequelize.fn(
                    "YEAR",
                    db.sequelize.col("opn_end_date_time")
                  ),
                  data.year
                ),
              ],
            },
            order: [["id", "ASC"]],
          },
        ],
      },
    ],
  });

exports.findWorkCenterAllforganttchartday = async (id, data) =>
  await db.tbl_work_center.findAll({
    where: {
      company_id: id,
    },
    group: [["id"]],
    include: [
      {
        model: db.tbl_mch,
        required: true,
        include: [
          {
            model: db.tbl_opn_ord,
            required: true,
            attributes: {
              include: [
                // [db.sequelize.fn('timediff',db.sequelize.col('opn_end_date_time'),db.sequelize.col('opn_start_date_time')),'duration'],
                [
                  db.sequelize.fn(
                    "date_format",
                    db.sequelize.col("opn_start_date_time"),
                    "%Y-%m-%dT%H:%i:%s.000Z"
                  ),
                  "opn_start_date_time",
                ],
                [
                  db.sequelize.fn(
                    "date_format",
                    db.sequelize.col("opn_end_date_time"),
                    "%Y-%m-%dT%H:%i:%s.000Z"
                  ),
                  "opn_end_date_time",
                ],
              ],
            },
            where: {
              [Op.or]: [
                {
                  opn_start_date_time: {
                    [Op.between]: [data.datefrom, data.dateto],
                  },
                },
                {
                  opn_end_date_time: {
                    [Op.between]: [data.datefrom, data.dateto],
                  },
                },
              ],
            },
            order: [["id", "ASC"]],
          },
        ],
      },
    ],
  });

exports.findBywc_id = async (wc_id,company_id) =>
await db.tbl_work_center.findOne({
  where: {
    wc_id:wc_id,
  company_id:company_id,
  },
});
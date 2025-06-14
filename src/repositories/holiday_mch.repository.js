const db = require("../db/models");
// const dbquery = require("../db/db");

exports.findHolidayMachineAll = async (id) =>
  await db.sequelize.query(
    `SELECT s.*,TIME_FORMAT(s.start_time, "%H:%i") as start_time,TIME_FORMAT(s.end_time, "%H:%i") as end_time,TIME_FORMAT(s.break_start, "%H:%i") as break_start
    ,TIME_FORMAT(s.break_end, "%H:%i") as break_end,TIME_FORMAT(s.summary_time, "%H:%i") as summary_time
    FROM HolidayMachine s
     WHERE s.company_id = :id`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findHolidayMchByHolidayID = async (holiday_id) =>
  await db.sequelize.query(
    `select * from tbl_holiday_mch where holiday_id = :holiday_id`,
    {
      replacements: { holiday_id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findMchByWcg = async (wcg_id) =>
  await db.sequelize.query(
    `SELECT mch.id as machine_id , mch.machine_id as machine_name
        FROM tbl_mch mch 
        left join tbl_work_center wc
        on mch.work_center_id = wc.id
        left join tbl_work_center_group wcg
        on wc.wc_group = wcg.work_center_group_id
        WHERE wcg.work_center_group_id = :wcg_id`,
    {
      replacements: { wcg_id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findHolidayMachineAllByID = async (id, u_define_id) =>
  await db.sequelize.query(
    `SELECT s.* ,udm.*,TIME_FORMAT(s.start_time, "%H:%i") as start_time,TIME_FORMAT(s.end_time, "%H:%i") as end_time,TIME_FORMAT(s.break_start, "%H:%i") as break_start
    ,TIME_FORMAT(s.break_end, "%H:%i") as break_end,TIME_FORMAT(s.summary_time, "%H:%i") as summary_time
    FROM HolidayMachine s
    LEFT JOIN u_define_master udm ON  s.id=udm.module_master_id
    and udm.u_define_module_id = :u_define_id
     WHERE s.id = :id`,
    {
      replacements: { id, u_define_id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.create = async (data) => await db.tbl_holiday_mch.create(data);

exports.update = async (id, data) =>
  await db.tbl_holiday_mch.update(data, {
    where: {
      id: id,
    },
  });

exports.delete = async (holiday_id) =>
  await db.tbl_holiday_mch.destroy({
    where: {
      holiday_id: holiday_id,
    },
  });

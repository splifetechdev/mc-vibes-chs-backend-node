const db = require("../db/models");
// const dbquery = require("../db/db");

    // `SELECT s.*,TIME_FORMAT(s.start_time, "%H:%i") as start_time,TIME_FORMAT(s.end_time, "%H:%i") as end_time,TIME_FORMAT(s.break_start, "%H:%i") as break_start
  //   ,TIME_FORMAT(s.break_end, "%H:%i") as break_end,TIME_FORMAT(s.summary_time, "%H:%i") as summary_time
  //   FROM tbl_shift s
  //    WHERE s.company_id = :id`
exports.findtbl_shiftAll = async (id) =>
  await db.sequelize.query(
    `SELECT s.*,convert(char(5), s.start_time, 108) as start_time,convert(char(5), s.end_time, 108) as end_time,convert(char(5), s.break_start, 108) as break_start
    ,convert(char(5), s.break_end, 108) as break_end,convert(char(5), s.summary_time, 108) as summary_time
    FROM tbl_shift s
     WHERE s.company_id = :id`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

  // `SELECT s.* ,udm.*,TIME_FORMAT(s.start_time, "%H:%i") as start_time,TIME_FORMAT(s.end_time, "%H:%i") as end_time,TIME_FORMAT(s.break_start, "%H:%i") as break_start
  // ,TIME_FORMAT(s.break_end, "%H:%i") as break_end,TIME_FORMAT(s.summary_time, "%H:%i") as summary_time
  // FROM tbl_shift s
  // LEFT JOIN u_define_master udm ON  s.id=udm.module_master_id
  // and udm.u_define_module_id = :u_define_id
  //  WHERE s.id = :id`,
exports.findtbl_shiftAllByID = async (id, u_define_id) =>
  await db.sequelize.query(
    `SELECT s.* ,udm.*,convert(char(5), s.start_time, 108) as start_time,convert(char(5), s.end_time, 108) as end_time,convert(char(5), s.break_start, 108) as break_start
    ,convert(char(5), s.break_end, 108) as break_end,convert(char(5), s.summary_time, 108) as summary_time
    FROM tbl_shift s
    LEFT JOIN u_define_master udm ON  s.id=udm.module_master_id
    and udm.u_define_module_id = :u_define_id
     WHERE s.id = :id`,
    {
      replacements: { id,u_define_id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );



exports.create = async (data) => await db.tbl_shift.create(data);

exports.update = async (id, data) =>
  await db.tbl_shift.update(data, {
    where: {
      id: id,
    },
  });


exports.delete = async (id) =>
  await db.tbl_shift.destroy({
    where: {
      id: id,
    },
  });

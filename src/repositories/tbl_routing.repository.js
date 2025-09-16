const { raw } = require("express");
const db = require("../db/models");
const { Op } = require("sequelize");
// const dbquery = require("../db/db");

/*
`SELECT DISTINCT (rtg_id) AS rtg_id, item_master_id 
        FROM tbl_routing
        WHERE item_master_id = ${item_master_id} AND company_id = ${company_id}`,
        */
exports.findRoutingWorkOrder = async (item_master_id, company_id) =>
  await db.sequelize.query(
    `SELECT DISTINCT * 
        FROM tbl_routing
        WHERE item_master_id = ${item_master_id} AND company_id = ${company_id}`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

// await db.tbl_routing.findAll({
//   where: {
//     item_master_id,
//     company_id,
//   },
//   // include: [
//   //   { model: db.company },
//   //   { model: db.tbl_work_center },
//   //   { model: db.item_master },
//   //   // { model: db.tbl_mch }
//   // ],
//   attributes: [["DISTINCT (rtg_id)", "rtg_id"], "item_master_id"],
//   raw: true,
// });

exports.findRoutingWorkOrderByRTGID = async (
  item_master_id,
  rtg_id,
  company_id
) =>
  await db.tbl_routing.findAll({
    where: {
      item_master_id,
      company_id,
      rtg_id,
    },
    // include: [
    //   { model: db.company },
    //   { model: db.tbl_work_center },
    //   { model: db.item_master },
    //   // { model: db.tbl_mch }
    // ],
  });

exports.findRoutingHoliday = async (machine_id, company_id) =>
  await db.sequelize.query(
    `SELECT distinct convert(varchar(10),h.date_from,120) as date_rom,
			    h.holiday_type,isnull(h.hours,8) as hours
          FROM tbl_mch mch
          left join tbl_work_center wc
          on mch.work_center_id =wc.id
          left join tbl_work_center_group wcg
          on wc.wc_group = wcg.work_center_group_id
          left join tbl_holiday h
          on h.wcg_id =wcg.work_center_group_id
          where mch.id in (${machine_id}) and mch.company_id =${company_id}`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findRoutingHolidayByMachineID = async (machine_id, company_id) =>
  await db.sequelize.query(
    `SELECT hmch.id as hmch_id,h.id as h_id ,
          convert(varchar(10),h.date_from,120) as date_rom,
          h.holiday_type,isnull(h.hours,8) as hours,
          h.company_id
      FROM tbl_holiday_mch hmch
      left join tbl_holiday h
      on hmch.holiday_id = h.id
      WHERE hmch.machine_id = ${machine_id}
      and h.company_id = ${company_id}`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findRoutingShift = async (machine_id, company_id) =>
  await db.sequelize.query(
    `SELECT mch.machine_id,sh.shift_name,
            CONVERT(varchar(8), sh.start_time) as start_time,
            CONVERT(varchar(8),sh.end_time) as end_time,
          CONVERT(varchar(8),sh.break_start) as break_start,
          CONVERT(varchar(8),sh.break_end) as break_end,
          CONVERT(varchar(8),sh.summary_time) as summary_time
                FROM tbl_mch mch
                LEFT JOIN tbl_mch_shift mch_sh
                on mch.id = mch_sh.machine_id
                left join tbl_shift sh
                on mch_sh.shift_id=sh.id  
          where mch.id in (${machine_id}) and mch.company_id =${company_id}`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findtbl_routingAll = async (company_id) =>
  await db.tbl_routing.findAll({
    where: {
      company_id,
    },
    include: [
      { model: db.company },
      { model: db.tbl_work_center },
      { model: db.item_master },
      // { model: db.tbl_mch }
    ],
  });

exports.findRoutingByRTGID = async (id) =>
  await db.tbl_routing.findAll({
    where: {
      id,
    },
  });

exports.findroutingByID = async (id) =>
  await db.tbl_routing.findOne({
    where: {
      id,
    },
    include: [
      { model: db.company },
      { model: db.tbl_work_center },
      { model: db.item_master },
      // { model: db.tbl_mch }
    ],
  });

exports.findtbl_routingAllgroupby = async (company_id) =>
  await db.sequelize.query(
    ` SELECT distinct tr.rtg_id,tr.item_master_id,tr.company_id,im.item_id,im.item_name,im.alias_name,tr.std_cost 
  from tbl_routing tr
  inner join item_master im on tr.item_master_id=im.id
  WHERE tr.company_id=${company_id}`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findtbl_routingAllByID = async (id, u_define_module_id) =>
  await db.tbl_routing.findOne({
    where: {
      id: id,
    },
    include: [
      {
        model: db.u_define_master,
        where: { u_define_module_id },
        required: false,
      },
    ],
  });

exports.searchbyitem_rtg = async (
  item_master_id,
  rtg_id,
  company_id,
  u_define_module_id
) =>
  await db.tbl_routing.findAll({
    where: {
      item_master_id,
      rtg_id,
      company_id,
    },
    order: [["id", "ASC"]],
    include: [
      { model: db.company },
      { model: db.tbl_work_center },
      { model: db.item_master },
      {
        model: db.u_define_master,
        where: { u_define_module_id },
        required: false,
      },
    ],
  });

exports.checkvalidaterouting = async (data) =>
  await db.tbl_routing.findOne({
    where: {
      rtg_id: data.rtg_id,
      company_id: data.company_id,
      item_master_id: data.item_master_id,
      opn_id: data.opn_id,
    },
  });

exports.create = async (data) => await db.tbl_routing.create(data);

exports.update = async (id, data) =>
  await db.tbl_routing.update(data, {
    where: {
      id: id,
    },
  });

exports.delete = async (id) =>
  await db.tbl_routing.destroy({
    where: {
      id: id,
    },
  });

exports.getrtg_id_item_id = async (id, item_master_id, rtg_id) =>
  await db.tbl_routing.findAll({
    where: {
      rtg_id: {
        [Op.ne]: rtg_id,
      },
      item_master_id: item_master_id,
    },
    raw: true,
  });

exports.getSumSTD = async (item_master_id, rtg_id) =>
  await db.tbl_routing.findAll({
    where: {
      // std_cost:1,
      item_master_id: item_master_id,
      rtg_id: rtg_id,
    },
    attributes: [
      "id",
      "std_cost",
      // include: [
      [db.sequelize.fn("sum", db.sequelize.col("std_dl")), "sumstd_dl"],
      [db.sequelize.fn("sum", db.sequelize.col("std_foh")), "sumstd_foh"],
      [db.sequelize.fn("sum", db.sequelize.col("std_voh")), "sumstd_voh"],
      [
        db.sequelize.fn("sum", db.sequelize.col("std_setup_time_pc")),
        "sumstd_setup_time_pc",
      ],
      // ],
    ],
    group: ["id", "std_cost"],
    order: [["id", "ASC"]],
    raw: true,
  });

exports.getIsrtg_idanditem_id = async (id, item_master_id, rtg_id) =>
  await db.tbl_routing.findAll({
    where: {
      rtg_id: rtg_id,
      item_master_id: item_master_id,
    },
    raw: true,
  });

exports.getItemhavestd_cost = async (item_master_id, company_id) =>
  await db.tbl_routing.findAll({
    where: {
      item_master_id,
      company_id,
      std_cost: 1,
    },
    raw: true,
  });

exports.V_Routing_From_Econs = async (doc_running, id) =>
await db.sequelize.query(
  `SELECT * FROM V_RTG_From_Econs;`,
  {
    type: db.sequelize.QueryTypes.SELECT,
  }
);
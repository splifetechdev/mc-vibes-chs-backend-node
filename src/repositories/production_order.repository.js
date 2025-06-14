const db = require("../db/models");
const { Op } = require("sequelize");
// const dbquery = require("../db/db");

exports.findProductionOrderAll = async (id) =>
  await db.sequelize.query(
    `SELECT wc.*, SUM(wc.total_plan_hour) as sum_total_plan_hour 
    FROM tbl_work_center  wc
    LEFT JOIN tbl_mch mch ON mch.work_center_id=wc.id
     WHERE wc.company_id = :id
     GROUP BY wc.id`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findProductionOrderAndName = async (id) =>
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

/*
  `SELECT wc_id,
      concat(wc_id,':',wc_name) as wc_name 
      FROM tbl_work_center
      WHERE tbl_work_center.company_id = :id
      and wc_group = '${wc_group}'`,
  */

exports.findProductionOrderAllByID = async (id, u_define_id) =>
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

exports.productionstatusreport = async (data) =>
  await db.tbl_opn_ord.findAll({
    where: {
      doc_running_no: data.doc_running_no,
      [Op.and]: [data.machine_id && { machine_id: data.machine_id }],
    },
    attributes: [
      "id",
      "setup_time",
      "production_time",
      "opn_qty",
      [
        db.sequelize.fn("sum", db.sequelize.col("tbl_time_card_details.qty")),
        "actual_sum_qty",
      ],
      [
        db.sequelize.fn(
          "sum",
          db.sequelize.col("tbl_time_card_details.work_hours")
        ),
        "actual_sum_work_hours",
      ],
    ],
    include: [
      {
        model: db.tbl_time_card_detail,
        required: false,
        attributes: [],
      },
      {
        model: db.tbl_routing,
        required: false,
        on: {
          rtg_id: db.sequelize.where(
            db.sequelize.col("tbl_opn_ord.rtg_id"),
            "=",
            db.sequelize.col("tbl_routings.rtg_id")
          ),
          item_master_id: db.sequelize.where(
            db.sequelize.col("tbl_opn_ord.item_master_id"),
            "=",
            db.sequelize.col("tbl_routings.item_master_id")
          ),
        },
        attributes: ["id", "setup_time", "scrap"],
      },
    ],
    group: [
      "tbl_opn_ord.id",
      "tbl_opn_ord.setup_time",
      "tbl_opn_ord.production_time",
      "tbl_opn_ord.opn_qty",
      "tbl_routings.id",
      "tbl_routings.setup_time",
      "tbl_routings.scrap",
    ],
  });

exports.putUpdateDockRunningNo = async (old_doc_running, data) => {
  const t = await db.sequelize.transaction();
  var rt_transaction;

  try {
    // console.log("old_doc_running:", old_doc_running);
    // console.log("data:", JSON.stringify(data));

    //check doc_running_no in tbl_ord
    const check_doc_running_no = await db.tbl_ord.findOne(
      {
        where: {
          doc_running_no: data.new_doc_running_no,
        },
      },
      { transaction: t }
    );
    // console.log("check_doc_running_no:", JSON.stringify(check_doc_running_no));

    if (check_doc_running_no) {
      rt_transaction = {
        save_sta: false,
        save_msg: "มีหมายเลขการสั่งผลิตนี้แล้ว!!!",
      };
      return rt_transaction;
    }

    //tbl_ord
    await db.tbl_ord.update(
      { doc_running_no: data.new_doc_running_no },
      {
        where: {
          doc_running_no: old_doc_running,
        },
      },
      { transaction: t }
    );

    //tbl_opn_ord
    await db.tbl_opn_ord.update(
      { doc_running_no: data.new_doc_running_no },
      {
        where: {
          doc_running_no: old_doc_running,
        },
      },
      { transaction: t }
    );

    //tbl_opn_tmp
    await db.tbl_opn_tmp.update(
      { doc_running_no: data.new_doc_running_no },
      {
        where: {
          doc_running_no: old_doc_running,
        },
      },
      { transaction: t }
    );

    //temp_opn_tmp
    await db.temp_opn_tmp.update(
      { doc_running_no: data.new_doc_running_no },
      {
        where: {
          doc_running_no: old_doc_running,
        },
      },
      { transaction: t }
    );

    //temp_opn_ord
    await db.temp_opn_ord.update(
      { doc_running_no: data.new_doc_running_no },
      {
        where: {
          doc_running_no: old_doc_running,
        },
      },
      { transaction: t }
    );

    //temp_adjust_opn_ord
    await db.temp_adjust_opn_ord.update(
      { doc_running_no: data.new_doc_running_no },
      {
        where: {
          doc_running_no: old_doc_running,
        },
      },
      { transaction: t }
    );

    //temp_adjust_opn_tmp
    await db.temp_adjust_opn_tmp.update(
      { doc_running_no: data.new_doc_running_no },
      {
        where: {
          doc_running_no: old_doc_running,
        },
      },
      { transaction: t }
    );

    // await t.commit();
    rt_transaction = {
      save_sta: true,
      save_msg: "Update Doc Running No Success",
    };
  } catch (error) {
    await t.rollback();
    // console.log("error rollback:", error.toString());
    rt_transaction = { save_sta: false, save_msg: error.toString() };
  }
  return rt_transaction;
};

exports.updateTblOrd = async (id, data) =>
  await db.tbl_ord.update(data, {
    where: {
      id: id,
    },
  });

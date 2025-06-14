const db = require("../db/models");
// const dbquery = require("../db/db");

exports.findTempOrderAll = async (id) =>
  await db.sequelize.query(
    `SELECT ord.*,
      im.item_id,im.item_name,
      FORMAT(convert(datetime,convert(varchar(16), CONCAT(due_date,' ',due_time), 120)),'dd/MM/yyyy HH:mm') as due_date_time,
      tc.wo_running_no
        FROM temp_ord ord
        left join item_master im
        on ord.item_master_id = im.id
        left join (select distinct wo_running_no from tbl_time_card) as tc
        on ord.doc_running_no = tc.wo_running_no
        WHERE ord.company_id =   :id`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findTempOrderByDocRunning = async (doc_running_no) =>
  await db.sequelize.query(
    `SELECT ord.*
        FROM temp_ord ord
        WHERE ord.doc_running_no =   :doc_running_no`,
    {
      replacements: { doc_running_no },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findTempOrderAllByID = async (id, u_define_id) =>
  await db.sequelize.query(
    `SELECT s.* ,udm.*,TIME_FORMAT(s.start_time, "%H:%i") as start_time,TIME_FORMAT(s.end_time, "%H:%i") as end_time,TIME_FORMAT(s.break_start, "%H:%i") as break_start
    ,TIME_FORMAT(s.break_end, "%H:%i") as break_end,TIME_FORMAT(s.summary_time, "%H:%i") as summary_time
    FROM temp_ord s
    LEFT JOIN u_define_master udm ON  s.id=udm.module_master_id
    and udm.u_define_module_id = :u_define_id
     WHERE s.id = :id`,
    {
      replacements: { id, u_define_id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.create = async (data) => await db.temp_ord.create(data);

exports.update = async (id, data) =>
  await db.temp_ord.update(data, {
    where: {
      id: id,
    },
  });

exports.delete = async (id) => {
  const t = await db.sequelize.transaction();
  var rt_transaction;
  try {
    await db.temp_ord.destroy(
      {
        where: {
          doc_running_no: id,
        },
      },
      { transaction: t }
    );

    await db.tbl_opn_ord.destroy(
      {
        where: {
          doc_running_no: id,
        },
      },
      { transaction: t }
    );

    await db.tbl_opn_tmp.destroy(
      {
        where: {
          doc_running_no: id,
        },
      },
      { transaction: t }
    );
    await t.commit();
    rt_transaction = { save_sta: true, save_msg: "save success" };
  } catch (error) {
    await t.rollback();
    // console.log("error rollback:", error.toString());
    rt_transaction = { save_sta: false, save_msg: error.toString() };
  }
  return rt_transaction;
};

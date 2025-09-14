const db = require("../db/models");
// const dbquery = require("../db/db");

/*
 `SELECT ord.*,
      im.item_id,im.item_name,
      FORMAT(convert(datetime,convert(varchar(16), CONCAT(due_date,' ',due_time), 120)),'dd/MM/yyyy HH:mm') as due_date_time,
      tc.wo_running_no
        FROM tbl_ord ord
        left join item_master im
        on ord.item_master_id = im.id
        left join (select distinct wo_running_no from tbl_time_card) as tc
        on ord.doc_running_no = tc.wo_running_no
        WHERE ord.company_id =   :id`,
 */
exports.findOrderAll = async (id) =>
  await db.sequelize.query(
    `SELECT ord.*,
      im.item_id,im.item_name,
      FORMAT(convert(datetime,convert(varchar(16), CONCAT(due_date,' ',due_time), 120)),'dd/MM/yyyy HH:mm') as due_date_time,
      tc.wo_running_no,ord.status,
      CASE
       WHEN ord.status = 'D' THEN 'Save Draft'
       WHEN ord.status = 'A' THEN 'Approve'
       WHEN ord.status = 'C' THEN 'Close'
       ELSE 'Close'
       END as fstatus ,
       isnull(it_qty,0) as it_qty 
       ,isnull(it_batch,0) as it_batch         
        FROM tbl_ord ord
        left join item_master im
        on ord.item_master_id = im.id
        left join (select distinct wo_running_no from tbl_time_card) as tc
        on ord.doc_running_no = tc.wo_running_no
        left join (select production_ord_no,isnull(sum(qty),0) as it_qty ,isnull(count(batch),0) as it_batch  from invent_trans
        GROUP BY production_ord_no) as ivt_qty
        on ord.doc_running_no = ivt_qty.production_ord_no
        WHERE ord.company_id = :id and ord.status in ('D','A')`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findAllByOrdId = async (id) =>
  await db.sequelize.query(
    `SELECT ord.*,
      im.item_id,im.item_name,
      FORMAT(convert(datetime,convert(varchar(16), CONCAT(due_date,' ',due_time), 120)),'dd/MM/yyyy HH:mm') as due_date_time,
      tc.wo_running_no,ord.status,
      CASE
       WHEN ord.status = 'D' THEN 'Save Draft'
       WHEN ord.status = 'A' THEN 'Approve'
       WHEN ord.status = 'C' THEN 'Close'
       ELSE 'Close'
       END as fstatus ,
       isnull(it_qty,0) as it_qty 
       ,isnull(it_batch,0) as it_batch         
        FROM tbl_ord ord
        left join item_master im
        on ord.item_master_id = im.id
        left join (select distinct wo_running_no from tbl_time_card) as tc
        on ord.doc_running_no = tc.wo_running_no
        left join (select production_ord_no,isnull(sum(qty),0) as it_qty ,isnull(count(batch),0) as it_batch  from invent_trans
        GROUP BY production_ord_no) as ivt_qty
        on ord.doc_running_no = ivt_qty.production_ord_no
        WHERE ord.id = :id`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.getOrderByQuery = async (id, data) =>
  await db.sequelize.query(
    `SELECT ord.*,
      im.item_id,im.item_name,
      FORMAT(convert(datetime,convert(varchar(16), CONCAT(due_date,' ',due_time), 120)),'dd/MM/yyyy HH:mm') as due_date_time,
      tc.wo_running_no,ord.status,
      CASE
       WHEN ord.status = 'D' THEN 'Save Draft'
       WHEN ord.status = 'A' THEN 'Approve'
       WHEN ord.status = 'C' THEN 'Close'
       ELSE 'Close'
       END as fstatus ,
       isnull(it_qty,0) as it_qty 
       ,isnull(it_batch,0) as it_batch         
        FROM tbl_ord ord
        left join item_master im
        on ord.item_master_id = im.id
        left join (select distinct wo_running_no from tbl_time_card) as tc
        on ord.doc_running_no = tc.wo_running_no
        left join (select production_ord_no,isnull(sum(qty),0) as it_qty ,isnull(count(batch),0) as it_batch  from invent_trans
        GROUP BY production_ord_no) as ivt_qty
        on ord.doc_running_no = ivt_qty.production_ord_no
        WHERE ord.company_id = :id
        ${data.doc_status}`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findIdByDocRunning = async (doc_running, id) =>
  await db.sequelize.query(
    `SELECT distinct ord.*,ord.status FROM tbl_ord ord
        left join (select distinct doc_running_no,status,item_master_id from tbl_opn_ord) as tord
                on ord.doc_running_no = tord.doc_running_no
                and ord.item_master_id = tord.item_master_id
        WHERE ord.doc_running_no = :doc_running and ord.id = :id`,
    {
      replacements: { doc_running, id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findIdByDocRunningV2 = async (doc_running) =>
  await db.sequelize.query(
    `SELECT TOP 1 ord.*,tord.status FROM tbl_ord ord
        left join (select distinct doc_running_no,status,item_master_id from tbl_opn_ord) as tord
                on ord.doc_running_no = tord.doc_running_no
                and ord.item_master_id = tord.item_master_id
        WHERE ord.doc_running_no = :doc_running and ord.status <> 'C'`,
    {
      replacements: { doc_running },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findAdjustPlanDraftByDocRunning = async (doc_running) =>
  await db.sequelize.query(
    `SELECT tpopd.* ,mch.name as mch_name,
            FORMAT(convert(datetime,convert(varchar(16), taot.opn_start_date_time, 120)),'dd/MM/yyyy HH:mm') as fopn_start_date_time,
            FORMAT(convert(datetime,convert(varchar(16), taot.opn_end_date_time, 120)),'dd/MM/yyyy HH:mm') as fopn_end_date_time, 
            cast(tpopd.setup_time as decimal(10,2)) as fsetup_time,
            cast(production_time as decimal(10,2)) as fproduction_time,unt.unit_name,
            CONCAT(rt.opn_id,'-',rt.opn_name) as opn_name,
            wc.wc_name,taot.machine_id,
            CASE
                WHEN tpopd.setup_timehr_per ='B' THEN cast(tpopd.production_time as decimal(10,2))
                ELSE cast(tpopd.time_process_by_opn as decimal(10,2))
            END as ftime_process_by_opn,
            CASE
                WHEN tpopd.setup_timehr_per ='B' THEN cast(tpopd.batch_amount as decimal(10,2))
                ELSE cast(tpopd.real_qty_order_scrap_by_opn as decimal(10,2))
            END as freal_qty_order_scrap_by_opn
            FROM tbl_opn_ord tpopd
            left join temp_adjust_opn_tmp taot
            on tpopd.id = taot.item_id
            left join tbl_mch mch
            on mch.id = taot.machine_id
            left join tbl_routing rt
            on tpopd.rtg_id = rt.rtg_id
            and tpopd.company_id = rt.company_id
            and tpopd.item_master_id = rt.item_master_id
            and tpopd.opn_id = rt.opn_id
            left join tbl_unit unt
            on rt.unit_id = unt.id
            left join tbl_work_center wc
            on rt.work_center_id = wc.id
            WHERE  tpopd.doc_running_no = :doc_running
            and tpopd.id in (select item_id from temp_adjust_opn_tmp where doc_running_no = :doc_running)`,
    {
      replacements: { doc_running },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );
exports.findOrderAllByID = async (id, u_define_id) =>
  await db.sequelize.query(
    `SELECT s.* ,udm.*,TIME_FORMAT(s.start_time, "%H:%i") as start_time,TIME_FORMAT(s.end_time, "%H:%i") as end_time,TIME_FORMAT(s.break_start, "%H:%i") as break_start
    ,TIME_FORMAT(s.break_end, "%H:%i") as break_end,TIME_FORMAT(s.summary_time, "%H:%i") as summary_time
    FROM Order s
    LEFT JOIN u_define_master udm ON  s.id=udm.module_master_id
    and udm.u_define_module_id = :u_define_id
     WHERE s.id = :id`,
    {
      replacements: { id, u_define_id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.create = async (data) => await db.tbl_ord.create(data);

exports.update = async (id, data) =>
  await db.tbl_ord.update(data, {
    where: {
      id: id,
    },
  });

exports.updateByDocRunning = async (doc_running_no, data) =>
  await db.tbl_ord.update(data, {
    where: {
      doc_running_no: doc_running_no,
    },
  });

exports.delete = async (id) => {
  const t = await db.sequelize.transaction();
  var rt_transaction;
  try {
    await db.tbl_ord.destroy(
      {
        where: {
          doc_running_no: id,
        },
      },
      { transaction: t }
    );

    // await db.tbl_opn_ord.destroy(
    //   {
    //     where: {
    //       doc_running_no: id,
    //     },
    //   },
    //   { transaction: t }
    // );

    await db.sequelize.query(
      `DELETE FROM tbl_opn_ord 
        WHERE doc_running_no = :id`,
      {
        replacements: { id },
        type: db.sequelize.QueryTypes.DELETE,
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

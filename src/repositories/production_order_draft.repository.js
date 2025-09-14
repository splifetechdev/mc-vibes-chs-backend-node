const db = require("../db/models");
// const dbquery = require("../db/db");

exports.findDraftProdOrderPlanAll = async (id) =>
  await db.sequelize.query(
    `SELECT * FROM tbl_opn_ord
     WHERE tbl_opn_ord.company_id = :id`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findApproveProdOrderOptionListByMachine = async (
  company_id,
  machine_id
) => {
  return await db.sequelize.query(
    `SELECT
      tbl_opn_ord.id,
      tbl_opn_ord.doc_running_no,
      tbl_opn_ord.opn_id,
      tbl_routing.opn_name,
      tbl_opn_ord.batch_count,
      tbl_mch.name mch_name
    FROM
      tbl_opn_ord
      LEFT JOIN tbl_routing ON tbl_opn_ord.rtg_id = tbl_routing.rtg_id
        AND tbl_opn_ord.item_master_id = tbl_routing.item_master_id
        AND tbl_opn_ord.opn_id = tbl_routing.opn_id
      LEFT JOIN tbl_mch ON tbl_opn_ord.machine_id = tbl_mch.id
    WHERE tbl_opn_ord.company_id = :company_id AND tbl_opn_ord.machine_id = :machine_id AND tbl_opn_ord.status = 'A' order by tbl_opn_ord.id ASC`,
    {
      replacements: { company_id, machine_id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );
};
// WHERE tbl_opn_ord.status = 'A';
exports.findApproveProdOrderOptionList = async (id) =>
  await db.sequelize.query(
    `SELECT
      tbl_opn_ord.id,
      tbl_opn_ord.doc_running_no,
      tbl_opn_ord.opn_id,
      tbl_routing.opn_name,
      tbl_opn_ord.batch_count,
      tbl_mch.name mch_name
    FROM
      tbl_opn_ord
      LEFT JOIN tbl_routing ON tbl_opn_ord.rtg_id = tbl_routing.rtg_id
        AND tbl_opn_ord.item_master_id = tbl_routing.item_master_id
        AND tbl_opn_ord.opn_id = tbl_routing.opn_id
      LEFT JOIN tbl_mch ON tbl_opn_ord.machine_id = tbl_mch.id
    WHERE tbl_opn_ord.company_id = :id AND tbl_opn_ord.status = 'A'`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );
exports.get_ord_by_id = async (id) =>
  await db.tbl_opn_ord.findOne({
    where: { id },
    include: { all: true },
  });

exports.findDraftProdOrderPlanAllByID = async (id) =>
  await db.sequelize.query(
    `SELECT * FROM tbl_opn_ord
     WHERE tbl_opn_ord.id = :id`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.getDataCheckBatchForAddNewOPN = async (
  doc_running_no,
  rtg_id,
  item_master_id,
  opn_id,
  batch_count
) =>
  await db.sequelize.query(
    `SELECT * FROM tbl_opn_ord
      WHERE doc_running_no = :doc_running_no
      AND rtg_id = :rtg_id
      AND item_master_id = :item_master_id
      AND opn_id = :opn_id
      AND batch_count = :batch_count`,
    {
      replacements: {
        doc_running_no,
        rtg_id,
        item_master_id,
        opn_id,
        batch_count,
      },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findAllGreaterThanOrEqualToID = async (id, doc_running_no) =>
  await db.sequelize.query(
    `SELECT * FROM tbl_opn_ord
     WHERE tbl_opn_ord.id >= :id AND tbl_opn_ord.doc_running_no = :doc_running_no`,
    {
      replacements: { id, doc_running_no },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findProdOrderPlanByID = async (doc_running, rtg_id, item_master_id) =>
  await db.sequelize.query(
    `SELECT tpopd.* ,mch.name as mch_name,
            FORMAT(convert(datetime,convert(varchar(16), opn_start_date_time, 120)),'dd/MM/yyyy HH:mm') as fopn_start_date_time,
            FORMAT(convert(datetime,convert(varchar(16), opn_end_date_time, 120)),'dd/MM/yyyy HH:mm') as fopn_end_date_time,
            cast(tpopd.setup_time as decimal(10,2)) as fsetup_time,
            cast(production_time as decimal(10,2)) as fproduction_time,unt.unit_name,
            CONCAT(rt.opn_id,'-',rt.opn_name) as opn_name,
            wc.wc_name,mch.machine_id,
            CASE
                WHEN tpopd.setup_timehr_per ='B' THEN cast(tpopd.production_time as decimal(10,2))
                ELSE cast(tpopd.time_process_by_opn as decimal(10,2))
            END as ftime_process_by_opn,
            CASE
                WHEN tpopd.setup_timehr_per ='B' THEN cast(tpopd.batch_amount as decimal(10,2))
                ELSE cast(tpopd.real_qty_order_scrap_by_opn as decimal(10,2))
            END as freal_qty_order_scrap_by_opn
            FROM tbl_opn_ord tpopd
            left join tbl_mch mch
            on mch.id = tpopd.machine_id
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
            AND tpopd.rtg_id = :rtg_id
            AND tpopd.item_master_id = :item_master_id`,
    {
      replacements: { doc_running, rtg_id, item_master_id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findListByCompany = async (company_id) =>
  await db.sequelize.query(
    `SELECT 
          distinct doc_running_no,item_master_id,order_qty,rtg_id,
          FORMAT(convert(datetime,convert(varchar(16), CONCAT(due_date,' ',due_time), 120)),'dd/MM/yyyy HH:mm') as due_date_time,
          im.item_id,im.item_name,tdpop.status,tdpop.doc_module_name ,
          tdpop.due_date,tdpop.due_time,tdpop.order_date 
          FROM tbl_opn_ord tdpop
          LEFT JOIN item_master im
          on im.id = tdpop.item_master_id
     WHERE tdpop.company_id = :company_id`,
    {
      replacements: { company_id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findListAll = async () =>
  await db.sequelize.query(
    `SELECT 
        CONVERT(id, CHAR(50)) as id,
        group_item,
        group_name,
        CONVERT(company_id, CHAR(50)) as companyId,
        created_at as createdAt,
        updated_at as updatedAt 
        FROM tbl_opn_ord`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.getAlldata = async () =>
  await db.sequelize.query(
    `SELECT 
          distinct doc_running_no,item_master_id,order_qty,rtg_id,due_date
          FROM tbl_opn_ord`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.create = async (data) => await db.tbl_opn_ord.create(data);

exports.createV2 = async (data) => {
  return await db.sequelize.query(
    `INSERT INTO tbl_opn_ord (doc_group_name, doc_running_no, item_master_id, order_qty,opn_qty,
                rtg_id, opn_id, pcs_hr, time_process_by_opn,
                setup_time, real_qty_order_scrap_by_opn,
                machine_id, overlap_time, setup_timehr_per, batch, batch_count, batch_amount,
                opn_start_date_time, opn_end_date_time, company_id, predecessor, dependency,
                production_time, due_date, due_time, doc_module_name, order_date, status, prod_status,
                std_labor_cost, std_foh_cost, std_voh_cost, receive_qty, act_setup_time, act_prod_time,
                act_labor_cost, act_foh_cost, act_voh_cost, user_create, user_update, created_at, updated_at,
                deleted_at)
                VALUES (:doc_group_name, :doc_running_no, :item_master_id, :order_qty,:opn_qty,
                :rtg_id, :opn_id, :pcs_hr, :time_process_by_opn,
                :setup_time, :real_qty_order_scrap_by_opn,
                :machine_id, :overlap_time, :setup_timehr_per, :batch, :batch_count, :batch_amount,
                :opn_start_date_time, :opn_end_date_time, :company_id, :predecessor, :dependency,
                :production_time, :due_date, :due_time, :doc_module_name, :order_date, :status,
                :prod_status, :std_labor_cost, :std_foh_cost, :std_voh_cost, :receive_qty,
                :act_setup_time, :act_prod_time, :act_labor_cost, :act_foh_cost, :act_voh_cost,
                :user_create, :user_update, :created_at, :updated_at, :deleted_at)`,
    {
      replacements: data,
      type: db.sequelize.QueryTypes.INSERT,
    }
  );
};

exports.update = async (id, data) =>
  await db.tbl_opn_ord.update(data, {
    where: {
      id: id,
    },
  });

exports.closeWorkOrder = async (doc_running_no, data) => {
  await db.tbl_opn_ord.update(data, {
    where: {
      doc_running_no: doc_running_no,
    },
  });

  await db.tbl_ord.update(data, {
    where: {
      doc_running_no: doc_running_no,
    },
  });
};

exports.approveWorkOrder = async (doc_running_no, data) => {
  await db.tbl_opn_ord.update(data, {
    where: {
      doc_running_no: doc_running_no,
    },
  });

  await db.tbl_ord.update(data, {
    where: {
      doc_running_no: doc_running_no,
    },
  });
};

exports.getAlldatabycompany = async (id) =>
  await db.sequelize.query(
    `SELECT d.id,d.group_item as group_item,
        d.company_id,
        c.code AS company_code,
        d.group_name  AS group_name,
        c.name_th AS company_name,
        c.status 
        FROM tbl_opn_ord d 
        LEFT JOIN company c ON d.company_id = c.id
        WHERE d.company_id=${id}`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.delete = async (id, force = true) =>
  await db.tbl_opn_ord.destroy({
    where: {
      id: id,
    },
    force,
  });

// exports.deleteByRunningNo = async (doc_running_no) =>
//   await db.tbl_opn_ord.destroy({
//     where: {
//       doc_running_no: doc_running_no,
//     },
//   });

exports.deleteByRunningNo = async (doc_running_no) =>
  await db.sequelize.query(
    `DELETE FROM tbl_opn_ord WHERE doc_running_no = '${doc_running_no}'`,
    {
      type: db.sequelize.QueryTypes.DELETE,
    }
  );

exports.deleteOPNById = async (id) =>
  await db.tbl_opn_ord.destroy({
    where: {
      id: id,
    },
  });

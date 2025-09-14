const db = require("../db/models");
// const dbquery = require("../db/db");

exports.findTempOpnOrdAll = async (id) =>
  await db.sequelize.query(
    `SELECT * FROM temp_opn_ord
     WHERE temp_opn_ord.company_id = :id`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

// WHERE temp_opn_ord.status = 'A';
exports.findApproveProdOrderOptionList = async (id) =>
  await db.sequelize.query(
    `SELECT
      temp_opn_ord.id,
      temp_opn_ord.doc_running_no,
      temp_opn_ord.opn_id,
      tbl_routing.opn_name,
      temp_opn_ord.batch_count,
      tbl_mch.name mch_name
    FROM
      temp_opn_ord
      LEFT JOIN tbl_routing ON temp_opn_ord.rtg_id = tbl_routing.rtg_id
        AND temp_opn_ord.item_master_id = tbl_routing.item_master_id
        AND temp_opn_ord.opn_id = tbl_routing.opn_id
      LEFT JOIN tbl_mch ON temp_opn_ord.machine_id = tbl_mch.id
    WHERE temp_opn_ord.company_id = :id`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );
exports.get_ord_by_id = async (id) =>
  await db.temp_opn_ord.findOne({
    where: { id },
    include: { all: true },
  });

exports.findTempOpnOrdAllByID = async (id) =>
  await db.sequelize.query(
    `SELECT * FROM temp_opn_ord
     WHERE temp_opn_ord.id = :id`,
    {
      replacements: { id },
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
            FROM temp_opn_ord tpopd
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

exports.findALLByRoutingV3 = async (doc_running) =>
  await db.sequelize.query(
    `SELECT * FROM temp_opn_ord tpopd
            WHERE  doc_running_no = :doc_running`,
    {
      replacements: { doc_running },
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
          FROM temp_opn_ord tdpop
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
        FROM temp_opn_ord`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.getAlldata = async () =>
  await db.sequelize.query(
    `SELECT 
          distinct doc_running_no,item_master_id,order_qty,rtg_id,due_date
          FROM temp_opn_ord`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.create = async (data) => await db.temp_opn_ord.create(data);

exports.update = async (id, data) =>
  await db.temp_opn_ord.update(data, {
    where: {
      id: id,
    },
  });

exports.getAlldatabycompany = async (id) =>
  await db.sequelize.query(
    `SELECT d.id,d.group_item as group_item,
        d.company_id,
        c.code AS company_code,
        d.group_name  AS group_name,
        c.name_th AS company_name,
        c.status 
        FROM temp_opn_ord d 
        LEFT JOIN company c ON d.company_id = c.id
        WHERE d.company_id=${id}`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.delete = async (id, force = true) =>
  await db.temp_opn_ord.destroy({
    where: {
      id: id,
    },
    force,
  });

// exports.deleteByRunningNo = async (doc_running_no) =>
//   await db.temp_opn_ord.destroy({
//     where: {
//       doc_running_no: doc_running_no,
//     },
//   });

exports.deleteByRunningNo = async (doc_running_no) =>
  await db.sequelize.query(
    `DELETE FROM temp_opn_ord WHERE doc_running_no = '${doc_running_no}'`,
    {
      type: db.sequelize.QueryTypes.DELETE,
    }
  );

exports.dumpTempOpnOrdDataByDocRunning = async (doc_running_no) =>
  await db.sequelize.query(
    `insert into temp_opn_ord
      SELECT * FROM tbl_opn_ord WHERE doc_running_no = :doc_running_no`,
    {
      replacements: { doc_running_no },
      type: db.sequelize.QueryTypes.INSERT,
    }
  );

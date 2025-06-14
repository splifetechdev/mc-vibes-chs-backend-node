const db = require("../db/models");
// const dbquery = require("../db/db");

exports.findAdjustTempOpnTmpAll = async (id) =>
  await db.sequelize.query(
    `SELECT * FROM temp_adjust_opn_tmp
     WHERE temp_adjust_opn_tmp.company_id = :id`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findAdjustTempOpnTmpAllByID = async (id) =>
  await db.sequelize.query(
    `SELECT * FROM temp_adjust_opn_tmp
     WHERE temp_adjust_opn_tmp.item_id = :id`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findDueDateByRouting = async (
  doc_running,
  rtg_id,
  item_master_id,
  opn_id
) =>
  await db.sequelize.query(
    `SELECT opn_end_date_time FROM temp_adjust_opn_tmp
     WHERE  temp_adjust_opn_tmp.doc_running_no = :doc_running
     AND temp_adjust_opn_tmp.rtg_id = :rtg_id
     AND temp_adjust_opn_tmp.item_master_id = :item_master_id
     AND temp_adjust_opn_tmp.opn_id = :opn_id`,
    {
      replacements: { doc_running, rtg_id, item_master_id, opn_id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findPOTempByOPN = async (doc_running, rtg_id, item_master_id, opn_id) =>
  await db.sequelize.query(
    `SELECT * FROM temp_adjust_opn_tmp
     WHERE  temp_adjust_opn_tmp.doc_running_no = :doc_running
     AND temp_adjust_opn_tmp.rtg_id = :rtg_id
     AND temp_adjust_opn_tmp.item_master_id = :item_master_id
     AND temp_adjust_opn_tmp.opn_id = :opn_id`,
    {
      replacements: { doc_running, rtg_id, item_master_id, opn_id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findPOTempByOPNMINStartDate = async (
  doc_running,
  rtg_id,
  item_master_id,
  opn_id
) =>
  await db.sequelize.query(
    `SELECT *,MAX(opn_start_date_time) FROM temp_adjust_opn_tmp
     WHERE  temp_adjust_opn_tmp.doc_running_no = :doc_running
     AND temp_adjust_opn_tmp.rtg_id = :rtg_id
     AND temp_adjust_opn_tmp.item_master_id = :item_master_id
     AND temp_adjust_opn_tmp.opn_id = :opn_id`,
    {
      replacements: { doc_running, rtg_id, item_master_id, opn_id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findPOTempByOPNMINEndDate = async (
  doc_running,
  rtg_id,
  item_master_id,
  opn_id
) =>
  await db.sequelize.query(
    `SELECT *,MAX(opn_end_date_time) FROM temp_adjust_opn_tmp
     WHERE  temp_adjust_opn_tmp.doc_running_no = :doc_running
     AND temp_adjust_opn_tmp.rtg_id = :rtg_id
     AND temp_adjust_opn_tmp.item_master_id = :item_master_id
     AND temp_adjust_opn_tmp.opn_id = :opn_id`,
    {
      replacements: { doc_running, rtg_id, item_master_id, opn_id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );
/*
  `SELECT * FROM temp_adjust_opn_tmp
     WHERE  temp_adjust_opn_tmp.doc_running_no = :doc_running
     AND temp_adjust_opn_tmp.rtg_id = :rtg_id
     AND temp_adjust_opn_tmp.item_master_id = :item_master_id`,
  */
exports.findALLByRouting = async (doc_running, rtg_id, item_master_id) =>
  await db.sequelize.query(
    `SELECT tpopd.* ,tr.qty_per,tr.qty_by,tr.scrap,tr.no_of_machine,tr.machine_id,tr.scrap,tr.batch,tr.setup_time as tr_setup_time
            FROM temp_adjust_opn_tmp tpopd
                  left join tbl_routing tr
                  on tr.rtg_id = tpopd.rtg_id
                  and tr.item_master_id = tpopd.item_master_id
                  and tr.opn_id = tpopd.opn_id
            WHERE  tpopd.doc_running_no = :doc_running
            AND tpopd.rtg_id = :rtg_id
            AND tpopd.item_master_id = :item_master_id`,
    {
      replacements: { doc_running, rtg_id, item_master_id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

//-- backup findALLByRoutingV2 query --
// `SELECT * FROM temp_adjust_opn_tmp tpopd
//             WHERE  doc_running_no = :doc_running`,

exports.findALLByRoutingV2 = async (doc_running) =>
  await db.sequelize.query(
    `SELECT isnull(rt.qty_per,1) as qty_per,
        isnull(rt.qty_by,1) as qty_by,
        isnull(rt.scrap,0) as scrap,
        rt.no_of_machine,
        tpopd.*
        FROM temp_adjust_opn_tmp tpopd
        left join tbl_routing rt
        on tpopd.rtg_id = rt.rtg_id
        and tpopd.opn_id = rt.opn_id
        and tpopd.item_master_id = rt.item_master_id
        WHERE  doc_running_no =:doc_running`,
    {
      replacements: { doc_running },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findListByCompany = async (company_id) =>
  await db.sequelize.query(
    `SELECT 
        CONVERT(id, CHAR(50)) as id,
        group_item,
        group_name,
        CONVERT(company_id, CHAR(50)) as companyId,
        created_at as createdAt,
        updated_at as updatedAt 
        FROM temp_adjust_opn_tmp
     WHERE temp_adjust_opn_tmp.company_id = :company_id`,
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
        FROM temp_adjust_opn_tmp`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.getAlldata = async () =>
  await db.sequelize.query(
    `SELECT d.id,d.group_item as group_item,
        d.company_id,
        c.code AS company_code,
        d.group_name  AS group_name,
        c.name_th AS company_name,
        c.status 
        FROM temp_adjust_opn_tmp d 
        LEFT JOIN company c ON d.company_id = c.id`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.create = async (data) => await db.temp_adjust_opn_tmp.create(data);

exports.update = async (doc_running, rtg_id, item_master_id, opn_id, data) =>
  await db.temp_adjust_opn_tmp.update(data, {
    where: {
      doc_running_no: doc_running,
      rtg_id: rtg_id,
      item_master_id: item_master_id,
      opn_id: opn_id,
    },
  });

exports.updateByID = async (id, data) =>
  await db.temp_adjust_opn_tmp.update(data, {
    where: {
      id: id,
    },
  });

exports.updateByDocRunningAndOPN = async (
  doc_running_no,
  rtg_id,
  item_master_id,
  data
) =>
  await db.temp_adjust_opn_tmp.update(data, {
    where: {
      doc_running_no: doc_running_no,
      rtg_id: rtg_id,
      item_master_id: item_master_id,
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
        FROM temp_adjust_opn_tmp d 
        LEFT JOIN company c ON d.company_id = c.id
        WHERE d.company_id=${id}`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.delete = async (id) =>
  await db.temp_adjust_opn_tmp.destroy({
    where: {
      id: id,
    },
  });

exports.deleteByRunningNo = async (doc_running_no) =>
  await db.temp_adjust_opn_tmp.destroy({
    where: {
      doc_running_no: doc_running_no,
    },
  });

exports.dumpAdjustTempOpnTmpDataByDocRunning = async (doc_running_no) =>
  await db.sequelize.query(
    `insert into temp_adjust_opn_tmp
      SELECT * FROM tbl_opn_tmp WHERE doc_running_no = :doc_running_no`,
    {
      replacements: { doc_running_no },
      type: db.sequelize.QueryTypes.INSERT,
    }
  );

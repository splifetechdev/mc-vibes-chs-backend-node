const db = require("../db/models");

exports.getReceiveAllByCompanyId = async (company_id) =>
  await db.sequelize.query(
    `SELECT distinct op_opd.id,status,doc_running_no,op_opd.opn_id,op_opd.rtg_id,CONCAT(op_opd.opn_id,'-',rt.opn_name) as opn_name, rt.work_center_id , wc_name,
        op_opd.machine_id , concat(mch.machine_id,'-',mch.name ) as mch_name,
        op_opd.batch,op_opd.batch_count  , op_opd.item_master_id , im.item_id , im.item_name,
        op_opd.order_qty , unit.unit_name , isnull(op_opd.receive_qty,0) as receive_qty , isnull((op_opd.order_qty - op_opd.receive_qty),0) as remain_qty2,
        CASE
            WHEN (op_opd.order_qty - op_opd.receive_qty) >= 0 THEN (op_opd.order_qty - op_opd.receive_qty)
            ELSE 0
        END AS remain_qty,  FORMAT(isnull((op_opd.act_labor_cost + act_foh_cost + act_voh_cost),0),'N2') as sum_cost,
        op_opd.opn_start_date_time , op_opd.opn_end_date_time , op_opd.order_date, op_opd.due_date, op_opd.due_time
        ,rt.id as routing_id,im.sheft_id as routing_shf_id, shf.wh_id as shf_wh_id , shf.lc_id as shf_lc_id
        FROM tbl_opn_ord op_opd
        left join tbl_routing rt
        on op_opd.rtg_id = rt.rtg_id
        and op_opd.opn_id = rt.opn_id
        and op_opd.item_master_id = rt.item_master_id
        and op_opd.company_id = rt.company_id
        left join item_master im
        on op_opd.item_master_id = im.id
        LEFT join tbl_unit unit
        on im.unit_id = unit.id 
        left join tbl_work_center wc
        on rt.work_center_id = wc.id
        left join tbl_mch mch
        on op_opd.machine_id = mch.id
        left join tbl_sheft shf
        on  im.sheft_id = shf.id
        where op_opd.company_id = ${company_id}
        and [status] <> 'C'`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );
//  and op_opd.status <> 'C'

exports.getTimeCardReceiveAllById = async (id) =>
  await db.sequelize.query(
    `select tcd.id,CONVERT(varchar(10),tcd.created_at,103) as receive_date,ISNULL(qty,0) as qty
        ,CONCAT(u.prename_th,' ',u.firstname,' ',u.lastname) as user_name ,time_card_id
        from tbl_time_card_detail tcd
        left join tbl_users u
        on tcd.created_by = u.id
        where opn_ord_id = ${id}`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.getReceiveAllByCompanyIdAndId = async (company_id, id) =>
  await db.sequelize.query(
    `SELECT distinct op_opd.id,status,doc_running_no,op_opd.opn_id,op_opd.rtg_id,CONCAT(op_opd.opn_id,'-',rt.opn_name) as opn_name, rt.work_center_id , wc_name,
        op_opd.machine_id , concat(mch.machine_id,'-',mch.name ) as mch_name,
        op_opd.batch,op_opd.batch_count  , op_opd.item_master_id , im.item_id , im.item_name,
        op_opd.order_qty , unit.unit_name , isnull(op_opd.receive_qty,0) as receive_qty , isnull((op_opd.order_qty - op_opd.receive_qty),0) as remain_qty2,
        CASE
            WHEN (op_opd.order_qty - op_opd.receive_qty) >= 0 THEN (op_opd.order_qty - op_opd.receive_qty)
            ELSE 0
        END AS remain_qty,  FORMAT(isnull((op_opd.act_labor_cost + act_foh_cost + act_voh_cost),0),'N2') as sum_cost,
        op_opd.opn_start_date_time , op_opd.opn_end_date_time , op_opd.order_date, op_opd.due_date, op_opd.due_time
        ,rt.id as routing_id,im.sheft_id as routing_shf_id, shf.wh_id as shf_wh_id , shf.lc_id as shf_lc_id
        FROM tbl_opn_ord op_opd
        left join tbl_routing rt
        on op_opd.rtg_id = rt.rtg_id
        and op_opd.opn_id = rt.opn_id
        and op_opd.item_master_id = rt.item_master_id
        and op_opd.company_id = rt.company_id
        left join item_master im
        on op_opd.item_master_id = im.id
        LEFT join tbl_unit unit
        on im.unit_id = unit.id 
        left join tbl_work_center wc
        on rt.work_center_id = wc.id
        left join tbl_mch mch
        on op_opd.machine_id = mch.id
        left join tbl_sheft shf
        on  im.sheft_id = shf.id
        where op_opd.company_id = ${company_id}  and op_opd.id= ${id}`,

    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );
// and op_opd.status <> 'C'

exports.findById = async (id) =>
  await db.sequelize.query(
    `SELECT *, concat(wh_id,':',wh_name) as fwh_name FROM receive_from_po where id=${id}`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.saveReceivePO = async (data) => {
  console.log("saveReceivePO:", JSON.stringify(data));
  let timecard_header_last_id = 1;
  let new_receive_qty = 0;
  var rt_transaction;

  const t = await db.sequelize.transaction();
  try {
    //doc_running_id  = 10-TC-FAC2 or 11-TC-FAC1
    let timecard_header = {
      company_id: data.company_id,
      doc_running_id: 11,
      wc_id: data.wc_id,
      mch_id: data.mch_id,
      opn_ord_id: data.opn_ord_id,
      time_card_type: `receive_po`,
      created_by: data.created_by,
      wo_running_no: data.doc_running_no,
      doc_running_no: data.timecard_doc_running_no,
      status: `post`,
      created_at: data.created_at,
    };

    console.log(`timecard_header:` + JSON.stringify(timecard_header));

    // INSERT a new record Timecard Header
    let timecard_header_create;

    timecard_header_create = await db.tbl_time_card.create(timecard_header, {
      transaction: t,
    });

    // try {
    //   timecard_header_create = await db.tbl_time_card.create(timecard_header, {
    //     transaction: t,
    //   });
    // } catch (error) {
    //   console.log("saveReceivePO timecard_header_create:", error);
    //   return;
    // }
    timecard_header_last_id = timecard_header_create.id;

    let timecard_detail = {
      time_card_id: timecard_header_last_id,
      opn_ord_id: data.opn_ord_id,
      wc_id: data.wc_id,
      mch_id: data.mch_id,
      opn_desc: data.opn_desc,
      opn_id: data.opn_id,
      item_id: data.item_id,
      wo_type: `N`,
      qty: data.qty,
      created_by: data.created_by,
      wo_running_no: data.doc_running_no,
      batch: data.batch,
      created_at: data.created_at,
    };
    // console.log(`timecard_header:` + JSON.stringify(timecard_header));
    // console.log(`timecard_detail:` + JSON.stringify(timecard_detail));
    // return;

    // INSERT a new record Timecard Detail
    await db.tbl_time_card_detail.create(timecard_detail, {
      transaction: t,
    });

    // Select tbl_opn_ord => receive_qty by id
    const opn_ord = await db.tbl_opn_ord.findOne({
      where: {
        id: data.id,
      },
    });

    if (opn_ord.receive_qty) {
      new_receive_qty = Number(opn_ord.receive_qty) + Number(data.qty);
    } else {
      new_receive_qty = Number(data.qty);
    }
    // console.log(`new_receive_qty:`, new_receive_qty);

    // Update tbl_opn_ord => routing_id by id
    await db.tbl_opn_ord.update(
      {
        routing_id: data.routing_id,
      },
      {
        where: {
          id: data.id,
        },
        transaction: t,
      }
    );

    if (data.status == "C" || data.status == "CD") {
      // Status = 'CD'  Or Status = 'C'
      // Update tbl_ord => qty_receive by doc_running_no
      await db.tbl_ord.update(
        {
          qty_receive: new_receive_qty,
        },
        {
          where: {
            doc_running_no: data.doc_running_no,
          },
          transaction: t,
        }
      );
    } else {
      // Status = 'D'
      // Update tbl_opn_ord => receive_qty by id
      await db.tbl_opn_ord.update(
        {
          receive_qty: new_receive_qty,
        },
        {
          where: {
            id: data.id,
          },
          transaction: t,
        }
      );
    }

    //Check data.status  if == 'C' then update tbl_opn_ord => status = 'C'
    // wh_id: data.wh_id,
    // lc_id: data.lc_id,
    // shf_id: data.shf_id,
    if (data.status == "C") {
      // update tbl_opn_ord => status = 'C' close
      await db.tbl_opn_ord.update(
        {
          status: "C",
        },
        {
          where: {
            id: data.id,
          },
          transaction: t,
        }
      );

      // let numberString = "1,650.06";
      let cf_costamount = data.costamount.replace(/,/g, "");

      // add data to invent_trans
      let invent_trans = {
        item_id: data.item_id_str,
        status_issue: 1,
        qty: data.qty,
        qty_kg: data.qty_kg,
        production_ord_no: data.doc_running_no,
        currency: "THB",
        transtype: 3,
        costamount: cf_costamount,
        inventdim_id: data.shf_id,
        user_create: data.created_by,
        batch: data.batch_count,
        lot: data.lot,
        date_receive: data.date_receive,
      };

      // INSERT a new record invent_trans
      await db.invent_trans.create(invent_trans, {
        transaction: t,
      });

      // try {
      //   await db.invent_trans.create(invent_trans, {
      //     transaction: t,
      //   });
      // } catch (error) {
      //   console.log("saveReceivePO invent_trans_create:", error);
      //   return;
      // }

      // get data from invent_sum
      const res_invent_sum = await db.sequelize.query(
        `select * from invent_sum
            where inventdim_id = ${data.shf_id} and item_id = '${data.item_id_str}'`,
        {
          type: db.sequelize.QueryTypes.SELECT,
        }
      );

      console.log(`res_invent_sum:`, JSON.stringify(res_invent_sum));

      if (res_invent_sum.length > 0) {
        // Update invent_sum => qty by inventdim_id and item_id
        console.log(`update invent_sum`);

        await db.invent_sum.update(
          {
            qty: Number(res_invent_sum[0].qty) + Number(data.qty),
            qty_kg: Number(res_invent_sum[0].qty_kg) + Number(data.qty_kg),
          },
          {
            where: {
              inventdim_id: data.shf_id,
              item_id: data.item_id_str,
            },
            transaction: t,
          }
        );
      } else {
        // add data to invent_sum
        console.log(`add invent_sum`);

        let invent_sum = {
          item_id: data.item_id_str,
          inventdim_id: data.shf_id,
          qty: data.qty,
          qty_kg: data.qty_kg,
          user_create: data.created_by,
        };
        // console.log(`invent_sum:`, JSON.stringify(invent_sum));

        // INSERT a new record invent_sum
        await db.invent_sum.create(invent_sum, {
          transaction: t,
        });
      }
    }

    // Commit the transaction
    await t.commit();
    rt_transaction = { save_sta: true, save_msg: "save success" };
    console.log("Transaction completed successfully");
  } catch (error) {
    // Rollback the transaction in case of an error
    await t.rollback();
    rt_transaction = { save_sta: false, save_msg: error.toString() };
    console.error("Transaction failed:", error);
  }
  return rt_transaction;
};

exports.deleteTimCardItem = async (id, qty, time_card_id, opn_ord_id) => {
  console.log(
    `deleteTimCardItem: id=${id}, qty=${qty}, time_card_id=${time_card_id}, opn_ord_id=${opn_ord_id}`
  );
  var rt_transaction;

  const t = await db.sequelize.transaction();
  try {
    // Delete time_card_detail by id
    await db.tbl_time_card_detail.destroy({
      where: {
        id: id,
      },
      transaction: t,
    });
    // Delete time_card_header by id
    await db.tbl_time_card.destroy({
      where: {
        id: time_card_id,
      },
      transaction: t,
    });

    //Update tbl_opn_ord => receive_qty by id
    await db.tbl_opn_ord.update(
      {
        receive_qty: qty,
      },
      {
        where: {
          id: opn_ord_id,
        },
        transaction: t,
      }
    );

    // Commit the transaction
    await t.commit();
    rt_transaction = { save_sta: true, save_msg: "save success" };
    console.log("Transaction completed successfully");
  } catch (error) {
    // Rollback the transaction in case of an error
    await t.rollback();
    rt_transaction = { save_sta: false, save_msg: error.toString() };
    console.error("Transaction failed:", error);
  }
  return rt_transaction;
};

exports.getReceivePODocIdPrefix = async () =>
  await db.sequelize.query(`SELECT distinct id_prefix FROM doc_running`, {
    type: db.sequelize.QueryTypes.SELECT,
  });

exports.findreceive_from_poAll = async (id) =>
  await db.sequelize.query(
    `SELECT * , concat(wh_id,':',wh_name) as fwh_name FROM receive_from_po `,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.create = async (data) => {
  console.log("Warehouse create:", JSON.stringify(data));
  try {
    return await db.receive_from_po.create(data);
  } catch (error) {
    console.log("Warehouse create:", error);
    return null;
  }
};

exports.update = async (id, data) =>
  await db.receive_from_po.update(data, {
    where: {
      wh_id: id,
    },
  });

exports.delete = async (id) =>
  await db.receive_from_po.destroy({
    where: {
      wh_id: id,
    },
  });

exports.findSystemId = async () =>
  await db.sequelize.query(
    "SELECT TOP 1 c.id FROM receive_from_po c  ORDER BY c.id DESC ",
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

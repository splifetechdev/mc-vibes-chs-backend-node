const { log } = require("make/src/log");
const db = require("../db/models");
const { Op } = require("sequelize");

exports.find_all = async (company_id) =>
  await db.tbl_time_card.findAll({
    where: {
      company_id,
    },
    include: [
      db.tbl_worker,
      db.tbl_mch,
      {
        model: db.tbl_opn_ord,
        // include: { all: true },
      },
      {
        model: db.tbl_time_card_detail,
      },
      { model: db.tbl_mch },
      { model: db.tbl_opn_ord },
      { model: db.doc_running },
    ],
    order: [["created_at", "DESC"]],
  });

exports.remove_log = async (log_id) =>
  await db.tbl_time_card_detail.destroy({
    where: { id: log_id },
  });

exports.remove_defect = async (defect_id) =>
  await db.tbl_time_card_defect.destroy({
    where: {
      id: defect_id,
    },
  });

exports.remove_time_card = async (tc_id) =>
  await db.tbl_time_card.destroy({
    where: {
      id: tc_id,
    },
  });

exports.remove_time_card_detail = async (tc_id) =>
  await db.tbl_time_card_detail.destroy({
    where: {
      time_card_id: tc_id,
    },
  });

exports.bulk_remove_defect = async (defect_id_list) =>
  await db.tbl_time_card_defect.destroy({
    where: {
      id: {
        [Op.in]: defect_id_list,
      },
    },
  });

exports.find_by_id = async (timecard_id, u_define_module_id) =>
  await db.tbl_time_card.findOne({
    where: {
      id: timecard_id,
    },
    include: [
      {
        model: db.u_define_master,
        required: false,
        where: { u_define_module_id },
      },
      { model: db.tbl_mch, required: false },
      { model: db.tbl_opn_ord, required: false },
      { model: db.doc_running, required: false },
    ],
  });

exports.get_time_card_with_log = async (timecard_id) =>
  await db.tbl_time_card.findOne({
    where: {
      id: timecard_id,
    },
    include: [
      {
        model: db.tbl_time_card_detail,
        order: [["tbl_time_card_detail.created_at", "DESC"]],
        include: [db.tbl_time_card_defect],
      },
      {
        model: db.tbl_opn_ord,
      },
      { model: db.tbl_mch },
      { model: db.doc_running },
    ],
  });

exports.post_time_card = async (timeCard) => {
  try {
    return await db.sequelize.transaction(async (t) => {
      const [timecardHeader, timecardDetails] = await Promise.all([
        db.tbl_time_card.findOne({
          where: {
            id: timeCard.id,
          },
          lock: true,
          transaction: t,
        }),
        db.tbl_time_card_detail.findAll({
          where: {
            time_card_id: timeCard.id,
          },
          lock: true,
          transaction: t,
        }),
      ]);
      const opnOrdIdList = timecardDetails.reduce((acc, cur) => {
        if (cur.opn_ord_id) {
          return [...acc, cur.opn_ord_id];
        }
        return acc;
      }, []);
      const opnOrdList = await db.tbl_opn_ord.findAll({
        where: {
          id: {
            [Op.in]: opnOrdIdList,
          },
        },
        lock: true,
        transaction: t,
      });
      await Promise.all(
        timecardDetails.map(async (detail) => {
          if (detail.downtime_id === null && detail.opn_ord_id) {
            let wc_id = detail.wc_id;

            if (!wc_id) {
              const machine = await db.tbl_mch.findOne({
                where: {
                  id: detail.mch_id,
                },
                transaction: t,
              });
              wc_id = machine.work_center_id;
            }
            const opnOrd = opnOrdList.find(
              (opn) => opn.id === detail.opn_ord_id
            );
            const workCenter = await db.tbl_work_center.findOne({
              where: {
                id: wc_id,
              },
              transaction: t,
            });
            const { labor_rate, foh_rate, voh_rate } = workCenter;
            const { work_hours, qty, setup_time } = detail;
            if (qty) {
              opnOrd.receive_qty = Number(qty) + Number(opnOrd.receive_qty);
            }
            if (setup_time) {
              opnOrd.act_setup_time =
                Number(setup_time) + Number(opnOrd.act_setup_time);
            }
            if (work_hours) {
              opnOrd.act_prod_time =
                Number(work_hours) + Number(opnOrd.act_prod_time);
            }
            const labor_cost = labor_rate * work_hours;
            const foh_cost = foh_rate * work_hours;
            const voh_cost = voh_rate * work_hours;
            opnOrd.act_labor_cost = labor_cost + Number(opnOrd.act_labor_cost);
            opnOrd.act_foh_cost = foh_cost + Number(opnOrd.act_foh_cost);
            opnOrd.act_voh_cost = voh_cost + Number(opnOrd.act_voh_cost);
          }
        })
      );
      timecardHeader.status = "post";
      await Promise.all([
        timecardHeader.save({ transaction: t }),
        ...opnOrdList.map((opn) => opn.save({ transaction: t })),
      ]);
    });
  } catch (error) {
    throw error;
  }
};

exports.save_log = async (time_card_log) => {
  try {
    console.log(
      "Saving tbl_time_card_detail log create:",
      JSON.stringify(time_card_log, null, 2)
    );

    return await db.tbl_time_card_detail.create(time_card_log);
    return await db.sequelize.transaction(async (t) => {
      const [workCenter, opnOrd] = await Promise.all([
        db.tbl_work_center.findOne({
          where: {
            id: time_card_log.wc_id,
          },
          transaction: t,
        }),
        db.tbl_opn_ord.findOne({
          where: {
            id: time_card_log.opn_ord_id,
          },
          lock: true,
          transaction: t,
        }),
      ]);
      const { labor_rate, foh_rate, voh_rate } = workCenter;
      const { work_hours, qty, setup_time } = time_card_log;
      const savedData = await db.tbl_time_card_detail.create(time_card_log, {
        transaction: t,
      });
      if (
        !time_card_log.downtime_id &&
        !time_card_log.tbl_time_card_defects.length
      ) {
        if (qty) {
          opnOrd.receive_qty = Number(qty) + Number(opnOrd.receive_qty);
        }
        if (setup_time) {
          opnOrd.act_setup_time =
            Number(setup_time) + Number(opnOrd.setup_time);
        }
        if (work_hours) {
          opnOrd.act_prod_time =
            Number(work_hours) + Number(opnOrd.act_prod_time);
        }

        const labor_cost = labor_rate * work_hours;
        const foh_cost = foh_rate * work_hours;
        const voh_cost = voh_rate * work_hours;
        opnOrd.act_labor_cost = labor_cost + Number(opnOrd.act_labor_cost);
        opnOrd.act_foh_cost = foh_cost + Number(opnOrd.act_foh_cost);
        opnOrd.act_voh_cost = voh_cost + Number(opnOrd.act_voh_cost);
        await opnOrd.save({ transaction: t });
      }

      return savedData;
    });
  } catch (error) {
    console.log({ error });
    throw error;
  }
};

exports.update_log = async (time_card_log) => {
  try {
    console.log(
      "Saving tbl_time_card_detail log update:",
      JSON.stringify(time_card_log, null, 2)
    );

    return db.tbl_time_card_detail.update(time_card_log, {
      where: {
        id: time_card_log.id,
      },
    });
    return await db.sequelize.transaction(async (t) => {
      const [workCenter, opnOrd, timeCardLog] = await Promise.all([
        db.tbl_work_center.findOne({
          where: {
            id: time_card_log.wc_id,
          },
          transaction: t,
        }),
        db.tbl_opn_ord.findOne({
          where: {
            id: time_card_log.opn_ord_id,
          },
          lock: true,
          transaction: t,
        }),
        db.tbl_time_card_detail.findOne({
          where: {
            id: time_card_log.id,
          },
          transaction: t,
        }),
      ]);
      const { labor_rate, foh_rate, voh_rate } = workCenter;
      const { work_hours, qty, setup_time } = time_card_log;
      const savedData = db.tbl_time_card_detail.update(time_card_log, {
        where: {
          id: time_card_log.id,
        },
        transaction: t,
      });
      if (
        !time_card_log.downtime_id &&
        !time_card_log.tbl_time_card_defects.length
      ) {
        if (qty) {
          const diff = Number(qty) - Number(timeCardLog.qty);
          opnOrd.receive_qty = diff + Number(opnOrd.receive_qty);
        }
        if (setup_time) {
          const diff = Number(setup_time) - Number(timeCardLog.setup_time);
          opnOrd.act_setup_time = diff + Number(opnOrd.act_setup_time);
        }

        if (work_hours) {
          const diff = Number(work_hours) - Number(timeCardLog.work_hours);
          opnOrd.act_prod_time = diff + Number(opnOrd.act_prod_time);
        }
        const old_labor_cost = labor_rate * Number(timeCardLog.work_hours);
        const labor_cost = labor_rate * work_hours;
        const labor_diff = labor_cost - old_labor_cost;

        const old_foh_cost = foh_rate * Number(timeCardLog.work_hours);
        const foh_cost = foh_rate * work_hours;
        const foh_diff = foh_cost - old_foh_cost;

        const old_voh_cost = voh_rate * Number(timeCardLog.work_hours);
        const voh_cost = voh_rate * work_hours;
        const voh_diff = voh_cost - old_voh_cost;
        opnOrd.act_labor_cost = labor_diff + Number(opnOrd.act_labor_cost);
        opnOrd.act_foh_cost = foh_diff + Number(opnOrd.act_foh_cost);
        opnOrd.act_voh_cost = voh_diff + Number(opnOrd.act_voh_cost);
        await opnOrd.save({ transaction: t });
      }
      return await savedData;
    });
  } catch (error) {
    console.log({ error });
    throw error;
  }
};

exports.save_defect = async (defect) =>
  await db.tbl_time_card_defect.create(defect);

exports.update_defect = async (defect) =>
  await db.tbl_time_card_defect.update(defect, {
    where: {
      id: defect.id,
    },
  });

exports.list_work_order_option = async (company_id) => {
  const queryResult = await db.sequelize.query(
    `SELECT DISTINCT doc_running_no from tbl_opn_ord where company_id = ${company_id}`,
    { type: db.sequelize.QueryTypes.SELECT }
  );
  return queryResult;
};

// exports.find_machine_by_id = async (machine_id) => await db.tbl_mch.findOne({
//   where: {
//     id: machine_id
//   },
//   include: [db.tbl_work_center]
// })

// exports.find_by_id_getname = async (id) => await db.tbl_mch.findOne({
//   where: {
//     id: id
//   },
// })

// exports.find_by_company_id_and_machine_id = async (company_id, machine_id) => await db.tbl_mch.findOne({
//   where: {
//     company_id,
//     machine_id
//   }
// })

exports.create = async (data) => {
  console.log("Creating time card with data:", JSON.stringify(data, null, 2));
  return await db.tbl_time_card.create(data);
};

// exports.update = async (id, data) =>
//   await db.tbl_mch.update(data, {
//     where: {
//       id: id,
//     },
//   });

// exports.delete = async (id) =>
//   await db.tbl_mch.destroy({
//     where: {
//       id: id,
//     },
//   });

exports.getdeletejobbycompany = async (data) =>
  await db.tbl_time_card.findAll({
    attributes: {
      include: [
        [
          db.sequelize.fn("FORMAT", db.sequelize.col("doc_date"), "dd/MM/yyyy"),
          "doc_date_show",
        ],
      ],
    },
    where: {
      company_id: data.company_id,
      [Op.and]: [
        data.wo_running_no && { wo_running_no: data.wo_running_no },
        data.mch_id && { mch_id: data.mch_id },
        data.doc_date && {
          doc_date: {
            [Op.between]: [data.datefrom, data.dateto],
          },
        },
        data.doc_running_no && { doc_running_no: data.doc_running_no },
      ],
    },
    include: [
      { model: db.tbl_mch },
      {
        model: db.tbl_time_card_detail,
      },
    ],
  });

exports.list_doc_running_no_option = async (company_id) => {
  const queryResult = await db.sequelize.query(
    `SELECT DISTINCT doc_running_no from tbl_time_card where company_id = ${company_id}`,
    { type: db.sequelize.QueryTypes.SELECT }
  );
  return queryResult;
};

exports.listtimecardWorkOrderOptions = async (company_id) => {
  const queryResult = await db.sequelize.query(
    `SELECT DISTINCT wo_running_no from tbl_time_card where company_id = ${company_id}`,
    { type: db.sequelize.QueryTypes.SELECT }
  );
  return queryResult;
};

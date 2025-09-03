const tbl_time_card_service = require("../services/tbl_time_card.service");
const doc_running_service = require("../services/doc_running.service");
const db = require("../db/models");
const dayjs = require("dayjs");
const {
  getPerformanceValue,
  getAvailabilityValue,
  getQualityValue,
  getOEEValue,
} = require("../utils/calculator");

const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
const isSameOrBefore = require("dayjs/plugin/isSameOrBefore");
dayjs.extend(isSameOrBefore);
dayjs.extend(utc);
dayjs.extend(timezone);
// exports.getAll = async (req, res) =>
//   res.json(await tbl_mch_service.find_all(req.params.company_id));

exports.get_one = async (req, res) => {
  try {
    const timecard = await tbl_time_card_service.find_by_id(
      req.params.tc_id,
      req.params.u_define_module_id
    );
    res.json(timecard);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

exports.list_own = async (req, res) => {
  try {
    const requesterId = req.requester_id;
    const timecards = await db.tbl_time_card.findAll({
      where: {
        created_by: requesterId,
        time_card_type: "worker",
        status: "save",
      },
      include: [
        {
          model: db.tbl_time_card_detail,
          where: {
            downtime_id: null,
          },
          require: true,
          include: [
            {
              model: db.tbl_mch,
            },
            {
              model: db.tbl_time_card_detail_worker,
              include: [{ model: db.tbl_worker }],
            },
            {
              model: db.tbl_time_card_defect,
            },
            {
              model: db.tbl_opn_ord,
            },
            {
              model: db.item_master,
            },
          ],
        },
        {
          model: db.tbl_shift,
        },
      ],
    });

    res.json(timecards);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

exports.end_time_card_detail = async (req, res) => {
  try {
    const { log_id } = req.params;
    let updateData = req.body;

    const detail = await db.tbl_time_card_detail.findOne({
      where: {
        id: log_id,
      },
    });
    if (!detail) {
      return res.status(404).send({ error: "Time card detail not found" });
    }

    const timecard = await db.tbl_time_card.findOne({
      where: {
        id: detail.time_card_id,
      },
    });

    const shift = await db.tbl_time_card.findOne({
      where: {
        id: timecard.shift_id,
      },
    });

    if (timecard.time_card_type === "worker") {
      let [startHour, startMinute] = detail.time_start.split(":");
      let [endHour, endMinute] = detail.time_end.split(":");
      if (!startHour || !startMinute || !endHour || !endMinute) {
        const startTime = shift.start_time;
        const endTime = shift.end_time;
        startHour = startTime.split(":")[0];
        startMinute = startTime.split(":")[1];
        endHour = endTime.split(":")[0];
        endMinute = endTime.split(":")[1];
      }

      const totalMinutes1 = Number(startHour) * 60 + Number(startMinute);
      const totalMinutes2 = Number(endHour) * 60 + Number(endMinute);
      let difference;
      if (totalMinutes2 < totalMinutes1) {
        difference = 24 * 60 - totalMinutes1 + totalMinutes2;
      } else {
        difference = totalMinutes2 - totalMinutes1;
      }
      diffHour = difference / 60;
      await db.tbl_time_card_detail.update(
        {
          ...updateData,
        },
        {
          where: {
            id: log_id,
          },
        }
      );
      updateData.qty = await getReceiveQty(log_id, req.requester_company_id);
      updateData.work_hours = diffHour;
    }

    await db.tbl_time_card_detail.update(
      {
        ...updateData,
        end_at: new Date(),
      },
      {
        where: {
          id: log_id,
        },
      }
    );
    res.json({ message: "Time card detail ended" });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = req.body;
    const { doc_group_id } = data;
    const docRunning = await doc_running_service.findOneById(doc_group_id);
    console.log(docRunning);
    const runningNumber = await doc_running_service.docGenerate(
      docRunning.module
    );
    const result = await tbl_time_card_service.create({
      ...req.body,
      doc_running_id: doc_group_id,
      doc_running_no: runningNumber,
      created_by: req.requester_id,
      updated_by: req.requester_id,
    });
    res.json(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

exports.createforiotmapping = async (req, res) => {
  try {
    const data = req.body;
    const { doc_group_id } = data;
    const { mch_id } = data;
    const docRunning = await doc_running_service.findOneById(doc_group_id);

    for (let i = 0; i < mch_id.length; i++) {
      let runningNumber = await doc_running_service.docGenerate(
        docRunning.module
      );
      const result = await tbl_time_card_service.create({
        ...req.body,
        mch_id: mch_id[i],
        doc_running_id: doc_group_id,
        doc_running_no: runningNumber,
        created_by: req.requester_id,
        updated_by: req.requester_id,
      });
      if (i === mch_id.length - 1) {
        res.json(result);
      }
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

exports.remove_log = async (req, res) => {
  try {
    const { log_id } = req.params;
    res.json(await tbl_time_card_service.remove_log(log_id));
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

const getReceiveQty = async (timecardDetailId, companyId) => {
  const timecardDetail = await db.tbl_time_card_detail.findOne({
    where: { id: timecardDetailId },
    include: [
      {
        model: db.tbl_time_card,
      },
      {
        model: db.tbl_opn_ord,
      },
    ],
  });
  if (!timecardDetail || timecardDetail.downtime_id !== null) {
    // return res.status(404).send({ error: "Time card detail not found" });
    return 0;
  }
  if (timecardDetail.mch_id === null) {
    return 0;
  }
  const plc = await db.tbl_plc_mapping_machine.findOne({
    where: {
      company_id: companyId,
      machine_id: timecardDetail.mch_id,
    },
  });
  if (!plc) {
    return 0;
  }
  const startDate = dayjs(timecardDetail.time_card_date).format("YYYY-MM-DD");

  const startAt = dayjs(`${startDate} ${timecardDetail.time_start}:00`);
  let endAt = dayjs(`${startDate} ${timecardDetail.time_end}:00`);
  if (endAt.isBefore(startAt)) {
    endAt = endAt.add(1, "day");
  }
  const startAtStr = startAt.format("YYYY-MM-DD HH:mm:ss");
  const endAtStr = endAt.format("YYYY-MM-DD HH:mm:ss");
  const [iotData] = await db.sequelize.query(
    `SELECT * FROM iotdata
    WHERE MachineID = ${plc.plc_id}
      AND DataDateTime 
      BETWEEN '${startAtStr}' 
        AND '${endAtStr}';`
  );
  const qty = iotData.reduce((acc, cur) => acc + cur.Qty, 0);
  const routing = await db.tbl_routing.findOne({
    where: {
      company_id: companyId,
      rtg_id: timecardDetail.tbl_opn_ord.rtg_id,
      opn_id: timecardDetail.tbl_opn_ord.opn_id,
      item_master_id: timecardDetail.tbl_opn_ord.item_master_id,
    },
  });

  const convertedQty = qty / routing.iot_um_conv;
  return (Math.round(convertedQty * 100) / 100).toFixed(2);
};

exports.post_job = async (req, res) => {
  try {
    const { tc_id } = req.params;
    const { start_time, end_time } = req.body;
    const timeCard = await tbl_time_card_service.list_log(tc_id);
    if (timeCard.status === "post") {
      return res.status(400).send({ error: "this time card is posted" });
    }

    if (timeCard.tbl_time_card_details.length === 0) {
      return res
        .status(400)
        .send({ error: "this time card is not have any details" });
    }
    const shift = await db.tbl_shift.findOne({
      where: {
        id: timeCard.shift_id,
      },
    });

    await Promise.all(
      timeCard.tbl_time_card_details
        .filter((detail) => detail.end_at === null)
        .map(async (detail) => {
          let [startHour, startMinute] = start_time.split(":");
          let [endHour, endMinute] = end_time.split(":");
          if (detail.downtime_id !== null) {
            await db.tbl_time_card_detail.update(
              {
                end_at: new Date(),
              },
              { where: { id: detail.id } }
            );
            return;
          }
          if (!startHour || !startMinute || !endHour || !endMinute) {
            const startTime = shift.start_time;
            const endTime = shift.end_time;
            startHour = startTime.split(":")[0];
            startMinute = startTime.split(":")[1];
            endHour = endTime.split(":")[0];
            endMinute = endTime.split(":")[1];
          }
          const totalMinutes1 = Number(startHour) * 60 + Number(startMinute);
          const totalMinutes2 = Number(endHour) * 60 + Number(endMinute);
          let difference;
          if (totalMinutes2 < totalMinutes1) {
            difference = 24 * 60 - totalMinutes1 + totalMinutes2;
          } else {
            difference = totalMinutes2 - totalMinutes1;
          }
          diffHour = difference / 60;
          await db.tbl_time_card_detail.update(
            {
              time_start: start_time,
              time_end: end_time,
            },
            { where: { id: detail.id } }
          );
          const detailQty = await getReceiveQty(
            detail.id,
            req.requester_company_id
          );
          await db.tbl_time_card_detail.update(
            {
              qty: detailQty,
              work_hours: diffHour,
              end_at: new Date(),
            },
            { where: { id: detail.id } }
          );
        })
    );
    const result = await tbl_time_card_service.post_time_card(timeCard);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
};

exports.post_time_card = async (req, res) => {
  try {
    const { tc_id } = req.params;
    const timeCard = await tbl_time_card_service.list_log(tc_id);
    if (timeCard.status === "post") {
      return res.status(400).send({ error: "this time card is posted" });
    }

    if (timeCard.tbl_time_card_details.length === 0) {
      return res
        .status(400)
        .send({ error: "this time card is not have any details" });
    }

    const result = await tbl_time_card_service.post_time_card(timeCard);
    res.json(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

exports.post_time_card_v2 = async (req, res) => {
  try {
    const { tc_id } = req.params;
    const timeCard = await tbl_time_card_service.list_log(tc_id);
    if (timeCard.status === "post") {
      return res.status(400).send({ error: "this time card is posted" });
    }

    if (timeCard.tbl_time_card_details.length === 0) {
      return res
        .status(400)
        .send({ error: "this time card is not have any details" });
    }

    const result = await tbl_time_card_service.post_time_card_v2(timeCard);
    res.json(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

exports.upsert_log = async (req, res) => {
  try {
    const log = req.body;
    let result;
    let logId;
    if (log.id !== null) {
      result = await tbl_time_card_service.update_log({
        ...log,
        updated_by: req.requester_id,
      });
      logId = log.id;
    } else {
      result = await tbl_time_card_service.save_log({
        ...log,
        created_by: req.requester_id,
        updated_by: req.requester_id,
      });
      logId = result.id;
    }
    const { tbl_time_card_defects, defect_delete_id_list } = log;
    if (tbl_time_card_defects || defect_delete_id_list) {
      await Promise.all(
        tbl_time_card_defects.map(async (defect) =>
          tbl_time_card_service.upsert_defect(logId, defect, req.requester_id)
        )
      );
      const removeResult = await tbl_time_card_service.bulk_remove_defect(
        defect_delete_id_list
      );
    }

    res.json(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

exports.bulk_upsert_log_defect = async (req, res) => {
  try {
    const defectList = req.body;
    await Promise.all(
      defectList.map(async (defect) => {
        if (defect.id) {
          tbl_time_card_service.update_defect(defect);
        } else {
          tbl_time_card_service.save_defect(defect);
        }
      })
    );
  } catch (error) {}
};

exports.remove_defect = async (req, res) => {
  try {
    const { defect_id } = req.params;
    const result = await tbl_time_card_service.remove_defect(defect_id);
    res.json(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

exports.list = async (req, res) => {
  try {
    const { company_id } = req.params;
    const result = await tbl_time_card_service.list(company_id);
    const formattedData = result.map((timecard) => ({
      ...timecard.toJSON(),
      mch_ids:
        timecard?.tbl_time_card_details.map((detail) => detail.mch_id) || [],
      wo_running_nos:
        timecard?.tbl_time_card_details.map((detail) => detail.wo_running_no) ||
        [],
      tbl_time_card_details: undefined,
    }));
    res.json(formattedData);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

exports.get_time_card_log = async (req, res) => {
  try {
    const { tc_id } = req.params;
    const result = await tbl_time_card_service.list_log(tc_id);
    res.json(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

exports.get_time_card_detail = async (req, res) => {
  try {
    const timecardDetails = await db.tbl_time_card_detail.findAll({
      where: {
        created_by: req.requester_id,
      },
      include: [
        {
          model: db.tbl_time_card,
          where: {
            company_id: req.requester_company_id,
          },
          require: true,
        },
        {
          model: db.tbl_opn_ord,
        },
        {
          model: db.tbl_worker,
        },
        {
          model: db.tbl_mch,
          include: {
            model: db.tbl_work_center,
            include: [{ model: db.tbl_work_center_group }],
          },
        },
        { model: db.item_master },
        { model: db.tbl_time_card_defect },
        { model: db.tbl_time_card_detail_worker, include: [db.tbl_worker] },
      ],
    });
    res.json(timecardDetails);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
};

exports.get_detail_receive_qty = async (req, res) => {
  try {
    const { log_id } = req.params;
    // const timecardDetail = await db.tbl_time_card_detail.findOne({
    //   where: { id: log_id },
    //   include: [
    //     {
    //       model: db.tbl_time_card,
    //     },
    //   ],
    // });
    // if (!timecardDetail) {
    //   return res.status(404).send({ error: "Time card detail not found" });
    // }
    // if (timecardDetail.mch_id === null) {
    //   return res
    //     .status(404)
    //     .send({ error: "Machine is not set in timecard detail" });
    // }
    // const plc = await db.tbl_plc_mapping_machine.findOne({
    //   where: {
    //     company_id: req.requester_company_id,
    //     machine_id: timecardDetail.mch_id,
    //   },
    // });
    // if (!plc) {
    //   return res.json({ qty: 0 });
    // }
    // const [iotData] = await db.sequelize.query(
    //   `SELECT * FROM iotdata
    //   WHERE MachineID = ${plc.plc_id}
    //     AND DataDateTime
    //     BETWEEN '${dayjs(timecardDetail.tbl_time_card.doc_date).format(
    //       "YYYY-MM-DD"
    //     )} ${timecardDetail.time_start}:00'
    //       AND '${dayjs(timecardDetail.tbl_time_card.doc_date).format(
    //         "YYYY-MM-DD"
    //       )} ${timecardDetail.time_end}:00';`
    // );
    const qty = await getReceiveQty(log_id, req.requester_company_id);
    res.json({ qty: qty });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

exports.listWorkOrderOptions = async (req, res) => {
  try {
    const { requester_company_id } = req;
    const result = await tbl_time_card_service.list_work_order_option(
      requester_company_id
    );
    res.status(200).send(result.map(({ doc_running_no }) => doc_running_no));
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

exports.listOperationOrdOptions = async (req, res) => {
  try {
    const { company_id } = req.params;
    const result = await tbl_time_card_service.list_opn_ord(company_id);
    res.status(200).send(
      result.map((opn_ord) => ({
        id: opn_ord.id,
        label: `OPN:${opn_ord.id} ${opn_ord.opn_name} WO:${opn_ord.doc_running_no}-Batch${opn_ord.batch_count}`,
        opn_desc: opn_ord.opn_name,
      }))
    );
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

exports.get_ord_by_id = async (req, res) => {
  try {
    const { opn_ord_id } = req.params;
    const result = await tbl_time_card_service.get_ord_by_id(opn_ord_id);
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

exports.remove_time_card = async (req, res) => {
  try {
    const { tc_id } = req.params;
    const result = await tbl_time_card_service.remove_time_card(tc_id);
    res.sendStatus(200).send(result);
  } catch (error) {
    res.sendStatus(500).send({ error: error.message });
  }
};

exports.remove_time_card_detail = async (req, res) => {
  try {
    const { tc_id } = req.params;
    const result = await tbl_time_card_service.remove_time_card_detail(tc_id);
    res.sendStatus(200).send(result);
  } catch (error) {
    res.sendStatus(500).send({ error: error.message });
  }
};

exports.getRunningOpnByMachine = async (req, res) => {
  try {
    const { mch_id } = req.params;
    const details = await db.tbl_time_card_detail.findAll({
      where: {
        mch_id,
      },
      include: [
        {
          model: db.tbl_time_card,
        },
        {
          model: db.tbl_opn_ord,
          where: {
            status: "A",
          },
          required: true,
        },
      ],
    });
    const result = details.map((detail) => detail.opn_ord_id);
    res.status(200).send([...new Set(result)]);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

const getPerformance = async (timecardDetails, routing, kpi) => {
  let accumulatedTime = 0;
  let accumulatedQty = 0;
  let accumulatedStandardPcs = 0;
  const target = kpi.target;
  const pcsPerHour = routing.pcs_hour;
  timecardDetails.forEach((detail) => {
    const { work_hours, qty } = detail;
    accumulatedTime += work_hours;
    accumulatedQty += qty;
    accumulatedStandardPcs += work_hours * pcsPerHour;
    return acc;
  });
  return {
    target,
    hours: accumulatedTime,
    standard_pcs: accumulatedStandardPcs,
    actual_pcs: accumulatedQty,
    performance:
      Math.round((accumulatedQty / accumulatedStandardPcs) * 100 * 100) / 100 ||
      0,
  };
};

const getReportByDateAndShiftz = async (
  date,
  shift_id,
  requester_id,
  isLeader,
  requester_company_id
) => {
  const startAt = date
    ? dayjs(date).startOf("day").toDate()
    : dayjs().startOf("day").toDate();
  const endAt = date
    ? dayjs(date).endOf("day").toDate()
    : dayjs().endOf("day").toDate();

  const whereTimeCard = {
    shift_id,
    status: "post",
    time_card_type: "worker",
  };

  const shift = await db.tbl_shift.findOne({
    where: {
      id: shift_id,
    },
  });

  if (!isLeader) {
    whereTimeCard.created_by = requester_id;
  }
  const timecardDetails = await db.tbl_time_card_detail.findAll({
    where: {
      time_card_date: {
        [db.Sequelize.Op.between]: [startAt, endAt],
      },
    },
    include: [
      {
        model: db.tbl_time_card,
        where: whereTimeCard,

        require: true,
      },
      {
        model: db.tbl_mch,
        include: [db.tbl_work_center],
      },
      {
        model: db.tbl_opn_ord,
        include: [db.tbl_ord],
      },
      {
        model: db.tbl_time_card_detail_worker,
        include: db.tbl_worker,
      },
      {
        model: db.tbl_time_card_defect,
      },
      {
        model: db.item_master,
      },
    ],
  });
  const formattedTimecardDetail = await Promise.all(
    timecardDetails.map(async (timecardDetail) => {
      const { work_hours, tbl_opn_ord } = timecardDetail;
      const isDownTime = timecardDetail.downtime_id !== null;
      if (!isDownTime && tbl_opn_ord) {
        const routing = await db.tbl_routing.findOne({
          where: {
            opn_id: tbl_opn_ord?.opn_id,
            rtg_id: tbl_opn_ord?.rtg_id,
          },
        });
        const standard_pcs = work_hours * (routing?.pcs_hr || 1);
        timecardDetail.dataValues.standardPcs = standard_pcs;
      } else {
        timecardDetail.dataValues.standardPcs = 0;
      }

      const timecardDetailByOpn = await db.tbl_time_card_detail.findAll({
        where: {
          opn_ord_id: tbl_opn_ord.id,
        },
        include: [
          {
            model: db.tbl_time_card,
            include: [db.tbl_shift],
          },
        ],
      });

      let filteredTimecardDetailByShift = timecardDetailByOpn;

      if (shift && shift.start_time) {
        const endTimeForFilter = dayjs.tz(
          `${dayjs.tz(date, "Asia/Bangkok").format("YYYY-MM-DD")} ${dayjs
            .tz(shift.start_time, "utc")
            .format("HH:mm:ss")}`,
          "Asia/Bangkok"
        );
        filteredTimecardDetailByShift = timecardDetailByOpn.filter((t) => {
          if (!t.tbl_time_card.tbl_shift) {
            return false;
          }
          const tcDateTime = dayjs.tz(
            `${dayjs.tz(date, "Asia/Bangkok").format("YYYY-MM-DD")} ${dayjs
              .tz(t.tbl_time_card.tbl_shift.start_time, "utc")
              .format("HH:mm:ss:SSS")}`,
            "Asia/Bangkok"
          );
          return tcDateTime.isSameOrBefore(endTimeForFilter);
        });
      }

      const accumulatedQty = filteredTimecardDetailByShift
        .filter(
          (t) =>
            t.tbl_time_card.status === "post" &&
            t.tbl_time_card.time_card_type === "worker"
        )
        .reduce((acc, cur) => acc + cur.qty, 0);
      timecardDetail.dataValues.wo_running_no =
        timecardDetail?.wo_running_no || "-";
      timecardDetail.dataValues.opn_ord_id = timecardDetail?.opn_ord_id || "-";
      timecardDetail.dataValues.opn_desc = timecardDetail?.opn_desc || "-";
      timecardDetail.dataValues.item_id =
        timecardDetail?.item_master?.item_id || "-";
      timecardDetail.dataValues.item_name =
        timecardDetail?.item_master?.item_name || "-";
      timecardDetail.dataValues.batch_count =
        timecardDetail?.tbl_opn_ord?.batch_count || "-";
      timecardDetail.dataValues.defect_count =
        timecardDetail.tbl_time_card_defects.reduce(
          (acc, defect) => (acc += defect.qty),
          0
        );
      timecardDetail.dataValues.downtime = isDownTime ? work_hours : 0;
      timecardDetail.dataValues.isDownTime = isDownTime;
      timecardDetail.dataValues.opn_status =
        tbl_opn_ord.prod_status === "E" ? "END" : "OPEN";
      // timecardDetail.dataValues.qty = parseFloat(qty);
      timecardDetail.dataValues.acc_qty = accumulatedQty.toFixed(2);
      return timecardDetail;
    })
  );

  const groupedTimecardByMachineOPN = formattedTimecardDetail.reduce(
    (acc, cur) => {
      if (cur.dataValues.isDownTime) {
        const foundDownTime = acc.find(
          (mchOpn) =>
            mchOpn.dataValues.isDownTime && mchOpn.mch_id === cur.mch_id
        );
        if (foundDownTime) {
          foundDownTime.dataValues.downtime += cur.work_hours;
        } else {
          acc.push(cur);
        }

        return acc;
      }
      const foundMachineOpn = acc.find(
        (mchOpn) =>
          mchOpn.mch_id === cur.mch_id &&
          mchOpn.opn_ord_id === cur.opn_ord_id &&
          mchOpn.tbl_opn_ord.batch_count === cur.tbl_opn_ord.batch_count
      );
      if (foundMachineOpn) {
        if (cur.qty > foundMachineOpn.qty) {
          foundMachineOpn.qty = cur.qty;
          foundMachineOpn.work_hours = cur.work_hours;
          foundMachineOpn.dataValues.defect_count +=
            cur.dataValues.defect_count;
        }
        return acc;
      } else {
        acc.push(cur);
        return acc;
      }
    },
    []
  );

  const timecardByMachines = groupedTimecardByMachineOPN.reduce((acc, cur) => {
    const { tbl_mch } = cur;
    const foundMachine = acc.find(
      (timecardByMachine) => timecardByMachine.machine.id === tbl_mch.id
    );
    if (foundMachine) {
      foundMachine.total_work_hours += cur.isDownTime ? 0 : cur.work_hours;
      foundMachine.total_acc_qty += parseFloat(cur.dataValues.acc_qty);
      foundMachine.total_defects += cur.dataValues.defect_count;
      //   console.log("cur.dataValues.downtime");
      // console.log(cur.work_hours);
      // console.log(cur);
      foundMachine.total_qty += cur.qty;
      foundMachine.total_downtime += cur.work_hours;
      foundMachine.total_standard_qty += cur.dataValues.standardPcs;
      foundMachine.total_plan_hours +=
        cur.tbl_mch.tbl_work_center.total_plan_hour;
      foundMachine.timecards.push(cur);
    } else {
      acc.push({
        workCenter: tbl_mch.tbl_work_center,
        machine: tbl_mch,
        total_work_hours: cur.dataValues.isDownTime ? 0 : cur.work_hours,
        total_defects: cur.dataValues.defect_count,
        total_qty: cur.qty,
        total_acc_qty: parseFloat(cur.dataValues.acc_qty),
        total_downtime: cur.work_hours,
        total_standard_qty: cur.dataValues.standardPcs,
        total_plan_hours: tbl_mch.tbl_work_center.total_plan_hour,
        timecards: [cur],
      });
    }
    return acc;
  }, []);

  const timecardByMachinesWithSummary = timecardByMachines.map((machine) => {
    machine.performance = getPerformanceValue(
      machine.total_qty,
      machine.total_standard_qty
    );
    machine.availability = getAvailabilityValue(
      machine.total_work_hours,
      machine.total_plan_hours
    );
    machine.quality = getQualityValue(
      machine.total_qty,
      machine.total_qty + machine.total_defects
    );

    machine.oee = getOEEValue(
      machine.performance,
      machine.availability,
      machine.quality
    );
    return machine;
  });

  const machineTimecardByWorkCenter = timecardByMachinesWithSummary.reduce(
    (acc, cur) => {
      const { workCenter } = cur;
      const foundWorkCenter = acc.find(
        (wc) => wc.workCenter.wc_id === workCenter.wc_id
      );

      if (foundWorkCenter) {
        foundWorkCenter.total_work_hours += cur.total_work_hours;
        foundWorkCenter.total_defects += cur.total_defects;
        foundWorkCenter.total_qty += cur.total_qty;
        foundWorkCenter.total_acc_qty += cur.total_acc_qty;
        foundWorkCenter.total_downtime += cur.total_downtime;
        foundWorkCenter.total_standard_qty += cur.total_standard_qty;
        foundWorkCenter.total_plan_hours += cur.total_plan_hours;
        foundWorkCenter.machines.push(cur);
      } else {
        acc.push({
          workCenter,
          total_work_hours: cur.total_work_hours,
          total_defects: cur.total_defects,
          total_qty: cur.total_qty,
          total_acc_qty: cur.total_acc_qty,
          total_downtime: cur.total_downtime,
          total_standard_qty: cur.total_standard_qty,
          total_plan_hours: cur.total_plan_hours,
          machines: [cur],
        });
      }
      return acc;
    },
    []
  );

  const shiftSummary = {
    total_qty: 0,
    total_acc_qty: 0,
    total_work_hours: 0,
    total_defects: 0,
    total_plan_hours: 0,
    total_downtime: 0,
    total_standard_qty: 0,
  };
  const machineTimecardByWorkCenterWithSummary =
    machineTimecardByWorkCenter.map((workCenter) => {
      shiftSummary.total_qty += workCenter.total_qty;
      shiftSummary.total_acc_qty += workCenter.total_acc_qty;
      shiftSummary.total_work_hours += workCenter.total_work_hours;
      shiftSummary.total_defects += workCenter.total_defects;
      shiftSummary.total_plan_hours += workCenter.total_plan_hours;
      shiftSummary.total_downtime += workCenter.total_downtime;
      shiftSummary.total_standard_qty += workCenter.total_standard_qty;
      workCenter.performance = getPerformanceValue(
        workCenter.total_qty,
        workCenter.total_standard_qty
      );
      workCenter.availability = getAvailabilityValue(
        workCenter.total_work_hours,
        workCenter.total_plan_hours
      );
      workCenter.quality = getQualityValue(
        workCenter.total_qty,
        workCenter.total_qty + workCenter.total_defects
      );
      workCenter.oee = getOEEValue(
        workCenter.performance,
        workCenter.availability,
        workCenter.quality
      );
      return workCenter;
    });
  shiftSummary.performance = getPerformanceValue(
    shiftSummary.total_qty,
    shiftSummary.total_standard_qty
  );
  shiftSummary.availability = getAvailabilityValue(
    shiftSummary.total_work_hours,
    shiftSummary.total_plan_hours
  );
  shiftSummary.quality = getQualityValue(
    shiftSummary.total_qty,
    shiftSummary.total_qty + shiftSummary.total_defects
  );
  shiftSummary.oee = getOEEValue(
    shiftSummary.performance,
    shiftSummary.availability,
    shiftSummary.quality
  );
  const user = await db.tbl_users.findOne({
    where: {
      id: requester_id,
    },
  });

  shiftSummary.created_by = `${user.firstname} ${user.lastname}`;
  shiftSummary.shift = shift.shift_name;
  shiftSummary.date = dayjs(date).format("DD/MM/YYYY");
  shiftSummary.start_time = dayjs(shift.start_time).tz("UTC").format("HH:mm");
  shiftSummary.end_time = dayjs(shift.end_time).tz("UTC").format("HH:mm");
  shiftSummary.workCenters = machineTimecardByWorkCenterWithSummary;

  return shiftSummary;
};

const getReportByDateAndShift = async (
  date,
  shift_id,
  requester_id,
  requester_company_id
) => {
  const startAt = date
    ? dayjs(date).startOf("day").toDate()
    : dayjs().startOf("day").toDate();
  const endAt = date
    ? dayjs(date).endOf("day").toDate()
    : dayjs().endOf("day").toDate();
  const timecardDetails = await db.tbl_time_card_detail.findAll({
    include: [
      {
        model: db.tbl_time_card,
        where: {
          shift_id,
          doc_date: {
            [db.Sequelize.Op.between]: [startAt, endAt],
          },
          created_by: requester_id,
          status: "post",
        },

        require: true,
      },
      {
        model: db.tbl_mch,
        include: [db.tbl_work_center],
      },
      {
        model: db.tbl_opn_ord,
      },
      {
        model: db.tbl_time_card_detail_worker,
        include: db.tbl_worker,
      },
      {
        model: db.tbl_time_card_defect,
      },
      {
        model: db.item_master,
      },
    ],
  });
  const timecardByMachines = timecardDetails.reduce((acc, cur) => {
    const { tbl_mch } = cur;
    const foundMachine = acc.find(
      (timecardByMachine) => timecardByMachine.machine.id === tbl_mch.id
    );
    if (foundMachine) {
      foundMachine.timecards.push(cur);
    } else {
      acc.push({
        workCenter: tbl_mch.tbl_work_center,
        machine: tbl_mch,
        timecards: [cur],
      });
    }
    return acc;
  }, []);
  // {
  //   workCenter: tbl_work_center,
  //   machine: tbl_mch,
  //   timecards: [tbl_time_card_detail]
  // }[]
  const machineTimecardByWorkCenter = timecardByMachines.reduce((acc, cur) => {
    const { workCenter, machine } = cur;
    const foundWorkCenter = acc.find(
      (wc) => wc.workCenter.wc_id === workCenter.wc_id
    );
    if (foundWorkCenter) {
      foundWorkCenter.machines.push(cur);
    } else {
      acc.push({
        workCenter,
        machines: [cur],
      });
    }
    return acc;
  }, []);
  // {
  //   workCenter: tbl_work_center,
  //   machines: [
  //     {
  //       machine: tbl_mch,
  //       timecards: [tbl_time_card_detail],
  //     },
  //   ];
  // }[]
  const accumulatedData = machineTimecardByWorkCenter.map((wc) => {
    const { workCenter, machines } = wc;
    const totalWorkHours = machines.reduce((acc, cur) => {
      const { timecards } = cur;
      const totalWorkHours = timecards.reduce(
        (acc, cur) => acc + cur.work_hours,
        0
      );
      return acc + totalWorkHours;
    }, 0);

    const totalDefects = machines.reduce((acc, cur) => {
      const { timecards } = cur;
      const totalDefects = timecards.reduce((acc, cur) => {
        return (
          acc +
          cur.tbl_time_card_defects.reduce(
            (acc, defect) => (acc += defect.qty),
            0
          )
        );
      }, 0);
      return acc + totalDefects;
    }, 0);

    const totalQty = machines.reduce((acc, cur) => {
      const { timecards } = cur;
      const totalQty = timecards.reduce((acc, cur) => acc + Number(cur.qty), 0);
      return acc + totalQty;
    }, 0);

    return {
      wc_id: workCenter.wc_id,
      wc_name: workCenter.wc_name,
      total_plan_hours: workCenter.total_plan_hours,
      total_work_hours: totalWorkHours,
      total_defects: totalDefects,
      total_qty: totalQty,
      machines: machines.map((mch) => {
        const { machine, timecards } = mch;
        const { machine_id, name } = machine;

        const totalDowntime = timecards.reduce((acc, cur) => {
          if (cur.downtime_id !== null) {
            acc += cur.work_hours;
          }
          return acc;
        }, 0);

        const totalWorkHours =
          timecards.reduce((acc, cur) => acc + cur.work_hours, 0) -
          totalDowntime;

        const totalDefects = timecards.reduce((acc, cur) => {
          return (
            acc +
            cur.tbl_time_card_defects.reduce(
              (acc, defect) => (acc += defect.qty),
              0
            )
          );
        }, 0);

        const totalQty = timecards.reduce(
          (acc, cur) => acc + Number(cur.qty),
          0
        );

        return {
          mch_id: machine_id,
          mch_name: name,
          total_work_hours: totalWorkHours,
          total_defects: totalDefects,
          total_qty: totalQty,
          total_downtime: totalDowntime,
          timecards: timecards.map((timecard) => {
            const {
              id,
              qty,
              work_hours,
              tbl_opn_ord,
              opn_desc,
              tbl_time_card_defects,
              wo_running_no,
              item_master,
              downtime_id,
            } = timecard;
            const isDownTime = downtime_id !== null;
            return {
              id,
              wo_running_no: isDownTime ? "-" : wo_running_no,
              item_name: isDownTime
                ? "-"
                : `${item_master.item_id}-${item_master.item_name}`,
              opn_ord_id: isDownTime ? "-" : tbl_opn_ord.id,
              opn_id: isDownTime ? "-" : tbl_opn_ord.opn_id,
              rtg_id: isDownTime ? "-" : tbl_opn_ord.rtg_id,
              opn_desc: isDownTime ? "-" : opn_desc,
              batch: isDownTime ? "-" : tbl_opn_ord.batch_count,
              qty,
              work_hours: isDownTime ? 0 : work_hours,
              defects: tbl_time_card_defects.reduce(
                (acc, defect) => (acc += defect.qty),
                0
              ),
              downtime: isDownTime ? work_hours : 0,
            };
          }),
        };
      }),
    };
  });
  const kpiCache = {};
  const report_data = {
    work_hours: 0,
    defect: 0,
    qty: 0,
    plan_hour: 0,
    standard_pcs: 0,
    availability: 0,
    quality_rate: 0,
    performance: 0,
    downtime: 0,
    oee: 0,
  };
  const reportData = await Promise.all(
    accumulatedData.map(async (wcData) => {
      const { wc_id, machines } = wcData;
      let kpi;
      if (wc_id in kpiCache) {
        kpi = kpiCache[wc_id];
      } else {
        kpi = await db.tbl_kpi_master.findOne({
          where: {
            wc_id,
          },
        });
        kpiCache[wc_id] = kpi;
      }
      let total_standard_qty_by_wc = 0;
      let total_plan_hour_by_wc = 0;
      let total_downtime_by_wc = 0;
      const target = kpi ? kpi.target : 80;
      const machineWithReports = await Promise.all(
        machines.map(async (machine) => {
          const { timecards } = machine;
          machine.total_standard_qty = 0;
          machine.total_plan_hours = 0;
          const AKpi = await db.tbl_kpi_master.findOne({
            where: {
              title_id: 2,
              company_id: requester_company_id,
            },
          });
          const Atarget = AKpi?.target || 80;
          await Promise.all(
            timecards.map(async (timecardDetail) => {
              if (timecardDetail.downtime_id !== null) {
                return timecardDetail;
              }
              const { opn_id, rtg_id, work_hours } = timecardDetail;

              const routing = await db.tbl_routing.findOne({
                where: {
                  opn_id,
                  rtg_id,
                },
              });
              const standard_pcs = work_hours * (routing.pcs_hr || 1);
              timecardDetail.standard_pcs = standard_pcs;
              machine.total_standard_qty += standard_pcs;
              machine.total_plan_hours += work_hours;
              return timecardDetail;
            })
          );
          const allQty = machine.total_qty + machine.total_defects;
          machine.availability =
            Math.round(
              (machine.total_work_hours / machine.total_plan_hours) * 100 * 100
            ) / 100 || 0;
          machine.quality_rate =
            Math.round((machine.total_qty / allQty) * 100 * 100) / 100 || 0;
          machine.performance =
            Math.round(
              (machine.total_qty / machine.total_standard_qty) * 100 * 100
            ) / 100;
          machine.oee = getOEEValue(
            machine.performance,
            machine.quality_rate,
            machine.availability
          );
          total_standard_qty_by_wc += machine.total_standard_qty;
          total_plan_hour_by_wc += machine.total_plan_hours;
          total_downtime_by_wc += machine.total_downtime;
        })
      );
      wcData.total_qty = wcData.total_qty.toFixed(2);
      wcData.total_acc_qty = wcData.total_acc_qty.toFixed(2);
      report_data.standard_pcs += total_standard_qty_by_wc;
      report_data.plan_hour += total_plan_hour_by_wc;
      report_data.qty += wcData.total_qty;
      report_data.defect += wcData.total_defects;
      report_data.work_hours += wcData.total_work_hours;
      report_data.total_downtime += total_downtime_by_wc;
      const allQty = wcData.total_qty + wcData.total_defects;

      wcData.availability =
        (
          Math.round(
            (wcData.total_work_hours / total_plan_hour_by_wc) * 100 * 100
          ) / 100
        ).toFixed() || 0;
      wcData.quality_rate =
        (Math.round((wcData.total_qty / allQty) * 100 * 100) / 100).toFixed(
          2
        ) || 0;
      wcData.performance =
        (
          Math.round(
            (wcData.total_qty / total_standard_qty_by_wc) * 100 * 100
          ) / 100
        ).toFixed(2) || 0;
      wcData.oee = getOEEValue(
        wcData.performance,
        wcData.quality_rate,
        wcData.availability
      );
    })
  );

  const report = {};
  report.total_qty = report_data.qty;
  report.total_defects = report_data.defect;
  report.total_downtime = report_data.total_downtime;
  report.availability =
    Math.round((report_data.work_hours / report_data.plan_hour) * 100 * 100) /
      100 || 0;
  report.quality_rate =
    Math.round(
      (report_data.qty / (report_data.qty + report_data.defect)) * 100 * 100
    ) / 100 || 0;
  report.performance =
    Math.round((report_data.qty / report_data.standard_pcs) * 100 * 100) /
      100 || 0;
  report.oee = getOEEValue(
    report.performance,
    report.availability,
    report.quality_rate
  );

  const user = await db.tbl_users.findOne({ where: { id: requester_id } });
  const shift = await db.tbl_shift.findOne({ where: { id: shift_id } });
  report.created_by = `${user.firstname} ${user.lastname}`;
  report.shift = shift.shift_name;
  report.date = dayjs(date).format("YYYY-MM-DD");
  report.start_time = dayjs(shift.start_time).format("HH:mm");
  report.end_time = dayjs(shift.end_time).format("HH:mm");
  report.workCenters = accumulatedData;
  return report;
};

exports.get_time_card_report = async (req, res) => {
  try {
    const { start_date, end_date, is_leader } = req.query;
    const { shift_id } = req.params;
    const requester_id = req.requester_id;
    const requester_company_id = req.requester_company_id;
    const startDate = start_date
      ? dayjs(start_date).toDate()
      : dayjs().startOf("day").toDate();
    const endDate = end_date
      ? dayjs(end_date).toDate()
      : dayjs().endOf("day").toDate();

    const splitDateList = [];
    let currentDate = startDate;
    while (currentDate <= endDate) {
      splitDateList.push(currentDate);
      currentDate = dayjs(currentDate).add(1, "day").toDate();
    }

    const result = await Promise.all(
      splitDateList.map(async (date) =>
        getReportByDateAndShiftz(
          date,
          shift_id,
          requester_id,
          is_leader == "true",
          requester_company_id
        )
      )
    );
    res.status(200).send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
};
// exports.update = async (req, res) => {
//   try {
//     res
//       .status(201)
//       .json(await tbl_mch_service.update(req.params.mch_id, req.body));
//   } catch (error) {
//     res.json({ message: error.message });
//     return;
//   }
// };

// exports.delete = async (req, res) => {
//   res.json(await tbl_mch_service.delete(req.params.mch_id));
// };

exports.getdeletejobbycompany = async (req, res) =>
  res.json(await tbl_time_card_service.getdeletejobbycompany(req.body));

exports.list_doc_running_no_option = async (req, res) =>
  res.json(
    await tbl_time_card_service.list_doc_running_no_option(
      req.params.company_id
    )
  );

exports.listtimecardWorkOrderOptions = async (req, res) =>
  res
    .status(200)
    .send(
      await tbl_time_card_service.listtimecardWorkOrderOptions(
        req.params.company_id
      )
    );

exports.time_card_detail_check_opn_id_ues = async (req, res) =>
  res
    .status(200)
    .send(
      await tbl_time_card_service.time_card_detail_check_opn_id_ues(
        req.params.opn_id
      )
    );

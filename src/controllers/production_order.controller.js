const ProductionOrderService = require("../services/production_order.service");
const doc_runningService = require("../services/doc_running.service");
const tbl_routingService = require("../services/tbl_routing.service");
const ProductionOrderTempService = require("../services/production_order_tmp.service");
const DraftProdOrderPlanService = require("../services/production_order_draft.service");
const tbl_mch_shift = require("../services/tbl_mch_shift.service");
const OrderService = require("../services/order.service");

const TempOpnOrd = require("../services/temp_opn_ord.service");
const TempOpnTmp = require("../services/temp_opn_tmp.service");
const TempOrder = require("../services/temp_order.service");

const AdjustTempOpnTmpService = require("../services/temp_adjust_opn_tmp.service");
const AdjustTempOpnOrdService = require("../services/temp_adjust_opn_ord.service");

const RoutingTmpService = require("../services/tbl_routing_tmp.service");

const { Op } = require("sequelize");
const timezone = require("dayjs/plugin/timezone");
const utc = require("dayjs/plugin/utc");
const dayjs = require("dayjs");

dayjs.extend(utc);
dayjs.extend(timezone);

const moment = require("moment");
const { log } = require("make");
const { production } = require("../db/sequelize");
const { error } = require("make/src/log");
const e = require("express");
const { get } = require("curl");
const db = require("../db/models");

exports.getAll = async (req, res) =>
  res.json(await ProductionOrderService.findAll(req.params.id));

exports.getProductionOrderAndName = async (req, res) =>
  res.json(
    await ProductionOrderService.findProductionOrderAndName(req.params.id)
  );

exports.getAllByID = async (req, res) =>
  res.json(
    await ProductionOrderService.findAllByID(
      req.params.id,
      req.params.u_define_id
    )
  );

exports.getMachineOpnByShift = async (req, res) => {
  try {
    const { machineId } = req.params;
    const machine = await db.tbl_mch.findOne({ where: { id: machineId } });
    if (!machine) {
      return res.status(404).json({ message: "machine not found" });
    }
    const opns = await db.tbl_opn_ord.findAll({
      where: {
        machine_id: machineId,
        status: "A",
      },
      include: [{ model: db.tbl_routing }],
    });
    return res.json(opns);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getListAll = async (req, res) => {
  var tmpObject = [];

  const res_position = await ProductionOrderService.findListAll();

  // id;
  // name;
  // companyId;
  // user_create;
  // user_update;
  // created_at;
  // updated_at;

  res_position.forEach((x, index) => {
    var tmpSubObject = {
      name: "Account Manager",
      id: "5fa8c4e75f2f6e2f4b8d819c",
      companyId: "5fa8afec23c6dd2f52f00612",
      createdAt: "2020-11-09T04:26:15.927Z",
      updatedAt: "2021-01-08T07:45:39.742Z",
    };

    // console.log(x);
    // console.log(x.name);
    tmpSubObject.id = x.id;
    tmpSubObject.name = x.name;
    tmpSubObject.companyId = x.companyId;
    tmpSubObject.createdAt = x.createdAt;
    tmpSubObject.updatedAt = x.updatedAt;
    // console.log("tmpSubObject: ", JSON.stringify(tmpSubObject));
    tmpObject.push(tmpSubObject);
  });

  return res.status(200).json(tmpObject);
};

exports.getListByCompany = async (req, res) => {
  var tmpObject = [];

  const res_position = await ProductionOrderService.findListByCompany(
    req.params.company_id
  );

  // id;
  // name;
  // companyId;
  // user_create;
  // user_update;
  // created_at;
  // updated_at;

  res_position.forEach((x, index) => {
    var tmpSubObject = {
      name: "Account Manager",
      id: "5fa8c4e75f2f6e2f4b8d819c",
      companyId: "5fa8afec23c6dd2f52f00612",
      createdAt: "2020-11-09T04:26:15.927Z",
      updatedAt: "2021-01-08T07:45:39.742Z",
    };

    // console.log(x);
    // console.log(x.name);
    tmpSubObject.id = x.id;
    tmpSubObject.name = x.name;
    tmpSubObject.companyId = x.companyId;
    tmpSubObject.createdAt = x.createdAt;
    tmpSubObject.updatedAt = x.updatedAt;
    // console.log("tmpSubObject: ", JSON.stringify(tmpSubObject));
    tmpObject.push(tmpSubObject);
  });

  return res.status(200).json(tmpObject);
};
exports.getAlldata = async (req, res) =>
  res.json(await ProductionOrderService.getAlldata());

exports.create = async (req, res) => {
  try {
    res.status(201).json(await ProductionOrderService.create(req.body));
  } catch (err) {
    res.status(204).json({ message: err });
  }
};

exports.saveProductionOrderDraft = async (req, res) => {
  let post_data = req.body;
  let doc_running = "";
  let doc_group_name = null; // ชื่อกลุ่มเอกสาร

  let routing_master_data = null; // ข้อมูล Routing + OPN ทั้งหมด
  let time_stamp = null; // วันที่เวลาปัจจุบัน
  let template_shift = []; // ทำ template กะไว้ก่อนเพื่อเอาไว้เช็ค due_date ว่าตรงกับกะไหม
  let master_data_production_order = null; // ข้อมูล Production Order ทั้งหมด
  let end_time_process = null; // เวลาที่จบการทำงาน OPN นั้นๆ
  let end_time_process_overlab = null; // เวลาที่จบการทำงาน OPN นั้นๆ คำนวนใหม่จาก overlap time

  let due_date_time = null; // วันที่ต้องส่งมอบ

  try {
    due_date_time = post_data.due_date + " " + post_data.due_time;
    // console.log("due_date_time: ", due_date_time);
    // console.log("post_data: ", JSON.stringify(post_data));

    time_stamp = post_data.due_date;

    // step1 : generate doc_running
    doc_running = await doc_runningService.docGenerate(
      post_data.doc_module_name
    );
    // console.log("doc_running: ", doc_running);

    // ---------- insert tbl_order -----------

    let data_order = {
      doc_running_no: doc_running,
      doc_module_name: post_data.doc_module_name,
      item_master_id: post_data.item_master_id,
      order_qty: post_data.order_qty,
      qty_remain: post_data.order_qty,
      rtg_id: post_data.rtg_id,
      line_of_mch: post_data.line_of_mch,
      order_date: post_data.order_date,
      due_date: post_data.due_date,
      due_time: post_data.due_time,
      company_id: post_data.company_id,
      user_create: post_data.user_create,
      created_at: new Date(),
    };
    //req.requester_id

    // console.log("data_order: ", JSON.stringify(data_order));
    await OrderService.create(data_order);

    // ---------- insert tbl_order -----------

    // step2 : get routing data by item_master_id and rtg_id
    // ดึงข้อมูล Routing + OPN มาวน loop คำนวน
    routing_master_data = await tbl_routingService.findRoutingWorkOrderByRTGID(
      post_data.item_master_id,
      post_data.rtg_id,
      post_data.company_id
    );
    // console.log("routing_master_data: ", JSON.stringify(routing_master_data));

    // วน insert ข้อมูลลง production_order_temp
    for (let i = 0; i < routing_master_data.length; i++) {
      let ovl_time = 0;

      if (
        routing_master_data[i].over_lap_unit == null ||
        routing_master_data[i].over_lap_unit == 0
      ) {
        if (
          routing_master_data[i].over_lap_time == null ||
          routing_master_data[i].over_lap_time == 0
        ) {
          ovl_time = 0;
        } else {
          ovl_time = parseFloat(routing_master_data[i].over_lap_time);
        }
      } else {
        ovl_time = parseFloat(
          routing_master_data[i].over_lap_unit / routing_master_data[i].pcs_hr
        );
      }

      let data = {
        doc_running_no: doc_running,
        item_id: i + 1,
        item_master_id: post_data.item_master_id,
        order_qty: post_data.order_qty,
        rtg_id: post_data.rtg_id,
        opn_id: routing_master_data[i].opn_id,
        pcs_hr: routing_master_data[i].pcs_hr,
        time_process_by_opn: 0,
        setup_time: 0,
        real_qty_order_scrap_by_opn: 0,
        machine_id: routing_master_data[i].machine_id,
        scrap_per: 0,
        overlap_time: ovl_time,
        setup_timehr_per: routing_master_data[i].setup_timehr_per,
        batch: routing_master_data[i].batch,
        opn_start_date_time: null,
        opn_end_date_time: null,
        overlab_time_cal: 0,
        company_id: post_data.company_id,
        predecessor: routing_master_data[i].predecessor,
        dependency: routing_master_data[i].dependency,
        user_create: post_data.user_create,
        created_at: post_data.created_at,
      };
      // console.log("data loop master data: ", JSON.stringify(data));
      try {
        await ProductionOrderTempService.create(data);
      } catch (error) {
        console.log("ProductionOrderTempService.create error: ", error);
      }

      // -- stamp due_date_time to last opn --
      if (routing_master_data.length - 1 == i) {
        // console.log("routing_master_data.length - 1 == i");

        let data_due_date = {
          opn_end_date_time: due_date_time,
        };

        try {
          await ProductionOrderTempService.update(
            doc_running,
            routing_master_data[i].rtg_id,
            routing_master_data[i].item_master_id,
            routing_master_data[i].opn_id,
            data_due_date
          );
        } catch (error) {
          console.log("ProductionOrderTempService.update error: ", error);
        }
      }
      // -- stamp due_date_time to last opn --
    }

    //เรียงลำดับ OPN จากมากไปน้อย
    routing_master_data.sort((a, b) => b.id - a.id);

    // console.log("routing_master_data: ", JSON.stringify(routing_master_data));

    // -------------- calculate overlab time  and update to database ----------------
    let cal_ov = 0.0;
    // let cal_ov_opn = null;
    let data_ov = {
      overlab_time_cal: 0,
      overlab_opn_id: null,
    };

    for (let i = 0; i < routing_master_data.length; i++) {
      // routing_master_data.forEach(async (item) => {

      try {
        await ProductionOrderTempService.update(
          doc_running,
          routing_master_data[i].rtg_id,
          routing_master_data[i].item_master_id,
          routing_master_data[i].opn_id,
          data_ov
        );
      } catch (error) {
        console.log("ProductionOrderTempService.update error: ", error);
      }

      if (
        routing_master_data[i].over_lap_unit == null ||
        routing_master_data[i].over_lap_unit == 0
      ) {
        if (
          routing_master_data[i].over_lap_time == null ||
          routing_master_data[i].over_lap_time == 0
        ) {
          data_ov.overlab_opn_id = null;
          cal_ov = 0;
        } else {
          cal_ov = parseFloat(routing_master_data[i].over_lap_time);
          data_ov.overlab_opn_id = routing_master_data[i].opn_id;
        }
      } else {
        cal_ov = parseFloat(
          routing_master_data[i].over_lap_unit / routing_master_data[i].pcs_hr
        );
        data_ov.overlab_opn_id = routing_master_data[i].opn_id;
      }

      data_ov.overlab_time_cal = cal_ov;

      // console.log("log over lab time: ", JSON.stringify(data_ov));

      // });
    }
    // -------------- calculate overlab time  and update to database ----------------

    //   ------------ step3 : คำนวณ OPN แต่ละตัว ------------
    // ---- loop ใหญ่ของ OPN ทั้งหมด ----
    let stamp_end_date = null;

    for (let i = 0; i < routing_master_data.length; i++) {
      // for (let i = 0; i < 3; i++) {
      template_shift = [];
      // console.log("Index i: ", i);
      if (i != 0) {
        console.log("routing_master_data.length - 1 == i");

        let data_due_date = {
          opn_end_date_time: stamp_end_date,
        };

        try {
          await ProductionOrderTempService.update(
            doc_running,
            routing_master_data[i].rtg_id,
            routing_master_data[i].item_master_id,
            routing_master_data[i].opn_id,
            data_due_date
          );
        } catch (error) {
          console.log("ProductionOrderTempService.update error: ", error);
        }
      }

      // console.log("routing_master_data[i]: ", routing_master_data[i]);

      let holiday_all = null; // วันหยุดเครื่องจักร
      let data = null; // รับข้อมูลกะ
      let shift_all = null; // ข้อมูลกะ
      let machine_all = null; // ข้อมูลเครื่องจักรใน OPN นั้นๆ
      let set_up_time = 0; // set up time ของ OPN นั้นๆ
      let time_process_by_opn = 0; // เวลาที่ใช้จริงของ OPN นั้นๆ
      let real_qty_order_scrap_by_opn = 0; // จำนวนที่ต้องผลิดจริง

      // ------------ sterp3.1 : คำนวณ OPN แต่ละตัว ------------
      // ------------ ดึงข้อมูลเครื่องจักรใน OPN นั้นๆ ------------
      machine_all = routing_master_data[i].machine_id.split(",");
      // console.log("machine_all: ", machine_all);

      // ------------ ดึงข้อมูลวันหยุด เครื่องจักร ------------
      // [
      //   {
      //     date_rom: "2024-01-30",
      //     holiday_type: "D",
      //     hours: 8,
      //   },
      //   {
      //     date_rom: "2024-02-14",
      //     holiday_type: "H",
      //     hours: 4,
      //   },
      // ];

      // ------------  step3.2 : get holiday data by machine_id and company_id ------------
      holiday_all = await tbl_routingService.findRoutingHoliday(
        machine_all,
        post_data.company_id
      );
      // console.log("holiday_all: ", JSON.stringify(holiday_all));

      // ------------ ดึงข้อมูลกะ ------------
      //   [
      //     {
      //       machine_id: "mccom1",
      //       shift_name: "กะA",
      //       start_time: "08:00:00",
      //       end_time: "17:00:00",
      //       break_start: "12:00:00",
      //       break_end: "13:00:00",
      //       summary_time: "08:00:00",
      //     },
      //     {
      //       machine_id: "mccom1",
      //       shift_name: "กะB",
      //       start_time: "17:01:00",
      //       end_time: "20:00:00",
      //       break_start: "00:00:00",
      //       break_end: "00:00:00",
      //       summary_time: "03:00:00",
      //     },
      //   ];

      // ------------  step3.3 : get shift data by machine_id and company_id  ------------

      shift_all = await tbl_routingService.findRoutingShift(
        machine_all[0],
        post_data.company_id
      );
      // console.log("shift_all: ", JSON.stringify(shift_all));

      // ข้อมูลตัวอย่าง
      // let data = [
      //   {
      //     machine_id: "mccom1",
      //     date_cal: "2024-01-30",
      //     shift_name: "กะA",
      //     start_time: "08:00:00",
      //     end_time: "17:00:00",
      //     break_start: "12:00:00",
      //     break_end: "13:00:00",
      //     summary_time: "08:00:00",
      //   },
      //   {
      //     machine_id: "mccom1",
      //     date_cal: "2024-01-30",
      //     shift_name: "กะB",
      //     start_time: "17:01:00",
      //     end_time: "20:00:00",
      //     break_start: "00:00:00",
      //     break_end: "00:00:00",
      //     summary_time: "03:00:00",
      //   },
      // ];
      data = shift_all;

      for (let i = 0; i < data.length; i++) {
        data[i].date_cal = time_stamp;
      }

      // console.log("data: ", JSON.stringify(data));

      // ------------  step3.4 : แตกกะและหาเวลารวมของแต่ละกะ + ทำ template  ------------
      // ------------  แตกกะและหาเวลารวมของแต่ละกะ ------------
      // ต้องทำ template กะไว้ก่อนเพื่อเอาไว้เช็ค due_date ว่าตรงกับกะไหม
      // และเอาไว้วน loop หา start_time OPN ปัจจุบัน
      // และเอาไว้วน loop หา end_time OPN ถัดไป

      let shift_index = 0;
      let tmp_shift_model = {
        index: 0,
        shift_name: "กะA",
        date_cal: "2024-02-29",
        start_time: "08:00:00",
        end_time: "17:00:00",
        summary_time: 0,
      };

      for (let i = data.length - 1; i >= 0; i--) {
        //   console.log(data[i]);

        // console.log(`Shift: ${data[i].shift_name}`);
        if (data[i].break_start != null && data[i].break_end != null) {
          tmp_shift_model = {
            index: 0,
            shift_name: "กะA",
            date_cal: "2024-02-29",
            start_time: "08:00:00",
            end_time: "17:00:00",
            summary_time: 0,
          };

          let hourDifference = calculateHourDifference(
            data[i].date_cal + " " + data[i].start_time,
            data[i].date_cal + " " + data[i].break_start
          );

          tmp_shift_model.index = i;
          tmp_shift_model.shift_name = data[i].shift_name;
          tmp_shift_model.date_cal = data[i].date_cal;
          tmp_shift_model.start_time = data[i].start_time;
          tmp_shift_model.end_time = data[i].break_start;
          tmp_shift_model.summary_time = Math.ceil(hourDifference);

          template_shift.push(tmp_shift_model);

          // console.log(
          //   `ความต่างของเวลาในชั่วโมง11: ${Math.ceil(hourDifference)} ชั่วโมง`
          // );

          tmp_shift_model = {
            index: 0,
            shift_name: "กะA",
            date_cal: "2024-02-29",
            start_time: "08:00:00",
            end_time: "17:00:00",
            summary_time: 0,
          };

          let hourDifference2 = calculateHourDifference(
            data[i].date_cal + " " + data[i].break_end,
            data[i].date_cal + " " + data[i].end_time
          );
          shift_index = shift_index++;
          tmp_shift_model.index = i + 1;
          tmp_shift_model.shift_name = data[i].shift_name;
          tmp_shift_model.date_cal = data[i].date_cal;
          tmp_shift_model.start_time = data[i].break_end;
          tmp_shift_model.end_time = data[i].end_time;
          tmp_shift_model.summary_time = Math.ceil(hourDifference2);

          template_shift.push(tmp_shift_model);

          // console.log(
          //   `ความต่างของเวลาในชั่วโมง22: ${Math.ceil(hourDifference2)} ชั่วโมง`
          // );
        } else {
          tmp_shift_model = {
            index: 0,
            shift_name: "กะA",
            date_cal: "2024-02-29",
            start_time: "08:00:00",
            end_time: "17:00:00",
            summary_time: 0,
          };

          let hourDifference3 = calculateHourDifference(
            data[i].date_cal + " " + data[i].start_time,
            data[i].date_cal + " " + data[i].end_time
          );
          shift_index = i + 1;
          tmp_shift_model.index = shift_index;
          tmp_shift_model.shift_name = data[i].shift_name;
          tmp_shift_model.date_cal = data[i].date_cal;
          tmp_shift_model.start_time = data[i].start_time;
          tmp_shift_model.end_time = data[i].end_time;
          // tmp_shift_model.summary_time = Math.ceil(hourDifference3);

          // let time = "08:00:00"; // Input time
          let time = data[i].summary_time; // Input time
          let parts = time.split(":"); // Split the time into [hours, minutes, seconds]
          let hours = parseInt(parts[0], 10); // Convert hours to integer
          tmp_shift_model.summary_time = hours;

          template_shift.push(tmp_shift_model);

          // console.log(
          //   `ความต่างของเวลาในชั่วโมง33: ${Math.ceil(hourDifference3)} ชั่วโมง`
          // );
        }
      }
      shift_index = 0;

      template_shift.sort(function (a, b) {
        return a.index - b.index;
      });

      // console.log("template_shift: ", JSON.stringify(template_shift));

      // ได้ template แล้ว หา set up time ของ OPN นั้นๆ

      // let time_process_by_opn = 0; // เวลาที่ใช้จริงของ OPN นั้นๆ

      //QtyOrder, QtyPer, QtyBy, Scrap, NoMch
      real_qty_order_scrap_by_opn = ManufactureOrder(
        post_data.order_qty,
        routing_master_data[i].qty_per,
        routing_master_data[i].qty_by,
        routing_master_data[i].scrap,
        parseInt(routing_master_data[i].no_of_machine)
      );
      // console.log("real_qty_order_scrap_by_opn: ", real_qty_order_scrap_by_opn);

      // qty_order_scrap,
      //   pcs_hr,
      //   set_up_time,
      //   setup_timehr_per,
      //   QtyPer,
      //   QtyBy,
      //   Scrap,
      //   NoMch,
      //   Batch;
      set_up_time = SetUpTime(
        post_data.order_qty,
        routing_master_data[i].pcs_hr,
        parseFloat(routing_master_data[i].setup_time),
        routing_master_data[i].setup_timehr_per,
        routing_master_data[i].qty_per,
        routing_master_data[i].qty_by,
        routing_master_data[i].scrap,
        parseInt(routing_master_data[i].no_of_machine),
        routing_master_data[i].batch
      );

      // console.log("set_up_time: ", set_up_time);

      time_process_by_opn =
        real_qty_order_scrap_by_opn / routing_master_data[i].pcs_hr +
        set_up_time;
      // console.log("time_process_by_opn: ", time_process_by_opn);

      // ------------ 3.5 : หาเวลาที่เหลือของวันนั้น ๆ  + เช็ควันหยุดเครื่องจักรด้วย ------------

      // order_qty,
      // machine_all,
      // holiday_all,
      // shift_all,
      // template_shift,
      // real_qty_order_scrap_by_opn,
      // set_up_time,
      // time_process_by_opn,
      // doc_running,
      // rtg_id,
      // item_master_id,
      // opn_id
      stamp_end_date = await calculateProductionOrderPlanDate(
        post_data.order_qty,
        machine_all,
        holiday_all,
        template_shift,
        real_qty_order_scrap_by_opn,
        set_up_time,
        time_process_by_opn,
        doc_running,
        post_data.rtg_id,
        post_data.item_master_id,
        routing_master_data[i].opn_id
      );

      // --------- check and update overlab time and return new stamp_end_date ---------

      // doc_running,
      // rtg_id,
      // item_master_id,
      // opn_id
      let check_overlab = null;
      // ต้องดึงข้อมูลจาก production_order_temp เพราะข้อมูลหลักที่วน loop ดึงจาก routing_master_data ไม่มีข้อมูล overlab_time_cal
      let res_overlab = await ProductionOrderTempService.findPOTempByOPN(
        doc_running,
        routing_master_data[i].rtg_id,
        routing_master_data[i].item_master_id,
        routing_master_data[i].opn_id
      );
      // console.log(
      //   "tmp_overlab overlab_time_cal: ",
      //   res_overlab[0].overlab_time_cal
      // );
      if (res_overlab[0].overlab_time_cal > 0) {
        // console.log("tmp_overlab res_overlab[0].overlab_time_cal > 0");
        let tmp_overlab = await ProductionOrderTempService.findPOTempByOPN(
          doc_running,
          res_overlab[0].rtg_id,
          res_overlab[0].item_master_id,
          res_overlab[0].overlab_opn_id
        );

        check_overlab = tmp_overlab[0].opn_start_date_time;
        // console.log("tmp_overlab: ", JSON.stringify(tmp_overlab));
        // console.log("tmp_overlab check_overlab: ", check_overlab);
        // let f1 = check_overlab.toISOString().split("T");
        // let f1 = check_overlab
        //   .toISOString()
        //   .replace("T", " ")
        //   .replace(".000Z", "");
        // console.log("tmp_overlab f1[0]: ", f1);
        const originalDate = new Date(check_overlab);
        // console.log("tmp_overlab originalDate: ", originalDate);
        let tov = 420 - convertHourToMinute(res_overlab[0].overlab_time_cal);
        // console.log("tmp_overlab tov: ", tov);
        let newDate = new Date(originalDate.getTime() + tov * 60 * 1000); // แปลงเป็นมิล
        // console.log("tmp_overlab newDate: ", newDate);
        stamp_end_date = newDate
          .toISOString()
          .replace("T", " ")
          .replace(".000Z", "");
        // console.log("tmp_overlab stamp_end_date: ", stamp_end_date);

        // ----------  update start-end overlab time to database ---------
        await calculateProductionOrderPlanOverLabDate(
          post_data.order_qty,
          machine_all,
          holiday_all,
          template_shift,
          real_qty_order_scrap_by_opn,
          set_up_time,
          time_process_by_opn,
          newDate,
          doc_running,
          post_data.rtg_id,
          post_data.item_master_id,
          routing_master_data[i].opn_id
        );
      } else {
        // console.log("tmp_overlab res_overlab[0].overlab_time_cal !> 0");
        // break;
      }
    }
    // ---- loop ใหญ่ของ OPN ทั้งหมด ----

    // End Flow คำนวณ

    // --------------------- Insert Data To Draft Production Order ---------------------

    // get doc_group_name
    let rec_no_batch_count = 0;
    let main_stamp_batch_start = null;
    let stamp_batch_start = null;
    let stamp_batch_end = null;

    const res_doc = await doc_runningService.findGroupByModule(
      post_data.doc_module_name
    );
    doc_group_name = res_doc[0].doc_group_name;

    let res_draft = await ProductionOrderTempService.findALLByRouting(
      doc_running,
      post_data.rtg_id,
      post_data.item_master_id
    );
    // console.log("res_draft: ", JSON.stringify(res_draft));

    // --------------- split machine opn by machine ----------------

    // clear data in production_order_temp
    await ProductionOrderTempService.deleteByRunningNo(doc_running);

    for (let i = 0; i < res_draft.length; i++) {
      console.log("res_draft 1: Loop ", i);
      let data = {
        doc_running_no: doc_running,
        item_id: res_draft[i].item_id,
        item_master_id: res_draft[i].item_master_id,
        order_qty: res_draft[i].order_qty,
        rtg_id: res_draft[i].rtg_id,
        opn_id: res_draft[i].opn_id,
        pcs_hr: res_draft[i].pcs_hr,
        time_process_by_opn: res_draft[i].time_process_by_opn,
        setup_time: res_draft[i].tr_setup_time,
        real_qty_order_scrap_by_opn: res_draft[i].real_qty_order_scrap_by_opn,
        machine_id: res_draft[i].machine_id,
        scrap_per: res_draft[i].scrap_per,
        overlap_time: res_draft[i].overlap_time,
        setup_timehr_per: res_draft[i].setup_timehr_per,
        batch: res_draft[i].batch,
        opn_start_date_time: res_draft[i].opn_start_date_time,
        opn_end_date_time: res_draft[i].opn_end_date_time,
        overlab_time_cal: res_draft[i].overlab_time_cal,
        company_id: res_draft[i].company_id,
        predecessor: res_draft[i].predecessor,
        dependency: res_draft[i].dependency,
        user_create: res_draft[i].user_create,
        created_at: new Date(),
      };

      let no_mch = [];
      no_mch = res_draft[i].machine_id.split(",");
      // console.log("TestData no_mch: ", no_mch);
      for (let j = 0; j < no_mch.length; j++) {
        data.machine_id = no_mch[j];
        // console.log("data: ", JSON.stringify(data));
        try {
          await ProductionOrderTempService.create(data);
          console.log("PD ProductionOrderTempService.create");
        } catch (error) {
          console.log("ProductionOrderTempService.create error: ", error);
        }
      }
    }

    // --------------- split machine opn by machine ----------------

    // return;
    // --------------- calculate predecessor and dependency ----------------
    console.log("PD ProductionOrderTempService.findALLByRouting");
    // res_draft = [];

    //delay 2 sec
    // await new Promise((resolve) => setTimeout(resolve, 9000));

    // let res_draft2 = await ProductionOrderTempService.findALLByRouting(
    //   doc_running,
    //   post_data.rtg_id,
    //   post_data.item_master_id
    // );

    let res_draft2 = await ProductionOrderTempService.findALLByRoutingV2(
      doc_running
    );

    // console.log("pd res_draft2: ", JSON.stringify(res_draft2));

    for (let i = 0; i < res_draft2.length; i++) {
      // console.log("pd res_draft2: ", res_draft2[i].machine_id);

      if (res_draft2[i].dependency == "FS") {
        // FS
        console.log("PD Type FS");

        if (
          res_draft2[i].overlap_time != 0 &&
          res_draft2[i].predecessor != "0"
        ) {
          // SS
          // ถ้าเป็น SS + overlab ต้องมี predecessor id ตลอด , ต้องมี OPN ก่อนหน้าเสมอ
          console.log("PD Type FS + Overlab");
          // console.log("res_draft2[i].predecessor != 0");
          // หา OPN จาก routting id
          let res_rtg_opn = await tbl_routingService.findRoutingByRTGID(
            res_draft2[i].predecessor
          );
          console.log("PD res_rtg_opn: ", JSON.stringify(res_rtg_opn));
          // หา opn_end_date_time จาก opn_id
          let res_predecessor =
            await ProductionOrderTempService.findPOTempByOPNMINEndDate(
              doc_running,
              post_data.rtg_id,
              post_data.item_master_id,
              res_rtg_opn[0].opn_id
            );
          // console.log("PD res_rtg_opn[0].opn_id: ", res_rtg_opn[0].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_start_date_time: ",
          //   res_predecessor[0].opn_start_date_time
          // );
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_end_date_time: ",
          //   res_predecessor[0].opn_end_date_time
          // );

          const originalDate = new Date(res_predecessor[0].opn_end_date_time);
          // console.log("tmp_overlab originalDate: ", originalDate);
          let tov = convertHourToMinute(res_predecessor[0].overlab_time_cal);
          // console.log("tmp_overlab tov: ", tov);
          let newDate = new Date(
            originalDate.getTime() + 420 + tov * 60 * 1000
          ); // แปลงเป็นมิล

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,
          let stamp_end_date = await calculateWorkOrderUpToDown(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let new_date_start = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          await ProductionOrderTempService.updateByID(
            res_draft2[i].id,
            data_due_date
          );
        } else if (
          res_draft2[i].predecessor == "0" &&
          res_draft2[i].overlap_time == 0
        ) {
          // console.log("res_draft2[i].predecessor == 0");
          // เป็น OPN แรก ไม่มี predecessor
          // console.log("PD res_rtg_opn[0].opn_id: ", res_draft2[i].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          console.log(
            "PD FS 0 res_predecessor res_predecessor[0].opn_start_date_time: ",
            res_draft2[i].opn_start_date_time
          );
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_end_date_time: ",
          //   res_draft2[i].opn_end_date_time
          // );
          const originalDate = new Date(res_draft2[i].opn_start_date_time);
          let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000);
          console.log("PD FS 0 newDate: ", newDate);

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,
          let stamp_end_date = await calculateWorkOrderUpToDown(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let new_date_start = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          await ProductionOrderTempService.updateByID(
            res_draft2[i].id,
            data_due_date
          );
        } else if (
          res_draft2[i].predecessor != "0" &&
          res_draft2[i].overlap_time == 0
        ) {
          // console.log("res_draft2[i].predecessor != 0");
          // หา OPN จาก routting id
          let res_rtg_opn = await tbl_routingService.findRoutingByRTGID(
            res_draft2[i].predecessor
          );
          // console.log("PD res_rtg_opn: ", JSON.stringify(res_rtg_opn));
          // หา opn_end_date_time จาก opn_id
          let res_predecessor =
            await ProductionOrderTempService.findPOTempByOPNMINEndDate(
              doc_running,
              post_data.rtg_id,
              post_data.item_master_id,
              res_rtg_opn[0].opn_id
            );
          // console.log("PD res_rtg_opn[0].opn_id: ", res_rtg_opn[0].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_start_date_time: ",
          //   res_predecessor[0].opn_start_date_time
          // );
          console.log(
            "PD FS !0 res_predecessor res_predecessor[0].opn_end_date_time: ",
            res_predecessor[0].opn_end_date_time
          );

          const originalDate = new Date(res_predecessor[0].opn_end_date_time);
          let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000);
          console.log("PD FS !0 newDate: ", newDate);

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,
          let stamp_end_date = await calculateWorkOrderUpToDown(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let new_date_start = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          await ProductionOrderTempService.updateByID(
            res_draft2[i].id,
            data_due_date
          );
        }
      } else if (res_draft2[i].dependency == "SS") {
        // SS
        // ถ้าเป็น SS ต้องมี predecessor id ตลอด , ต้องมี OPN ก่อนหน้าเสมอ
        console.log("PD Type SS");
        if (
          res_draft2[i].overlap_time != 0 &&
          res_draft2[i].predecessor != "0"
        ) {
          // SS
          // ถ้าเป็น SS + overlab ต้องมี predecessor id ตลอด , ต้องมี OPN ก่อนหน้าเสมอ
          console.log("PD Type SS + Overlab");
          // console.log("res_draft2[i].predecessor != 0");
          // หา OPN จาก routting id
          let res_rtg_opn = await tbl_routingService.findRoutingByRTGID(
            res_draft2[i].predecessor
          );
          console.log("PD res_rtg_opn: ", JSON.stringify(res_rtg_opn));
          // หา opn_end_date_time จาก opn_id
          let res_predecessor =
            await ProductionOrderTempService.findPOTempByOPNMINStartDate(
              doc_running,
              post_data.rtg_id,
              post_data.item_master_id,
              res_rtg_opn[0].opn_id
            );
          // console.log("PD res_rtg_opn[0].opn_id: ", res_rtg_opn[0].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_start_date_time: ",
          //   res_predecessor[0].opn_start_date_time
          // );
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_end_date_time: ",
          //   res_predecessor[0].opn_end_date_time
          // );

          const originalDate = new Date(res_predecessor[0].opn_start_date_time);
          // console.log("tmp_overlab originalDate: ", originalDate);
          let tov = convertHourToMinute(res_predecessor[0].overlab_time_cal);
          // console.log("tmp_overlab tov: ", tov);
          let newDate = new Date(
            originalDate.getTime() + 420 + tov * 60 * 1000
          ); // แปลงเป็นมิล

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,
          let stamp_end_date = await calculateWorkOrderUpToDown(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let new_date_start = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          await ProductionOrderTempService.updateByID(
            res_draft2[i].id,
            data_due_date
          );
        } else if (
          res_draft2[i].predecessor == "0" &&
          res_draft2[i].overlap_time == 0
        ) {
          // console.log("res_draft2[i].predecessor == 0");
          // เป็น OPN แรก ไม่มี predecessor
          // console.log("PD res_rtg_opn[0].opn_id: ", res_draft2[i].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          console.log(
            "PD SS 0 res_predecessor res_predecessor[0].opn_start_date_time: ",
            res_draft2[i].opn_start_date_time
          );
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_end_date_time: ",
          //   res_draft2[i].opn_end_date_time
          // );

          // let newDate = new Date(res_draft2[i].opn_start_date_time);

          const originalDate = new Date(res_draft2[i].opn_start_date_time);
          let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000);
          console.log("PD SS 0 newDate: ", newDate);

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,
          let stamp_end_date = await calculateWorkOrderUpToDown(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let new_date_start = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          await ProductionOrderTempService.updateByID(
            res_draft2[i].id,
            data_due_date
          );
        } else if (
          res_draft2[i].predecessor != "0" &&
          res_draft2[i].overlap_time == 0
        ) {
          // console.log("res_draft2[i].predecessor != 0");
          // หา OPN จาก routting id
          let res_rtg_opn = await tbl_routingService.findRoutingByRTGID(
            res_draft2[i].predecessor
          );
          // console.log("PD res_rtg_opn: ", JSON.stringify(res_rtg_opn));
          // หา opn_end_date_time จาก opn_id
          let res_predecessor =
            await ProductionOrderTempService.findPOTempByOPNMINStartDate(
              doc_running,
              post_data.rtg_id,
              post_data.item_master_id,
              res_rtg_opn[0].opn_id
            );
          // console.log("PD res_rtg_opn[0].opn_id: ", res_rtg_opn[0].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          console.log(
            "PD SS !0 res_predecessor res_predecessor[0].opn_start_date_time: ",
            res_predecessor[0].opn_start_date_time
          );
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_end_date_time: ",
          //   res_predecessor[0].opn_end_date_time
          // );

          // let newDate = new Date(res_predecessor[0].opn_start_date_time);

          const originalDate = new Date(res_predecessor[0].opn_start_date_time);
          let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000);
          console.log("PD SS !0 newDate: ", newDate);

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,
          let stamp_end_date = await calculateWorkOrderUpToDown(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let new_date_start = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          await ProductionOrderTempService.updateByID(
            res_draft2[i].id,
            data_due_date
          );
        }
      } else if (res_draft2[i].dependency == "FF") {
        // FF

        // ถ้าเป็น FF ต้องมี predecessor id ตลอด , ต้องมี OPN ก่อนหน้าเสมอ
        console.log("PD Type FF");

        if (
          res_draft2[i].overlap_time != 0 &&
          res_draft2[i].predecessor != "0"
        ) {
          // SS
          // ถ้าเป็น SS + overlab ต้องมี predecessor id ตลอด , ต้องมี OPN ก่อนหน้าเสมอ
          console.log("PD Type FF + Overlab");
          // console.log("res_draft2[i].predecessor != 0");
          // หา OPN จาก routting id
          let res_rtg_opn = await tbl_routingService.findRoutingByRTGID(
            res_draft2[i].predecessor
          );
          console.log("PD res_rtg_opn: ", JSON.stringify(res_rtg_opn));
          // หา opn_end_date_time จาก opn_id
          let res_predecessor =
            await ProductionOrderTempService.findPOTempByOPNMINEndDate(
              doc_running,
              post_data.rtg_id,
              post_data.item_master_id,
              res_rtg_opn[0].opn_id
            );
          // console.log("PD res_rtg_opn[0].opn_id: ", res_rtg_opn[0].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_start_date_time: ",
          //   res_predecessor[0].opn_start_date_time
          // );
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_end_date_time: ",
          //   res_predecessor[0].opn_end_date_time
          // );

          const originalDate = new Date(res_predecessor[0].opn_end_date_time);
          // console.log("tmp_overlab originalDate: ", originalDate);
          let tov = convertHourToMinute(res_predecessor[0].overlab_time_cal);
          // console.log("tmp_overlab tov: ", tov);
          let newDate = new Date(
            originalDate.getTime() + 420 + tov * 60 * 1000
          ); // แปลงเป็นมิล

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,
          let new_date_start = await calculateWorkOrderDownToUp(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let stamp_end_date = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          await ProductionOrderTempService.updateByID(
            res_draft2[i].id,
            data_due_date
          );
        } else if (
          res_draft2[i].predecessor == "0" &&
          res_draft2[i].overlap_time == 0
        ) {
          // console.log("res_draft2[i].predecessor == 0");
          // เป็น OPN แรก ไม่มี predecessor
          // console.log("PD res_rtg_opn[0].opn_id: ", res_draft2[i].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_start_date_time: ",
          //   res_draft2[i].opn_start_date_time
          // );
          console.log(
            "PD FF 0 res_predecessor res_predecessor[0].opn_end_date_time: ",
            res_draft2[i].opn_end_date_time
          );

          // let newDate = new Date(res_draft2[i].opn_end_date_time);

          const originalDate = new Date(res_draft2[i].opn_end_date_time);
          let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000);
          console.log("PD FF 0 newDate: ", newDate);

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,
          let new_date_start = await calculateWorkOrderDownToUp(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let stamp_end_date = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          await ProductionOrderTempService.updateByID(
            res_draft2[i].id,
            data_due_date
          );
        } else if (
          res_draft2[i].predecessor != "0" &&
          res_draft2[i].overlap_time == 0
        ) {
          // console.log("res_draft2[i].predecessor != 0");
          // หา OPN จาก routting id
          let res_rtg_opn = await tbl_routingService.findRoutingByRTGID(
            res_draft2[i].predecessor
          );
          // console.log("PD res_rtg_opn: ", JSON.stringify(res_rtg_opn));
          // หา opn_end_date_time จาก opn_id
          let res_predecessor =
            await ProductionOrderTempService.findPOTempByOPNMINEndDate(
              doc_running,
              post_data.rtg_id,
              post_data.item_master_id,
              res_rtg_opn[0].opn_id
            );
          // console.log("PD res_rtg_opn[0].opn_id: ", res_rtg_opn[0].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_start_date_time: ",
          //   res_predecessor[0].opn_start_date_time
          // );
          console.log(
            "PD FF !0 res_predecessor res_predecessor[0].opn_end_date_time: ",
            res_predecessor[0].opn_end_date_time
          );

          // let newDate = new Date(res_predecessor[0].opn_end_date_time);

          const originalDate = new Date(res_predecessor[0].opn_end_date_time);
          let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000);
          console.log("PD FF !0 newDate: ", newDate);

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,
          let new_date_start = await calculateWorkOrderDownToUp(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let stamp_end_date = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          await ProductionOrderTempService.updateByID(
            res_draft2[i].id,
            data_due_date
          );
        }
      }
    }

    // --------------- calculate predecessor and dependency ----------------
    // return;
    // --------------- calculate End Time Last OPN == DueDate -----------------
    let c_over = 0;
    let c_date_due_date = new Date();
    let c_date_end_time_cal = new Date();
    do {
      c_over++;
      let res_draft3 = await ProductionOrderTempService.findALLByRoutingV2(
        doc_running
      );

      // console.log("PD res_draft3: ", JSON.stringify(res_draft3));

      let OriginalDate3 = new Date(
        res_draft3[res_draft3.length - 1].opn_end_date_time
      );
      let end_time_cal = new Date(OriginalDate3.getTime() + 420 * 60 * 1000);
      console.log("PD end_time_cal: ", end_time_cal);
      c_date_end_time_cal = new Date(end_time_cal);

      let OriginalDate31 = new Date(due_date_time);
      c_date_due_date = new Date(OriginalDate31.getTime() + 420 * 60 * 1000);

      console.log("PD c_date_end_time_cal: ", c_date_end_time_cal);
      console.log("PD c_date_due_date: ", c_date_due_date);

      let status_cal = "equal";
      let minute_cal = 0;

      if (c_date_due_date < c_date_end_time_cal) {
        try {
          console.log("due_date_time < end_time_cal");
          // duedate เป็นค่า -
          // ขยับเวลาทั้งหมด ขึ้นไปข้างหน้าโดยการลบ
          status_cal = "minus";

          let holiday_all = await getHolidayByMachineId(
            res_draft3[res_draft3.length - 1].machine_id,
            res_draft3[res_draft3.length - 1].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));

          let shift_all = await getShiftByMachineId(
            res_draft3[res_draft3.length - 1].machine_id,
            res_draft3[res_draft3.length - 1].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          //c_date_due_date > c_date_end_time_cal
          minute_cal = await calculateDateRangeMinuteUpToDown(
            shift_all,
            c_date_due_date,
            c_date_end_time_cal
          );
          console.log("PD minute_cal: ", minute_cal);

          // update first opn start date time
          // console.log("PD res_draft3: ", JSON.stringify(res_draft3));
          let t1 = new Date(res_draft3[0].opn_start_date_time);
          // console.log("PD t1: ", t1);
          let t2 = new Date(t1.getTime() + 420 * 60 * 1000);
          // console.log("PD t2: ", t2);
          // let t3 = new Date(t2.getTime() - minute_cal * 60 * 1000);
          // console.log("PD t3: ", t3);
          let t4 = t2.toISOString().replace("T", " ").replace(".000Z", "");
          // console.log("PD t4: ", t4);
          // holiday_all,
          //   shift_all,
          //   minutesWorkedCal,
          //   opn_end_date_time;
          let t5 = await calculateReDateDownToUp(
            holiday_all,
            shift_all,
            minute_cal,
            t4
          );

          console.log("SVPD minute_cal2: ", minute_cal);

          // let t51 = new Date(t5);
          // let t6 = new Date(t51.getTime() + 420 * 60 * 1000);
          // update first opn start date time by id
          let data_due_date = {
            opn_start_date_time: t5,
          };
          // await ProductionOrderTempService.updateByID(
          //   res_draft3[0].id,
          //   data_due_date
          // );

          // doc_running, rtg_id, item_master_id, data;
          await ProductionOrderTempService.updateByDocRunningAndOPN(
            res_draft3[0].doc_running_no,
            res_draft3[0].rtg_id,
            res_draft3[0].item_master_id,
            data_due_date
          );
          // console.log("PD t5: ", t5);

          //recalculate PD
          await reCalculatePD(doc_running);

          console.log("SVPD minute_cal3: ", "reCalculatePD");
        } catch (error) {
          console.log("PD calculateDateRangeMinuteUpToDown error: ", error);
        }
      } else {
        console.log("due_date_time > end_time_cal");
      }

      // } while (c_date_due_date.getTime() > c_date_end_time_cal.getTime());
    } while (c_over < 10);

    console.log("End Loop calculate End Time Last OPN == DueDate ");

    // --------------- calculate End Time Last OPN == DueDate -----------------
    // return;
    // ----------------- calculate Operation Type and insert to production_order -----------------
    let res_draft4 = await ProductionOrderTempService.findALLByRoutingV2(
      doc_running
    );

    // console.log("res_draft4: ", JSON.stringify(res_draft4));
    // return;

    for (let i = 0; i < res_draft4.length; i++) {
      // console.log("res_draft4: ", JSON.stringify(res_draft4[i]));

      console.log("res_draft4 1: Loop ", i);
      let data = {
        doc_group_name: doc_group_name,
        doc_running_no: doc_running,
        item_master_id: res_draft4[i].item_master_id,
        order_qty: res_draft4[i].order_qty,
        opn_qty: 0,
        rtg_id: res_draft4[i].rtg_id,
        opn_id: res_draft4[i].opn_id,
        pcs_hr: res_draft4[i].pcs_hr,
        time_process_by_opn: res_draft4[i].time_process_by_opn,
        setup_time: res_draft4[i].setup_time,
        real_qty_order_scrap_by_opn: res_draft4[i].real_qty_order_scrap_by_opn,
        machine_id: res_draft4[i].machine_id,
        overlap_time: res_draft4[i].overlap_time,
        setup_timehr_per: res_draft4[i].setup_timehr_per,
        batch: res_draft4[i].batch,
        batch_count: 0,
        batch_amount: 0,
        opn_start_date_time: res_draft4[i].opn_start_date_time,
        opn_end_date_time: res_draft4[i].opn_end_date_time,
        overlab_time_cal: res_draft4[i].overlab_time_cal,
        company_id: res_draft4[i].company_id,
        predecessor: res_draft4[i].predecessor,
        dependency: res_draft4[i].dependency,
        production_time: 0,
        due_date: post_data.due_date,
        due_time: post_data.due_time,
        order_date: post_data.created_at,
        doc_module_name: post_data.doc_module_name,
        std_labor_cost: 0.0,
        std_foh_cost: 0.0,
        std_voh_cost: 0.0,
        user_create: res_draft4[i].user_create,
        created_at: new Date(),
      };

      /*
        {
            "id": 637,
            "doc_running_no": "PDCM-240231",
            "item_id": 1,
            "item_master_id": 10,
            "order_qty": 1000,
            "rtg_id": "01",
            "opn_id": "100",
            "pcs_hr": 240,
            "time_process_by_opn": "13.6250",
            "setup_time": "0.0000",
            "real_qty_order_scrap_by_opn": 2550,
            "machine_id": "17,18",
            "scrap_per": "0.0000",
            "overlap_time": "0.0000",
            "setup_timehr_per": "B",
            "batch": 500,
            "opn_start_date_time": "2024-02-25T07:10:00.000Z",
            "opn_end_date_time": "2024-02-26T06:11:30.000Z",
            "overlab_time_cal": "0.5000",
            "overlab_opn_id": "200",
            "company_id": 1,
            "user_create": 2,
            "user_update": null,
            "created_at": "2024-02-15T00:00:00.000Z",
            "updated_at": "2024-02-06T04:21:14.000Z",
            "qty_per": 10,
            "qty_by": 2,
            "scrap": 2,
            "no_of_machine": "2"
        },
    */

      let holiday_all = await getHolidayByMachineId(
        res_draft4[i].machine_id,
        res_draft4[i].company_id
      );
      // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
      let shift_all = await getShiftByMachineId(
        res_draft4[i].machine_id,
        res_draft4[i].company_id
      );
      // console.log("PD shift_all2: ", JSON.stringify(shift_all));

      console.log("res_draft4 2: Loop ", i);
      let bo = 0.0;
      let no_mch = [];
      if (res_draft4[i].setup_timehr_per == "B") {
        console.log("res_draft4 3: Loop ", i);
        //QtyOrder, QtyPer, QtyBy, Scrap, NoMch, Batch
        let cal_down = 0.0;
        // console.log("res_draft4 3.1: order_qty ", res_draft4[i].order_qty);
        // console.log("res_draft4 3.1: qty_per ", res_draft4[i].qty_per);
        // console.log("res_draft4 3.1: qty_by ", res_draft4[i].qty_by);
        // console.log("res_draft4 3.1: scrap ", res_draft4[i].scrap);
        // console.log(
        //   "res_draft4 3.1: no_of_machine ",
        //   res_draft4[i].no_of_machine
        // );
        // console.log("res_draft4 3.1: batch ", res_draft4[i].batch);

        bo = BatchOrder(
          res_draft4[i].order_qty,
          res_draft4[i].qty_per,
          res_draft4[i].qty_by,
          res_draft4[i].scrap,
          res_draft4[i].no_of_machine,
          res_draft4[i].batch
        );
        console.log("res_draft4 3.1: bo => ", bo);
        console.log("res_draft4 4: Loop ", i);
        no_mch = res_draft4[i].machine_id.split(",");
        // console.log("TestData no_mch: ", no_mch);
        for (let j = 0; j < no_mch.length; j++) {
          main_stamp_batch_start = res_draft4[i].opn_start_date_time;
          stamp_batch_start = null;
          // stamp_batch_start = res_draft4[i].opn_start_date_time;

          // console.log("TestData no_mch: ", no_mch[j]);
          console.log("res_draft4 5: Loop ", i);
          data.machine_id = no_mch[j];
          let res_cost = await tbl_mch_shift.findMachineCostByID(
            data.machine_id
          );
          console.log("res_cost: ", JSON.stringify(res_cost));
          // data.std_labor_cost = res_cost[0].labor_rate;
          // data.std_foh_cost = res_cost[0].foh_rate;
          // data.std_voh_cost = res_cost[0].voh_rate;

          for (let k = 0; k < bo; k++) {
            // console.log("TestData bo: ", bo[k]);
            console.log("res_draft4 6: Loop ", i);
            rec_no_batch_count = rec_no_batch_count + 1;
            // data.batch_count = k + 1;
            data.batch_count = rec_no_batch_count;
            if (k == bo - 1) {
              cal_down =
                res_draft4[i].real_qty_order_scrap_by_opn % res_draft4[i].batch;
              if (cal_down == 0) {
                cal_down = res_draft4[i].batch;
              }
            } else {
              cal_down = res_draft4[i].batch;
            }
            data.batch_amount = cal_down;
            data.production_time =
              parseFloat(cal_down) / parseFloat(res_draft4[i].pcs_hr) +
              parseFloat(res_draft4[i].setup_time);
            // console.log(`TestData data ${k}: `, JSON.stringify(data));

            data.opn_qty = data.batch_amount;

            console.log("res_draft4 7: Loop ", i);

            data.std_labor_cost =
              parseFloat(res_cost[0].labor_rate) * data.production_time;
            data.std_foh_cost =
              parseFloat(res_cost[0].foh_rate) * data.production_time;
            data.std_voh_cost =
              parseFloat(res_cost[0].voh_rate) * data.production_time;

            // console.log("data B production_time: ", data.production_time);
            // console.log("data B std_labor_cost: ", data.std_labor_cost);
            // console.log("data B std_foh_cost: ", data.std_foh_cost);
            // console.log("data B std_voh_cost: ", data.std_voh_cost);

            if (stamp_batch_start == null) {
              console.log(
                "res_draft4 7.1: stamp_batch_start ",
                "stamp_batch_start == null"
              );
              console.log(
                "res_draft4 7.1: stamp_batch_start: ",
                stamp_batch_start
              );
              // stamp_batch_end = await calculateSplitMachineBatchDate(
              //   data.machine_id,
              //   post_data.company_id,
              //   data.production_time,
              //   main_stamp_batch_start
              // );

              //   holiday_all,
              //   shift_all,
              //   production_time,
              //   opn_end_date_time;
              stamp_batch_end = await calculateSplitMachineBatchDateV2(
                holiday_all,
                shift_all,
                data.production_time,
                main_stamp_batch_start
              );

              data.opn_start_date_time = main_stamp_batch_start;
              data.opn_end_date_time = stamp_batch_end;
            } else {
              console.log(
                "res_draft4 7.1: stamp_batch_start ",
                "stamp_batch_start != null"
              );
              console.log(
                "res_draft4 7.1: stamp_batch_start: ",
                stamp_batch_start
              );
              // stamp_batch_end = await calculateSplitMachineBatchDate(
              //   data.machine_id,
              //   post_data.company_id,
              //   data.production_time,
              //   stamp_batch_start
              // );

              //   holiday_all,
              //   shift_all,
              //   production_time,
              //   opn_end_date_time;
              stamp_batch_end = await calculateSplitMachineBatchDateV2(
                holiday_all,
                shift_all,
                data.production_time,
                stamp_batch_start
              );

              data.opn_start_date_time = stamp_batch_start;
              data.opn_end_date_time = stamp_batch_end;
            }
            console.log("res_draft4 7.1: Loop ", i);

            console.log("res_draft4 stamp_batch_start:", stamp_batch_start);
            console.log("res_draft4 stamp_batch_end:", stamp_batch_end);
            try {
              await DraftProdOrderPlanService.create(data);
            } catch (error) {
              console.log("res_draft4 8: Loop error", error);
            }
            stamp_batch_start = stamp_batch_end;

            console.log("res_draft4 8: Loop ", i);
          }
        }
      } else if (res_draft4[i].setup_timehr_per == "O") {
        console.log("res_draft4 9: Loop ", i);
        data.batch_count = 1;
        data.batch_amount = res_draft4[i].order_qty;
        data.production_time =
          parseFloat(res_draft4[i].order_qty) /
            parseFloat(res_draft4[i].pcs_hr) +
          parseFloat(res_draft4[i].setup_time);

        data.opn_qty = data.batch_amount;

        console.log("production_time O: ", data.production_time);
        console.log("res_draft4[i].order_qty: ", res_draft4[i].order_qty);
        console.log("res_draft4[i].pcs_hr: ", res_draft4[i].pcs_hr);
        console.log("res_draft4[i].setup_time: ", res_draft4[i].setup_time);

        let res_cost = await tbl_mch_shift.findMachineCostByID(data.machine_id);
        console.log("res_cost: ", JSON.stringify(res_cost));
        data.std_labor_cost =
          parseFloat(res_cost[0].labor_rate) * data.production_time;
        data.std_foh_cost =
          parseFloat(res_cost[0].foh_rate) * data.production_time;
        data.std_voh_cost =
          parseFloat(res_cost[0].voh_rate) * data.production_time;

        console.log("data O production_time: ", data.production_time);
        console.log("data O std_labor_cost: ", data.std_labor_cost);
        console.log("data O std_foh_cost: ", data.std_foh_cost);
        console.log("data O std_voh_cost: ", data.std_voh_cost);
        try {
          await DraftProdOrderPlanService.create(data);
        } catch (error) {
          console.log("res_draft4 10: Loop error", error);
        }

        console.log("res_draft4 10: Loop ", i);
      } else if (res_draft4[i].setup_timehr_per == "Q") {
        console.log("res_draft4 11: Loop ", i);
        data.batch_count = 1;
        data.batch_amount = res_draft4[i].order_qty;
        data.production_time =
          parseFloat(res_draft4[i].order_qty) /
            parseFloat(res_draft4[i].pcs_hr) +
          parseFloat(res_draft4[i].setup_time);

        data.opn_qty = data.batch_amount;

        let res_cost = await tbl_mch_shift.findMachineCostByID(data.machine_id);
        // console.log("res_cost: ", JSON.stringify(res_cost));
        data.std_labor_cost =
          parseFloat(res_cost[0].labor_rate) * data.production_time;
        data.std_foh_cost =
          parseFloat(res_cost[0].foh_rate) * data.production_time;
        data.std_voh_cost =
          parseFloat(res_cost[0].voh_rate) * data.production_time;

        // console.log("data Q production_time: ", data.production_time);
        // console.log("data Q std_labor_cost: ", data.std_labor_cost);
        // console.log("data Q std_foh_cost: ", data.std_foh_cost);
        // console.log("data Q std_voh_cost: ", data.std_voh_cost);

        await DraftProdOrderPlanService.create(data);
        // console.log("production_time Q: ", data.production_time);
        // console.log("res_draft4[i].order_qty: ", res_draft4[i].order_qty);
        // console.log("res_draft4[i].pcs_hr: ", res_draft4[i].pcs_hr);
        // console.log("res_draft4[i].setup_time: ", res_draft4[i].setup_time);
        // console.log("res_draft4 12: Loop ", i);
      }
    }

    console.log(
      "End Loop calculate Operation Type and insert to production_order"
    );
    // ----------------- calculate Operation Type and insert to production_order -----------------
    // return;
    // --------------------- Insert Data To Draft Production Order ---------------------

    // ----- get id form tbl_ord for return ------
    let return_id = null;
    let res_rt_id = await OrderService.findIdByDocRunningV2(doc_running);
    console.log("res: ", res);
    return_id = res_rt_id[0].id;
    console.log("return_id: ", return_id);
    // ----- get id form tbl_ord for return ------

    return res
      .status(200)
      .json({ message: "success", doc_running: doc_running, id: return_id });
  } catch (err) {
    console.log("err: ", err);
    return res.status(204).json({ message: err });
  }
};

exports.updateProductionOrderDraft = async (req, res) => {
  let ord_id = req.params.id;

  let post_data = req.body;
  let doc_running = "";
  let doc_group_name = null; // ชื่อกลุ่มเอกสาร

  let routing_master_data = null; // ข้อมูล Routing + OPN ทั้งหมด
  let time_stamp = null; // วันที่เวลาปัจจุบัน
  let template_shift = []; // ทำ template กะไว้ก่อนเพื่อเอาไว้เช็ค due_date ว่าตรงกับกะไหม
  let master_data_production_order = null; // ข้อมูล Production Order ทั้งหมด
  let end_time_process = null; // เวลาที่จบการทำงาน OPN นั้นๆ
  let end_time_process_overlab = null; // เวลาที่จบการทำงาน OPN นั้นๆ คำนวนใหม่จาก overlap time

  let due_date_time = null; // วันที่ต้องส่งมอบ

  //   let machine_all = null; // จำนวนเครื่องจักรทั้งหมด

  // {
  //     "doc_running": "PDCM-240282",
  //     "doc_module_name": "PD ceramic",
  //     "item_master_id": 10,
  //     "order_qty": "1000",
  //     "rtg_id": "01",
  //     "order_date": "2024-01-30",
  //     "due_date": "2024-02-29",
  //     "due_time": "16:00:00",
  //     "company_id": "1",
  //     "user_update": "2",
  //     "updated_at": "2024-01-30"
  // }

  try {
    // -------------- update tbl_ord --------------

    let data = {
      item_master_id: post_data.item_master_id,
      order_qty: post_data.order_qty,
      rtg_id: post_data.rtg_id,
      order_date: post_data.order_date,
      due_date: post_data.due_date,
      due_time: post_data.due_time,
      user_update: post_data.user_update,
      updated_at: new Date(),
    };

    // console.log("data: ", JSON.stringify(data));
    await OrderService.update(ord_id, data);

    // -------------- update tbl_ord --------------
    // return res.status(200).json({ message: "success" });

    due_date_time = post_data.due_date + " " + post_data.due_time;
    console.log("due_date_time: ", due_date_time);
    console.log("post_data: ", JSON.stringify(post_data));

    time_stamp = post_data.due_date;

    // step1 : generate doc_running
    // doc_running = await doc_runningService.docGenerate(
    //   post_data.doc_module_name
    // );

    doc_running = post_data.doc_running;
    // console.log("doc_running: ", doc_running);

    // clear data in production_order_temp
    await ProductionOrderTempService.deleteByRunningNo(doc_running);

    // clear data in draft_production_order_plan
    await DraftProdOrderPlanService.deleteByRunningNo(doc_running);

    // step2 : get routing data by item_master_id and rtg_id
    // ดึงข้อมูล Routing + OPN มาวน loop คำนวน
    routing_master_data = await tbl_routingService.findRoutingWorkOrderByRTGID(
      post_data.item_master_id,
      post_data.rtg_id,
      post_data.company_id
    );
    // console.log("routing_master_data: ", JSON.stringify(routing_master_data));

    // วน insert ข้อมูลลง production_order_temp
    for (let i = 0; i < routing_master_data.length; i++) {
      let ovl_time = 0;

      if (
        routing_master_data[i].over_lap_unit == null ||
        routing_master_data[i].over_lap_unit == 0
      ) {
        if (
          routing_master_data[i].over_lap_time == null ||
          routing_master_data[i].over_lap_time == 0
        ) {
          ovl_time = 0;
        } else {
          ovl_time = parseFloat(routing_master_data[i].over_lap_time);
        }
      } else {
        ovl_time = parseFloat(
          routing_master_data[i].over_lap_unit / routing_master_data[i].pcs_hr
        );
      }

      let data = {
        doc_running_no: doc_running,
        item_id: i + 1,
        item_master_id: post_data.item_master_id,
        order_qty: post_data.order_qty,
        rtg_id: post_data.rtg_id,
        opn_id: routing_master_data[i].opn_id,
        pcs_hr: routing_master_data[i].pcs_hr,
        time_process_by_opn: 0,
        setup_time: 0,
        real_qty_order_scrap_by_opn: 0,
        machine_id: routing_master_data[i].machine_id,
        scrap_per: 0,
        overlap_time: ovl_time,
        setup_timehr_per: routing_master_data[i].setup_timehr_per,
        batch: routing_master_data[i].batch,
        opn_start_date_time: null,
        opn_end_date_time: null,
        overlab_time_cal: 0,
        company_id: post_data.company_id,
        predecessor: routing_master_data[i].predecessor,
        dependency: routing_master_data[i].dependency,
        user_create: post_data.user_create,
        created_at: post_data.created_at,
      };
      // console.log("data loop master data: ", JSON.stringify(data));
      try {
        await ProductionOrderTempService.create(data);
      } catch (error) {
        console.log("ProductionOrderTempService.create error: ", error);
      }

      // -- stamp due_date_time to last opn --
      if (routing_master_data.length - 1 == i) {
        // console.log("routing_master_data.length - 1 == i");

        let data_due_date = {
          opn_end_date_time: due_date_time,
        };

        try {
          await ProductionOrderTempService.update(
            doc_running,
            routing_master_data[i].rtg_id,
            routing_master_data[i].item_master_id,
            routing_master_data[i].opn_id,
            data_due_date
          );
        } catch (error) {
          console.log("ProductionOrderTempService.update error: ", error);
        }
      }
      // -- stamp due_date_time to last opn --
    }

    //เรียงลำดับ OPN จากมากไปน้อย
    routing_master_data.sort((a, b) => b.id - a.id);

    // console.log("routing_master_data: ", JSON.stringify(routing_master_data));

    // -------------- calculate overlab time  and update to database ----------------
    let cal_ov = 0.0;
    // let cal_ov_opn = null;
    let data_ov = {
      overlab_time_cal: 0,
      overlab_opn_id: null,
    };

    for (let i = 0; i < routing_master_data.length; i++) {
      // routing_master_data.forEach(async (item) => {

      try {
        await ProductionOrderTempService.update(
          doc_running,
          routing_master_data[i].rtg_id,
          routing_master_data[i].item_master_id,
          routing_master_data[i].opn_id,
          data_ov
        );
      } catch (error) {
        console.log("ProductionOrderTempService.update error: ", error);
      }

      if (
        routing_master_data[i].over_lap_unit == null ||
        routing_master_data[i].over_lap_unit == 0
      ) {
        if (
          routing_master_data[i].over_lap_time == null ||
          routing_master_data[i].over_lap_time == 0
        ) {
          data_ov.overlab_opn_id = null;
          cal_ov = 0;
        } else {
          cal_ov = parseFloat(routing_master_data[i].over_lap_time);
          data_ov.overlab_opn_id = routing_master_data[i].opn_id;
        }
      } else {
        cal_ov = parseFloat(
          routing_master_data[i].over_lap_unit / routing_master_data[i].pcs_hr
        );
        data_ov.overlab_opn_id = routing_master_data[i].opn_id;
      }

      data_ov.overlab_time_cal = cal_ov;

      // console.log("log over lab time: ", JSON.stringify(data_ov));

      // });
    }
    // -------------- calculate overlab time  and update to database ----------------

    //   ------------ step3 : คำนวณ OPN แต่ละตัว ------------
    // ---- loop ใหญ่ของ OPN ทั้งหมด ----
    let stamp_end_date = null;

    for (let i = 0; i < routing_master_data.length; i++) {
      // for (let i = 0; i < 3; i++) {
      template_shift = [];
      // console.log("Index i: ", i);
      if (i != 0) {
        console.log("routing_master_data.length - 1 == i");

        let data_due_date = {
          opn_end_date_time: stamp_end_date,
        };

        try {
          await ProductionOrderTempService.update(
            doc_running,
            routing_master_data[i].rtg_id,
            routing_master_data[i].item_master_id,
            routing_master_data[i].opn_id,
            data_due_date
          );
        } catch (error) {
          console.log("ProductionOrderTempService.update error: ", error);
        }
      }

      // console.log("routing_master_data[i]: ", routing_master_data[i]);

      let holiday_all = null; // วันหยุดเครื่องจักร
      let data = null; // รับข้อมูลกะ
      let shift_all = null; // ข้อมูลกะ
      let machine_all = null; // ข้อมูลเครื่องจักรใน OPN นั้นๆ
      let set_up_time = 0; // set up time ของ OPN นั้นๆ
      let time_process_by_opn = 0; // เวลาที่ใช้จริงของ OPN นั้นๆ
      let real_qty_order_scrap_by_opn = 0; // จำนวนที่ต้องผลิดจริง

      // ------------ sterp3.1 : คำนวณ OPN แต่ละตัว ------------
      // ------------ ดึงข้อมูลเครื่องจักรใน OPN นั้นๆ ------------
      machine_all = routing_master_data[i].machine_id.split(",");
      // console.log("machine_all: ", machine_all);

      // ------------ ดึงข้อมูลวันหยุด เครื่องจักร ------------
      // [
      //   {
      //     date_rom: "2024-01-30",
      //     holiday_type: "D",
      //     hours: 8,
      //   },
      //   {
      //     date_rom: "2024-02-14",
      //     holiday_type: "H",
      //     hours: 4,
      //   },
      // ];

      // ------------  step3.2 : get holiday data by machine_id and company_id ------------
      holiday_all = await tbl_routingService.findRoutingHoliday(
        machine_all,
        post_data.company_id
      );
      // console.log("holiday_all: ", JSON.stringify(holiday_all));

      // ------------ ดึงข้อมูลกะ ------------
      //   [
      //     {
      //       machine_id: "mccom1",
      //       shift_name: "กะA",
      //       start_time: "08:00:00",
      //       end_time: "17:00:00",
      //       break_start: "12:00:00",
      //       break_end: "13:00:00",
      //       summary_time: "08:00:00",
      //     },
      //     {
      //       machine_id: "mccom1",
      //       shift_name: "กะB",
      //       start_time: "17:01:00",
      //       end_time: "20:00:00",
      //       break_start: "00:00:00",
      //       break_end: "00:00:00",
      //       summary_time: "03:00:00",
      //     },
      //   ];

      // ------------  step3.3 : get shift data by machine_id and company_id  ------------

      shift_all = await tbl_routingService.findRoutingShift(
        machine_all[0],
        post_data.company_id
      );
      // console.log("shift_all: ", JSON.stringify(shift_all));

      // ข้อมูลตัวอย่าง
      // let data = [
      //   {
      //     machine_id: "mccom1",
      //     date_cal: "2024-01-30",
      //     shift_name: "กะA",
      //     start_time: "08:00:00",
      //     end_time: "17:00:00",
      //     break_start: "12:00:00",
      //     break_end: "13:00:00",
      //     summary_time: "08:00:00",
      //   },
      //   {
      //     machine_id: "mccom1",
      //     date_cal: "2024-01-30",
      //     shift_name: "กะB",
      //     start_time: "17:01:00",
      //     end_time: "20:00:00",
      //     break_start: "00:00:00",
      //     break_end: "00:00:00",
      //     summary_time: "03:00:00",
      //   },
      // ];
      data = shift_all;

      for (let i = 0; i < data.length; i++) {
        data[i].date_cal = time_stamp;
      }

      // console.log("data: ", JSON.stringify(data));

      // ------------  step3.4 : แตกกะและหาเวลารวมของแต่ละกะ + ทำ template  ------------
      // ------------  แตกกะและหาเวลารวมของแต่ละกะ ------------
      // ต้องทำ template กะไว้ก่อนเพื่อเอาไว้เช็ค due_date ว่าตรงกับกะไหม
      // และเอาไว้วน loop หา start_time OPN ปัจจุบัน
      // และเอาไว้วน loop หา end_time OPN ถัดไป

      let shift_index = 0;
      let tmp_shift_model = {
        index: 0,
        shift_name: "กะA",
        date_cal: "2024-02-29",
        start_time: "08:00:00",
        end_time: "17:00:00",
        summary_time: 0,
      };

      for (let i = data.length - 1; i >= 0; i--) {
        //   console.log(data[i]);

        // console.log(`Shift: ${data[i].shift_name}`);
        if (data[i].break_start != null && data[i].break_end != null) {
          tmp_shift_model = {
            index: 0,
            shift_name: "กะA",
            date_cal: "2024-02-29",
            start_time: "08:00:00",
            end_time: "17:00:00",
            summary_time: 0,
          };

          let hourDifference = calculateHourDifference(
            data[i].date_cal + " " + data[i].start_time,
            data[i].date_cal + " " + data[i].break_start
          );

          tmp_shift_model.index = i;
          tmp_shift_model.shift_name = data[i].shift_name;
          tmp_shift_model.date_cal = data[i].date_cal;
          tmp_shift_model.start_time = data[i].start_time;
          tmp_shift_model.end_time = data[i].break_start;
          tmp_shift_model.summary_time = Math.ceil(hourDifference);

          template_shift.push(tmp_shift_model);

          // console.log(
          //   `ความต่างของเวลาในชั่วโมง11: ${Math.ceil(hourDifference)} ชั่วโมง`
          // );

          tmp_shift_model = {
            index: 0,
            shift_name: "กะA",
            date_cal: "2024-02-29",
            start_time: "08:00:00",
            end_time: "17:00:00",
            summary_time: 0,
          };

          let hourDifference2 = calculateHourDifference(
            data[i].date_cal + " " + data[i].break_end,
            data[i].date_cal + " " + data[i].end_time
          );
          shift_index = shift_index++;
          tmp_shift_model.index = i + 1;
          tmp_shift_model.shift_name = data[i].shift_name;
          tmp_shift_model.date_cal = data[i].date_cal;
          tmp_shift_model.start_time = data[i].break_end;
          tmp_shift_model.end_time = data[i].end_time;
          tmp_shift_model.summary_time = Math.ceil(hourDifference2);

          template_shift.push(tmp_shift_model);

          // console.log(
          //   `ความต่างของเวลาในชั่วโมง22: ${Math.ceil(hourDifference2)} ชั่วโมง`
          // );
        } else {
          tmp_shift_model = {
            index: 0,
            shift_name: "กะA",
            date_cal: "2024-02-29",
            start_time: "08:00:00",
            end_time: "17:00:00",
            summary_time: 0,
          };

          let hourDifference3 = calculateHourDifference(
            data[i].date_cal + " " + data[i].start_time,
            data[i].date_cal + " " + data[i].end_time
          );
          shift_index = i + 1;
          tmp_shift_model.index = shift_index;
          tmp_shift_model.shift_name = data[i].shift_name;
          tmp_shift_model.date_cal = data[i].date_cal;
          tmp_shift_model.start_time = data[i].start_time;
          tmp_shift_model.end_time = data[i].end_time;
          // tmp_shift_model.summary_time = Math.ceil(hourDifference3);

          let time = data[i].summary_time; // Input time
          let parts = time.split(":"); // Split the time into [hours, minutes, seconds]
          let hours = parseInt(parts[0], 10); // Convert hours to integer
          tmp_shift_model.summary_time = hours;

          template_shift.push(tmp_shift_model);

          // console.log(
          //   `ความต่างของเวลาในชั่วโมง33: ${Math.ceil(hourDifference3)} ชั่วโมง`
          // );
        }
      }
      shift_index = 0;

      template_shift.sort(function (a, b) {
        return a.index - b.index;
      });

      // console.log("template_shift: ", JSON.stringify(template_shift));

      // ได้ template แล้ว หา set up time ของ OPN นั้นๆ

      // let time_process_by_opn = 0; // เวลาที่ใช้จริงของ OPN นั้นๆ

      //QtyOrder, QtyPer, QtyBy, Scrap, NoMch
      real_qty_order_scrap_by_opn = ManufactureOrder(
        post_data.order_qty,
        routing_master_data[i].qty_per,
        routing_master_data[i].qty_by,
        routing_master_data[i].scrap,
        parseInt(routing_master_data[i].no_of_machine)
      );
      // console.log("real_qty_order_scrap_by_opn: ", real_qty_order_scrap_by_opn);

      // qty_order_scrap,
      //   pcs_hr,
      //   set_up_time,
      //   setup_timehr_per,
      //   QtyPer,
      //   QtyBy,
      //   Scrap,
      //   NoMch,
      //   Batch;
      set_up_time = SetUpTime(
        post_data.order_qty,
        routing_master_data[i].pcs_hr,
        parseFloat(routing_master_data[i].setup_time),
        routing_master_data[i].setup_timehr_per,
        routing_master_data[i].qty_per,
        routing_master_data[i].qty_by,
        routing_master_data[i].scrap,
        parseInt(routing_master_data[i].no_of_machine),
        routing_master_data[i].batch
      );

      // console.log("set_up_time: ", set_up_time);

      time_process_by_opn =
        real_qty_order_scrap_by_opn / routing_master_data[i].pcs_hr +
        set_up_time;
      // console.log("time_process_by_opn: ", time_process_by_opn);

      // ------------ 3.5 : หาเวลาที่เหลือของวันนั้น ๆ  + เช็ควันหยุดเครื่องจักรด้วย ------------

      // order_qty,
      // machine_all,
      // holiday_all,
      // shift_all,
      // template_shift,
      // real_qty_order_scrap_by_opn,
      // set_up_time,
      // time_process_by_opn,
      // doc_running,
      // rtg_id,
      // item_master_id,
      // opn_id
      stamp_end_date = await calculateProductionOrderPlanDate(
        post_data.order_qty,
        machine_all,
        holiday_all,
        template_shift,
        real_qty_order_scrap_by_opn,
        set_up_time,
        time_process_by_opn,
        doc_running,
        post_data.rtg_id,
        post_data.item_master_id,
        routing_master_data[i].opn_id
      );

      // --------- check and update overlab time and return new stamp_end_date ---------

      // doc_running,
      // rtg_id,
      // item_master_id,
      // opn_id
      let check_overlab = null;
      // ต้องดึงข้อมูลจาก production_order_temp เพราะข้อมูลหลักที่วน loop ดึงจาก routing_master_data ไม่มีข้อมูล overlab_time_cal
      let res_overlab = await ProductionOrderTempService.findPOTempByOPN(
        doc_running,
        routing_master_data[i].rtg_id,
        routing_master_data[i].item_master_id,
        routing_master_data[i].opn_id
      );
      // console.log(
      //   "tmp_overlab overlab_time_cal: ",
      //   res_overlab[0].overlab_time_cal
      // );
      if (res_overlab[0].overlab_time_cal > 0) {
        // console.log("tmp_overlab res_overlab[0].overlab_time_cal > 0");
        let tmp_overlab = await ProductionOrderTempService.findPOTempByOPN(
          doc_running,
          res_overlab[0].rtg_id,
          res_overlab[0].item_master_id,
          res_overlab[0].overlab_opn_id
        );

        check_overlab = tmp_overlab[0].opn_start_date_time;
        // console.log("tmp_overlab: ", JSON.stringify(tmp_overlab));
        // console.log("tmp_overlab check_overlab: ", check_overlab);
        // let f1 = check_overlab.toISOString().split("T");
        // let f1 = check_overlab
        //   .toISOString()
        //   .replace("T", " ")
        //   .replace(".000Z", "");
        // console.log("tmp_overlab f1[0]: ", f1);
        const originalDate = new Date(check_overlab);
        // console.log("tmp_overlab originalDate: ", originalDate);
        let tov = 420 - convertHourToMinute(res_overlab[0].overlab_time_cal);
        // console.log("tmp_overlab tov: ", tov);
        let newDate = new Date(originalDate.getTime() + tov * 60 * 1000); // แปลงเป็นมิล
        // console.log("tmp_overlab newDate: ", newDate);
        stamp_end_date = newDate
          .toISOString()
          .replace("T", " ")
          .replace(".000Z", "");
        // console.log("tmp_overlab stamp_end_date: ", stamp_end_date);

        // ----------  update start-end overlab time to database ---------
        await calculateProductionOrderPlanOverLabDate(
          post_data.order_qty,
          machine_all,
          holiday_all,
          template_shift,
          real_qty_order_scrap_by_opn,
          set_up_time,
          time_process_by_opn,
          newDate,
          doc_running,
          post_data.rtg_id,
          post_data.item_master_id,
          routing_master_data[i].opn_id
        );
      } else {
        // console.log("tmp_overlab res_overlab[0].overlab_time_cal !> 0");
        // break;
      }
    }
    // ---- loop ใหญ่ของ OPN ทั้งหมด ----

    // End Flow คำนวณ

    // --------------------- Insert Data To Draft Production Order ---------------------

    // get doc_group_name
    let rec_no_batch_count = 0;
    let main_stamp_batch_start = null;
    let stamp_batch_start = null;
    let stamp_batch_end = null;

    const res_doc = await doc_runningService.findGroupByModule(
      post_data.doc_module_name
    );
    doc_group_name = res_doc[0].doc_group_name;

    let res_draft = await ProductionOrderTempService.findALLByRouting(
      doc_running,
      post_data.rtg_id,
      post_data.item_master_id
    );
    // console.log("res_draft: ", JSON.stringify(res_draft));

    // --------------- split machine opn by machine ----------------

    // clear data in production_order_temp
    await ProductionOrderTempService.deleteByRunningNo(doc_running);

    for (let i = 0; i < res_draft.length; i++) {
      console.log("res_draft 1: Loop ", i);
      let data = {
        doc_running_no: doc_running,
        item_id: res_draft[i].item_id,
        item_master_id: res_draft[i].item_master_id,
        order_qty: res_draft[i].order_qty,
        rtg_id: res_draft[i].rtg_id,
        opn_id: res_draft[i].opn_id,
        pcs_hr: res_draft[i].pcs_hr,
        time_process_by_opn: res_draft[i].time_process_by_opn,
        setup_time: res_draft[i].tr_setup_time,
        real_qty_order_scrap_by_opn: res_draft[i].real_qty_order_scrap_by_opn,
        machine_id: res_draft[i].machine_id,
        scrap_per: res_draft[i].scrap_per,
        overlap_time: res_draft[i].overlap_time,
        setup_timehr_per: res_draft[i].setup_timehr_per,
        batch: res_draft[i].batch,
        opn_start_date_time: res_draft[i].opn_start_date_time,
        opn_end_date_time: res_draft[i].opn_end_date_time,
        overlab_time_cal: res_draft[i].overlab_time_cal,
        company_id: res_draft[i].company_id,
        predecessor: res_draft[i].predecessor,
        dependency: res_draft[i].dependency,
        user_create: res_draft[i].user_create,
        created_at: new Date(),
      };

      let no_mch = [];
      no_mch = res_draft[i].machine_id.split(",");
      // console.log("TestData no_mch: ", no_mch);
      for (let j = 0; j < no_mch.length; j++) {
        data.machine_id = no_mch[j];
        // console.log("data: ", JSON.stringify(data));
        try {
          await ProductionOrderTempService.create(data);
          console.log("PD ProductionOrderTempService.create");
        } catch (error) {
          console.log("ProductionOrderTempService.create error: ", error);
        }
      }
    }

    // --------------- split machine opn by machine ----------------

    // return;
    // --------------- calculate predecessor and dependency ----------------
    console.log("PD ProductionOrderTempService.findALLByRouting");
    // res_draft = [];

    //delay 2 sec
    // await new Promise((resolve) => setTimeout(resolve, 9000));

    // let res_draft2 = await ProductionOrderTempService.findALLByRouting(
    //   doc_running,
    //   post_data.rtg_id,
    //   post_data.item_master_id
    // );

    let res_draft2 = await ProductionOrderTempService.findALLByRoutingV2(
      doc_running
    );

    // console.log("pd res_draft2: ", JSON.stringify(res_draft2));

    for (let i = 0; i < res_draft2.length; i++) {
      // console.log("pd res_draft2: ", res_draft2[i].machine_id);

      if (res_draft2[i].dependency == "FS") {
        // FS
        console.log("PD Type FS");

        if (
          res_draft2[i].overlap_time != 0 &&
          res_draft2[i].predecessor != "0"
        ) {
          // SS
          // ถ้าเป็น SS + overlab ต้องมี predecessor id ตลอด , ต้องมี OPN ก่อนหน้าเสมอ
          console.log("PD Type FS + Overlab");
          // console.log("res_draft2[i].predecessor != 0");
          // หา OPN จาก routting id
          let res_rtg_opn = await tbl_routingService.findRoutingByRTGID(
            res_draft2[i].predecessor
          );
          console.log("PD res_rtg_opn: ", JSON.stringify(res_rtg_opn));
          // หา opn_end_date_time จาก opn_id
          let res_predecessor =
            await ProductionOrderTempService.findPOTempByOPNMINEndDate(
              doc_running,
              post_data.rtg_id,
              post_data.item_master_id,
              res_rtg_opn[0].opn_id
            );
          // console.log("PD res_rtg_opn[0].opn_id: ", res_rtg_opn[0].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_start_date_time: ",
          //   res_predecessor[0].opn_start_date_time
          // );
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_end_date_time: ",
          //   res_predecessor[0].opn_end_date_time
          // );

          const originalDate = new Date(res_predecessor[0].opn_end_date_time);
          // console.log("tmp_overlab originalDate: ", originalDate);
          let tov = convertHourToMinute(res_predecessor[0].overlab_time_cal);
          // console.log("tmp_overlab tov: ", tov);
          let newDate = new Date(
            originalDate.getTime() + 420 + tov * 60 * 1000
          ); // แปลงเป็นมิล

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,
          let stamp_end_date = await calculateWorkOrderUpToDown(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let new_date_start = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          await ProductionOrderTempService.updateByID(
            res_draft2[i].id,
            data_due_date
          );
        } else if (
          res_draft2[i].predecessor == "0" &&
          res_draft2[i].overlap_time == 0
        ) {
          // console.log("res_draft2[i].predecessor == 0");
          // เป็น OPN แรก ไม่มี predecessor
          // console.log("PD res_rtg_opn[0].opn_id: ", res_draft2[i].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          console.log(
            "PD FS 0 res_predecessor res_predecessor[0].opn_start_date_time: ",
            res_draft2[i].opn_start_date_time
          );
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_end_date_time: ",
          //   res_draft2[i].opn_end_date_time
          // );
          const originalDate = new Date(res_draft2[i].opn_start_date_time);
          let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000);
          console.log("PD FS 0 newDate: ", newDate);

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,
          let stamp_end_date = await calculateWorkOrderUpToDown(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let new_date_start = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          await ProductionOrderTempService.updateByID(
            res_draft2[i].id,
            data_due_date
          );
        } else if (
          res_draft2[i].predecessor != "0" &&
          res_draft2[i].overlap_time == 0
        ) {
          // console.log("res_draft2[i].predecessor != 0");
          // หา OPN จาก routting id
          let res_rtg_opn = await tbl_routingService.findRoutingByRTGID(
            res_draft2[i].predecessor
          );
          // console.log("PD res_rtg_opn: ", JSON.stringify(res_rtg_opn));
          // หา opn_end_date_time จาก opn_id
          let res_predecessor =
            await ProductionOrderTempService.findPOTempByOPNMINEndDate(
              doc_running,
              post_data.rtg_id,
              post_data.item_master_id,
              res_rtg_opn[0].opn_id
            );
          // console.log("PD res_rtg_opn[0].opn_id: ", res_rtg_opn[0].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_start_date_time: ",
          //   res_predecessor[0].opn_start_date_time
          // );
          console.log(
            "PD FS !0 res_predecessor res_predecessor[0].opn_end_date_time: ",
            res_predecessor[0].opn_end_date_time
          );

          const originalDate = new Date(res_predecessor[0].opn_end_date_time);
          let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000);
          console.log("PD FS !0 newDate: ", newDate);

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,
          let stamp_end_date = await calculateWorkOrderUpToDown(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let new_date_start = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          await ProductionOrderTempService.updateByID(
            res_draft2[i].id,
            data_due_date
          );
        }
      } else if (res_draft2[i].dependency == "SS") {
        // SS
        // ถ้าเป็น SS ต้องมี predecessor id ตลอด , ต้องมี OPN ก่อนหน้าเสมอ
        console.log("PD Type SS");
        if (
          res_draft2[i].overlap_time != 0 &&
          res_draft2[i].predecessor != "0"
        ) {
          // SS
          // ถ้าเป็น SS + overlab ต้องมี predecessor id ตลอด , ต้องมี OPN ก่อนหน้าเสมอ
          console.log("PD Type SS + Overlab");
          // console.log("res_draft2[i].predecessor != 0");
          // หา OPN จาก routting id
          let res_rtg_opn = await tbl_routingService.findRoutingByRTGID(
            res_draft2[i].predecessor
          );
          console.log("PD res_rtg_opn: ", JSON.stringify(res_rtg_opn));
          // หา opn_end_date_time จาก opn_id
          let res_predecessor =
            await ProductionOrderTempService.findPOTempByOPNMINStartDate(
              doc_running,
              post_data.rtg_id,
              post_data.item_master_id,
              res_rtg_opn[0].opn_id
            );
          // console.log("PD res_rtg_opn[0].opn_id: ", res_rtg_opn[0].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_start_date_time: ",
          //   res_predecessor[0].opn_start_date_time
          // );
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_end_date_time: ",
          //   res_predecessor[0].opn_end_date_time
          // );

          const originalDate = new Date(res_predecessor[0].opn_start_date_time);
          // console.log("tmp_overlab originalDate: ", originalDate);
          let tov = convertHourToMinute(res_predecessor[0].overlab_time_cal);
          // console.log("tmp_overlab tov: ", tov);
          let newDate = new Date(
            originalDate.getTime() + 420 + tov * 60 * 1000
          ); // แปลงเป็นมิล

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,
          let stamp_end_date = await calculateWorkOrderUpToDown(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let new_date_start = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          await ProductionOrderTempService.updateByID(
            res_draft2[i].id,
            data_due_date
          );
        } else if (
          res_draft2[i].predecessor == "0" &&
          res_draft2[i].overlap_time == 0
        ) {
          // console.log("res_draft2[i].predecessor == 0");
          // เป็น OPN แรก ไม่มี predecessor
          // console.log("PD res_rtg_opn[0].opn_id: ", res_draft2[i].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          console.log(
            "PD SS 0 res_predecessor res_predecessor[0].opn_start_date_time: ",
            res_draft2[i].opn_start_date_time
          );
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_end_date_time: ",
          //   res_draft2[i].opn_end_date_time
          // );

          // let newDate = new Date(res_draft2[i].opn_start_date_time);

          const originalDate = new Date(res_draft2[i].opn_start_date_time);
          let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000);
          console.log("PD SS 0 newDate: ", newDate);

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,
          let stamp_end_date = await calculateWorkOrderUpToDown(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let new_date_start = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          await ProductionOrderTempService.updateByID(
            res_draft2[i].id,
            data_due_date
          );
        } else if (
          res_draft2[i].predecessor != "0" &&
          res_draft2[i].overlap_time == 0
        ) {
          // console.log("res_draft2[i].predecessor != 0");
          // หา OPN จาก routting id
          let res_rtg_opn = await tbl_routingService.findRoutingByRTGID(
            res_draft2[i].predecessor
          );
          // console.log("PD res_rtg_opn: ", JSON.stringify(res_rtg_opn));
          // หา opn_end_date_time จาก opn_id
          let res_predecessor =
            await ProductionOrderTempService.findPOTempByOPNMINStartDate(
              doc_running,
              post_data.rtg_id,
              post_data.item_master_id,
              res_rtg_opn[0].opn_id
            );
          // console.log("PD res_rtg_opn[0].opn_id: ", res_rtg_opn[0].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          console.log(
            "PD SS !0 res_predecessor res_predecessor[0].opn_start_date_time: ",
            res_predecessor[0].opn_start_date_time
          );
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_end_date_time: ",
          //   res_predecessor[0].opn_end_date_time
          // );

          // let newDate = new Date(res_predecessor[0].opn_start_date_time);

          const originalDate = new Date(res_predecessor[0].opn_start_date_time);
          let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000);
          console.log("PD SS !0 newDate: ", newDate);

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,
          let stamp_end_date = await calculateWorkOrderUpToDown(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let new_date_start = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          await ProductionOrderTempService.updateByID(
            res_draft2[i].id,
            data_due_date
          );
        }
      } else if (res_draft2[i].dependency == "FF") {
        // FF

        // ถ้าเป็น FF ต้องมี predecessor id ตลอด , ต้องมี OPN ก่อนหน้าเสมอ
        console.log("PD Type FF");

        if (
          res_draft2[i].overlap_time != 0 &&
          res_draft2[i].predecessor != "0"
        ) {
          // SS
          // ถ้าเป็น SS + overlab ต้องมี predecessor id ตลอด , ต้องมี OPN ก่อนหน้าเสมอ
          console.log("PD Type FF + Overlab");
          // console.log("res_draft2[i].predecessor != 0");
          // หา OPN จาก routting id
          let res_rtg_opn = await tbl_routingService.findRoutingByRTGID(
            res_draft2[i].predecessor
          );
          console.log("PD res_rtg_opn: ", JSON.stringify(res_rtg_opn));
          // หา opn_end_date_time จาก opn_id
          let res_predecessor =
            await ProductionOrderTempService.findPOTempByOPNMINEndDate(
              doc_running,
              post_data.rtg_id,
              post_data.item_master_id,
              res_rtg_opn[0].opn_id
            );
          // console.log("PD res_rtg_opn[0].opn_id: ", res_rtg_opn[0].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_start_date_time: ",
          //   res_predecessor[0].opn_start_date_time
          // );
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_end_date_time: ",
          //   res_predecessor[0].opn_end_date_time
          // );

          const originalDate = new Date(res_predecessor[0].opn_end_date_time);
          // console.log("tmp_overlab originalDate: ", originalDate);
          let tov = convertHourToMinute(res_predecessor[0].overlab_time_cal);
          // console.log("tmp_overlab tov: ", tov);
          let newDate = new Date(
            originalDate.getTime() + 420 + tov * 60 * 1000
          ); // แปลงเป็นมิล

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,
          let new_date_start = await calculateWorkOrderDownToUp(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let stamp_end_date = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          await ProductionOrderTempService.updateByID(
            res_draft2[i].id,
            data_due_date
          );
        } else if (
          res_draft2[i].predecessor == "0" &&
          res_draft2[i].overlap_time == 0
        ) {
          // console.log("res_draft2[i].predecessor == 0");
          // เป็น OPN แรก ไม่มี predecessor
          // console.log("PD res_rtg_opn[0].opn_id: ", res_draft2[i].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_start_date_time: ",
          //   res_draft2[i].opn_start_date_time
          // );
          console.log(
            "PD FF 0 res_predecessor res_predecessor[0].opn_end_date_time: ",
            res_draft2[i].opn_end_date_time
          );

          // let newDate = new Date(res_draft2[i].opn_end_date_time);

          const originalDate = new Date(res_draft2[i].opn_end_date_time);
          let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000);
          console.log("PD FF 0 newDate: ", newDate);

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,
          let new_date_start = await calculateWorkOrderDownToUp(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let stamp_end_date = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          await ProductionOrderTempService.updateByID(
            res_draft2[i].id,
            data_due_date
          );
        } else if (
          res_draft2[i].predecessor != "0" &&
          res_draft2[i].overlap_time == 0
        ) {
          // console.log("res_draft2[i].predecessor != 0");
          // หา OPN จาก routting id
          let res_rtg_opn = await tbl_routingService.findRoutingByRTGID(
            res_draft2[i].predecessor
          );
          // console.log("PD res_rtg_opn: ", JSON.stringify(res_rtg_opn));
          // หา opn_end_date_time จาก opn_id
          let res_predecessor =
            await ProductionOrderTempService.findPOTempByOPNMINEndDate(
              doc_running,
              post_data.rtg_id,
              post_data.item_master_id,
              res_rtg_opn[0].opn_id
            );
          // console.log("PD res_rtg_opn[0].opn_id: ", res_rtg_opn[0].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_start_date_time: ",
          //   res_predecessor[0].opn_start_date_time
          // );
          console.log(
            "PD FF !0 res_predecessor res_predecessor[0].opn_end_date_time: ",
            res_predecessor[0].opn_end_date_time
          );

          // let newDate = new Date(res_predecessor[0].opn_end_date_time);

          const originalDate = new Date(res_predecessor[0].opn_end_date_time);
          let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000);
          console.log("PD FF !0 newDate: ", newDate);

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,
          let new_date_start = await calculateWorkOrderDownToUp(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let stamp_end_date = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          await ProductionOrderTempService.updateByID(
            res_draft2[i].id,
            data_due_date
          );
        }
      }
    }

    // --------------- calculate predecessor and dependency ----------------

    // --------------- calculate End Time Last OPN == DueDate -----------------

    let c_over = 0;

    let c_date_due_date = new Date();
    let c_date_end_time_cal = new Date();
    do {
      c_over++;
      let res_draft3 = await ProductionOrderTempService.findALLByRoutingV2(
        doc_running
      );

      // console.log("PD res_draft3: ", JSON.stringify(res_draft3));

      let OriginalDate3 = new Date(
        res_draft3[res_draft3.length - 1].opn_end_date_time
      );
      let end_time_cal = new Date(OriginalDate3.getTime() + 420 * 60 * 1000);
      console.log("PD end_time_cal: ", end_time_cal);
      c_date_end_time_cal = new Date(end_time_cal);

      let OriginalDate31 = new Date(due_date_time);
      c_date_due_date = new Date(OriginalDate31.getTime() + 420 * 60 * 1000);

      console.log("PD c_date_end_time_cal: ", c_date_end_time_cal);
      console.log("PD c_date_due_date: ", c_date_due_date);

      let status_cal = "equal";
      let minute_cal = 0;

      if (c_date_due_date < c_date_end_time_cal) {
        try {
          console.log("due_date_time < end_time_cal");
          // duedate เป็นค่า -
          // ขยับเวลาทั้งหมด ขึ้นไปข้างหน้าโดยการลบ
          status_cal = "minus";

          let holiday_all = await getHolidayByMachineId(
            res_draft3[res_draft3.length - 1].machine_id,
            res_draft3[res_draft3.length - 1].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));

          let shift_all = await getShiftByMachineId(
            res_draft3[res_draft3.length - 1].machine_id,
            res_draft3[res_draft3.length - 1].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          //c_date_due_date > c_date_end_time_cal
          minute_cal = await calculateDateRangeMinuteUpToDown(
            shift_all,
            c_date_due_date,
            c_date_end_time_cal
          );
          console.log("PD minute_cal: ", minute_cal);

          // update first opn start date time
          // console.log("PD res_draft3: ", JSON.stringify(res_draft3));
          let t1 = new Date(res_draft3[0].opn_start_date_time);
          // console.log("PD t1: ", t1);
          let t2 = new Date(t1.getTime() + 420 * 60 * 1000);
          // console.log("PD t2: ", t2);
          // let t3 = new Date(t2.getTime() - minute_cal * 60 * 1000);
          // console.log("PD t3: ", t3);
          let t4 = t2.toISOString().replace("T", " ").replace(".000Z", "");
          // console.log("PD t4: ", t4);
          // holiday_all,
          //   shift_all,
          //   minutesWorkedCal,
          //   opn_end_date_time;
          let t5 = await calculateReDateDownToUp(
            holiday_all,
            shift_all,
            minute_cal,
            t4
          );
          // let t51 = new Date(t5);
          // let t6 = new Date(t51.getTime() + 420 * 60 * 1000);
          // update first opn start date time by id
          let data_due_date = {
            opn_start_date_time: t5,
          };
          // await ProductionOrderTempService.updateByID(
          //   res_draft3[0].id,
          //   data_due_date
          // );

          // doc_running, rtg_id, item_master_id, data;
          await ProductionOrderTempService.updateByDocRunningAndOPN(
            res_draft3[0].doc_running_no,
            res_draft3[0].rtg_id,
            res_draft3[0].item_master_id,
            data_due_date
          );
          // console.log("PD t5: ", t5);

          //recalculate PD
          await reCalculatePD(doc_running);

          // ----------------- get last opn end date time for check -----------------
          let res_draft4 = await ProductionOrderTempService.findALLByRoutingV2(
            doc_running
          );

          // console.log("PD res_draft4: ", JSON.stringify(res_draft4));

          let OriginalDate4 = new Date(
            res_draft4[res_draft4.length - 1].opn_end_date_time
          );
          let end_time_cal4 = new Date(
            OriginalDate4.getTime() + 420 * 60 * 1000
          );
          console.log("PD 44 end_time_cal4: ", end_time_cal4);
          c_date_end_time_cal = new Date(end_time_cal4);
          console.log("PD 44 c_date_end_time_cal: ", c_date_end_time_cal);
          // ----------------- get last opn end date time for check -----------------
        } catch (error) {
          console.log("PD calculateDateRangeMinuteUpToDown error: ", error);
        }
      }
      // } while (c_date_due_date < c_date_end_time_cal);
    } while (c_over < 10);

    // --------------- calculate End Time Last OPN == DueDate -----------------

    // ----------------- calculate Operation Type and insert to production_order -----------------
    let res_draft4 = await ProductionOrderTempService.findALLByRoutingV2(
      doc_running
    );

    // console.log("res_draft4: ", JSON.stringify(res_draft4));

    for (let i = 0; i < res_draft4.length; i++) {
      // console.log("res_draft4: ", JSON.stringify(res_draft4[i]));

      console.log("res_draft4 1: Loop ", i);
      let data = {
        doc_group_name: doc_group_name,
        doc_running_no: doc_running,
        item_master_id: res_draft4[i].item_master_id,
        order_qty: res_draft4[i].order_qty,
        rtg_id: res_draft4[i].rtg_id,
        opn_id: res_draft4[i].opn_id,
        pcs_hr: res_draft4[i].pcs_hr,
        time_process_by_opn: res_draft4[i].time_process_by_opn,
        setup_time: res_draft4[i].setup_time,
        real_qty_order_scrap_by_opn: res_draft4[i].real_qty_order_scrap_by_opn,
        machine_id: res_draft4[i].machine_id,
        overlap_time: res_draft4[i].overlap_time,
        setup_timehr_per: res_draft4[i].setup_timehr_per,
        batch: res_draft4[i].batch,
        batch_count: 0,
        batch_amount: 0,
        opn_start_date_time: res_draft4[i].opn_start_date_time,
        opn_end_date_time: res_draft4[i].opn_end_date_time,
        overlab_time_cal: res_draft4[i].overlab_time_cal,
        company_id: res_draft4[i].company_id,
        predecessor: res_draft4[i].predecessor,
        dependency: res_draft4[i].dependency,
        production_time: 0,
        due_date: post_data.due_date,
        due_time: post_data.due_time,
        order_date: post_data.created_at,
        doc_module_name: post_data.doc_module_name,
        std_labor_cost: 0.0,
        std_foh_cost: 0.0,
        std_voh_cost: 0.0,
        user_create: res_draft4[i].user_create,
        created_at: new Date(),
        opn_qty: 0,
      };

      /*
        {
            "id": 637,
            "doc_running_no": "PDCM-240231",
            "item_id": 1,
            "item_master_id": 10,
            "order_qty": 1000,
            "rtg_id": "01",
            "opn_id": "100",
            "pcs_hr": 240,
            "time_process_by_opn": "13.6250",
            "setup_time": "0.0000",
            "real_qty_order_scrap_by_opn": 2550,
            "machine_id": "17,18",
            "scrap_per": "0.0000",
            "overlap_time": "0.0000",
            "setup_timehr_per": "B",
            "batch": 500,
            "opn_start_date_time": "2024-02-25T07:10:00.000Z",
            "opn_end_date_time": "2024-02-26T06:11:30.000Z",
            "overlab_time_cal": "0.5000",
            "overlab_opn_id": "200",
            "company_id": 1,
            "user_create": 2,
            "user_update": null,
            "created_at": "2024-02-15T00:00:00.000Z",
            "updated_at": "2024-02-06T04:21:14.000Z",
            "qty_per": 10,
            "qty_by": 2,
            "scrap": 2,
            "no_of_machine": "2"
        },
    */

      let holiday_all = await getHolidayByMachineId(
        res_draft4[i].machine_id,
        res_draft4[i].company_id
      );
      // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
      let shift_all = await getShiftByMachineId(
        res_draft4[i].machine_id,
        res_draft4[i].company_id
      );
      // console.log("PD shift_all2: ", JSON.stringify(shift_all));

      console.log("res_draft4 2: Loop ", i);
      let bo = 0.0;
      let no_mch = [];
      if (res_draft4[i].setup_timehr_per == "B") {
        console.log("res_draft4 3: Loop ", i);
        //QtyOrder, QtyPer, QtyBy, Scrap, NoMch, Batch
        let cal_down = 0.0;
        bo = BatchOrder(
          res_draft4[i].order_qty,
          res_draft4[i].qty_per,
          res_draft4[i].qty_by,
          res_draft4[i].scrap,
          res_draft4[i].no_of_machine,
          res_draft4[i].batch
        );
        console.log("res_draft4 4: Loop ", i);
        no_mch = res_draft4[i].machine_id.split(",");
        // console.log("TestData no_mch: ", no_mch);
        for (let j = 0; j < no_mch.length; j++) {
          main_stamp_batch_start = res_draft4[i].opn_start_date_time;
          stamp_batch_start = null;
          // stamp_batch_start = res_draft4[i].opn_start_date_time;

          // console.log("TestData no_mch: ", no_mch[j]);
          console.log("res_draft4 5: Loop ", i);
          data.machine_id = no_mch[j];
          let res_cost = await tbl_mch_shift.findMachineCostByID(
            data.machine_id
          );
          console.log("res_cost: ", JSON.stringify(res_cost));
          // data.std_labor_cost = res_cost[0].labor_rate;
          // data.std_foh_cost = res_cost[0].foh_rate;
          // data.std_voh_cost = res_cost[0].voh_rate;

          for (let k = 0; k < bo; k++) {
            // console.log("TestData bo: ", bo[k]);
            console.log("res_draft4 6: Loop ", i);
            rec_no_batch_count = rec_no_batch_count + 1;
            // data.batch_count = k + 1;
            data.batch_count = rec_no_batch_count;
            if (k == bo - 1) {
              cal_down =
                res_draft4[i].real_qty_order_scrap_by_opn % res_draft4[i].batch;
              if (cal_down == 0) {
                cal_down = res_draft4[i].batch;
              }
            } else {
              cal_down = res_draft4[i].batch;
            }
            data.batch_amount = cal_down;
            data.production_time =
              parseFloat(cal_down) / parseFloat(res_draft4[i].pcs_hr) +
              parseFloat(res_draft4[i].setup_time);

            data.opn_qty = data.batch_amount;

            // console.log(`TestData data ${k}: `, JSON.stringify(data));
            console.log("res_draft4 7: Loop ", i);

            data.std_labor_cost =
              parseFloat(res_cost[0].labor_rate) * data.production_time;
            data.std_foh_cost =
              parseFloat(res_cost[0].foh_rate) * data.production_time;
            data.std_voh_cost =
              parseFloat(res_cost[0].voh_rate) * data.production_time;

            // console.log("data B production_time: ", data.production_time);
            // console.log("data B std_labor_cost: ", data.std_labor_cost);
            // console.log("data B std_foh_cost: ", data.std_foh_cost);
            // console.log("data B std_voh_cost: ", data.std_voh_cost);

            if (stamp_batch_start == null) {
              console.log(
                "res_draft4 7.1: stamp_batch_start ",
                "stamp_batch_start == null"
              );
              console.log(
                "res_draft4 7.1: stamp_batch_start: ",
                stamp_batch_start
              );
              // stamp_batch_end = await calculateSplitMachineBatchDate(
              //   data.machine_id,
              //   post_data.company_id,
              //   data.production_time,
              //   main_stamp_batch_start
              // );

              //   holiday_all,
              //   shift_all,
              //   production_time,
              //   opn_end_date_time;
              stamp_batch_end = await calculateSplitMachineBatchDateV2(
                holiday_all,
                shift_all,
                data.production_time,
                main_stamp_batch_start
              );

              data.opn_start_date_time = main_stamp_batch_start;
              data.opn_end_date_time = stamp_batch_end;
            } else {
              console.log(
                "res_draft4 7.1: stamp_batch_start ",
                "stamp_batch_start != null"
              );
              console.log(
                "res_draft4 7.1: stamp_batch_start: ",
                stamp_batch_start
              );
              // stamp_batch_end = await calculateSplitMachineBatchDate(
              //   data.machine_id,
              //   post_data.company_id,
              //   data.production_time,
              //   stamp_batch_start
              // );

              //   holiday_all,
              //   shift_all,
              //   production_time,
              //   opn_end_date_time;
              stamp_batch_end = await calculateSplitMachineBatchDateV2(
                holiday_all,
                shift_all,
                data.production_time,
                stamp_batch_start
              );

              data.opn_start_date_time = stamp_batch_start;
              data.opn_end_date_time = stamp_batch_end;
            }
            console.log("res_draft4 7.1: Loop ", i);

            console.log("res_draft4 stamp_batch_start:", stamp_batch_start);
            console.log("res_draft4 stamp_batch_end:", stamp_batch_end);
            try {
              await DraftProdOrderPlanService.create(data);
            } catch (error) {
              console.log("res_draft4 8: Loop error", error);
            }
            stamp_batch_start = stamp_batch_end;

            console.log("res_draft4 8: Loop ", i);
          }
        }
      } else if (res_draft4[i].setup_timehr_per == "O") {
        console.log("res_draft4 9: Loop ", i);
        data.batch_count = 1;
        data.batch_amount = res_draft4[i].order_qty;
        data.production_time =
          parseFloat(res_draft4[i].order_qty) /
            parseFloat(res_draft4[i].pcs_hr) +
          parseFloat(res_draft4[i].setup_time);

        data.opn_qty = data.batch_amount;

        console.log("production_time O: ", data.production_time);
        console.log("res_draft4[i].order_qty: ", res_draft4[i].order_qty);
        console.log("res_draft4[i].pcs_hr: ", res_draft4[i].pcs_hr);
        console.log("res_draft4[i].setup_time: ", res_draft4[i].setup_time);

        let res_cost = await tbl_mch_shift.findMachineCostByID(data.machine_id);
        console.log("res_cost: ", JSON.stringify(res_cost));
        data.std_labor_cost =
          parseFloat(res_cost[0].labor_rate) * data.production_time;
        data.std_foh_cost =
          parseFloat(res_cost[0].foh_rate) * data.production_time;
        data.std_voh_cost =
          parseFloat(res_cost[0].voh_rate) * data.production_time;

        console.log("data O production_time: ", data.production_time);
        console.log("data O std_labor_cost: ", data.std_labor_cost);
        console.log("data O std_foh_cost: ", data.std_foh_cost);
        console.log("data O std_voh_cost: ", data.std_voh_cost);
        try {
          await DraftProdOrderPlanService.create(data);
        } catch (error) {
          console.log("res_draft4 10: Loop error", error);
        }

        console.log("res_draft4 10: Loop ", i);
      } else if (res_draft4[i].setup_timehr_per == "Q") {
        console.log("res_draft4 11: Loop ", i);
        data.batch_count = 1;
        data.batch_amount = res_draft4[i].order_qty;
        data.production_time =
          parseFloat(res_draft4[i].order_qty) /
            parseFloat(res_draft4[i].pcs_hr) +
          parseFloat(res_draft4[i].setup_time);

        data.opn_qty = data.batch_amount;

        let res_cost = await tbl_mch_shift.findMachineCostByID(data.machine_id);
        // console.log("res_cost: ", JSON.stringify(res_cost));
        data.std_labor_cost =
          parseFloat(res_cost[0].labor_rate) * data.production_time;
        data.std_foh_cost =
          parseFloat(res_cost[0].foh_rate) * data.production_time;
        data.std_voh_cost =
          parseFloat(res_cost[0].voh_rate) * data.production_time;

        // console.log("data Q production_time: ", data.production_time);
        // console.log("data Q std_labor_cost: ", data.std_labor_cost);
        // console.log("data Q std_foh_cost: ", data.std_foh_cost);
        // console.log("data Q std_voh_cost: ", data.std_voh_cost);

        await DraftProdOrderPlanService.create(data);
        // console.log("production_time Q: ", data.production_time);
        // console.log("res_draft4[i].order_qty: ", res_draft4[i].order_qty);
        // console.log("res_draft4[i].pcs_hr: ", res_draft4[i].pcs_hr);
        // console.log("res_draft4[i].setup_time: ", res_draft4[i].setup_time);
        // console.log("res_draft4 12: Loop ", i);
      }
    }

    // ----------------- calculate Operation Type and insert to production_order -----------------

    // --------------------- Insert Data To Draft Production Order ---------------------

    return res
      .status(200)
      .json({ message: "success", doc_running: doc_running });
  } catch (err) {
    return res.status(204).json({ message: err });
  }
};

exports.adjustProductionOrderByDueDateDraft = async (req, res) => {
  let ord_id = req.params.id;

  let post_data = req.body;
  let doc_running = "";
  let doc_group_name = null; // ชื่อกลุ่มเอกสาร

  let routing_master_data = null; // ข้อมูล Routing + OPN ทั้งหมด
  let time_stamp = null; // วันที่เวลาปัจจุบัน
  let template_shift = []; // ทำ template กะไว้ก่อนเพื่อเอาไว้เช็ค due_date ว่าตรงกับกะไหม
  let master_data_production_order = null; // ข้อมูล Production Order ทั้งหมด
  let end_time_process = null; // เวลาที่จบการทำงาน OPN นั้นๆ
  let end_time_process_overlab = null; // เวลาที่จบการทำงาน OPN นั้นๆ คำนวนใหม่จาก overlap time

  let due_date_time = null; // วันที่ต้องส่งมอบ

  //   let machine_all = null; // จำนวนเครื่องจักรทั้งหมด

  // {
  //     "doc_running": "PDCM-240282",
  //     "doc_module_name": "PD ceramic",
  //     "item_master_id": 10,
  //     "order_qty": "1000",
  //     "rtg_id": "01",
  //     "order_date": "2024-01-30",
  //     "due_date": "2024-02-29",
  //     "due_time": "16:00:00",
  //     "company_id": "1",
  //     "user_update": "2",
  //     "updated_at": "2024-01-30"
  // }

  try {
    doc_running = post_data.doc_running;
    console.log("doc_running: ", doc_running);

    //update order_date to tbl_order
    let data_order = {
      order_date: post_data.order_date,
    };
    await OrderService.updateByDocRunning(post_data.doc_running, data_order);

    // check temp_order by doc_running_no
    let res_chk_tmp_ord = await TempOrder.findTempOrderByDocRunning(
      doc_running
    );
    // console.log("res_draft: ", JSON.stringify(res_draft));

    if (res_chk_tmp_ord.length == 0) {
      // return res.status(204).json({ message: "no data" });
      // ---------- insert tbl_order -----------

      let data_order = {
        id: ord_id,
        doc_running_no: post_data.doc_running,
        doc_module_name: post_data.doc_module_name,
        item_master_id: post_data.item_master_id,
        order_qty: post_data.order_qty,
        rtg_id: post_data.rtg_id,
        order_date: post_data.order_date,
        due_date: post_data.due_date,
        due_time: post_data.due_time,
        company_id: post_data.company_id,
        user_create: post_data.user_create,
        created_at: new Date(),
      };
      //req.requester_id

      // console.log("data_order: ", JSON.stringify(data_order));
      await TempOrder.create(data_order);

      // ---------- insert tbl_order -----------
    } else {
      // -------------- update tbl_ord --------------

      let data = {
        item_master_id: post_data.item_master_id,
        order_qty: post_data.order_qty,
        rtg_id: post_data.rtg_id,
        order_date: post_data.order_date,
        due_date: post_data.due_date,
        due_time: post_data.due_time,
        user_update: post_data.user_update,
        updated_at: new Date(),
      };

      // console.log("data: ", JSON.stringify(data));
      await TempOrder.update(ord_id, data);

      // -------------- update tbl_ord --------------
    }

    // return res.status(200).json({ message: "success" });

    due_date_time = post_data.due_date + " " + post_data.due_time;
    console.log("due_date_time: ", due_date_time);
    console.log("post_data: ", JSON.stringify(post_data));

    time_stamp = post_data.due_date;

    // step1 : generate doc_running
    // doc_running = await doc_runningService.docGenerate(
    //   post_data.doc_module_name
    // );

    // clear data in production_order_temp
    await TempOpnTmp.deleteByRunningNo(post_data.doc_running);

    // clear data in draft_production_order_plan
    await TempOpnOrd.deleteByRunningNo(post_data.doc_running);

    // step2 : get routing data by item_master_id and rtg_id
    // ดึงข้อมูล Routing + OPN มาวน loop คำนวน
    routing_master_data = await tbl_routingService.findRoutingWorkOrderByRTGID(
      post_data.item_master_id,
      post_data.rtg_id,
      post_data.company_id
    );
    // console.log("routing_master_data: ", JSON.stringify(routing_master_data));

    // วน insert ข้อมูลลง production_order_temp
    for (let i = 0; i < routing_master_data.length; i++) {
      let ovl_time = 0;

      if (
        routing_master_data[i].over_lap_unit == null ||
        routing_master_data[i].over_lap_unit == 0
      ) {
        if (
          routing_master_data[i].over_lap_time == null ||
          routing_master_data[i].over_lap_time == 0
        ) {
          ovl_time = 0;
        } else {
          ovl_time = parseFloat(routing_master_data[i].over_lap_time);
        }
      } else {
        ovl_time = parseFloat(
          routing_master_data[i].over_lap_unit / routing_master_data[i].pcs_hr
        );
      }

      let data = {
        doc_running_no: doc_running,
        item_id: i + 1,
        item_master_id: post_data.item_master_id,
        order_qty: post_data.order_qty,
        rtg_id: post_data.rtg_id,
        opn_id: routing_master_data[i].opn_id,
        pcs_hr: routing_master_data[i].pcs_hr,
        time_process_by_opn: 0,
        setup_time: 0,
        real_qty_order_scrap_by_opn: 0,
        machine_id: routing_master_data[i].machine_id,
        scrap_per: 0,
        overlap_time: ovl_time,
        setup_timehr_per: routing_master_data[i].setup_timehr_per,
        batch: routing_master_data[i].batch,
        opn_start_date_time: null,
        opn_end_date_time: null,
        overlab_time_cal: 0,
        company_id: post_data.company_id,
        predecessor: routing_master_data[i].predecessor,
        dependency: routing_master_data[i].dependency,
        user_create: post_data.user_create,
        created_at: post_data.created_at,
      };
      // console.log("data loop master data: ", JSON.stringify(data));
      try {
        await TempOpnTmp.create(data);
      } catch (error) {
        console.log("TempOpnTmp.create error: ", error);
      }

      // -- stamp due_date_time to last opn --
      if (routing_master_data.length - 1 == i) {
        // console.log("routing_master_data.length - 1 == i");

        let data_due_date = {
          opn_end_date_time: due_date_time,
        };

        try {
          await TempOpnTmp.update(
            doc_running,
            routing_master_data[i].rtg_id,
            routing_master_data[i].item_master_id,
            routing_master_data[i].opn_id,
            data_due_date
          );
        } catch (error) {
          console.log("TempOpnTmp.update error: ", error);
        }
      }
      // -- stamp due_date_time to last opn --
    }

    //เรียงลำดับ OPN จากมากไปน้อย
    routing_master_data.sort((a, b) => b.id - a.id);

    // console.log("routing_master_data: ", JSON.stringify(routing_master_data));

    // -------------- calculate overlab time  and update to database ----------------
    let cal_ov = 0.0;
    // let cal_ov_opn = null;
    let data_ov = {
      overlab_time_cal: 0,
      overlab_opn_id: null,
    };

    for (let i = 0; i < routing_master_data.length; i++) {
      // routing_master_data.forEach(async (item) => {

      try {
        await TempOpnTmp.update(
          doc_running,
          routing_master_data[i].rtg_id,
          routing_master_data[i].item_master_id,
          routing_master_data[i].opn_id,
          data_ov
        );
      } catch (error) {
        console.log("TempOpnTmp.update error: ", error);
      }

      if (
        routing_master_data[i].over_lap_unit == null ||
        routing_master_data[i].over_lap_unit == 0
      ) {
        if (
          routing_master_data[i].over_lap_time == null ||
          routing_master_data[i].over_lap_time == 0
        ) {
          data_ov.overlab_opn_id = null;
          cal_ov = 0;
        } else {
          cal_ov = parseFloat(routing_master_data[i].over_lap_time);
          data_ov.overlab_opn_id = routing_master_data[i].opn_id;
        }
      } else {
        cal_ov = parseFloat(
          routing_master_data[i].over_lap_unit / routing_master_data[i].pcs_hr
        );
        data_ov.overlab_opn_id = routing_master_data[i].opn_id;
      }

      data_ov.overlab_time_cal = cal_ov;

      // console.log("log over lab time: ", JSON.stringify(data_ov));

      // });
    }
    // -------------- calculate overlab time  and update to database ----------------

    // return;

    //   ------------ step3 : คำนวณ OPN แต่ละตัว ------------
    // ---- loop ใหญ่ของ OPN ทั้งหมด ----
    let stamp_end_date = null;

    for (let i = 0; i < routing_master_data.length; i++) {
      // for (let i = 0; i < 3; i++) {
      template_shift = [];
      // console.log("Index i: ", i);
      if (i != 0) {
        console.log("routing_master_data.length - 1 == i");

        let data_due_date = {
          opn_end_date_time: stamp_end_date,
        };

        try {
          await TempOpnTmp.update(
            doc_running,
            routing_master_data[i].rtg_id,
            routing_master_data[i].item_master_id,
            routing_master_data[i].opn_id,
            data_due_date
          );
        } catch (error) {
          console.log("TempOpnTmp.update error: ", error);
        }
      }

      // console.log("routing_master_data[i]: ", routing_master_data[i]);

      let holiday_all = null; // วันหยุดเครื่องจักร
      let data = null; // รับข้อมูลกะ
      let shift_all = null; // ข้อมูลกะ
      let machine_all = null; // ข้อมูลเครื่องจักรใน OPN นั้นๆ
      let set_up_time = 0; // set up time ของ OPN นั้นๆ
      let time_process_by_opn = 0; // เวลาที่ใช้จริงของ OPN นั้นๆ
      let real_qty_order_scrap_by_opn = 0; // จำนวนที่ต้องผลิดจริง

      // ------------ sterp3.1 : คำนวณ OPN แต่ละตัว ------------
      // ------------ ดึงข้อมูลเครื่องจักรใน OPN นั้นๆ ------------
      machine_all = routing_master_data[i].machine_id.split(",");
      // console.log("machine_all: ", machine_all);

      // ------------ ดึงข้อมูลวันหยุด เครื่องจักร ------------
      // [
      //   {
      //     date_rom: "2024-01-30",
      //     holiday_type: "D",
      //     hours: 8,
      //   },
      //   {
      //     date_rom: "2024-02-14",
      //     holiday_type: "H",
      //     hours: 4,
      //   },
      // ];

      // ------------  step3.2 : get holiday data by machine_id and company_id ------------
      holiday_all = await tbl_routingService.findRoutingHoliday(
        machine_all,
        post_data.company_id
      );
      // console.log("holiday_all: ", JSON.stringify(holiday_all));

      // ------------ ดึงข้อมูลกะ ------------
      //   [
      //     {
      //       machine_id: "mccom1",
      //       shift_name: "กะA",
      //       start_time: "08:00:00",
      //       end_time: "17:00:00",
      //       break_start: "12:00:00",
      //       break_end: "13:00:00",
      //       summary_time: "08:00:00",
      //     },
      //     {
      //       machine_id: "mccom1",
      //       shift_name: "กะB",
      //       start_time: "17:01:00",
      //       end_time: "20:00:00",
      //       break_start: "00:00:00",
      //       break_end: "00:00:00",
      //       summary_time: "03:00:00",
      //     },
      //   ];

      // ------------  step3.3 : get shift data by machine_id and company_id  ------------

      shift_all = await tbl_routingService.findRoutingShift(
        machine_all[0],
        post_data.company_id
      );
      // console.log("shift_all: ", JSON.stringify(shift_all));

      // ข้อมูลตัวอย่าง
      // let data = [
      //   {
      //     machine_id: "mccom1",
      //     date_cal: "2024-01-30",
      //     shift_name: "กะA",
      //     start_time: "08:00:00",
      //     end_time: "17:00:00",
      //     break_start: "12:00:00",
      //     break_end: "13:00:00",
      //     summary_time: "08:00:00",
      //   },
      //   {
      //     machine_id: "mccom1",
      //     date_cal: "2024-01-30",
      //     shift_name: "กะB",
      //     start_time: "17:01:00",
      //     end_time: "20:00:00",
      //     break_start: "00:00:00",
      //     break_end: "00:00:00",
      //     summary_time: "03:00:00",
      //   },
      // ];
      data = shift_all;

      for (let i = 0; i < data.length; i++) {
        data[i].date_cal = time_stamp;
      }

      // console.log("data: ", JSON.stringify(data));

      // ------------  step3.4 : แตกกะและหาเวลารวมของแต่ละกะ + ทำ template  ------------
      // ------------  แตกกะและหาเวลารวมของแต่ละกะ ------------
      // ต้องทำ template กะไว้ก่อนเพื่อเอาไว้เช็ค due_date ว่าตรงกับกะไหม
      // และเอาไว้วน loop หา start_time OPN ปัจจุบัน
      // และเอาไว้วน loop หา end_time OPN ถัดไป

      let shift_index = 0;
      let tmp_shift_model = {
        index: 0,
        shift_name: "กะA",
        date_cal: "2024-02-29",
        start_time: "08:00:00",
        end_time: "17:00:00",
        summary_time: 0,
      };

      for (let i = data.length - 1; i >= 0; i--) {
        //   console.log(data[i]);

        // console.log(`Shift: ${data[i].shift_name}`);
        if (data[i].break_start != null && data[i].break_end != null) {
          tmp_shift_model = {
            index: 0,
            shift_name: "กะA",
            date_cal: "2024-02-29",
            start_time: "08:00:00",
            end_time: "17:00:00",
            summary_time: 0,
          };

          let hourDifference = calculateHourDifference(
            data[i].date_cal + " " + data[i].start_time,
            data[i].date_cal + " " + data[i].break_start
          );

          tmp_shift_model.index = i;
          tmp_shift_model.shift_name = data[i].shift_name;
          tmp_shift_model.date_cal = data[i].date_cal;
          tmp_shift_model.start_time = data[i].start_time;
          tmp_shift_model.end_time = data[i].break_start;
          tmp_shift_model.summary_time = Math.ceil(hourDifference);

          template_shift.push(tmp_shift_model);

          // console.log(
          //   `ความต่างของเวลาในชั่วโมง11: ${Math.ceil(hourDifference)} ชั่วโมง`
          // );

          tmp_shift_model = {
            index: 0,
            shift_name: "กะA",
            date_cal: "2024-02-29",
            start_time: "08:00:00",
            end_time: "17:00:00",
            summary_time: 0,
          };

          let hourDifference2 = calculateHourDifference(
            data[i].date_cal + " " + data[i].break_end,
            data[i].date_cal + " " + data[i].end_time
          );
          shift_index = shift_index++;
          tmp_shift_model.index = i + 1;
          tmp_shift_model.shift_name = data[i].shift_name;
          tmp_shift_model.date_cal = data[i].date_cal;
          tmp_shift_model.start_time = data[i].break_end;
          tmp_shift_model.end_time = data[i].end_time;
          tmp_shift_model.summary_time = Math.ceil(hourDifference2);

          template_shift.push(tmp_shift_model);

          // console.log(
          //   `ความต่างของเวลาในชั่วโมง22: ${Math.ceil(hourDifference2)} ชั่วโมง`
          // );
        } else {
          tmp_shift_model = {
            index: 0,
            shift_name: "กะA",
            date_cal: "2024-02-29",
            start_time: "08:00:00",
            end_time: "17:00:00",
            summary_time: 0,
          };

          let hourDifference3 = calculateHourDifference(
            data[i].date_cal + " " + data[i].start_time,
            data[i].date_cal + " " + data[i].end_time
          );
          shift_index = i + 1;
          tmp_shift_model.index = shift_index;
          tmp_shift_model.shift_name = data[i].shift_name;
          tmp_shift_model.date_cal = data[i].date_cal;
          tmp_shift_model.start_time = data[i].start_time;
          tmp_shift_model.end_time = data[i].end_time;
          // tmp_shift_model.summary_time = Math.ceil(hourDifference3);

          let time = data[i].summary_time; // Input time
          let parts = time.split(":"); // Split the time into [hours, minutes, seconds]
          let hours = parseInt(parts[0], 10); // Convert hours to integer
          tmp_shift_model.summary_time = hours;

          template_shift.push(tmp_shift_model);

          // console.log(
          //   `ความต่างของเวลาในชั่วโมง33: ${Math.ceil(hourDifference3)} ชั่วโมง`
          // );
        }
      }
      shift_index = 0;

      template_shift.sort(function (a, b) {
        return a.index - b.index;
      });

      // console.log("template_shift: ", JSON.stringify(template_shift));

      // ได้ template แล้ว หา set up time ของ OPN นั้นๆ

      // let time_process_by_opn = 0; // เวลาที่ใช้จริงของ OPN นั้นๆ

      //QtyOrder, QtyPer, QtyBy, Scrap, NoMch
      real_qty_order_scrap_by_opn = ManufactureOrder(
        post_data.order_qty,
        routing_master_data[i].qty_per,
        routing_master_data[i].qty_by,
        routing_master_data[i].scrap,
        parseInt(routing_master_data[i].no_of_machine)
      );
      // console.log("real_qty_order_scrap_by_opn: ", real_qty_order_scrap_by_opn);

      // qty_order_scrap,
      //   pcs_hr,
      //   set_up_time,
      //   setup_timehr_per,
      //   QtyPer,
      //   QtyBy,
      //   Scrap,
      //   NoMch,
      //   Batch;
      set_up_time = SetUpTime(
        post_data.order_qty,
        routing_master_data[i].pcs_hr,
        parseFloat(routing_master_data[i].setup_time),
        routing_master_data[i].setup_timehr_per,
        routing_master_data[i].qty_per,
        routing_master_data[i].qty_by,
        routing_master_data[i].scrap,
        parseInt(routing_master_data[i].no_of_machine),
        routing_master_data[i].batch
      );

      // console.log("set_up_time: ", set_up_time);

      time_process_by_opn =
        real_qty_order_scrap_by_opn / routing_master_data[i].pcs_hr +
        set_up_time;
      // console.log("time_process_by_opn: ", time_process_by_opn);

      // ------------ 3.5 : หาเวลาที่เหลือของวันนั้น ๆ  + เช็ควันหยุดเครื่องจักรด้วย ------------

      // order_qty,
      // machine_all,
      // holiday_all,
      // shift_all,
      // template_shift,
      // real_qty_order_scrap_by_opn,
      // set_up_time,
      // time_process_by_opn,
      // doc_running,
      // rtg_id,
      // item_master_id,
      // opn_id

      // adjustProductionOrderByDueDate calculateProductionOrderPlanDate
      stamp_end_date = await calculateTempOpnOrdDate(
        post_data.order_qty,
        machine_all,
        holiday_all,
        template_shift,
        real_qty_order_scrap_by_opn,
        set_up_time,
        time_process_by_opn,
        doc_running,
        post_data.rtg_id,
        post_data.item_master_id,
        routing_master_data[i].opn_id
      );
      console.log("calculateTempOpnOrdDate stamp_end_date: ", stamp_end_date);

      // --------- check and update overlab time and return new stamp_end_date ---------

      // doc_running,
      // rtg_id,
      // item_master_id,
      // opn_id
      let check_overlab = null;
      // ต้องดึงข้อมูลจาก production_order_temp เพราะข้อมูลหลักที่วน loop ดึงจาก routing_master_data ไม่มีข้อมูล overlab_time_cal
      let res_overlab = await TempOpnTmp.findPOTempByOPN(
        doc_running,
        routing_master_data[i].rtg_id,
        routing_master_data[i].item_master_id,
        routing_master_data[i].opn_id
      );
      // console.log(
      //   "tmp_overlab overlab_time_cal: ",
      //   res_overlab[0].overlab_time_cal
      // );
      if (res_overlab[0].overlab_time_cal > 0) {
        // console.log("tmp_overlab res_overlab[0].overlab_time_cal > 0");
        let tmp_overlab = await TempOpnTmp.findPOTempByOPN(
          doc_running,
          res_overlab[0].rtg_id,
          res_overlab[0].item_master_id,
          res_overlab[0].overlab_opn_id
        );

        check_overlab = tmp_overlab[0].opn_start_date_time;
        // console.log("tmp_overlab: ", JSON.stringify(tmp_overlab));
        // console.log("tmp_overlab check_overlab: ", check_overlab);
        // let f1 = check_overlab.toISOString().split("T");
        // let f1 = check_overlab
        //   .toISOString()
        //   .replace("T", " ")
        //   .replace(".000Z", "");
        // console.log("tmp_overlab f1[0]: ", f1);
        const originalDate = new Date(check_overlab);
        // console.log("tmp_overlab originalDate: ", originalDate);
        let tov = 420 - convertHourToMinute(res_overlab[0].overlab_time_cal);
        // console.log("tmp_overlab tov: ", tov);
        let newDate = new Date(originalDate.getTime() + tov * 60 * 1000); // แปลงเป็นมิล
        // console.log("tmp_overlab newDate: ", newDate);
        stamp_end_date = newDate
          .toISOString()
          .replace("T", " ")
          .replace(".000Z", "");
        console.log("tmp_overlab stamp_end_date: ", stamp_end_date);

        // ----------  update start-end overlab time to database ---------

        // adjustProductionOrderByDueDate calculateProductionOrderPlanOverLabDate

        await calculateTempOpnOrdOverLabDate(
          post_data.order_qty,
          machine_all,
          holiday_all,
          template_shift,
          real_qty_order_scrap_by_opn,
          set_up_time,
          time_process_by_opn,
          newDate,
          doc_running,
          post_data.rtg_id,
          post_data.item_master_id,
          routing_master_data[i].opn_id
        );
      } else {
        // console.log("tmp_overlab res_overlab[0].overlab_time_cal !> 0");
        // break;
      }
    }
    // ---- loop ใหญ่ของ OPN ทั้งหมด ----

    // End Flow คำนวณ

    // return;

    // --------------------- Insert Data To Draft Production Order ---------------------

    // get doc_group_name
    let rec_no_batch_count = 0;
    let main_stamp_batch_start = null;
    let stamp_batch_start = null;
    let stamp_batch_end = null;

    const res_doc = await doc_runningService.findGroupByModule(
      post_data.doc_module_name
    );
    doc_group_name = res_doc[0].doc_group_name;

    let res_draft = await TempOpnTmp.findALLByRouting(
      doc_running,
      post_data.rtg_id,
      post_data.item_master_id
    );
    // console.log("res_draft: ", JSON.stringify(res_draft));

    // --------------- split machine opn by machine ----------------

    // clear data in production_order_temp
    await TempOpnTmp.deleteByRunningNo(doc_running);

    for (let i = 0; i < res_draft.length; i++) {
      console.log("res_draft 1: Loop ", i);
      let data = {
        doc_running_no: doc_running,
        item_id: res_draft[i].item_id,
        item_master_id: res_draft[i].item_master_id,
        order_qty: res_draft[i].order_qty,
        rtg_id: res_draft[i].rtg_id,
        opn_id: res_draft[i].opn_id,
        pcs_hr: res_draft[i].pcs_hr,
        time_process_by_opn: res_draft[i].time_process_by_opn,
        setup_time: res_draft[i].tr_setup_time,
        real_qty_order_scrap_by_opn: res_draft[i].real_qty_order_scrap_by_opn,
        machine_id: res_draft[i].machine_id,
        scrap_per: res_draft[i].scrap_per,
        overlap_time: res_draft[i].overlap_time,
        setup_timehr_per: res_draft[i].setup_timehr_per,
        batch: res_draft[i].batch,
        opn_start_date_time: res_draft[i].opn_start_date_time,
        opn_end_date_time: res_draft[i].opn_end_date_time,
        overlab_time_cal: res_draft[i].overlab_time_cal,
        company_id: res_draft[i].company_id,
        predecessor: res_draft[i].predecessor,
        dependency: res_draft[i].dependency,
        user_create: res_draft[i].user_create,
        created_at: new Date(),
      };

      let no_mch = [];
      no_mch = res_draft[i].machine_id.split(",");
      // console.log("TestData no_mch: ", no_mch);
      for (let j = 0; j < no_mch.length; j++) {
        data.machine_id = no_mch[j];
        // console.log("data: ", JSON.stringify(data));
        try {
          await TempOpnTmp.create(data);
          console.log("PD TempOpnTmp.create");
        } catch (error) {
          console.log("TempOpnTmp.create error: ", error);
        }
      }
    }

    // --------------- split machine opn by machine ----------------

    // return;
    // --------------- calculate predecessor and dependency ----------------
    console.log("PD TempOpnTmp.findALLByRouting");
    // res_draft = [];

    //delay 2 sec
    // await new Promise((resolve) => setTimeout(resolve, 9000));

    // let res_draft2 = await TempOpnTmp.findALLByRouting(
    //   doc_running,
    //   post_data.rtg_id,
    //   post_data.item_master_id
    // );

    let res_draft2 = await TempOpnTmp.findALLByRoutingV2(doc_running);

    // console.log("pd res_draft2: ", JSON.stringify(res_draft2));

    for (let i = 0; i < res_draft2.length; i++) {
      // console.log("pd res_draft2: ", res_draft2[i].machine_id);

      if (res_draft2[i].dependency == "FS") {
        // FS
        console.log("PD Type FS");

        if (
          res_draft2[i].overlap_time != 0 &&
          res_draft2[i].predecessor != "0"
        ) {
          // SS
          // ถ้าเป็น SS + overlab ต้องมี predecessor id ตลอด , ต้องมี OPN ก่อนหน้าเสมอ
          console.log("PD Type FS + Overlab");
          // console.log("res_draft2[i].predecessor != 0");
          // หา OPN จาก routting id
          let res_rtg_opn = await tbl_routingService.findRoutingByRTGID(
            res_draft2[i].predecessor
          );
          console.log("PD res_rtg_opn: ", JSON.stringify(res_rtg_opn));
          // หา opn_end_date_time จาก opn_id
          let res_predecessor = await TempOpnTmp.findPOTempByOPNMINEndDate(
            doc_running,
            post_data.rtg_id,
            post_data.item_master_id,
            res_rtg_opn[0].opn_id
          );
          // console.log("PD res_rtg_opn[0].opn_id: ", res_rtg_opn[0].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_start_date_time: ",
          //   res_predecessor[0].opn_start_date_time
          // );
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_end_date_time: ",
          //   res_predecessor[0].opn_end_date_time
          // );

          const originalDate = new Date(res_predecessor[0].opn_end_date_time);
          // console.log("tmp_overlab originalDate: ", originalDate);
          let tov = convertHourToMinute(res_predecessor[0].overlab_time_cal);
          // console.log("tmp_overlab tov: ", tov);
          let newDate = new Date(
            originalDate.getTime() + 420 + tov * 60 * 1000
          ); // แปลงเป็นมิล

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,

          // adjustProductionOrderByDueDate calculateWorkOrderUpToDown

          let stamp_end_date = await calculateWorkOrderUpToDown(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let new_date_start = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          // console.log(
          //   "PD FS 1111 data_due_date: ",
          //   JSON.stringify(data_due_date)
          // );
          await TempOpnTmp.updateByID(res_draft2[i].id, data_due_date);
        } else if (
          res_draft2[i].predecessor == "0" &&
          res_draft2[i].overlap_time == 0
        ) {
          // console.log("res_draft2[i].predecessor == 0");
          // เป็น OPN แรก ไม่มี predecessor
          // console.log("PD res_rtg_opn[0].opn_id: ", res_draft2[i].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          // console.log(
          //   "PD FS 0 res_predecessor res_predecessor[0].opn_start_date_time: ",
          //   res_draft2[i].opn_start_date_time
          // );
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_end_date_time: ",
          //   res_draft2[i].opn_end_date_time
          // );
          const originalDate = new Date(res_draft2[i].opn_start_date_time);
          let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000);
          console.log("PD FS 0 newDate: ", newDate);

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,
          let stamp_end_date = await calculateWorkOrderUpToDown(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );
          console.log("PD FS 0 stamp_end_date: ", stamp_end_date);

          let new_date_start = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          // console.log(
          //   "PD FS 1112 data_due_date: ",
          //   JSON.stringify(data_due_date)
          // );
          await TempOpnTmp.updateByID(res_draft2[i].id, data_due_date);
        } else if (
          res_draft2[i].predecessor != "0" &&
          res_draft2[i].overlap_time == 0
        ) {
          // console.log("res_draft2[i].predecessor != 0");
          // หา OPN จาก routting id
          let res_rtg_opn = await tbl_routingService.findRoutingByRTGID(
            res_draft2[i].predecessor
          );
          // console.log("PD res_rtg_opn: ", JSON.stringify(res_rtg_opn));
          // หา opn_end_date_time จาก opn_id
          let res_predecessor = await TempOpnTmp.findPOTempByOPNMINEndDate(
            doc_running,
            post_data.rtg_id,
            post_data.item_master_id,
            res_rtg_opn[0].opn_id
          );
          // console.log("PD res_rtg_opn[0].opn_id: ", res_rtg_opn[0].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_start_date_time: ",
          //   res_predecessor[0].opn_start_date_time
          // );
          // console.log(
          //   "PD FS !0 res_predecessor res_predecessor[0].opn_end_date_time: ",
          //   res_predecessor[0].opn_end_date_time
          // );

          const originalDate = new Date(res_predecessor[0].opn_end_date_time);
          let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000);
          // console.log("PD FS !0 newDate: ", newDate);

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,
          let stamp_end_date = await calculateWorkOrderUpToDown(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let new_date_start = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          // console.log(
          //   "PD FS 1113 data_due_date: ",
          //   JSON.stringify(data_due_date)
          // );
          await TempOpnTmp.updateByID(res_draft2[i].id, data_due_date);
        }
      } else if (res_draft2[i].dependency == "SS") {
        // SS
        // ถ้าเป็น SS ต้องมี predecessor id ตลอด , ต้องมี OPN ก่อนหน้าเสมอ
        console.log("PD Type SS");
        if (
          res_draft2[i].overlap_time != 0 &&
          res_draft2[i].predecessor != "0"
        ) {
          // SS
          // ถ้าเป็น SS + overlab ต้องมี predecessor id ตลอด , ต้องมี OPN ก่อนหน้าเสมอ
          console.log("PD Type SS + Overlab");
          // console.log("res_draft2[i].predecessor != 0");
          // หา OPN จาก routting id
          let res_rtg_opn = await tbl_routingService.findRoutingByRTGID(
            res_draft2[i].predecessor
          );
          console.log("PD res_rtg_opn: ", JSON.stringify(res_rtg_opn));
          // หา opn_end_date_time จาก opn_id
          let res_predecessor = await TempOpnTmp.findPOTempByOPNMINStartDate(
            doc_running,
            post_data.rtg_id,
            post_data.item_master_id,
            res_rtg_opn[0].opn_id
          );
          // console.log("PD res_rtg_opn[0].opn_id: ", res_rtg_opn[0].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_start_date_time: ",
          //   res_predecessor[0].opn_start_date_time
          // );
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_end_date_time: ",
          //   res_predecessor[0].opn_end_date_time
          // );

          const originalDate = new Date(res_predecessor[0].opn_start_date_time);
          // console.log("tmp_overlab originalDate: ", originalDate);
          let tov = convertHourToMinute(res_predecessor[0].overlab_time_cal);
          // console.log("tmp_overlab tov: ", tov);
          let newDate = new Date(
            originalDate.getTime() + 420 + tov * 60 * 1000
          ); // แปลงเป็นมิล

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,
          let stamp_end_date = await calculateWorkOrderUpToDown(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let new_date_start = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          await TempOpnTmp.updateByID(res_draft2[i].id, data_due_date);
        } else if (
          res_draft2[i].predecessor == "0" &&
          res_draft2[i].overlap_time == 0
        ) {
          // console.log("res_draft2[i].predecessor == 0");
          // เป็น OPN แรก ไม่มี predecessor
          // console.log("PD res_rtg_opn[0].opn_id: ", res_draft2[i].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          console.log(
            "PD SS 0 res_predecessor res_predecessor[0].opn_start_date_time: ",
            res_draft2[i].opn_start_date_time
          );
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_end_date_time: ",
          //   res_draft2[i].opn_end_date_time
          // );

          // let newDate = new Date(res_draft2[i].opn_start_date_time);

          const originalDate = new Date(res_draft2[i].opn_start_date_time);
          let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000);
          console.log("PD SS 0 newDate: ", newDate);

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,
          let stamp_end_date = await calculateWorkOrderUpToDown(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let new_date_start = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          await TempOpnTmp.updateByID(res_draft2[i].id, data_due_date);
        } else if (
          res_draft2[i].predecessor != "0" &&
          res_draft2[i].overlap_time == 0
        ) {
          // console.log("res_draft2[i].predecessor != 0");
          // หา OPN จาก routting id
          let res_rtg_opn = await tbl_routingService.findRoutingByRTGID(
            res_draft2[i].predecessor
          );
          // console.log("PD res_rtg_opn: ", JSON.stringify(res_rtg_opn));
          // หา opn_end_date_time จาก opn_id
          let res_predecessor = await TempOpnTmp.findPOTempByOPNMINStartDate(
            doc_running,
            post_data.rtg_id,
            post_data.item_master_id,
            res_rtg_opn[0].opn_id
          );
          // console.log("PD res_rtg_opn[0].opn_id: ", res_rtg_opn[0].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          console.log(
            "PD SS !0 res_predecessor res_predecessor[0].opn_start_date_time: ",
            res_predecessor[0].opn_start_date_time
          );
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_end_date_time: ",
          //   res_predecessor[0].opn_end_date_time
          // );

          // let newDate = new Date(res_predecessor[0].opn_start_date_time);

          const originalDate = new Date(res_predecessor[0].opn_start_date_time);
          let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000);
          console.log("PD SS !0 newDate: ", newDate);

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,
          let stamp_end_date = await calculateWorkOrderUpToDown(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let new_date_start = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          await TempOpnTmp.updateByID(res_draft2[i].id, data_due_date);
        }
      } else if (res_draft2[i].dependency == "FF") {
        // FF

        // ถ้าเป็น FF ต้องมี predecessor id ตลอด , ต้องมี OPN ก่อนหน้าเสมอ
        console.log("PD Type FF");

        if (
          res_draft2[i].overlap_time != 0 &&
          res_draft2[i].predecessor != "0"
        ) {
          // SS
          // ถ้าเป็น SS + overlab ต้องมี predecessor id ตลอด , ต้องมี OPN ก่อนหน้าเสมอ
          console.log("PD Type FF + Overlab");
          // console.log("res_draft2[i].predecessor != 0");
          // หา OPN จาก routting id
          let res_rtg_opn = await tbl_routingService.findRoutingByRTGID(
            res_draft2[i].predecessor
          );
          console.log("PD res_rtg_opn: ", JSON.stringify(res_rtg_opn));
          // หา opn_end_date_time จาก opn_id
          let res_predecessor = await TempOpnTmp.findPOTempByOPNMINEndDate(
            doc_running,
            post_data.rtg_id,
            post_data.item_master_id,
            res_rtg_opn[0].opn_id
          );
          // console.log("PD res_rtg_opn[0].opn_id: ", res_rtg_opn[0].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_start_date_time: ",
          //   res_predecessor[0].opn_start_date_time
          // );
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_end_date_time: ",
          //   res_predecessor[0].opn_end_date_time
          // );

          const originalDate = new Date(res_predecessor[0].opn_end_date_time);
          // console.log("tmp_overlab originalDate: ", originalDate);
          let tov = convertHourToMinute(res_predecessor[0].overlab_time_cal);
          // console.log("tmp_overlab tov: ", tov);
          let newDate = new Date(
            originalDate.getTime() + 420 + tov * 60 * 1000
          ); // แปลงเป็นมิล

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,
          let new_date_start = await calculateWorkOrderDownToUp(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let stamp_end_date = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          await TempOpnTmp.updateByID(res_draft2[i].id, data_due_date);
        } else if (
          res_draft2[i].predecessor == "0" &&
          res_draft2[i].overlap_time == 0
        ) {
          // console.log("res_draft2[i].predecessor == 0");
          // เป็น OPN แรก ไม่มี predecessor
          // console.log("PD res_rtg_opn[0].opn_id: ", res_draft2[i].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_start_date_time: ",
          //   res_draft2[i].opn_start_date_time
          // );
          console.log(
            "PD FF 0 res_predecessor res_predecessor[0].opn_end_date_time: ",
            res_draft2[i].opn_end_date_time
          );

          // let newDate = new Date(res_draft2[i].opn_end_date_time);

          const originalDate = new Date(res_draft2[i].opn_end_date_time);
          let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000);
          console.log("PD FF 0 newDate: ", newDate);

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,
          let new_date_start = await calculateWorkOrderDownToUp(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let stamp_end_date = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          await TempOpnTmp.updateByID(res_draft2[i].id, data_due_date);
        } else if (
          res_draft2[i].predecessor != "0" &&
          res_draft2[i].overlap_time == 0
        ) {
          // console.log("res_draft2[i].predecessor != 0");
          // หา OPN จาก routting id
          let res_rtg_opn = await tbl_routingService.findRoutingByRTGID(
            res_draft2[i].predecessor
          );
          // console.log("PD res_rtg_opn: ", JSON.stringify(res_rtg_opn));
          // หา opn_end_date_time จาก opn_id
          let res_predecessor = await TempOpnTmp.findPOTempByOPNMINEndDate(
            doc_running,
            post_data.rtg_id,
            post_data.item_master_id,
            res_rtg_opn[0].opn_id
          );
          // console.log("PD res_rtg_opn[0].opn_id: ", res_rtg_opn[0].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_start_date_time: ",
          //   res_predecessor[0].opn_start_date_time
          // );
          console.log(
            "PD FF !0 res_predecessor res_predecessor[0].opn_end_date_time: ",
            res_predecessor[0].opn_end_date_time
          );

          // let newDate = new Date(res_predecessor[0].opn_end_date_time);

          const originalDate = new Date(res_predecessor[0].opn_end_date_time);
          let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000);
          console.log("PD FF !0 newDate: ", newDate);

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,
          let new_date_start = await calculateWorkOrderDownToUp(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let stamp_end_date = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          console.log(
            "Adjust By Due_Date data_due_date: ",
            JSON.stringify(data_due_date)
          );
          await TempOpnTmp.updateByID(res_draft2[i].id, data_due_date);
        }
      }
    }

    // --------------- calculate predecessor and dependency ----------------

    // return;
    // --------------- calculate End Time Last OPN == DueDate -----------------
    let c_over = 0;
    let c_date_due_date = new Date();
    let c_date_end_time_cal = new Date();
    do {
      c_over++;
      let res_draft3 = await TempOpnTmp.findALLByRoutingV2(doc_running);

      console.log("PD res_draft3: ", JSON.stringify(res_draft3));

      let OriginalDate3 = new Date(
        res_draft3[res_draft3.length - 1].opn_end_date_time
      );
      let end_time_cal = new Date(OriginalDate3.getTime() + 420 * 60 * 1000);
      console.log("PD end_time_cal: ", end_time_cal);
      c_date_end_time_cal = new Date(end_time_cal);

      let OriginalDate31 = new Date(due_date_time);
      c_date_due_date = new Date(OriginalDate31.getTime() + 420 * 60 * 1000);

      console.log("PD c_date_end_time_cal: ", c_date_end_time_cal);
      console.log("PD c_date_due_date: ", c_date_due_date);

      let status_cal = "equal";
      let minute_cal = 0;

      if (c_date_due_date < c_date_end_time_cal) {
        try {
          console.log("due_date_time < end_time_cal");
          // duedate เป็นค่า -
          // ขยับเวลาทั้งหมด ขึ้นไปข้างหน้าโดยการลบ
          status_cal = "minus";

          let holiday_all = await getHolidayByMachineId(
            res_draft3[res_draft3.length - 1].machine_id,
            res_draft3[res_draft3.length - 1].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));

          let shift_all = await getShiftByMachineId(
            res_draft3[res_draft3.length - 1].machine_id,
            res_draft3[res_draft3.length - 1].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          //c_date_due_date > c_date_end_time_cal
          minute_cal = await calculateDateRangeMinuteUpToDown(
            shift_all,
            c_date_due_date,
            c_date_end_time_cal
          );
          console.log("PD minute_cal: ", minute_cal);

          // update first opn start date time
          // console.log("PD res_draft3: ", JSON.stringify(res_draft3));
          let t1 = new Date(res_draft3[0].opn_start_date_time);
          console.log("PD t1: ", t1);
          let t2 = new Date(t1.getTime() + 420 * 60 * 1000);
          console.log("PD t2: ", t2);
          // let t3 = new Date(t2.getTime() - minute_cal * 60 * 1000);
          // console.log("PD t3: ", t3);
          let t4 = t2.toISOString().replace("T", " ").replace(".000Z", "");
          console.log("PD t4: ", t4);
          // holiday_all,
          //   shift_all,
          //   minutesWorkedCal,
          //   opn_end_date_time;
          let t5 = await calculateReDateDownToUp(
            holiday_all,
            shift_all,
            minute_cal,
            t4
          );
          console.log("PD t5: ", t5);
          // let t51 = new Date(t5);
          // let t6 = new Date(t51.getTime() + 420 * 60 * 1000);
          // update first opn start date time by id
          let data_due_date = {
            opn_start_date_time: t5,
          };
          // await TempOpnTmp.updateByID(
          //   res_draft3[0].id,
          //   data_due_date
          // );

          // doc_running, rtg_id, item_master_id, data;
          await TempOpnTmp.updateByDocRunningAndOPN(
            res_draft3[0].doc_running_no,
            res_draft3[0].rtg_id,
            res_draft3[0].item_master_id,
            data_due_date
          );
          // console.log("PD t5: ", t5);

          //recalculate PD
          // await reCalculatePD(doc_running);
          await reCalculateAdjustPD(doc_running);

          // ----------------- get last opn end date time for check -----------------
          let res_draft4 = await TempOpnTmp.findALLByRoutingV2(doc_running);

          // console.log("PD res_draft4: ", JSON.stringify(res_draft4));

          let OriginalDate4 = new Date(
            res_draft4[res_draft4.length - 1].opn_end_date_time
          );
          let end_time_cal4 = new Date(
            OriginalDate4.getTime() + 420 * 60 * 1000
          );
          console.log("PD 44 end_time_cal4: ", end_time_cal4);
          c_date_end_time_cal = new Date(end_time_cal4);
          console.log("PD 44 c_date_end_time_cal: ", c_date_end_time_cal);
          console.log("PD 44 c_date_due_date: ", c_date_due_date);
          // ----------------- get last opn end date time for check -----------------
        } catch (error) {
          console.log("PD calculateDateRangeMinuteUpToDown error: ", error);
        }
      }

      console.log("PD 55 c_date_end_time_cal: ", c_date_end_time_cal);
      console.log("PD 55 c_date_due_date: ", c_date_due_date);
      // } while (c_date_due_date < c_date_end_time_cal);
    } while (c_over < 10);

    // --------------- calculate End Time Last OPN == DueDate -----------------

    // ----------------- calculate Operation Type and insert to production_order -----------------
    let res_draft4 = await TempOpnTmp.findALLByRoutingV2(doc_running);

    // console.log("res_draft4: ", JSON.stringify(res_draft4));

    for (let i = 0; i < res_draft4.length; i++) {
      // console.log("res_draft4: ", JSON.stringify(res_draft4[i]));

      console.log("res_draft4 1: Loop ", i);
      let data = {
        doc_group_name: doc_group_name,
        doc_running_no: doc_running,
        item_master_id: res_draft4[i].item_master_id,
        order_qty: res_draft4[i].order_qty,
        rtg_id: res_draft4[i].rtg_id,
        opn_id: res_draft4[i].opn_id,
        pcs_hr: res_draft4[i].pcs_hr,
        time_process_by_opn: res_draft4[i].time_process_by_opn,
        setup_time: res_draft4[i].setup_time,
        real_qty_order_scrap_by_opn: res_draft4[i].real_qty_order_scrap_by_opn,
        machine_id: res_draft4[i].machine_id,
        overlap_time: res_draft4[i].overlap_time,
        setup_timehr_per: res_draft4[i].setup_timehr_per,
        batch: res_draft4[i].batch,
        batch_count: 0,
        batch_amount: 0,
        opn_start_date_time: res_draft4[i].opn_start_date_time,
        opn_end_date_time: res_draft4[i].opn_end_date_time,
        overlab_time_cal: res_draft4[i].overlab_time_cal,
        company_id: res_draft4[i].company_id,
        predecessor: res_draft4[i].predecessor,
        dependency: res_draft4[i].dependency,
        production_time: 0,
        due_date: post_data.due_date,
        due_time: post_data.due_time,
        order_date: post_data.created_at,
        doc_module_name: post_data.doc_module_name,
        std_labor_cost: 0.0,
        std_foh_cost: 0.0,
        std_voh_cost: 0.0,
        user_create: res_draft4[i].user_create,
        created_at: new Date(),
        opn_qty: 0,
      };

      /*
        {
            "id": 637,
            "doc_running_no": "PDCM-240231",
            "item_id": 1,
            "item_master_id": 10,
            "order_qty": 1000,
            "rtg_id": "01",
            "opn_id": "100",
            "pcs_hr": 240,
            "time_process_by_opn": "13.6250",
            "setup_time": "0.0000",
            "real_qty_order_scrap_by_opn": 2550,
            "machine_id": "17,18",
            "scrap_per": "0.0000",
            "overlap_time": "0.0000",
            "setup_timehr_per": "B",
            "batch": 500,
            "opn_start_date_time": "2024-02-25T07:10:00.000Z",
            "opn_end_date_time": "2024-02-26T06:11:30.000Z",
            "overlab_time_cal": "0.5000",
            "overlab_opn_id": "200",
            "company_id": 1,
            "user_create": 2,
            "user_update": null,
            "created_at": "2024-02-15T00:00:00.000Z",
            "updated_at": "2024-02-06T04:21:14.000Z",
            "qty_per": 10,
            "qty_by": 2,
            "scrap": 2,
            "no_of_machine": "2"
        },
    */

      let holiday_all = await getHolidayByMachineId(
        res_draft4[i].machine_id,
        res_draft4[i].company_id
      );
      // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
      let shift_all = await getShiftByMachineId(
        res_draft4[i].machine_id,
        res_draft4[i].company_id
      );
      // console.log("PD shift_all2: ", JSON.stringify(shift_all));

      console.log("res_draft4 2: Loop ", i);
      let bo = 0.0;
      let no_mch = [];
      if (res_draft4[i].setup_timehr_per == "B") {
        console.log("res_draft4 3: Loop ", i);
        //QtyOrder, QtyPer, QtyBy, Scrap, NoMch, Batch
        let cal_down = 0.0;
        bo = BatchOrder(
          res_draft4[i].order_qty,
          res_draft4[i].qty_per,
          res_draft4[i].qty_by,
          res_draft4[i].scrap,
          res_draft4[i].no_of_machine,
          res_draft4[i].batch
        );
        console.log("res_draft4 4: Loop ", i);
        no_mch = res_draft4[i].machine_id.split(",");
        // console.log("TestData no_mch: ", no_mch);
        for (let j = 0; j < no_mch.length; j++) {
          main_stamp_batch_start = res_draft4[i].opn_start_date_time;
          stamp_batch_start = null;
          // stamp_batch_start = res_draft4[i].opn_start_date_time;

          // console.log("TestData no_mch: ", no_mch[j]);
          console.log("res_draft4 5: Loop ", i);
          data.machine_id = no_mch[j];
          let res_cost = await tbl_mch_shift.findMachineCostByID(
            data.machine_id
          );
          console.log("res_cost: ", JSON.stringify(res_cost));
          // data.std_labor_cost = res_cost[0].labor_rate;
          // data.std_foh_cost = res_cost[0].foh_rate;
          // data.std_voh_cost = res_cost[0].voh_rate;

          for (let k = 0; k < bo; k++) {
            // console.log("TestData bo: ", bo[k]);
            console.log("res_draft4 6: Loop ", i);
            rec_no_batch_count = rec_no_batch_count + 1;
            // data.batch_count = k + 1;
            data.batch_count = rec_no_batch_count;
            if (k == bo - 1) {
              cal_down =
                res_draft4[i].real_qty_order_scrap_by_opn % res_draft4[i].batch;
              if (cal_down == 0) {
                cal_down = res_draft4[i].batch;
              }
            } else {
              cal_down = res_draft4[i].batch;
            }
            data.batch_amount = cal_down;
            data.production_time =
              parseFloat(cal_down) / parseFloat(res_draft4[i].pcs_hr) +
              parseFloat(res_draft4[i].setup_time);
            // console.log(`TestData data ${k}: `, JSON.stringify(data));

            data.opn_qty = data.batch_amount;
            console.log("res_draft4 7: Loop ", i);

            data.std_labor_cost =
              parseFloat(res_cost[0].labor_rate) * data.production_time;
            data.std_foh_cost =
              parseFloat(res_cost[0].foh_rate) * data.production_time;
            data.std_voh_cost =
              parseFloat(res_cost[0].voh_rate) * data.production_time;

            // console.log("data B production_time: ", data.production_time);
            // console.log("data B std_labor_cost: ", data.std_labor_cost);
            // console.log("data B std_foh_cost: ", data.std_foh_cost);
            // console.log("data B std_voh_cost: ", data.std_voh_cost);

            if (stamp_batch_start == null) {
              console.log(
                "res_draft4 7.1: stamp_batch_start ",
                "stamp_batch_start == null"
              );
              console.log(
                "res_draft4 7.1: stamp_batch_start: ",
                stamp_batch_start
              );
              // stamp_batch_end = await calculateSplitMachineBatchDate(
              //   data.machine_id,
              //   post_data.company_id,
              //   data.production_time,
              //   main_stamp_batch_start
              // );

              //   holiday_all,
              //   shift_all,
              //   production_time,
              //   opn_end_date_time;

              // adjustProductionOrderByDueDate calculateSplitMachineBatchDateV2

              stamp_batch_end = await calculateSplitMachineBatchDateV2(
                holiday_all,
                shift_all,
                data.production_time,
                main_stamp_batch_start
              );

              data.opn_start_date_time = main_stamp_batch_start;
              data.opn_end_date_time = stamp_batch_end;
            } else {
              console.log(
                "res_draft4 7.1: stamp_batch_start ",
                "stamp_batch_start != null"
              );
              console.log(
                "res_draft4 7.1: stamp_batch_start: ",
                stamp_batch_start
              );
              // stamp_batch_end = await calculateSplitMachineBatchDate(
              //   data.machine_id,
              //   post_data.company_id,
              //   data.production_time,
              //   stamp_batch_start
              // );

              //   holiday_all,
              //   shift_all,
              //   production_time,
              //   opn_end_date_time;
              stamp_batch_end = await calculateSplitMachineBatchDateV2(
                holiday_all,
                shift_all,
                data.production_time,
                stamp_batch_start
              );

              data.opn_start_date_time = stamp_batch_start;
              data.opn_end_date_time = stamp_batch_end;
            }
            console.log("res_draft4 7.1: Loop ", i);

            console.log("res_draft4 stamp_batch_start:", stamp_batch_start);
            console.log("res_draft4 stamp_batch_end:", stamp_batch_end);
            try {
              await TempOpnOrd.create(data);
            } catch (error) {
              console.log("res_draft4 8: Loop error", error);
            }
            stamp_batch_start = stamp_batch_end;

            console.log("res_draft4 8: Loop ", i);
          }
        }
      } else if (res_draft4[i].setup_timehr_per == "O") {
        console.log("res_draft4 9: Loop ", i);
        data.batch_count = 1;
        data.batch_amount = res_draft4[i].order_qty;
        data.production_time =
          parseFloat(res_draft4[i].order_qty) /
            parseFloat(res_draft4[i].pcs_hr) +
          parseFloat(res_draft4[i].setup_time);

        data.opn_qty = data.batch_amount;

        console.log("production_time O: ", data.production_time);
        console.log("res_draft4[i].order_qty: ", res_draft4[i].order_qty);
        console.log("res_draft4[i].pcs_hr: ", res_draft4[i].pcs_hr);
        console.log("res_draft4[i].setup_time: ", res_draft4[i].setup_time);

        let res_cost = await tbl_mch_shift.findMachineCostByID(data.machine_id);
        console.log("res_cost: ", JSON.stringify(res_cost));
        data.std_labor_cost =
          parseFloat(res_cost[0].labor_rate) * data.production_time;
        data.std_foh_cost =
          parseFloat(res_cost[0].foh_rate) * data.production_time;
        data.std_voh_cost =
          parseFloat(res_cost[0].voh_rate) * data.production_time;

        console.log("data O production_time: ", data.production_time);
        console.log("data O std_labor_cost: ", data.std_labor_cost);
        console.log("data O std_foh_cost: ", data.std_foh_cost);
        console.log("data O std_voh_cost: ", data.std_voh_cost);
        try {
          await TempOpnOrd.create(data);
        } catch (error) {
          console.log("res_draft4 10: Loop error", error);
        }

        console.log("res_draft4 10: Loop ", i);
      } else if (res_draft4[i].setup_timehr_per == "Q") {
        console.log("res_draft4 11: Loop ", i);
        data.batch_count = 1;
        data.batch_amount = res_draft4[i].order_qty;
        data.production_time =
          parseFloat(res_draft4[i].order_qty) /
            parseFloat(res_draft4[i].pcs_hr) +
          parseFloat(res_draft4[i].setup_time);

        data.opn_qty = data.batch_amount;

        let res_cost = await tbl_mch_shift.findMachineCostByID(data.machine_id);
        // console.log("res_cost: ", JSON.stringify(res_cost));
        data.std_labor_cost =
          parseFloat(res_cost[0].labor_rate) * data.production_time;
        data.std_foh_cost =
          parseFloat(res_cost[0].foh_rate) * data.production_time;
        data.std_voh_cost =
          parseFloat(res_cost[0].voh_rate) * data.production_time;

        // console.log("data Q production_time: ", data.production_time);
        // console.log("data Q std_labor_cost: ", data.std_labor_cost);
        // console.log("data Q std_foh_cost: ", data.std_foh_cost);
        // console.log("data Q std_voh_cost: ", data.std_voh_cost);

        await TempOpnOrd.create(data);
        // console.log("production_time Q: ", data.production_time);
        // console.log("res_draft4[i].order_qty: ", res_draft4[i].order_qty);
        // console.log("res_draft4[i].pcs_hr: ", res_draft4[i].pcs_hr);
        // console.log("res_draft4[i].setup_time: ", res_draft4[i].setup_time);
        // console.log("res_draft4 12: Loop ", i);
      }
    }

    // ----------------- calculate Operation Type and insert to production_order -----------------

    // --------------------- Insert Data To Draft Production Order ---------------------

    return res
      .status(200)
      .json({ message: "success", doc_running: doc_running });
  } catch (err) {
    return res.status(204).json({ message: err });
  }
};

exports.adjustProductionOrderByStartDateDraft = async (req, res) => {
  let ord_id = req.params.id;

  let post_data = req.body;
  let doc_running = "";
  let doc_group_name = null; // ชื่อกลุ่มเอกสาร

  let routing_master_data = null; // ข้อมูล Routing + OPN ทั้งหมด
  let time_stamp = null; // วันที่เวลาปัจจุบัน
  let template_shift = []; // ทำ template กะไว้ก่อนเพื่อเอาไว้เช็ค due_date ว่าตรงกับกะไหม
  let master_data_production_order = null; // ข้อมูล Production Order ทั้งหมด
  let end_time_process = null; // เวลาที่จบการทำงาน OPN นั้นๆ
  let end_time_process_overlab = null; // เวลาที่จบการทำงาน OPN นั้นๆ คำนวนใหม่จาก overlap time

  let due_date_time = null; // วันที่ต้องส่งมอบ
  let new_start_date_time = null; // วันที่เวลาที่ OPN นั้นๆ ทำงาน
  let res_chk_tmp_ord = [];
  //   let machine_all = null; // จำนวนเครื่องจักรทั้งหมด

  // {
  //     "doc_running": "PDCM-240282",
  //     "doc_module_name": "PD ceramic",
  //     "item_master_id": 10,
  //     "order_qty": "1000",
  //     "rtg_id": "01",
  //     "order_date": "2024-01-30",
  //     "due_date": "2024-02-29",
  //     "due_time": "16:00:00",
  //     "start_date": "2024-02-29",
  //     "start_time": "16:00:00",
  //     "company_id": "1",
  //     "user_update": "2",
  //     "updated_at": "2024-01-30"
  // }

  try {
    doc_running = post_data.doc_running;
    console.log("doc_running: ", doc_running);

    //update order_date to tbl_order
    let data_order = {
      order_date: post_data.order_date,
    };
    await OrderService.updateByDocRunning(post_data.doc_running, data_order);

    // check temp_order by doc_running_no

    try {
      res_chk_tmp_ord = await TempOrder.findTempOrderByDocRunning(doc_running);
      console.log("res_draft: ", JSON.stringify(res_chk_tmp_ord));
    } catch (error) {
      console.log("res_chk_tmp_ord error: ", error);
    }
    try {
      if (res_chk_tmp_ord.length == 0) {
        // return res.status(204).json({ message: "no data" });
        // ---------- insert tbl_order -----------

        let data_order = {
          id: ord_id,
          doc_running_no: post_data.doc_running,
          doc_module_name: post_data.doc_module_name,
          item_master_id: post_data.item_master_id,
          order_qty: post_data.order_qty,
          rtg_id: post_data.rtg_id,
          order_date: post_data.order_date,
          due_date: post_data.due_date,
          due_time: post_data.due_time,
          company_id: post_data.company_id,
          user_create: post_data.user_create,
          created_at: new Date(),
        };
        //req.requester_id

        // console.log("data_order: ", JSON.stringify(data_order));
        await TempOrder.create(data_order);

        // ---------- insert tbl_order -----------
      } else {
        // -------------- update tbl_ord --------------

        let data = {
          item_master_id: post_data.item_master_id,
          order_qty: post_data.order_qty,
          rtg_id: post_data.rtg_id,
          order_date: post_data.order_date,
          due_date: post_data.due_date,
          due_time: post_data.due_time,
          user_update: post_data.user_update,
          updated_at: new Date(),
        };

        // console.log("data: ", JSON.stringify(data));
        await TempOrder.update(ord_id, data);

        // -------------- update tbl_ord --------------
      }
    } catch (error) {
      console.log("error 2222 : ", error);
    }

    // return res.status(200).json({ message: "success" });

    due_date_time = post_data.due_date + " " + post_data.due_time;
    console.log("due_date_time: ", due_date_time);
    console.log("post_data: ", JSON.stringify(post_data));

    new_start_date_time = post_data.start_date + " " + post_data.start_time;
    console.log("new_start_date_time: ", new_start_date_time);

    time_stamp = post_data.due_date;

    // step1 : generate doc_running
    // doc_running = await doc_runningService.docGenerate(
    //   post_data.doc_module_name
    // );

    // clear data in production_order_temp
    await TempOpnTmp.deleteByRunningNo(post_data.doc_running);

    // clear data in draft_production_order_plan
    await TempOpnOrd.deleteByRunningNo(post_data.doc_running);

    // dump date to temp_opn_tmp
    await TempOpnTmp.dumpTempOpnTmpDataByDocRunning(post_data.doc_running);

    const rest_chk_new_mch =
      await RoutingTmpService.getMainRoutingByItemAndRtgId(
        post_data.item_master_id,
        post_data.rtg_id,
        post_data.company_id
      );

    console.log("rest_chk_new_mch: ", JSON.stringify(rest_chk_new_mch));
    try {
      if (rest_chk_new_mch) {
        console.log("rest_chk_new_mch: ", "if (rest_chk_new_mch)");
        let data = {
          machine_id: rest_chk_new_mch[0].machine_id,
        };
        await TempOpnTmp.updateMachineIDByDocRunning(
          post_data.doc_running,
          data
        );
      }
    } catch (error) {
      console.log("rest_chk_new_mch error: ", error);
    }

    // return;

    // dump date to  temp_opn_ord
    // await TempOpnOrd.dumpTempOpnOrdDataByDocRunning(post_data.doc_running);

    // --------------------- Insert Data To Draft Production Order ---------------------

    // get doc_group_name
    let rec_no_batch_count = 0;
    let main_stamp_batch_start = null;
    let stamp_batch_start = null;
    let stamp_batch_end = null;

    const res_doc = await doc_runningService.findGroupByModule(
      post_data.doc_module_name
    );
    doc_group_name = res_doc[0].doc_group_name;

    // return;
    // --------------- calculate predecessor and dependency ----------------
    console.log("PD TempOpnTmp.findALLByRouting");

    let res_draft2 = await TempOpnTmp.findALLByRoutingV2(doc_running);

    // console.log("pd res_draft2: ", JSON.stringify(res_draft2));
    res_draft2[0].opn_start_date_time = new_start_date_time;
    console.log("pd res_draft2: ", JSON.stringify(res_draft2));

    // console.log("pd res_draft2: ", JSON.stringify(res_draft2));
    // return;
    for (let i = 0; i < res_draft2.length; i++) {
      // console.log("pd res_draft2: ", res_draft2[i].machine_id);

      if (res_draft2[i].dependency == "FS") {
        // FS
        console.log("PD Type FS");

        if (
          res_draft2[i].overlap_time != 0 &&
          res_draft2[i].predecessor != "0"
        ) {
          // SS
          // ถ้าเป็น SS + overlab ต้องมี predecessor id ตลอด , ต้องมี OPN ก่อนหน้าเสมอ
          console.log("PD Type FS + Overlab");
          // console.log("res_draft2[i].predecessor != 0");
          // หา OPN จาก routting id
          let res_rtg_opn = await tbl_routingService.findRoutingByRTGID(
            res_draft2[i].predecessor
          );
          console.log("PD res_rtg_opn: ", JSON.stringify(res_rtg_opn));
          // หา opn_end_date_time จาก opn_id
          let res_predecessor = await TempOpnTmp.findPOTempByOPNMINEndDate(
            doc_running,
            post_data.rtg_id,
            post_data.item_master_id,
            res_rtg_opn[0].opn_id
          );
          // console.log("PD res_rtg_opn[0].opn_id: ", res_rtg_opn[0].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_start_date_time: ",
          //   res_predecessor[0].opn_start_date_time
          // );
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_end_date_time: ",
          //   res_predecessor[0].opn_end_date_time
          // );

          const originalDate = new Date(res_predecessor[0].opn_end_date_time);
          // console.log("tmp_overlab originalDate: ", originalDate);
          let tov = convertHourToMinute(res_predecessor[0].overlab_time_cal);
          // console.log("tmp_overlab tov: ", tov);
          let newDate = new Date(
            originalDate.getTime() + 420 + tov * 60 * 1000
          ); // แปลงเป็นมิล

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,

          // adjustProductionOrderByDueDate calculateWorkOrderUpToDown

          let stamp_end_date = await calculateWorkOrderUpToDown(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let new_date_start = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          await TempOpnTmp.updateByID(res_draft2[i].id, data_due_date);
        } else if (
          res_draft2[i].predecessor == "0" &&
          res_draft2[i].overlap_time == 0
        ) {
          // console.log("res_draft2[i].predecessor == 0");
          // เป็น OPN แรก ไม่มี predecessor
          // console.log("PD res_rtg_opn[0].opn_id: ", res_draft2[i].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          console.log(
            "PD FS 0 res_predecessor res_predecessor[0].opn_start_date_time: ",
            res_draft2[i].opn_start_date_time
          );
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_end_date_time: ",
          //   res_draft2[i].opn_end_date_time
          // );
          const originalDate = new Date(res_draft2[i].opn_start_date_time);
          let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000);
          console.log("PD FS 0 newDate: ", newDate);

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,
          let stamp_end_date = await calculateWorkOrderUpToDown(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let new_date_start = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          await TempOpnTmp.updateByID(res_draft2[i].id, data_due_date);
        } else if (
          res_draft2[i].predecessor != "0" &&
          res_draft2[i].overlap_time == 0
        ) {
          // console.log("res_draft2[i].predecessor != 0");
          // หา OPN จาก routting id
          let res_rtg_opn = await tbl_routingService.findRoutingByRTGID(
            res_draft2[i].predecessor
          );
          // console.log("PD res_rtg_opn: ", JSON.stringify(res_rtg_opn));
          // หา opn_end_date_time จาก opn_id
          let res_predecessor = await TempOpnTmp.findPOTempByOPNMINEndDate(
            doc_running,
            post_data.rtg_id,
            post_data.item_master_id,
            res_rtg_opn[0].opn_id
          );
          // console.log("PD res_rtg_opn[0].opn_id: ", res_rtg_opn[0].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_start_date_time: ",
          //   res_predecessor[0].opn_start_date_time
          // );
          console.log(
            "PD FS !0 res_predecessor res_predecessor[0].opn_end_date_time: ",
            res_predecessor[0].opn_end_date_time
          );

          const originalDate = new Date(res_predecessor[0].opn_end_date_time);
          let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000);
          console.log("PD FS !0 newDate: ", newDate);

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,
          let stamp_end_date = await calculateWorkOrderUpToDown(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let new_date_start = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          await TempOpnTmp.updateByID(res_draft2[i].id, data_due_date);
        }
      } else if (res_draft2[i].dependency == "SS") {
        // SS
        // ถ้าเป็น SS ต้องมี predecessor id ตลอด , ต้องมี OPN ก่อนหน้าเสมอ
        console.log("PD Type SS");
        if (
          res_draft2[i].overlap_time != 0 &&
          res_draft2[i].predecessor != "0"
        ) {
          // SS
          // ถ้าเป็น SS + overlab ต้องมี predecessor id ตลอด , ต้องมี OPN ก่อนหน้าเสมอ
          console.log("PD Type SS + Overlab");
          // console.log("res_draft2[i].predecessor != 0");
          // หา OPN จาก routting id
          let res_rtg_opn = await tbl_routingService.findRoutingByRTGID(
            res_draft2[i].predecessor
          );
          console.log("PD res_rtg_opn: ", JSON.stringify(res_rtg_opn));
          // หา opn_end_date_time จาก opn_id
          let res_predecessor = await TempOpnTmp.findPOTempByOPNMINStartDate(
            doc_running,
            post_data.rtg_id,
            post_data.item_master_id,
            res_rtg_opn[0].opn_id
          );
          // console.log("PD res_rtg_opn[0].opn_id: ", res_rtg_opn[0].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_start_date_time: ",
          //   res_predecessor[0].opn_start_date_time
          // );
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_end_date_time: ",
          //   res_predecessor[0].opn_end_date_time
          // );

          const originalDate = new Date(res_predecessor[0].opn_start_date_time);
          // console.log("tmp_overlab originalDate: ", originalDate);
          let tov = convertHourToMinute(res_predecessor[0].overlab_time_cal);
          // console.log("tmp_overlab tov: ", tov);
          let newDate = new Date(
            originalDate.getTime() + 420 + tov * 60 * 1000
          ); // แปลงเป็นมิล

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,
          let stamp_end_date = await calculateWorkOrderUpToDown(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let new_date_start = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          await TempOpnTmp.updateByID(res_draft2[i].id, data_due_date);
        } else if (
          res_draft2[i].predecessor == "0" &&
          res_draft2[i].overlap_time == 0
        ) {
          // console.log("res_draft2[i].predecessor == 0");
          // เป็น OPN แรก ไม่มี predecessor
          // console.log("PD res_rtg_opn[0].opn_id: ", res_draft2[i].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          console.log(
            "PD SS 0 res_predecessor res_predecessor[0].opn_start_date_time: ",
            res_draft2[i].opn_start_date_time
          );
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_end_date_time: ",
          //   res_draft2[i].opn_end_date_time
          // );

          // let newDate = new Date(res_draft2[i].opn_start_date_time);

          const originalDate = new Date(res_draft2[i].opn_start_date_time);
          let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000);
          console.log("PD SS 0 newDate: ", newDate);

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,
          let stamp_end_date = await calculateWorkOrderUpToDown(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let new_date_start = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          await TempOpnTmp.updateByID(res_draft2[i].id, data_due_date);
        } else if (
          res_draft2[i].predecessor != "0" &&
          res_draft2[i].overlap_time == 0
        ) {
          // console.log("res_draft2[i].predecessor != 0");
          // หา OPN จาก routting id
          let res_rtg_opn = await tbl_routingService.findRoutingByRTGID(
            res_draft2[i].predecessor
          );
          // console.log("PD res_rtg_opn: ", JSON.stringify(res_rtg_opn));
          // หา opn_end_date_time จาก opn_id
          let res_predecessor = await TempOpnTmp.findPOTempByOPNMINStartDate(
            doc_running,
            post_data.rtg_id,
            post_data.item_master_id,
            res_rtg_opn[0].opn_id
          );
          // console.log("PD res_rtg_opn[0].opn_id: ", res_rtg_opn[0].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          console.log(
            "PD SS !0 res_predecessor res_predecessor[0].opn_start_date_time: ",
            res_predecessor[0].opn_start_date_time
          );
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_end_date_time: ",
          //   res_predecessor[0].opn_end_date_time
          // );

          // let newDate = new Date(res_predecessor[0].opn_start_date_time);

          const originalDate = new Date(res_predecessor[0].opn_start_date_time);
          let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000);
          console.log("PD SS !0 newDate: ", newDate);

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,
          let stamp_end_date = await calculateWorkOrderUpToDown(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let new_date_start = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          await TempOpnTmp.updateByID(res_draft2[i].id, data_due_date);
        }
      } else if (res_draft2[i].dependency == "FF") {
        // FF

        // ถ้าเป็น FF ต้องมี predecessor id ตลอด , ต้องมี OPN ก่อนหน้าเสมอ
        console.log("PD Type FF");

        if (
          res_draft2[i].overlap_time != 0 &&
          res_draft2[i].predecessor != "0"
        ) {
          // SS
          // ถ้าเป็น SS + overlab ต้องมี predecessor id ตลอด , ต้องมี OPN ก่อนหน้าเสมอ
          console.log("PD Type FF + Overlab");
          // console.log("res_draft2[i].predecessor != 0");
          // หา OPN จาก routting id
          let res_rtg_opn = await tbl_routingService.findRoutingByRTGID(
            res_draft2[i].predecessor
          );
          console.log("PD res_rtg_opn: ", JSON.stringify(res_rtg_opn));
          // หา opn_end_date_time จาก opn_id
          let res_predecessor = await TempOpnTmp.findPOTempByOPNMINEndDate(
            doc_running,
            post_data.rtg_id,
            post_data.item_master_id,
            res_rtg_opn[0].opn_id
          );
          // console.log("PD res_rtg_opn[0].opn_id: ", res_rtg_opn[0].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_start_date_time: ",
          //   res_predecessor[0].opn_start_date_time
          // );
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_end_date_time: ",
          //   res_predecessor[0].opn_end_date_time
          // );

          const originalDate = new Date(res_predecessor[0].opn_end_date_time);
          // console.log("tmp_overlab originalDate: ", originalDate);
          let tov = convertHourToMinute(res_predecessor[0].overlab_time_cal);
          // console.log("tmp_overlab tov: ", tov);
          let newDate = new Date(
            originalDate.getTime() + 420 + tov * 60 * 1000
          ); // แปลงเป็นมิล

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,
          let new_date_start = await calculateWorkOrderDownToUp(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let stamp_end_date = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          await TempOpnTmp.updateByID(res_draft2[i].id, data_due_date);
        } else if (
          res_draft2[i].predecessor == "0" &&
          res_draft2[i].overlap_time == 0
        ) {
          // console.log("res_draft2[i].predecessor == 0");
          // เป็น OPN แรก ไม่มี predecessor
          // console.log("PD res_rtg_opn[0].opn_id: ", res_draft2[i].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_start_date_time: ",
          //   res_draft2[i].opn_start_date_time
          // );
          console.log(
            "PD FF 0 res_predecessor res_predecessor[0].opn_end_date_time: ",
            res_draft2[i].opn_end_date_time
          );

          // let newDate = new Date(res_draft2[i].opn_end_date_time);

          const originalDate = new Date(res_draft2[i].opn_end_date_time);
          let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000);
          console.log("PD FF 0 newDate: ", newDate);

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,
          let new_date_start = await calculateWorkOrderDownToUp(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let stamp_end_date = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          await TempOpnTmp.updateByID(res_draft2[i].id, data_due_date);
        } else if (
          res_draft2[i].predecessor != "0" &&
          res_draft2[i].overlap_time == 0
        ) {
          // console.log("res_draft2[i].predecessor != 0");
          // หา OPN จาก routting id
          let res_rtg_opn = await tbl_routingService.findRoutingByRTGID(
            res_draft2[i].predecessor
          );
          // console.log("PD res_rtg_opn: ", JSON.stringify(res_rtg_opn));
          // หา opn_end_date_time จาก opn_id
          let res_predecessor = await TempOpnTmp.findPOTempByOPNMINEndDate(
            doc_running,
            post_data.rtg_id,
            post_data.item_master_id,
            res_rtg_opn[0].opn_id
          );
          // console.log("PD res_rtg_opn[0].opn_id: ", res_rtg_opn[0].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_start_date_time: ",
          //   res_predecessor[0].opn_start_date_time
          // );
          console.log(
            "PD FF !0 res_predecessor res_predecessor[0].opn_end_date_time: ",
            res_predecessor[0].opn_end_date_time
          );

          // let newDate = new Date(res_predecessor[0].opn_end_date_time);

          const originalDate = new Date(res_predecessor[0].opn_end_date_time);
          let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000);
          console.log("PD FF !0 newDate: ", newDate);

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,
          let new_date_start = await calculateWorkOrderDownToUp(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let stamp_end_date = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          await TempOpnTmp.updateByID(res_draft2[i].id, data_due_date);
        }
      }
    }

    // --------------- calculate predecessor and dependency ----------------

    // ----------------- calculate Operation Type and insert to production_order -----------------
    let res_draft4 = await TempOpnTmp.findALLByRoutingV2(doc_running);

    // console.log("res_draft4: ", JSON.stringify(res_draft4));

    for (let i = 0; i < res_draft4.length; i++) {
      // console.log("res_draft4: ", JSON.stringify(res_draft4[i]));

      console.log("res_draft4 1: Loop ", i);
      let data = {
        doc_group_name: doc_group_name,
        doc_running_no: doc_running,
        item_master_id: res_draft4[i].item_master_id,
        order_qty: res_draft4[i].order_qty,
        rtg_id: res_draft4[i].rtg_id,
        opn_id: res_draft4[i].opn_id,
        pcs_hr: res_draft4[i].pcs_hr,
        time_process_by_opn: res_draft4[i].time_process_by_opn,
        setup_time: res_draft4[i].setup_time,
        real_qty_order_scrap_by_opn: res_draft4[i].real_qty_order_scrap_by_opn,
        machine_id: res_draft4[i].machine_id,
        overlap_time: res_draft4[i].overlap_time,
        setup_timehr_per: res_draft4[i].setup_timehr_per,
        batch: res_draft4[i].batch,
        batch_count: 0,
        batch_amount: 0,
        opn_start_date_time: res_draft4[i].opn_start_date_time,
        opn_end_date_time: res_draft4[i].opn_end_date_time,
        overlab_time_cal: res_draft4[i].overlab_time_cal,
        company_id: res_draft4[i].company_id,
        predecessor: res_draft4[i].predecessor,
        dependency: res_draft4[i].dependency,
        production_time: 0,
        due_date: post_data.due_date,
        due_time: post_data.due_time,
        order_date: post_data.created_at,
        doc_module_name: post_data.doc_module_name,
        std_labor_cost: 0.0,
        std_foh_cost: 0.0,
        std_voh_cost: 0.0,
        user_create: res_draft4[i].user_create,
        created_at: new Date(),
        opn_qty: 0,
      };

      /*
        {
            "id": 637,
            "doc_running_no": "PDCM-240231",
            "item_id": 1,
            "item_master_id": 10,
            "order_qty": 1000,
            "rtg_id": "01",
            "opn_id": "100",
            "pcs_hr": 240,
            "time_process_by_opn": "13.6250",
            "setup_time": "0.0000",
            "real_qty_order_scrap_by_opn": 2550,
            "machine_id": "17,18",
            "scrap_per": "0.0000",
            "overlap_time": "0.0000",
            "setup_timehr_per": "B",
            "batch": 500,
            "opn_start_date_time": "2024-02-25T07:10:00.000Z",
            "opn_end_date_time": "2024-02-26T06:11:30.000Z",
            "overlab_time_cal": "0.5000",
            "overlab_opn_id": "200",
            "company_id": 1,
            "user_create": 2,
            "user_update": null,
            "created_at": "2024-02-15T00:00:00.000Z",
            "updated_at": "2024-02-06T04:21:14.000Z",
            "qty_per": 10,
            "qty_by": 2,
            "scrap": 2,
            "no_of_machine": "2"
        },
    */

      let holiday_all = await getHolidayByMachineId(
        res_draft4[i].machine_id,
        res_draft4[i].company_id
      );
      // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
      let shift_all = await getShiftByMachineId(
        res_draft4[i].machine_id,
        res_draft4[i].company_id
      );
      // console.log("PD shift_all2: ", JSON.stringify(shift_all));

      console.log("res_draft4 2: Loop ", i);
      let bo = 0.0;
      let no_mch = [];

      try {
        if (res_draft4[i].setup_timehr_per == "B") {
          console.log("res_draft4 3: Loop ", i);
          //QtyOrder, QtyPer, QtyBy, Scrap, NoMch, Batch
          let cal_down = 0.0;
          bo = BatchOrder(
            res_draft4[i].order_qty,
            res_draft4[i].qty_per,
            res_draft4[i].qty_by,
            res_draft4[i].scrap,
            res_draft4[i].no_of_machine,
            res_draft4[i].batch
          );
          console.log("res_draft4 4: Loop ", i);
          no_mch = res_draft4[i].machine_id.split(",");
          // console.log("TestData no_mch: ", no_mch);
          for (let j = 0; j < no_mch.length; j++) {
            main_stamp_batch_start = res_draft4[i].opn_start_date_time;
            stamp_batch_start = null;
            // stamp_batch_start = res_draft4[i].opn_start_date_time;

            // console.log("TestData no_mch: ", no_mch[j]);
            console.log("res_draft4 5: Loop ", i);
            data.machine_id = no_mch[j];
            let res_cost = await tbl_mch_shift.findMachineCostByID(
              data.machine_id
            );
            console.log("res_cost: ", JSON.stringify(res_cost));
            // data.std_labor_cost = res_cost[0].labor_rate;
            // data.std_foh_cost = res_cost[0].foh_rate;
            // data.std_voh_cost = res_cost[0].voh_rate;

            for (let k = 0; k < bo; k++) {
              // console.log("TestData bo: ", bo[k]);
              console.log("res_draft4 6: Loop ", i);
              rec_no_batch_count = rec_no_batch_count + 1;
              // data.batch_count = k + 1;
              data.batch_count = rec_no_batch_count;
              if (k == bo - 1) {
                cal_down =
                  res_draft4[i].real_qty_order_scrap_by_opn %
                  res_draft4[i].batch;
                if (cal_down == 0) {
                  cal_down = res_draft4[i].batch;
                }
              } else {
                cal_down = res_draft4[i].batch;
              }
              data.batch_amount = cal_down;
              data.production_time =
                parseFloat(cal_down) / parseFloat(res_draft4[i].pcs_hr) +
                parseFloat(res_draft4[i].setup_time);

              data.opn_qty = data.batch_amount;

              // console.log(`TestData data ${k}: `, JSON.stringify(data));
              console.log("res_draft4 7: Loop ", i);

              data.std_labor_cost =
                parseFloat(res_cost[0].labor_rate) * data.production_time;
              data.std_foh_cost =
                parseFloat(res_cost[0].foh_rate) * data.production_time;
              data.std_voh_cost =
                parseFloat(res_cost[0].voh_rate) * data.production_time;

              // console.log("data B production_time: ", data.production_time);
              // console.log("data B std_labor_cost: ", data.std_labor_cost);
              // console.log("data B std_foh_cost: ", data.std_foh_cost);
              // console.log("data B std_voh_cost: ", data.std_voh_cost);

              if (stamp_batch_start == null) {
                console.log(
                  "res_draft4 7.1: stamp_batch_start ",
                  "stamp_batch_start == null"
                );
                console.log(
                  "res_draft4 7.1: stamp_batch_start: ",
                  stamp_batch_start
                );
                // stamp_batch_end = await calculateSplitMachineBatchDate(
                //   data.machine_id,
                //   post_data.company_id,
                //   data.production_time,
                //   main_stamp_batch_start
                // );

                //   holiday_all,
                //   shift_all,
                //   production_time,
                //   opn_end_date_time;

                // adjustProductionOrderByDueDate calculateSplitMachineBatchDateV2

                stamp_batch_end = await calculateSplitMachineBatchDateV2(
                  holiday_all,
                  shift_all,
                  data.production_time,
                  main_stamp_batch_start
                );

                data.opn_start_date_time = main_stamp_batch_start;
                data.opn_end_date_time = stamp_batch_end;
              } else {
                console.log(
                  "res_draft4 7.1: stamp_batch_start ",
                  "stamp_batch_start != null"
                );
                console.log(
                  "res_draft4 7.1: stamp_batch_start: ",
                  stamp_batch_start
                );
                // stamp_batch_end = await calculateSplitMachineBatchDate(
                //   data.machine_id,
                //   post_data.company_id,
                //   data.production_time,
                //   stamp_batch_start
                // );

                //   holiday_all,
                //   shift_all,
                //   production_time,
                //   opn_end_date_time;
                stamp_batch_end = await calculateSplitMachineBatchDateV2(
                  holiday_all,
                  shift_all,
                  data.production_time,
                  stamp_batch_start
                );

                data.opn_start_date_time = stamp_batch_start;
                data.opn_end_date_time = stamp_batch_end;
              }
              console.log("res_draft4 7.1: Loop ", i);

              console.log("res_draft4 stamp_batch_start:", stamp_batch_start);
              console.log("res_draft4 stamp_batch_end:", stamp_batch_end);
              try {
                await TempOpnOrd.create(data);
              } catch (error) {
                console.log("res_draft4 8: Loop error", error);
              }
              stamp_batch_start = stamp_batch_end;

              console.log("res_draft4 8: Loop ", i);
            }
          }
        } else if (res_draft4[i].setup_timehr_per == "O") {
          console.log("res_draft4 9: Loop ", i);
          data.batch_count = 1;
          data.batch_amount = res_draft4[i].order_qty;
          data.production_time =
            parseFloat(res_draft4[i].order_qty) /
              parseFloat(res_draft4[i].pcs_hr) +
            parseFloat(res_draft4[i].setup_time);

          data.opn_qty = data.batch_amount;

          console.log("production_time O: ", data.production_time);
          console.log("res_draft4[i].order_qty: ", res_draft4[i].order_qty);
          console.log("res_draft4[i].pcs_hr: ", res_draft4[i].pcs_hr);
          console.log("res_draft4[i].setup_time: ", res_draft4[i].setup_time);

          let res_cost = await tbl_mch_shift.findMachineCostByID(
            data.machine_id
          );
          console.log("res_cost: ", JSON.stringify(res_cost));
          data.std_labor_cost =
            parseFloat(res_cost[0].labor_rate) * data.production_time;
          data.std_foh_cost =
            parseFloat(res_cost[0].foh_rate) * data.production_time;
          data.std_voh_cost =
            parseFloat(res_cost[0].voh_rate) * data.production_time;

          console.log("data O production_time: ", data.production_time);
          console.log("data O std_labor_cost: ", data.std_labor_cost);
          console.log("data O std_foh_cost: ", data.std_foh_cost);
          console.log("data O std_voh_cost: ", data.std_voh_cost);
          try {
            await TempOpnOrd.create(data);
          } catch (error) {
            console.log("res_draft4 10: Loop error", error);
          }

          console.log("res_draft4 10: Loop ", i);
        } else if (res_draft4[i].setup_timehr_per == "Q") {
          console.log("res_draft4 11: Loop ", i);
          data.batch_count = 1;
          data.batch_amount = res_draft4[i].order_qty;
          data.production_time =
            parseFloat(res_draft4[i].order_qty) /
              parseFloat(res_draft4[i].pcs_hr) +
            parseFloat(res_draft4[i].setup_time);

          data.opn_qty = data.batch_amount;

          let res_cost = await tbl_mch_shift.findMachineCostByID(
            data.machine_id
          );
          // console.log("res_cost: ", JSON.stringify(res_cost));
          data.std_labor_cost =
            parseFloat(res_cost[0].labor_rate) * data.production_time;
          data.std_foh_cost =
            parseFloat(res_cost[0].foh_rate) * data.production_time;
          data.std_voh_cost =
            parseFloat(res_cost[0].voh_rate) * data.production_time;

          // console.log("data Q production_time: ", data.production_time);
          // console.log("data Q std_labor_cost: ", data.std_labor_cost);
          // console.log("data Q std_foh_cost: ", data.std_foh_cost);
          // console.log("data Q std_voh_cost: ", data.std_voh_cost);

          await TempOpnOrd.create(data);
          // console.log("production_time Q: ", data.production_time);
          // console.log("res_draft4[i].order_qty: ", res_draft4[i].order_qty);
          // console.log("res_draft4[i].pcs_hr: ", res_draft4[i].pcs_hr);
          // console.log("res_draft4[i].setup_time: ", res_draft4[i].setup_time);
          // console.log("res_draft4 12: Loop ", i);
        }
      } catch (error) {
        console.log("setup_timehr_per error :", error);
      }
    }

    // ----------------- calculate Operation Type and insert to production_order -----------------

    // --------------------- Insert Data To Draft Production Order ---------------------

    // -------------- compare new opn_start_date_time and opn_end_date_time --------------
    console.log("start compare new opn_start_date_time and opn_end_date_time");
    let cpd_res = "success";
    try {
      let res_draft5 = await TempOpnOrd.findALLByRoutingV3(doc_running);
      // console.log("res_draft5: ", JSON.stringify(res_draft5));
      // let sd = res_draft5[0].opn_start_date_time;
      let ed = res_draft5[res_draft5.length - 1].opn_end_date_time;
      console.log("ed: ", ed);
      console.log("ed due_date_time: ", due_date_time);

      let old_og_ed = new Date(due_date_time);
      let og_ed = new Date(ed);

      let old_ed = new Date(old_og_ed.getTime() + 420 * 60 * 1000);
      let new_ed = new Date(og_ed.getTime() + 420 * 60 * 1000);

      if (new_ed < old_ed) {
        cpd_res = "New End Date less than Old End Date";
      } else if (new_ed > old_ed) {
        cpd_res = "New End Date more than Old End Date";
      } else if (new_ed == old_ed) {
        cpd_res = "New End Date equal Old End Date";
      }
    } catch (error) {
      console.log(
        "compare new opn_start_date_time and opn_end_date_time error :",
        error
      );
    }

    return res
      .status(200)
      .json({ message: "success", doc_running: doc_running, cpd_res: cpd_res });
  } catch (err) {
    console.log("err 204: ", err);
    return res.status(204).json({ message: err });
  }
};

exports.adjustPOChangeMchAllOPN = async (req, res) => {
  let ord_id = req.params.id;

  let post_data = req.body;
  let doc_running = "";
  let doc_group_name = null; // ชื่อกลุ่มเอกสาร

  let time_stamp = null; // วันที่เวลาปัจจุบัน

  let due_date_time = null; // วันที่ต้องส่งมอบ
  let new_start_date_time = null; // วันที่เวลาที่ OPN นั้นๆ ทำงาน

  let main_end_time_old = null;
  let main_overlab_old = 0;

  // ------- ข้อมูลที่ต้องส่งเพิ่มมาใน post_data ---------
  // "adjust_type": "TO" หรือ "AO" // TO=This Operation, AO=All Operation
  // "start_date": "2024-02-29", // แปลงเอาจาก opn_start_date_time
  // "start_time": "16:00:00", // แปลงเอาจาก opn_start_date_time
  // "new_machine_id": "2", // ใช้ user ในการสร้างเอกสาร

  try {
    doc_running = post_data.doc_running_no;
    console.log("doc_running: ", doc_running);

    due_date_time = post_data.due_date + " " + post_data.due_time;
    console.log("due_date_time: ", due_date_time);
    console.log("post_data: ", JSON.stringify(post_data));

    let tmp111 = post_data.opn_start_date_time.replace(".000Z", "");
    let tmp_start_date_time = tmp111.split("T");

    // .replace("T", " ")
    //         .replace(".000Z", "");

    // new_start_date_time = post_data.start_date + " " + post_data.start_time;
    new_start_date_time = tmp_start_date_time[0] + " " + tmp_start_date_time[1];
    console.log("new_start_date_time: ", new_start_date_time);

    main_end_time_old = new_start_date_time;

    time_stamp = post_data.due_date;

    // clear data in production_order_temp
    await AdjustTempOpnTmpService.deleteByRunningNo(post_data.doc_running_no);

    // clear data in draft_production_order_plan
    await AdjustTempOpnOrdService.deleteByRunningNo(post_data.doc_running_no);

    // get temp_opn_ord for dump to twmp_adjust_opn_tmp

    let res_dump1 = [];
    if (post_data.adjust_type == "TO") {
      console.log("TO adjust_type: ", post_data.adjust_type);
      res_dump1 = await DraftProdOrderPlanService.findAllByID(ord_id);
    } else {
      console.log("AO adjust_type: ", post_data.adjust_type);
      res_dump1 = await DraftProdOrderPlanService.findAllGreaterThanOrEqualToID(
        ord_id,
        post_data.doc_running_no
      );
    }

    // console.log("res_dump1: ", JSON.stringify(res_dump1));

    let tc = 0;
    for (const element of res_dump1) {
      let data_opn_tmp = {
        item_id: element.id,
        doc_running_no: doc_running,
        item_master_id: element.item_master_id,
        order_qty: element.order_qty,
        rtg_id: element.rtg_id,
        opn_id: element.opn_id,
        pcs_hr: element.pcs_hr,
        time_process_by_opn: element.time_process_by_opn,
        setup_time: element.setup_time,
        real_qty_order_scrap_by_opn: element.real_qty_order_scrap_by_opn,
        machine_id: post_data.new_machine_id[0],
        scrap_per: element.scrap_per,
        overlap_time: element.overlap_time,
        setup_timehr_per: element.setup_timehr_per,
        batch: element.batch,
        opn_start_date_time: element.opn_start_date_time,
        opn_end_date_time: element.opn_end_date_time,
        overlab_time_cal: element.overlab_time_cal,
        overlab_opn_id: element.overlab_opn_id,
        predecessor: element.predecessor,
        dependency: element.dependency,
        company_id: element.company_id,
        user_create: element.user_create,
        user_update: element.user_update,
        created_at: new Date(),
        updated_at: new Date(),
      };
      if (tc == 0) {
        data_opn_tmp.predecessor = "0";
        data_opn_tmp.dependency = "FS";
        data_opn_tmp.overlap_time = 0;
        data_opn_tmp.overlab_time_cal = 0;
        data_opn_tmp.overlab_opn_id = null;
      }

      try {
        await AdjustTempOpnTmpService.create(data_opn_tmp);
      } catch (error) {
        console.log("AdjustTempOpnTmpService.create error: ", error);
      }

      tc++;
    }

    // return;

    // --------------------- Insert Data To Draft Production Order ---------------------

    // get doc_group_name
    let rec_no_batch_count = 0;
    let main_stamp_batch_start = null;
    let stamp_batch_start = null;
    let stamp_batch_end = null;

    // const res_doc = await doc_runningService.findGroupByModule(
    //   post_data.doc_module_name
    // );
    // doc_group_name = res_doc[0].doc_group_name;

    doc_group_name = post_data.doc_group_name;

    // return;
    // --------------- calculate predecessor and dependency ----------------
    console.log("PD TempOpnTmp.findALLByRouting");

    // let res_draft2 = await TempOpnTmp.findALLByRoutingV2(doc_running);
    let res_draft2 = await AdjustTempOpnTmpService.findALLByRoutingV2(
      doc_running
    );

    console.log("pd res_draft2: ", JSON.stringify(res_draft2));

    res_draft2[0].opn_start_date_time = new_start_date_time;
    console.log("pd res_draft2: ", JSON.stringify(res_draft2));

    // console.log("pd res_draft2: ", JSON.stringify(res_draft2));

    for (let i = 0; i < res_draft2.length; i++) {
      // console.log("pd res_draft2: ", res_draft2[i].machine_id);

      if (res_draft2[i].dependency == "FS") {
        // FS
        console.log("PD Type FS");

        if (
          res_draft2[i].overlap_time != 0 &&
          res_draft2[i].predecessor != "0"
        ) {
          // SS
          // ถ้าเป็น SS + overlab ต้องมี predecessor id ตลอด , ต้องมี OPN ก่อนหน้าเสมอ
          console.log("PD Type FS + Overlab");
          // console.log("res_draft2[i].predecessor != 0");
          // หา OPN จาก routting id
          let res_rtg_opn = await tbl_routingService.findRoutingByRTGID(
            res_draft2[i].predecessor
          );
          console.log("PD res_rtg_opn: ", JSON.stringify(res_rtg_opn));
          // หา opn_end_date_time จาก opn_id
          // let res_predecessor = await TempOpnTmp.findPOTempByOPNMINEndDate(
          let res_predecessor =
            await AdjustTempOpnTmpService.findPOTempByOPNMINEndDate(
              doc_running,
              post_data.rtg_id,
              post_data.item_master_id,
              res_rtg_opn[0].opn_id
            );
          // console.log("PD res_rtg_opn[0].opn_id: ", res_rtg_opn[0].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_start_date_time: ",
          //   res_predecessor[0].opn_start_date_time
          // );
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_end_date_time: ",
          //   res_predecessor[0].opn_end_date_time
          // );

          let tmp_end_date = null;
          let tmp_overlab = 0;

          // console.log("PD FS res_predecessor: ", res_predecessor);

          if (res_predecessor && res_predecessor[0].opn_end_date_time != null) {
            console.log("res_predecessor have data");
            tmp_end_date = res_predecessor[0].opn_end_date_time;
            tmp_overlab = res_predecessor[0].overlab_time_cal;
          } else {
            console.log("res_predecessor no data");
            tmp_end_date = main_end_time_old;
            tmp_overlab = main_overlab_old;
          }

          // ---- check type Batch from tbl_opn_ort by ID ----
          // let res_opn_ord = await DraftProdOrderPlanService.findAllByID(
          let res_opn_ord = await AdjustTempOpnTmpService.findAllByID(
            res_draft2[i].item_id - 1
          );

          console.log(
            "PD Type FS + Overlab res_opn_ord: ",
            JSON.stringify(res_opn_ord)
          );

          if (res_opn_ord[0].setup_timehr_per == "B") {
            console.log("res_opn_ord setup_timehr_per = B");
            tmp_end_date = res_opn_ord[0].opn_end_date_time;
            tmp_overlab = 0;
          }
          console.log("PD FS tmp_end_date: ", tmp_end_date);

          const originalDate = new Date(tmp_end_date);
          // console.log("tmp_overlab originalDate: ", originalDate);
          let tov = convertHourToMinute(tmp_overlab);

          // const originalDate = new Date(res_predecessor[0].opn_end_date_time);
          // // console.log("tmp_overlab originalDate: ", originalDate);
          // let tov = convertHourToMinute(res_predecessor[0].overlab_time_cal);
          // console.log("tmp_overlab tov: ", tov);
          let newDate = new Date(
            originalDate.getTime() + 420 + tov * 60 * 1000
          ); // แปลงเป็นมิล

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,

          // adjustProductionOrderByDueDate calculateWorkOrderUpToDown

          let stamp_end_date = await calculateWorkOrderUpToDown(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let new_date_start = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          // await TempOpnTmp.updateByID(res_draft2[i].id, data_due_date);
          await AdjustTempOpnTmpService.updateByID(
            res_draft2[i].id,
            data_due_date
          );
        } else if (
          res_draft2[i].predecessor == "0" &&
          res_draft2[i].overlap_time == 0
        ) {
          console.log("PD Type FS + Non Overlab + Non Predecessor");
          // console.log("res_draft2[i].predecessor == 0");
          // เป็น OPN แรก ไม่มี predecessor
          // console.log("PD res_rtg_opn[0].opn_id: ", res_draft2[i].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          console.log(
            "PD FS 0 res_predecessor res_predecessor[0].opn_start_date_time: ",
            res_draft2[i].opn_start_date_time
          );
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_end_date_time: ",
          //   res_draft2[i].opn_end_date_time
          // );

          let tmp_end_date = null;

          tmp_end_date = res_draft2[i].opn_start_date_time;
          // ---- check type Batch from tbl_opn_ort by ID ----
          let res_opn_ord = await DraftProdOrderPlanService.findAllByID(
            // let res_opn_ord = await AdjustTempOpnTmpService.findAllByID(
            res_draft2[i].item_id
          );

          // console.log("PD res_opn_ord: ", JSON.stringify(res_opn_ord));

          // if (res_opn_ord[0].setup_timehr_per == "B") {
          // console.log("res_opn_ord setup_timehr_per = B");
          tmp_end_date = res_opn_ord[0].opn_start_date_time;
          // }
          console.log("PD FS tmp_end_date: ", tmp_end_date);

          // const originalDate = new Date(res_draft2[i].opn_start_date_time);
          const originalDate = new Date(tmp_end_date);
          console.log("PD FS 0 originalDate: ", originalDate.getTime());
          let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000);
          console.log("PD FS 0 newDate: ", newDate);

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,
          let stamp_end_date = await calculateWorkOrderUpToDown(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let new_date_start = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          // await TempOpnTmp.updateByID(res_draft2[i].id, data_due_date);
          await AdjustTempOpnTmpService.updateByID(
            res_draft2[i].id,
            data_due_date
          );
        } else if (
          res_draft2[i].predecessor != "0" &&
          res_draft2[i].overlap_time == 0
        ) {
          console.log("PD Type FS + Non Overlab");
          // console.log("res_draft2[i].predecessor != 0");
          // หา OPN จาก routting id
          let res_rtg_opn = await tbl_routingService.findRoutingByRTGID(
            res_draft2[i].predecessor
          );
          // console.log("PD res_rtg_opn: ", JSON.stringify(res_rtg_opn));
          // หา opn_end_date_time จาก opn_id
          // let res_predecessor = await TempOpnTmp.findPOTempByOPNMINEndDate(
          let res_predecessor =
            await AdjustTempOpnTmpService.findPOTempByOPNMINEndDate(
              doc_running,
              post_data.rtg_id,
              post_data.item_master_id,
              res_rtg_opn[0].opn_id
            );
          // console.log("PD res_rtg_opn[0].opn_id: ", res_rtg_opn[0].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_start_date_time: ",
          //   res_predecessor[0].opn_start_date_time
          // );
          // console.log(
          //   "PD FS !0 res_predecessor res_predecessor[0].opn_end_date_time: ",
          //   res_predecessor[0].opn_end_date_time
          // );

          let tmp_end_date = null;
          // let tmp_overlab = 0;

          if (res_predecessor && res_predecessor[0].opn_end_date_time != null) {
            console.log("res_predecessor have data");
            tmp_end_date = res_predecessor[0].opn_end_date_time;
            // tmp_overlab = res_predecessor[0].overlab_time_cal;
          } else {
            console.log("res_predecessor no data");
            tmp_end_date = main_end_time_old;
            // tmp_overlab = main_overlab_old;
          }

          // ---- check type Batch from tbl_opn_ort by ID ----
          // let res_opn_ord = await DraftProdOrderPlanService.findAllByID(
          let res_opn_ord = await AdjustTempOpnTmpService.findAllByID(
            res_draft2[i].item_id - 1
          );

          // console.log("PD res_opn_ord: ", JSON.stringify(res_opn_ord));

          if (res_opn_ord[0].setup_timehr_per == "B") {
            console.log("res_opn_ord setup_timehr_per = B");
            tmp_end_date = res_opn_ord[0].opn_end_date_time;
          }
          console.log("PD FS tmp_end_date: ", tmp_end_date);

          const originalDate = new Date(tmp_end_date);
          // console.log("tmp_overlab originalDate: ", originalDate);

          // const originalDate = new Date(res_predecessor[0].opn_end_date_time);
          let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000);
          console.log("PD FS !0 newDate: ", newDate);

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,
          let stamp_end_date = await calculateWorkOrderUpToDown(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let new_date_start = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          // await TempOpnTmp.updateByID(res_draft2[i].id, data_due_date);
          await AdjustTempOpnTmpService.updateByID(
            res_draft2[i].id,
            data_due_date
          );
        }
      } else if (res_draft2[i].dependency == "SS") {
        // SS
        // ถ้าเป็น SS ต้องมี predecessor id ตลอด , ต้องมี OPN ก่อนหน้าเสมอ
        console.log("PD Type SS");
        if (
          res_draft2[i].overlap_time != 0 &&
          res_draft2[i].predecessor != "0"
        ) {
          // SS
          // ถ้าเป็น SS + overlab ต้องมี predecessor id ตลอด , ต้องมี OPN ก่อนหน้าเสมอ
          console.log("PD Type SS + Overlab");
          // console.log("res_draft2[i].predecessor != 0");
          // หา OPN จาก routting id
          let res_rtg_opn = await tbl_routingService.findRoutingByRTGID(
            res_draft2[i].predecessor
          );
          console.log("PD res_rtg_opn: ", JSON.stringify(res_rtg_opn));
          // หา opn_end_date_time จาก opn_id
          // let res_predecessor = await TempOpnTmp.findPOTempByOPNMINStartDate(
          let res_predecessor =
            await AdjustTempOpnTmpService.findPOTempByOPNMINStartDate(
              doc_running,
              post_data.rtg_id,
              post_data.item_master_id,
              res_rtg_opn[0].opn_id
            );
          // console.log("PD res_rtg_opn[0].opn_id: ", res_rtg_opn[0].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_start_date_time: ",
          //   res_predecessor[0].opn_start_date_time
          // );
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_end_date_time: ",
          //   res_predecessor[0].opn_end_date_time
          // );
          let tmp_end_date = null;
          let tmp_overlab = 0;

          if (
            res_predecessor &&
            res_predecessor[0].opn_start_date_time != null
          ) {
            console.log("res_predecessor have data");
            tmp_end_date = res_predecessor[0].opn_start_date_time;
            tmp_overlab = res_predecessor[0].overlab_time_cal;
          } else {
            console.log("res_predecessor no data");
            tmp_end_date = main_end_time_old;
            tmp_overlab = main_overlab_old;
          }

          const originalDate = new Date(tmp_end_date);
          // console.log("tmp_overlab originalDate: ", originalDate);
          let tov = convertHourToMinute(tmp_overlab);

          // ---- check type Batch from tbl_opn_ort by ID ----
          // let res_opn_ord = await DraftProdOrderPlanService.findAllByID(
          let res_opn_ord = await AdjustTempOpnTmpService.findAllByID(
            res_draft2[i].item_id - 1
          );

          // console.log("PD res_opn_ord: ", JSON.stringify(res_opn_ord));

          if (res_opn_ord[0].setup_timehr_per == "B") {
            console.log("res_opn_ord setup_timehr_per = B");
            tmp_end_date = res_opn_ord[0].opn_end_date_time;
            tmp_overlab = 0;
          }
          console.log("PD SS tmp_end_date: ", tmp_end_date);

          // const originalDate = new Date(res_predecessor[0].opn_start_date_time);
          // // console.log("tmp_overlab originalDate: ", originalDate);
          // let tov = convertHourToMinute(res_predecessor[0].overlab_time_cal);
          // console.log("tmp_overlab tov: ", tov);
          let newDate = new Date(
            originalDate.getTime() + 420 + tov * 60 * 1000
          ); // แปลงเป็นมิล

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,
          let stamp_end_date = await calculateWorkOrderUpToDown(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let new_date_start = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          // await TempOpnTmp.updateByID(res_draft2[i].id, data_due_date);
          await AdjustTempOpnTmpService.updateByID(
            res_draft2[i].id,
            data_due_date
          );
        } else if (
          res_draft2[i].predecessor == "0" &&
          res_draft2[i].overlap_time == 0
        ) {
          // console.log("res_draft2[i].predecessor == 0");
          // เป็น OPN แรก ไม่มี predecessor
          // console.log("PD res_rtg_opn[0].opn_id: ", res_draft2[i].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          console.log(
            "PD SS 0 res_predecessor res_predecessor[0].opn_start_date_time: ",
            res_draft2[i].opn_start_date_time
          );
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_end_date_time: ",
          //   res_draft2[i].opn_end_date_time
          // );

          // let newDate = new Date(res_draft2[i].opn_start_date_time);

          let tmp_end_date = null;

          tmp_end_date = res_draft2[i].opn_start_date_time;
          // ---- check type Batch from tbl_opn_ort by ID ----
          let res_opn_ord = await DraftProdOrderPlanService.findAllByID(
            // let res_opn_ord = await AdjustTempOpnTmpService.findAllByID(
            res_draft2[i].item_id
          );

          // console.log("PD res_opn_ord: ", JSON.stringify(res_opn_ord));

          // if (res_opn_ord[0].setup_timehr_per == "B") {
          // console.log("res_opn_ord setup_timehr_per = B");
          tmp_end_date = res_opn_ord[0].opn_start_date_time;
          // }
          console.log("PD SS tmp_end_date: ", tmp_end_date);

          const originalDate = new Date(tmp_end_date);
          // const originalDate = new Date(res_draft2[i].opn_start_date_time);
          let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000);
          console.log("PD SS 0 newDate: ", newDate);

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,
          let stamp_end_date = await calculateWorkOrderUpToDown(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let new_date_start = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          // await TempOpnTmp.updateByID(res_draft2[i].id, data_due_date);
          await AdjustTempOpnTmpService.updateByID(
            res_draft2[i].id,
            data_due_date
          );
        } else if (
          res_draft2[i].predecessor != "0" &&
          res_draft2[i].overlap_time == 0
        ) {
          // console.log("res_draft2[i].predecessor != 0");
          // หา OPN จาก routting id
          let res_rtg_opn = await tbl_routingService.findRoutingByRTGID(
            res_draft2[i].predecessor
          );
          // console.log("PD res_rtg_opn: ", JSON.stringify(res_rtg_opn));
          // หา opn_end_date_time จาก opn_id
          // let res_predecessor = await TempOpnTmp.findPOTempByOPNMINStartDate(
          let res_predecessor =
            await AdjustTempOpnTmpService.findPOTempByOPNMINStartDate(
              doc_running,
              post_data.rtg_id,
              post_data.item_master_id,
              res_rtg_opn[0].opn_id
            );
          // console.log("PD res_rtg_opn[0].opn_id: ", res_rtg_opn[0].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          // console.log(
          //   "PD SS !0 res_predecessor res_predecessor[0].opn_start_date_time: ",
          //   res_predecessor[0].opn_start_date_time
          // );
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_end_date_time: ",
          //   res_predecessor[0].opn_end_date_time
          // );

          // let newDate = new Date(res_predecessor[0].opn_start_date_time);

          let tmp_end_date = null;
          // let tmp_overlab = 0;

          if (
            res_predecessor &&
            res_predecessor[0].opn_start_date_time != null
          ) {
            console.log("res_predecessor have data");
            tmp_end_date = res_predecessor[0].opn_start_date_time;
            // tmp_overlab = res_predecessor[0].overlab_time_cal;
          } else {
            console.log("res_predecessor no data");
            tmp_end_date = main_end_time_old;
            // tmp_overlab = main_overlab_old;
          }

          // ---- check type Batch from tbl_opn_ort by ID ----
          // let res_opn_ord = await DraftProdOrderPlanService.findAllByID(
          let res_opn_ord = await AdjustTempOpnTmpService.findAllByID(
            res_draft2[i].item_id - 1
          );

          // console.log("PD res_opn_ord: ", JSON.stringify(res_opn_ord));

          if (res_opn_ord[0].setup_timehr_per == "B") {
            console.log("res_opn_ord setup_timehr_per = B");
            tmp_end_date = res_opn_ord[0].opn_end_date_time;
          }
          console.log("PD SS tmp_end_date: ", tmp_end_date);

          const originalDate = new Date(tmp_end_date);
          // console.log("tmp_overlab originalDate: ", originalDate);
          // let tov = convertHourToMinute(tmp_overlab);

          // const originalDate = new Date(res_predecessor[0].opn_start_date_time);
          let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000);
          console.log("PD SS !0 newDate: ", newDate);

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,
          let stamp_end_date = await calculateWorkOrderUpToDown(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let new_date_start = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          // await TempOpnTmp.updateByID(res_draft2[i].id, data_due_date);
          await AdjustTempOpnTmpService.updateByID(
            res_draft2[i].id,
            data_due_date
          );
        }
      } else if (res_draft2[i].dependency == "FF") {
        // FF

        // ถ้าเป็น FF ต้องมี predecessor id ตลอด , ต้องมี OPN ก่อนหน้าเสมอ
        console.log("PD Type FF");

        if (
          res_draft2[i].overlap_time != 0 &&
          res_draft2[i].predecessor != "0"
        ) {
          // SS
          // ถ้าเป็น SS + overlab ต้องมี predecessor id ตลอด , ต้องมี OPN ก่อนหน้าเสมอ
          console.log("PD Type FF + Overlab");
          // console.log("res_draft2[i].predecessor != 0");
          // หา OPN จาก routting id
          let res_rtg_opn = await tbl_routingService.findRoutingByRTGID(
            res_draft2[i].predecessor
          );
          console.log("PD res_rtg_opn: ", JSON.stringify(res_rtg_opn));
          // หา opn_end_date_time จาก opn_id
          // let res_predecessor = await TempOpnTmp.findPOTempByOPNMINEndDate(
          let res_predecessor =
            await AdjustTempOpnTmpService.findPOTempByOPNMINEndDate(
              doc_running,
              post_data.rtg_id,
              post_data.item_master_id,
              res_rtg_opn[0].opn_id
            );
          // console.log("PD res_rtg_opn[0].opn_id: ", res_rtg_opn[0].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_start_date_time: ",
          //   res_predecessor[0].opn_start_date_time
          // );
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_end_date_time: ",
          //   res_predecessor[0].opn_end_date_time
          // );

          let tmp_end_date = null;
          let tmp_overlab = 0;

          if (res_predecessor && res_predecessor[0].opn_end_date_time != null) {
            console.log("res_predecessor have data");
            tmp_end_date = res_predecessor[0].opn_end_date_time;
            tmp_overlab = res_predecessor[0].overlab_time_cal;
          } else {
            console.log("res_predecessor no data");
            tmp_end_date = main_end_time_old;
            tmp_overlab = main_overlab_old;
          }

          // ---- check type Batch from tbl_opn_ort by ID ----
          // let res_opn_ord = await DraftProdOrderPlanService.findAllByID(
          let res_opn_ord = await AdjustTempOpnTmpService.findAllByID(
            res_draft2[i].item_id - 1
          );

          // console.log("PD res_opn_ord: ", JSON.stringify(res_opn_ord));

          if (res_opn_ord[0].setup_timehr_per == "B") {
            console.log("res_opn_ord setup_timehr_per = B");
            tmp_end_date = res_opn_ord[0].opn_end_date_time;
            tmp_overlab = 0;
          }
          console.log("PD FF tmp_end_date: ", tmp_end_date);

          const originalDate = new Date(tmp_end_date);
          // console.log("tmp_overlab originalDate: ", originalDate);
          let tov = convertHourToMinute(tmp_overlab);

          // const originalDate = new Date(res_predecessor[0].opn_end_date_time);
          // // console.log("tmp_overlab originalDate: ", originalDate);
          // let tov = convertHourToMinute(res_predecessor[0].overlab_time_cal);
          // console.log("tmp_overlab tov: ", tov);
          let newDate = new Date(
            originalDate.getTime() + 420 + tov * 60 * 1000
          ); // แปลงเป็นมิล

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,
          let new_date_start = await calculateWorkOrderDownToUp(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let stamp_end_date = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          // await TempOpnTmp.updateByID(res_draft2[i].id, data_due_date);
          await AdjustTempOpnTmpService.updateByID(
            res_draft2[i].id,
            data_due_date
          );
        } else if (
          res_draft2[i].predecessor == "0" &&
          res_draft2[i].overlap_time == 0
        ) {
          // console.log("res_draft2[i].predecessor == 0");
          // เป็น OPN แรก ไม่มี predecessor
          // console.log("PD res_rtg_opn[0].opn_id: ", res_draft2[i].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_start_date_time: ",
          //   res_draft2[i].opn_start_date_time
          // );
          console.log(
            "PD FF 0 res_predecessor res_predecessor[0].opn_end_date_time: ",
            res_draft2[i].opn_end_date_time
          );

          // let newDate = new Date(res_draft2[i].opn_end_date_time);

          let tmp_end_date = null;

          tmp_end_date = res_draft2[i].opn_start_date_time;
          // ---- check type Batch from tbl_opn_ort by ID ----
          let res_opn_ord = await DraftProdOrderPlanService.findAllByID(
            // let res_opn_ord = await AdjustTempOpnTmpService.findAllByID(
            res_draft2[i].item_id
          );

          // console.log("PD res_opn_ord: ", JSON.stringify(res_opn_ord));

          // if (res_opn_ord[0].setup_timehr_per == "B") {
          // console.log("res_opn_ord setup_timehr_per = B");
          tmp_end_date = res_opn_ord[0].opn_start_date_time;
          // }
          console.log("PD FF tmp_end_date: ", tmp_end_date);

          const originalDate = new Date(res_draft2[i].opn_end_date_time);
          let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000);
          console.log("PD FF 0 newDate: ", newDate);

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,
          let new_date_start = await calculateWorkOrderDownToUp(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let stamp_end_date = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          // await TempOpnTmp.updateByID(res_draft2[i].id, data_due_date);
          await AdjustTempOpnTmpService.updateByID(
            res_draft2[i].id,
            data_due_date
          );
        } else if (
          res_draft2[i].predecessor != "0" &&
          res_draft2[i].overlap_time == 0
        ) {
          // console.log("res_draft2[i].predecessor != 0");
          // หา OPN จาก routting id
          let res_rtg_opn = await tbl_routingService.findRoutingByRTGID(
            res_draft2[i].predecessor
          );
          // console.log("PD res_rtg_opn: ", JSON.stringify(res_rtg_opn));
          // หา opn_end_date_time จาก opn_id
          // let res_predecessor = await TempOpnTmp.findPOTempByOPNMINEndDate(
          let res_predecessor =
            await AdjustTempOpnTmpService.findPOTempByOPNMINEndDate(
              doc_running,
              post_data.rtg_id,
              post_data.item_master_id,
              res_rtg_opn[0].opn_id
            );
          // console.log("PD res_rtg_opn[0].opn_id: ", res_rtg_opn[0].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_start_date_time: ",
          //   res_predecessor[0].opn_start_date_time
          // );
          // console.log(
          //   "PD FF !0 res_predecessor res_predecessor[0].opn_end_date_time: ",
          //   res_predecessor[0].opn_end_date_time
          // );

          // let newDate = new Date(res_predecessor[0].opn_end_date_time);

          let tmp_end_date = null;
          // let tmp_overlab = 0;

          if (res_predecessor && res_predecessor[0].opn_end_date_time != null) {
            console.log("res_predecessor have data");
            tmp_end_date = res_predecessor[0].opn_end_date_time;
            // tmp_overlab = res_predecessor[0].overlab_time_cal;
          } else {
            console.log("res_predecessor no data");
            tmp_end_date = main_end_time_old;
            // tmp_overlab = main_overlab_old;
          }

          // ---- check type Batch from tbl_opn_ort by ID ----
          // let res_opn_ord = await DraftProdOrderPlanService.findAllByID(
          let res_opn_ord = await AdjustTempOpnTmpService.findAllByID(
            res_draft2[i].item_id - 1
          );

          // console.log("PD res_opn_ord: ", JSON.stringify(res_opn_ord));

          if (res_opn_ord[0].setup_timehr_per == "B") {
            console.log("res_opn_ord setup_timehr_per = B");
            tmp_end_date = res_opn_ord[0].opn_end_date_time;
          }
          console.log("PD FS tmp_end_date: ", tmp_end_date);

          const originalDate = new Date(tmp_end_date);
          // console.log("tmp_overlab originalDate: ", originalDate);
          // let tov = convertHourToMinute(tmp_overlab);

          // const originalDate = new Date(res_predecessor[0].opn_end_date_time);
          let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000);
          console.log("PD FF !0 newDate: ", newDate);

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,
          let new_date_start = await calculateWorkOrderDownToUp(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let stamp_end_date = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          // await TempOpnTmp.updateByID(res_draft2[i].id, data_due_date);
          await AdjustTempOpnTmpService.updateByID(
            res_draft2[i].id,
            data_due_date
          );
        }
      }
    }

    // --------------- calculate predecessor and dependency ----------------

    // return;

    // --------------------- Insert Data To Draft Production Order ---------------------

    // -------------- compare new opn_start_date_time and opn_end_date_time --------------
    console.log("start compare new opn_start_date_time and opn_end_date_time");
    let cpd_res = "success";
    try {
      let res_draft5 = await AdjustTempOpnTmpService.findALLByRoutingV2(
        doc_running
      );
      console.log("res_draft5: ", JSON.stringify(res_draft5));
      // let sd = res_draft5[0].opn_start_date_time;
      let ed = res_draft5[res_draft5.length - 1].opn_end_date_time;
      console.log("ed: ", ed);
      console.log("ed due_date_time: ", due_date_time);

      let old_og_ed = new Date(due_date_time.toString());
      let og_ed = new Date(ed.toString());

      let old_ed = new Date(old_og_ed.getTime() + 420 * 60 * 1000);
      let new_ed = new Date(og_ed.getTime() + 420 * 60 * 1000);
      console.log("old_ed: ", old_ed);
      console.log("new_ed: ", new_ed);

      let c1 = old_ed.getTime();
      let c2 = new_ed.getTime();
      console.log("c1: ", c1);
      console.log("c2: ", c2);

      if (c2 < c1) {
        cpd_res = "New End Date less than Old End Date";
      } else if (c2 > c1) {
        cpd_res = "Due date is Over , Want to postpone?";
      } else if (c2 == c1) {
        cpd_res = "New End Date equal Old End Date";
      }
    } catch (error) {
      console.log(
        "compare new opn_start_date_time and opn_end_date_time error :",
        error
      );
    }

    return res
      .status(200)
      .json({ message: "success", doc_running: doc_running, cpd_res: cpd_res });
  } catch (err) {
    console.log("err 204: ", err);
    return res.status(204).json({ message: err });
  }
};

exports.adjustPOChangeStartDateAllOPN = async (req, res) => {
  let ord_id = req.params.id;

  let post_data = req.body;
  let doc_running = "";
  let doc_group_name = null; // ชื่อกลุ่มเอกสาร

  let time_stamp = null; // วันที่เวลาปัจจุบัน

  let due_date_time = null; // วันที่ต้องส่งมอบ
  let new_start_date_time = null; // วันที่เวลาที่ OPN นั้นๆ ทำงาน

  let main_end_time_old = null;
  let main_overlab_old = 0;

  // ------- ข้อมูลที่ต้องส่งเพิ่มมาใน post_data ---------
  // "adjust_type": "TO" หรือ "AO" // TO=This Operation, AO=All Operation
  // "start_date": "2024-02-29", // รับค่ามาใหม่
  // "start_time": "16:00:00", // รับค่ามาใหม่

  try {
    doc_running = post_data.doc_running_no;
    console.log("doc_running: ", doc_running);

    due_date_time = post_data.due_date + " " + post_data.due_time;
    console.log("due_date_time: ", due_date_time);
    console.log("post_data: ", JSON.stringify(post_data));

    new_start_date_time = post_data.start_date + " " + post_data.start_time;
    console.log("new_start_date_time: ", new_start_date_time);

    main_end_time_old = new_start_date_time;

    time_stamp = post_data.due_date;

    // clear data in production_order_temp
    await AdjustTempOpnTmpService.deleteByRunningNo(post_data.doc_running_no);

    // clear data in draft_production_order_plan
    await AdjustTempOpnOrdService.deleteByRunningNo(post_data.doc_running_no);

    // get temp_opn_ord for dump to twmp_adjust_opn_tmp

    let res_dump1 = [];
    if (post_data.adjust_type == "TO") {
      console.log("TO adjust_type: ", post_data.adjust_type);
      res_dump1 = await DraftProdOrderPlanService.findAllByID(ord_id);
    } else {
      console.log("AO adjust_type: ", post_data.adjust_type);
      res_dump1 = await DraftProdOrderPlanService.findAllGreaterThanOrEqualToID(
        ord_id,
        post_data.doc_running_no
      );
    }

    // console.log("res_dump1: ", JSON.stringify(res_dump1));

    let tc = 0;
    for (const element of res_dump1) {
      let data_opn_tmp = {
        item_id: element.id,
        doc_running_no: doc_running,
        item_master_id: element.item_master_id,
        order_qty: element.order_qty,
        rtg_id: element.rtg_id,
        opn_id: element.opn_id,
        pcs_hr: element.pcs_hr,
        time_process_by_opn: element.time_process_by_opn,
        setup_time: element.setup_time,
        real_qty_order_scrap_by_opn: element.real_qty_order_scrap_by_opn,
        machine_id: element.new_machine_id,
        scrap_per: element.scrap_per,
        overlap_time: element.overlap_time,
        setup_timehr_per: element.setup_timehr_per,
        batch: element.batch,
        opn_start_date_time: element.opn_start_date_time,
        opn_end_date_time: element.opn_end_date_time,
        overlab_time_cal: element.overlab_time_cal,
        overlab_opn_id: element.overlab_opn_id,
        predecessor: element.predecessor,
        dependency: element.dependency,
        company_id: element.company_id,
        user_create: element.user_create,
        user_update: element.user_update,
        created_at: new Date(),
        updated_at: new Date(),
      };
      if (tc == 0) {
        data_opn_tmp.predecessor = "0";
        data_opn_tmp.dependency = "FS";
        data_opn_tmp.overlap_time = 0;
        data_opn_tmp.overlab_time_cal = 0;
        data_opn_tmp.overlab_opn_id = null;
      }

      try {
        await AdjustTempOpnTmpService.create(data_opn_tmp);
      } catch (error) {
        console.log("AdjustTempOpnTmpService.create error: ", error);
      }

      tc++;
    }

    // return;

    doc_group_name = post_data.doc_group_name;

    // return;
    // --------------- calculate predecessor and dependency ----------------
    console.log("PD AdjustTempOpnTmpService.findALLByRoutingV2");

    // let res_draft2 = await TempOpnTmp.findALLByRoutingV2(doc_running);
    let res_draft2 = await AdjustTempOpnTmpService.findALLByRoutingV2(
      doc_running
    );

    // console.log("pd res_draft2: ", JSON.stringify(res_draft2));
    res_draft2[0].opn_start_date_time = new_start_date_time;
    console.log("pd res_draft2: ", JSON.stringify(res_draft2));

    // console.log("pd res_draft2: ", JSON.stringify(res_draft2));

    for (let i = 0; i < res_draft2.length; i++) {
      // console.log("pd res_draft2: ", res_draft2[i].machine_id);

      if (res_draft2[i].dependency == "FS") {
        // FS
        console.log("PD Type FS");

        if (
          res_draft2[i].overlap_time != 0 &&
          res_draft2[i].predecessor != "0"
        ) {
          // SS
          // ถ้าเป็น SS + overlab ต้องมี predecessor id ตลอด , ต้องมี OPN ก่อนหน้าเสมอ
          console.log("PD Type FS + Overlab");
          // console.log("res_draft2[i].predecessor != 0");
          // หา OPN จาก routting id
          let res_rtg_opn = await tbl_routingService.findRoutingByRTGID(
            res_draft2[i].predecessor
          );
          console.log("PD res_rtg_opn: ", JSON.stringify(res_rtg_opn));
          // หา opn_end_date_time จาก opn_id
          // let res_predecessor = await TempOpnTmp.findPOTempByOPNMINEndDate(
          let res_predecessor =
            await AdjustTempOpnTmpService.findPOTempByOPNMINEndDate(
              doc_running,
              post_data.rtg_id,
              post_data.item_master_id,
              res_rtg_opn[0].opn_id
            );
          // console.log("PD res_rtg_opn[0].opn_id: ", res_rtg_opn[0].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_start_date_time: ",
          //   res_predecessor[0].opn_start_date_time
          // );
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_end_date_time: ",
          //   res_predecessor[0].opn_end_date_time
          // );

          let tmp_end_date = null;
          let tmp_overlab = 0;

          // console.log("PD FS res_predecessor: ", res_predecessor);

          if (res_predecessor && res_predecessor[0].opn_end_date_time != null) {
            console.log("res_predecessor have data");
            tmp_end_date = res_predecessor[0].opn_end_date_time;
            tmp_overlab = res_predecessor[0].overlab_time_cal;
          } else {
            console.log("res_predecessor no data");
            tmp_end_date = main_end_time_old;
            tmp_overlab = main_overlab_old;
          }

          // ---- check type Batch from tbl_opn_ort by ID ----
          // let res_opn_ord = await DraftProdOrderPlanService.findAllByID(
          let res_opn_ord = await AdjustTempOpnTmpService.findAllByID(
            res_draft2[i].item_id - 1
          );

          console.log(
            "PD Type FS + Overlab res_opn_ord: ",
            JSON.stringify(res_opn_ord)
          );

          if (res_opn_ord[0].setup_timehr_per == "B") {
            console.log("res_opn_ord setup_timehr_per = B");
            tmp_end_date = res_opn_ord[0].opn_end_date_time;
            tmp_overlab = 0;
          }
          console.log("PD FS tmp_end_date: ", tmp_end_date);

          const originalDate = new Date(tmp_end_date);
          // console.log("tmp_overlab originalDate: ", originalDate);
          let tov = convertHourToMinute(tmp_overlab);

          // const originalDate = new Date(res_predecessor[0].opn_end_date_time);
          // // console.log("tmp_overlab originalDate: ", originalDate);
          // let tov = convertHourToMinute(res_predecessor[0].overlab_time_cal);
          // console.log("tmp_overlab tov: ", tov);
          let newDate = new Date(
            originalDate.getTime() + 420 + tov * 60 * 1000
          ); // แปลงเป็นมิล

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,

          // adjustProductionOrderByDueDate calculateWorkOrderUpToDown

          let stamp_end_date = await calculateWorkOrderUpToDown(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let new_date_start = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          // await TempOpnTmp.updateByID(res_draft2[i].id, data_due_date);
          await AdjustTempOpnTmpService.updateByID(
            res_draft2[i].id,
            data_due_date
          );
        } else if (
          res_draft2[i].predecessor == "0" &&
          res_draft2[i].overlap_time == 0
        ) {
          console.log("PD Type FS + Non Overlab + Non Predecessor");
          // console.log("res_draft2[i].predecessor == 0");
          // เป็น OPN แรก ไม่มี predecessor
          // console.log("PD res_rtg_opn[0].opn_id: ", res_draft2[i].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          console.log(
            "PD FS 0 res_predecessor res_predecessor[0].opn_start_date_time: ",
            res_draft2[i].opn_start_date_time
          );
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_end_date_time: ",
          //   res_draft2[i].opn_end_date_time
          // );

          let tmp_end_date = null;

          tmp_end_date = res_draft2[i].opn_start_date_time;
          // ---- check type Batch from tbl_opn_ort by ID ----
          let res_opn_ord = await DraftProdOrderPlanService.findAllByID(
            // let res_opn_ord = await AdjustTempOpnTmpService.findAllByID(
            res_draft2[i].item_id
          );

          // console.log("PD res_opn_ord: ", JSON.stringify(res_opn_ord));

          // if (res_opn_ord[0].setup_timehr_per == "B") {
          // console.log("res_opn_ord setup_timehr_per = B");
          tmp_end_date = res_opn_ord[0].opn_start_date_time;
          // }
          console.log("PD FS tmp_end_date: ", tmp_end_date);

          // const originalDate = new Date(res_draft2[i].opn_start_date_time);
          const originalDate = new Date(tmp_end_date);
          console.log("PD FS 0 originalDate: ", originalDate.getTime());
          let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000);
          console.log("PD FS 0 newDate: ", newDate);

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,
          let stamp_end_date = await calculateWorkOrderUpToDown(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let new_date_start = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          // await TempOpnTmp.updateByID(res_draft2[i].id, data_due_date);
          await AdjustTempOpnTmpService.updateByID(
            res_draft2[i].id,
            data_due_date
          );
        } else if (
          res_draft2[i].predecessor != "0" &&
          res_draft2[i].overlap_time == 0
        ) {
          console.log("PD Type FS + Non Overlab");
          // console.log("res_draft2[i].predecessor != 0");
          // หา OPN จาก routting id
          let res_rtg_opn = await tbl_routingService.findRoutingByRTGID(
            res_draft2[i].predecessor
          );
          // console.log("PD res_rtg_opn: ", JSON.stringify(res_rtg_opn));
          // หา opn_end_date_time จาก opn_id
          // let res_predecessor = await TempOpnTmp.findPOTempByOPNMINEndDate(
          let res_predecessor =
            await AdjustTempOpnTmpService.findPOTempByOPNMINEndDate(
              doc_running,
              post_data.rtg_id,
              post_data.item_master_id,
              res_rtg_opn[0].opn_id
            );
          // console.log("PD res_rtg_opn[0].opn_id: ", res_rtg_opn[0].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_start_date_time: ",
          //   res_predecessor[0].opn_start_date_time
          // );
          // console.log(
          //   "PD FS !0 res_predecessor res_predecessor[0].opn_end_date_time: ",
          //   res_predecessor[0].opn_end_date_time
          // );

          let tmp_end_date = null;
          // let tmp_overlab = 0;

          if (res_predecessor && res_predecessor[0].opn_end_date_time != null) {
            console.log("res_predecessor have data");
            tmp_end_date = res_predecessor[0].opn_end_date_time;
            // tmp_overlab = res_predecessor[0].overlab_time_cal;
          } else {
            console.log("res_predecessor no data");
            tmp_end_date = main_end_time_old;
            // tmp_overlab = main_overlab_old;
          }

          // ---- check type Batch from tbl_opn_ort by ID ----
          // let res_opn_ord = await DraftProdOrderPlanService.findAllByID(
          let res_opn_ord = await AdjustTempOpnTmpService.findAllByID(
            res_draft2[i].item_id - 1
          );

          // console.log("PD res_opn_ord: ", JSON.stringify(res_opn_ord));

          if (res_opn_ord[0].setup_timehr_per == "B") {
            console.log("res_opn_ord setup_timehr_per = B");
            tmp_end_date = res_opn_ord[0].opn_end_date_time;
          }
          console.log("PD FS tmp_end_date: ", tmp_end_date);

          const originalDate = new Date(tmp_end_date);
          // console.log("tmp_overlab originalDate: ", originalDate);

          // const originalDate = new Date(res_predecessor[0].opn_end_date_time);
          let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000);
          console.log("PD FS !0 newDate: ", newDate);

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,
          let stamp_end_date = await calculateWorkOrderUpToDown(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let new_date_start = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          // await TempOpnTmp.updateByID(res_draft2[i].id, data_due_date);
          await AdjustTempOpnTmpService.updateByID(
            res_draft2[i].id,
            data_due_date
          );
        }
      } else if (res_draft2[i].dependency == "SS") {
        // SS
        // ถ้าเป็น SS ต้องมี predecessor id ตลอด , ต้องมี OPN ก่อนหน้าเสมอ
        console.log("PD Type SS");
        if (
          res_draft2[i].overlap_time != 0 &&
          res_draft2[i].predecessor != "0"
        ) {
          // SS
          // ถ้าเป็น SS + overlab ต้องมี predecessor id ตลอด , ต้องมี OPN ก่อนหน้าเสมอ
          console.log("PD Type SS + Overlab");
          // console.log("res_draft2[i].predecessor != 0");
          // หา OPN จาก routting id
          let res_rtg_opn = await tbl_routingService.findRoutingByRTGID(
            res_draft2[i].predecessor
          );
          console.log("PD res_rtg_opn: ", JSON.stringify(res_rtg_opn));
          // หา opn_end_date_time จาก opn_id
          // let res_predecessor = await TempOpnTmp.findPOTempByOPNMINStartDate(
          let res_predecessor =
            await AdjustTempOpnTmpService.findPOTempByOPNMINStartDate(
              doc_running,
              post_data.rtg_id,
              post_data.item_master_id,
              res_rtg_opn[0].opn_id
            );
          // console.log("PD res_rtg_opn[0].opn_id: ", res_rtg_opn[0].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_start_date_time: ",
          //   res_predecessor[0].opn_start_date_time
          // );
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_end_date_time: ",
          //   res_predecessor[0].opn_end_date_time
          // );
          let tmp_end_date = null;
          let tmp_overlab = 0;

          if (
            res_predecessor &&
            res_predecessor[0].opn_start_date_time != null
          ) {
            console.log("res_predecessor have data");
            tmp_end_date = res_predecessor[0].opn_start_date_time;
            tmp_overlab = res_predecessor[0].overlab_time_cal;
          } else {
            console.log("res_predecessor no data");
            tmp_end_date = main_end_time_old;
            tmp_overlab = main_overlab_old;
          }

          const originalDate = new Date(tmp_end_date);
          // console.log("tmp_overlab originalDate: ", originalDate);
          let tov = convertHourToMinute(tmp_overlab);

          // ---- check type Batch from tbl_opn_ort by ID ----
          // let res_opn_ord = await DraftProdOrderPlanService.findAllByID(
          let res_opn_ord = await AdjustTempOpnTmpService.findAllByID(
            res_draft2[i].item_id - 1
          );

          // console.log("PD res_opn_ord: ", JSON.stringify(res_opn_ord));

          if (res_opn_ord[0].setup_timehr_per == "B") {
            console.log("res_opn_ord setup_timehr_per = B");
            tmp_end_date = res_opn_ord[0].opn_end_date_time;
            tmp_overlab = 0;
          }
          console.log("PD SS tmp_end_date: ", tmp_end_date);

          // const originalDate = new Date(res_predecessor[0].opn_start_date_time);
          // // console.log("tmp_overlab originalDate: ", originalDate);
          // let tov = convertHourToMinute(res_predecessor[0].overlab_time_cal);
          // console.log("tmp_overlab tov: ", tov);
          let newDate = new Date(
            originalDate.getTime() + 420 + tov * 60 * 1000
          ); // แปลงเป็นมิล

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,
          let stamp_end_date = await calculateWorkOrderUpToDown(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let new_date_start = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          // await TempOpnTmp.updateByID(res_draft2[i].id, data_due_date);
          await AdjustTempOpnTmpService.updateByID(
            res_draft2[i].id,
            data_due_date
          );
        } else if (
          res_draft2[i].predecessor == "0" &&
          res_draft2[i].overlap_time == 0
        ) {
          // console.log("res_draft2[i].predecessor == 0");
          // เป็น OPN แรก ไม่มี predecessor
          // console.log("PD res_rtg_opn[0].opn_id: ", res_draft2[i].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          console.log(
            "PD SS 0 res_predecessor res_predecessor[0].opn_start_date_time: ",
            res_draft2[i].opn_start_date_time
          );
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_end_date_time: ",
          //   res_draft2[i].opn_end_date_time
          // );

          // let newDate = new Date(res_draft2[i].opn_start_date_time);

          let tmp_end_date = null;

          tmp_end_date = res_draft2[i].opn_start_date_time;
          // ---- check type Batch from tbl_opn_ort by ID ----
          let res_opn_ord = await DraftProdOrderPlanService.findAllByID(
            // let res_opn_ord = await AdjustTempOpnTmpService.findAllByID(
            res_draft2[i].item_id
          );

          // console.log("PD res_opn_ord: ", JSON.stringify(res_opn_ord));

          // if (res_opn_ord[0].setup_timehr_per == "B") {
          // console.log("res_opn_ord setup_timehr_per = B");
          tmp_end_date = res_opn_ord[0].opn_start_date_time;
          // }
          console.log("PD SS tmp_end_date: ", tmp_end_date);

          const originalDate = new Date(tmp_end_date);
          // const originalDate = new Date(res_draft2[i].opn_start_date_time);
          let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000);
          console.log("PD SS 0 newDate: ", newDate);

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,
          let stamp_end_date = await calculateWorkOrderUpToDown(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let new_date_start = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          // await TempOpnTmp.updateByID(res_draft2[i].id, data_due_date);
          await AdjustTempOpnTmpService.updateByID(
            res_draft2[i].id,
            data_due_date
          );
        } else if (
          res_draft2[i].predecessor != "0" &&
          res_draft2[i].overlap_time == 0
        ) {
          // console.log("res_draft2[i].predecessor != 0");
          // หา OPN จาก routting id
          let res_rtg_opn = await tbl_routingService.findRoutingByRTGID(
            res_draft2[i].predecessor
          );
          // console.log("PD res_rtg_opn: ", JSON.stringify(res_rtg_opn));
          // หา opn_end_date_time จาก opn_id
          // let res_predecessor = await TempOpnTmp.findPOTempByOPNMINStartDate(
          let res_predecessor =
            await AdjustTempOpnTmpService.findPOTempByOPNMINStartDate(
              doc_running,
              post_data.rtg_id,
              post_data.item_master_id,
              res_rtg_opn[0].opn_id
            );
          // console.log("PD res_rtg_opn[0].opn_id: ", res_rtg_opn[0].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          // console.log(
          //   "PD SS !0 res_predecessor res_predecessor[0].opn_start_date_time: ",
          //   res_predecessor[0].opn_start_date_time
          // );
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_end_date_time: ",
          //   res_predecessor[0].opn_end_date_time
          // );

          // let newDate = new Date(res_predecessor[0].opn_start_date_time);

          let tmp_end_date = null;
          // let tmp_overlab = 0;

          if (
            res_predecessor &&
            res_predecessor[0].opn_start_date_time != null
          ) {
            console.log("res_predecessor have data");
            tmp_end_date = res_predecessor[0].opn_start_date_time;
            // tmp_overlab = res_predecessor[0].overlab_time_cal;
          } else {
            console.log("res_predecessor no data");
            tmp_end_date = main_end_time_old;
            // tmp_overlab = main_overlab_old;
          }

          // ---- check type Batch from tbl_opn_ort by ID ----
          // let res_opn_ord = await DraftProdOrderPlanService.findAllByID(
          let res_opn_ord = await AdjustTempOpnTmpService.findAllByID(
            res_draft2[i].item_id - 1
          );

          // console.log("PD res_opn_ord: ", JSON.stringify(res_opn_ord));

          if (res_opn_ord[0].setup_timehr_per == "B") {
            console.log("res_opn_ord setup_timehr_per = B");
            tmp_end_date = res_opn_ord[0].opn_end_date_time;
          }
          console.log("PD SS tmp_end_date: ", tmp_end_date);

          const originalDate = new Date(tmp_end_date);
          // console.log("tmp_overlab originalDate: ", originalDate);
          // let tov = convertHourToMinute(tmp_overlab);

          // const originalDate = new Date(res_predecessor[0].opn_start_date_time);
          let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000);
          console.log("PD SS !0 newDate: ", newDate);

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,
          let stamp_end_date = await calculateWorkOrderUpToDown(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let new_date_start = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          // await TempOpnTmp.updateByID(res_draft2[i].id, data_due_date);
          await AdjustTempOpnTmpService.updateByID(
            res_draft2[i].id,
            data_due_date
          );
        }
      } else if (res_draft2[i].dependency == "FF") {
        // FF

        // ถ้าเป็น FF ต้องมี predecessor id ตลอด , ต้องมี OPN ก่อนหน้าเสมอ
        console.log("PD Type FF");

        if (
          res_draft2[i].overlap_time != 0 &&
          res_draft2[i].predecessor != "0"
        ) {
          // SS
          // ถ้าเป็น SS + overlab ต้องมี predecessor id ตลอด , ต้องมี OPN ก่อนหน้าเสมอ
          console.log("PD Type FF + Overlab");
          // console.log("res_draft2[i].predecessor != 0");
          // หา OPN จาก routting id
          let res_rtg_opn = await tbl_routingService.findRoutingByRTGID(
            res_draft2[i].predecessor
          );
          console.log("PD res_rtg_opn: ", JSON.stringify(res_rtg_opn));
          // หา opn_end_date_time จาก opn_id
          // let res_predecessor = await TempOpnTmp.findPOTempByOPNMINEndDate(
          let res_predecessor =
            await AdjustTempOpnTmpService.findPOTempByOPNMINEndDate(
              doc_running,
              post_data.rtg_id,
              post_data.item_master_id,
              res_rtg_opn[0].opn_id
            );
          // console.log("PD res_rtg_opn[0].opn_id: ", res_rtg_opn[0].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_start_date_time: ",
          //   res_predecessor[0].opn_start_date_time
          // );
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_end_date_time: ",
          //   res_predecessor[0].opn_end_date_time
          // );

          let tmp_end_date = null;
          let tmp_overlab = 0;

          if (res_predecessor && res_predecessor[0].opn_end_date_time != null) {
            console.log("res_predecessor have data");
            tmp_end_date = res_predecessor[0].opn_end_date_time;
            tmp_overlab = res_predecessor[0].overlab_time_cal;
          } else {
            console.log("res_predecessor no data");
            tmp_end_date = main_end_time_old;
            tmp_overlab = main_overlab_old;
          }

          // ---- check type Batch from tbl_opn_ort by ID ----
          // let res_opn_ord = await DraftProdOrderPlanService.findAllByID(
          let res_opn_ord = await AdjustTempOpnTmpService.findAllByID(
            res_draft2[i].item_id - 1
          );

          // console.log("PD res_opn_ord: ", JSON.stringify(res_opn_ord));

          if (res_opn_ord[0].setup_timehr_per == "B") {
            console.log("res_opn_ord setup_timehr_per = B");
            tmp_end_date = res_opn_ord[0].opn_end_date_time;
            tmp_overlab = 0;
          }
          console.log("PD FF tmp_end_date: ", tmp_end_date);

          const originalDate = new Date(tmp_end_date);
          // console.log("tmp_overlab originalDate: ", originalDate);
          let tov = convertHourToMinute(tmp_overlab);

          // const originalDate = new Date(res_predecessor[0].opn_end_date_time);
          // // console.log("tmp_overlab originalDate: ", originalDate);
          // let tov = convertHourToMinute(res_predecessor[0].overlab_time_cal);
          // console.log("tmp_overlab tov: ", tov);
          let newDate = new Date(
            originalDate.getTime() + 420 + tov * 60 * 1000
          ); // แปลงเป็นมิล

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,
          let new_date_start = await calculateWorkOrderDownToUp(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let stamp_end_date = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          // await TempOpnTmp.updateByID(res_draft2[i].id, data_due_date);
          await AdjustTempOpnTmpService.updateByID(
            res_draft2[i].id,
            data_due_date
          );
        } else if (
          res_draft2[i].predecessor == "0" &&
          res_draft2[i].overlap_time == 0
        ) {
          // console.log("res_draft2[i].predecessor == 0");
          // เป็น OPN แรก ไม่มี predecessor
          // console.log("PD res_rtg_opn[0].opn_id: ", res_draft2[i].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_start_date_time: ",
          //   res_draft2[i].opn_start_date_time
          // );
          console.log(
            "PD FF 0 res_predecessor res_predecessor[0].opn_end_date_time: ",
            res_draft2[i].opn_end_date_time
          );

          // let newDate = new Date(res_draft2[i].opn_end_date_time);

          let tmp_end_date = null;

          tmp_end_date = res_draft2[i].opn_start_date_time;
          // ---- check type Batch from tbl_opn_ort by ID ----
          let res_opn_ord = await DraftProdOrderPlanService.findAllByID(
            // let res_opn_ord = await AdjustTempOpnTmpService.findAllByID(
            res_draft2[i].item_id
          );

          // console.log("PD res_opn_ord: ", JSON.stringify(res_opn_ord));

          // if (res_opn_ord[0].setup_timehr_per == "B") {
          // console.log("res_opn_ord setup_timehr_per = B");
          tmp_end_date = res_opn_ord[0].opn_start_date_time;
          // }
          console.log("PD FF tmp_end_date: ", tmp_end_date);

          const originalDate = new Date(res_draft2[i].opn_end_date_time);
          let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000);
          console.log("PD FF 0 newDate: ", newDate);

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,
          let new_date_start = await calculateWorkOrderDownToUp(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let stamp_end_date = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          // await TempOpnTmp.updateByID(res_draft2[i].id, data_due_date);
          await AdjustTempOpnTmpService.updateByID(
            res_draft2[i].id,
            data_due_date
          );
        } else if (
          res_draft2[i].predecessor != "0" &&
          res_draft2[i].overlap_time == 0
        ) {
          // console.log("res_draft2[i].predecessor != 0");
          // หา OPN จาก routting id
          let res_rtg_opn = await tbl_routingService.findRoutingByRTGID(
            res_draft2[i].predecessor
          );
          // console.log("PD res_rtg_opn: ", JSON.stringify(res_rtg_opn));
          // หา opn_end_date_time จาก opn_id
          // let res_predecessor = await TempOpnTmp.findPOTempByOPNMINEndDate(
          let res_predecessor =
            await AdjustTempOpnTmpService.findPOTempByOPNMINEndDate(
              doc_running,
              post_data.rtg_id,
              post_data.item_master_id,
              res_rtg_opn[0].opn_id
            );
          // console.log("PD res_rtg_opn[0].opn_id: ", res_rtg_opn[0].opn_id);
          // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
          // console.log(
          //   "PD res_predecessor res_predecessor[0].opn_start_date_time: ",
          //   res_predecessor[0].opn_start_date_time
          // );
          // console.log(
          //   "PD FF !0 res_predecessor res_predecessor[0].opn_end_date_time: ",
          //   res_predecessor[0].opn_end_date_time
          // );

          // let newDate = new Date(res_predecessor[0].opn_end_date_time);

          let tmp_end_date = null;
          // let tmp_overlab = 0;

          if (res_predecessor && res_predecessor[0].opn_end_date_time != null) {
            console.log("res_predecessor have data");
            tmp_end_date = res_predecessor[0].opn_end_date_time;
            // tmp_overlab = res_predecessor[0].overlab_time_cal;
          } else {
            console.log("res_predecessor no data");
            tmp_end_date = main_end_time_old;
            // tmp_overlab = main_overlab_old;
          }

          // ---- check type Batch from tbl_opn_ort by ID ----
          // let res_opn_ord = await DraftProdOrderPlanService.findAllByID(
          let res_opn_ord = await AdjustTempOpnTmpService.findAllByID(
            res_draft2[i].item_id - 1
          );

          // console.log("PD res_opn_ord: ", JSON.stringify(res_opn_ord));

          if (res_opn_ord[0].setup_timehr_per == "B") {
            console.log("res_opn_ord setup_timehr_per = B");
            tmp_end_date = res_opn_ord[0].opn_end_date_time;
          }
          console.log("PD FS tmp_end_date: ", tmp_end_date);

          const originalDate = new Date(tmp_end_date);
          // console.log("tmp_overlab originalDate: ", originalDate);
          // let tov = convertHourToMinute(tmp_overlab);

          // const originalDate = new Date(res_predecessor[0].opn_end_date_time);
          let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000);
          console.log("PD FF !0 newDate: ", newDate);

          let holiday_all = await getHolidayByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
          let shift_all = await getShiftByMachineId(
            res_draft2[i].machine_id,
            res_draft2[i].company_id
          );
          // console.log("PD shift_all2: ", JSON.stringify(shift_all));

          // holiday_all,
          // shift_all,
          // time_process_by_opn,
          // start_date,
          let new_date_start = await calculateWorkOrderDownToUp(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );

          let stamp_end_date = newDate
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // -------- update opn_end_date_time to database ---------
          let data_due_date = {
            opn_start_date_time: new_date_start,
            opn_end_date_time: stamp_end_date,
          };
          // await TempOpnTmp.updateByID(res_draft2[i].id, data_due_date);
          await AdjustTempOpnTmpService.updateByID(
            res_draft2[i].id,
            data_due_date
          );
        }
      }
    }

    // --------------- calculate predecessor and dependency ----------------

    // return;

    // --------------------- Insert Data To Draft Production Order ---------------------

    // -------------- compare new opn_start_date_time and opn_end_date_time --------------
    console.log("start compare new opn_start_date_time and opn_end_date_time");
    let cpd_res = "success";
    try {
      let res_draft5 = await AdjustTempOpnTmpService.findALLByRoutingV2(
        doc_running
      );
      // console.log("res_draft5: ", JSON.stringify(res_draft5));
      // let sd = res_draft5[0].opn_start_date_time;
      let ed = res_draft5[res_draft5.length - 1].opn_end_date_time;
      console.log("ed: ", ed);
      console.log("ed due_date_time: ", due_date_time);

      let old_og_ed = new Date(due_date_time);
      let og_ed = new Date(ed);

      let old_ed = new Date(old_og_ed.getTime() + 420 * 60 * 1000);
      let new_ed = new Date(og_ed.getTime() + 420 * 60 * 1000);

      if (new_ed < old_ed) {
        cpd_res = "New End Date less than Old End Date";
      } else if (new_ed > old_ed) {
        cpd_res = "New End Date more than Old End Date";
      } else if (new_ed == old_ed) {
        cpd_res = "New End Date equal Old End Date";
      }
    } catch (error) {
      console.log(
        "compare new opn_start_date_time and opn_end_date_time error :",
        error
      );
    }

    return res
      .status(200)
      .json({ message: "success", doc_running: doc_running, cpd_res: cpd_res });
  } catch (err) {
    console.log("err 204: ", err);
    return res.status(204).json({ message: err });
  }
};

exports.adjustProductionOrderConfirm = async (req, res) => {
  let doc_running = req.params.doc_running;
  let post_data = req.body;
  console.log("post_data: ", JSON.stringify(post_data));

  try {
    // doc_running = post_data.doc_running;
    console.log("doc_running: ", doc_running);

    // check temp_order by doc_running_no
    let res_chk_tmp_ord = await TempOrder.findTempOrderByDocRunning(
      doc_running
    );
    console.log(
      "adjustProductionOrderConfirm res_chk_tmp_ord: ",
      JSON.stringify(res_chk_tmp_ord)
    );

    // -------------- update tbl_ord --------------

    let data = {
      item_master_id: res_chk_tmp_ord[0].item_master_id,
      order_qty: res_chk_tmp_ord[0].order_qty,
      rtg_id: res_chk_tmp_ord[0].rtg_id,
      order_date: res_chk_tmp_ord[0].order_date,
      due_date: res_chk_tmp_ord[0].due_date,
      due_time: res_chk_tmp_ord[0].due_time,
      user_update: res_chk_tmp_ord[0].user_update,
      updated_at: new Date(),
    };

    console.log("OrderService.update data:", JSON.stringify(data));
    console.log(
      "OrderService.update res_chk_tmp_ord.id:",
      res_chk_tmp_ord[0].id
    );
    try {
      await OrderService.update(res_chk_tmp_ord[0].id, data);
    } catch (error) {
      console.log("OrderService.update error:", error);
    }

    // -------------- update tbl_ord --------------

    // clear data in production_order_temp
    await ProductionOrderTempService.deleteByRunningNo(doc_running);

    // clear data in draft_production_order_plan
    await DraftProdOrderPlanService.deleteByRunningNo(doc_running);

    // ----------- insert data to production_order_temp -----------
    let res_opn_tmp = await TempOpnTmp.findALLByRoutingV2(doc_running);

    for (const element of res_opn_tmp) {
      let data_opn_tmp = {
        doc_running_no: doc_running,
        item_id: element.item_id,
        item_master_id: element.item_master_id,
        order_qty: element.order_qty,
        rtg_id: element.rtg_id,
        opn_id: element.opn_id,
        pcs_hr: element.pcs_hr,
        time_process_by_opn: element.time_process_by_opn,
        setup_time: element.setup_time,
        real_qty_order_scrap_by_opn: element.real_qty_order_scrap_by_opn,
        machine_id: element.machine_id,
        scrap_per: element.scrap_per,
        overlap_time: element.overlap_time,
        setup_timehr_per: element.setup_timehr_per,
        batch: element.batch,
        opn_start_date_time: element.opn_start_date_time,
        opn_end_date_time: element.opn_end_date_time,
        overlab_time_cal: element.overlab_time_cal,
        overlab_opn_id: element.overlab_opn_id,
        predecessor: element.predecessor,
        dependency: element.dependency,
        company_id: element.company_id,
        user_create: element.user_create,
        user_update: element.user_update,
        created_at: new Date(),
        updated_at: new Date(),
      };
      await ProductionOrderTempService.create(data_opn_tmp);
    }
    // ----------- insert data to production_order_temp -----------

    // ----------- insert data to draft_production_order_plan -----------
    let res_opn_ord = await TempOpnOrd.findALLByRoutingV3(doc_running);

    for (const element of res_opn_ord) {
      let data_opn_ord = {
        doc_group_name: element.doc_group_name,
        doc_running_no: element.doc_running_no,
        item_master_id: element.item_master_id,
        order_qty: element.order_qty,
        opn_qty: element.batch_amount,
        rtg_id: element.rtg_id,
        opn_id: element.opn_id,
        pcs_hr: element.pcs_hr,
        time_process_by_opn: element.time_process_by_opn,
        setup_time: element.setup_time,
        real_qty_order_scrap_by_opn: element.real_qty_order_scrap_by_opn,
        machine_id: element.machine_id,
        overlap_time: element.overlap_time,
        setup_timehr_per: element.setup_timehr_per,
        batch: element.batch,
        batch_count: element.batch_count,
        batch_amount: element.batch_amount,
        opn_start_date_time: element.opn_start_date_time,
        opn_end_date_time: element.opn_end_date_time,
        company_id: element.company_id,
        predecessor: element.predecessor,
        dependency: element.dependency,
        production_time: element.production_time,
        due_date: element.due_date,
        due_time: element.due_time,
        doc_module_name: element.doc_module_name,
        order_date: element.order_date,
        status: element.status,
        prod_status: element.prod_status,
        std_labor_cost: element.std_labor_cost,
        std_foh_cost: element.std_foh_cost,
        std_voh_cost: element.std_voh_cost,
        receive_qty: element.receive_qty,
        act_setup_time: element.act_setup_time,
        act_prod_time: element.act_prod_time,
        act_labor_cost: element.act_labor_cost,
        act_foh_cost: element.act_foh_cost,
        act_voh_cost: element.act_voh_cost,
        user_create: element.user_create,
        user_update: element.user_update,
        created_at: element.created_at,
        updated_at: element.updated_at,
        deleted_at: element.deleted_at,
      };
      await DraftProdOrderPlanService.createV2(data_opn_ord);
    }

    // ----------- insert data to draft_production_order_plan -----------

    return res
      .status(200)
      .json({ message: "success", doc_running: doc_running, cpd_res: "" });
  } catch (err) {
    console.log("err 204: ", err);
    return res.status(204).json({ message: err });
  }
};

exports.adjustAdjustBetweenConfirm = async (req, res) => {
  let doc_running = req.params.doc_running;
  let post_data = req.body;
  // console.log("post_data: ", JSON.stringify(post_data));

  try {
    // doc_running = post_data.doc_running;
    console.log("doc_running: ", doc_running);

    let res_adjust = await AdjustTempOpnTmpService.findALLByRoutingV2(
      doc_running
    );

    // -------------- update tbl_ord --------------
    let temp1 = res_adjust[res_adjust.length - 1].opn_end_date_time;
    let temp2 = temp1.toISOString().replace("T", " ").replace(".000Z", "");
    let temp3 = temp2.split(" ");
    let due_date = temp3[0] + " " + temp3[1];
    let due_time = temp3[0] + " " + temp3[1];

    let data = {
      due_date: due_date,
      due_time: due_time,
    };

    console.log("OrderService.update data:", JSON.stringify(data));

    try {
      if ((post_data.adjust_message = "Due date is Over , Want to postpone?")) {
        console.log(
          "post_data.adjust_message if: ",
          "Due date is Over , Want to postpone?"
        );
        await OrderService.updateByDocRunning(doc_running, data);
      } else {
        console.log(
          "post_data.adjust_message else: ",
          post_data.adjust_message
        );
      }
    } catch (error) {
      console.log("OrderService.update error:", error);
    }

    // -------------- update tbl_ord --------------

    res_adjust.forEach(async (element) => {
      let data = {
        machine_id: element.machine_id,
        opn_start_date_time: element.opn_start_date_time,
        opn_end_date_time: element.opn_end_date_time,
      };

      await DraftProdOrderPlanService.update(element.item_id, data);
    });

    return res
      .status(200)
      .json({ message: "success", doc_running: doc_running, cpd_res: "" });
  } catch (err) {
    console.log("err 204: ", err);
    return res.status(204).json({ message: err });
  }
};

async function calculateTempOpnOrdDate(
  order_qty,
  machine_all,
  holiday_all,
  shift_all,
  real_qty_order_scrap_by_opn,
  set_up_time,
  time_process_by_opn,
  doc_running,
  rtg_id,
  item_master_id,
  opn_id
) {
  // // กำหนดข้อมูล
  // const shifts = [
  //   {
  //     index: 0,
  //     shift_name: "กระเช้า",
  //     date_cal: "2024-02-29",
  //     start_time: "08:00:00",
  //     end_time: "12:00:00",
  //     summary_time: 4,
  //   },
  //   {
  //     index: 1,
  //     shift_name: "กระเช้า",
  //     date_cal: "2024-02-29",
  //     start_time: "13:00:00",
  //     end_time: "17:00:00",
  //     summary_time: 4,
  //   },
  //   {
  //     index: 2,
  //     shift_name: "กะB",
  //     date_cal: "2024-02-29",
  //     start_time: "17:01:00",
  //     end_time: "20:00:00",
  //     summary_time: 3,
  //   },
  // ];

  // console.log("CPOP order_qty: ", order_qty);
  // console.log("CPOP machine_all: ", machine_all);
  // console.log("CPOP holiday_all: ", holiday_all);
  // console.log("CPOP shift_all: ", shift_all);
  // console.log(
  //   "CPOP real_qty_order_scrap_by_opn: ",
  //   real_qty_order_scrap_by_opn
  // );
  // console.log("CPOP set_up_time: ", set_up_time);
  // console.log("CPOP time_process_by_opn: ", time_process_by_opn);
  // console.log("CPOP doc_running: ", doc_running);
  // console.log("CPOP rtg_id: ", rtg_id);
  // console.log("CPOP item_master_id: ", item_master_id);
  // console.log("CPOP opn_id: ", opn_id);

  // let minutesWorked = 630;
  let minutesWorked = 0;
  minutesWorked = convertHourToMinute(time_process_by_opn);
  // console.log("minutesWorked: ", minutesWorked);
  // let startTime = new Date(endOfWork);

  let shifts = shift_all;
  let cal_index = 0;
  let first_cal = false;
  let main_date_cal = "2024-02-29";
  let main_min_cal = "08:00:00";
  let first_day_stop = false;
  let stamp_date = "2024-02-29 08:00:00";

  // console.log("CPOP set_up_time: ", "1111111");

  let strEndOfWork = await TempOpnTmp.findDueDateByRouting(
    doc_running,
    rtg_id,
    item_master_id,
    opn_id
  );
  console.log("CTOOD strEndOfWork: ", strEndOfWork);

  let ced1 = new Date(strEndOfWork[0].opn_end_date_time);
  let ced2 = new Date(ced1.getTime() + 420 * 60 * 1000); // แปลงเป็นมิลลิวินาทีแล้วลบ
  const formattedDate = ced2
    .toISOString()
    .replace("T", " ")
    .replace(".000Z", "");

  strEndOfWork = formattedDate;
  let f1 = strEndOfWork.split(" ");
  let formattedDate2 = f1[0];
  console.log("CTOOD strEndOfWork: ", strEndOfWork);
  console.log("CTOOD formattedDate2: ", formattedDate2);

  // ------- check holiday -------
  const searchIndex = holiday_all.findIndex(
    (item) => item.date_rom == formattedDate2
  );
  console.log("CTOOD cal_index searchIndex: ", searchIndex);
  console.log("CTOOD cal_index holiday_all: ", JSON.stringify(holiday_all));

  if (searchIndex > -1) {
    console.log("CTOOD searchIndex > -1 111");
    const { holiday_type, hours } = holiday_all[searchIndex];

    // console.log(
    //   `Holiday found on ${formattedDate2}: Type - ${holiday_type}, Hours - ${hours}`
    // );
    // console.log("CTOOD newDate: ", newDate);
    if (holiday_type == "D") {
      let drp = null;
      const newDate = new Date(formattedDate2);
      newDate.setDate(newDate.getDate() - 1);
      drp = newDate.toISOString().replace("T00:00:00.000Z", "");

      // console.log("CTOOD holiday_type: ", "D");
      // console.log("CTOOD shift.date_cal: ", formattedDate2);
      // console.log("CTOOD newDate: ", newDate);
      // console.log("CTOOD drp: ", drp);
      formattedDate2 = drp;
      strEndOfWork = drp;
    } else if (holiday_type == "H") {
      let cm = convertHourToMinute(hours);
      minutesWorked = minutesWorked + cm;
    } else if (holiday_type == "I") {
      let cm = convertHourToMinute(hours);
      minutesWorked = minutesWorked - cm;
    }
  }

  // ------- check holiday -------
  console.log("CTOOD formattedDate2: ", formattedDate2);
  // // Replace date_cal with "2024-02-28"
  const newDate = formattedDate2;
  // console.log("CPOPOVL newDate: ", newDate);
  shifts.forEach((shift) => {
    shift.date_cal = newDate;
    shift.summary_time = shift.summary_time * 60;
  });

  // console.log("shifts main: ", JSON.stringify(shifts));

  // const endOfWork = new Date("2024-02-29 16:00:00");
  // const strEndOfWork = "2024-02-29 16:00:00";

  // ตรวจสอบว่าวันสิ้นสุดต้องอยู่ในช่วงเวลาของกะ
  let isInShift = false;
  for (let i = shifts.length - 1; i >= 0; i--) {
    main_date_cal = shifts[i].date_cal;
    const shift = shifts[i];
    // console.log("Intersec shift: ", shift);
    const shiftStartTime = `${shift.date_cal} ${shift.start_time}`;
    const shiftEndTime = `${shift.date_cal} ${shift.end_time}`;
    // console.log("CTOOD Intersec shiftStartTime: ", shiftStartTime);
    // console.log("CTOOD Intersec shiftEndTime: ", shiftEndTime);

    if (isDateBetween(shiftStartTime, shiftEndTime, strEndOfWork)) {
      isInShift = true;
      cal_index = shift.index;
      break;
    }
  }

  // console.log("isInShift: ", isInShift);
  // console.log("cal_index: ", cal_index);

  if (cal_index > 0) {
    cal_index = cal_index - 1;
  }

  // วน loop เช็ควันแรกที่เริ่มทำงาน ตามกะที่เหลือ
  // เริ่มลบเวลาตามกะ
  for (let i = cal_index; i >= 0; i--) {
    const shift = shifts[i];
    // console.log("cal_index shift N1: ", shift);
    // console.log("cal_index shift N1 shift.date_cal: ", shift.date_cal);

    // console.log("minutesWorked: ", minutesWorked);
    let shiftStartTime = `${shift.date_cal} ${shift.start_time}`;
    let shiftEndTime = `${shift.date_cal} ${shift.end_time}`;

    console.log("CTOOD shiftStartTime: ", shiftStartTime);
    console.log("CTOOD shiftEndTime: ", shiftEndTime);
    // console.log("strEndOfWork: ", strEndOfWork);

    // do {
    // คำนวนครั้งแรก ให้ใช้ endOfWork แทน end_time
    if (first_cal == false) {
      shiftEndTime = strEndOfWork;
      console.log("CTOOD first_cal111: ", "True");
      console.log("CTOOD shiftStartTime111: ", shiftStartTime);
      console.log("CTOOD shiftEndTime111: ", shiftEndTime);
      // main_date_cal = endOfWork;
      // หาเวลาคงเหลือ

      let minDiff = calculateTimeDifference(shiftStartTime, shiftEndTime);
      console.log("CTOOD minDiff11: ", minDiff);
      minutesWorked = minutesWorked - minDiff;
      console.log("CTOOD minutesWorked11: ", minutesWorked);
      first_cal = true;
    } else {
      console.log("CTOOD first_cal222: ", "False");
      console.log("CTOOD shiftEndTime222: ", shiftEndTime);
      console.log("CTOOD shiftStartTime222: ", shiftStartTime);
      // หาเวลาคงเหลือ
      let minDiff = calculateTimeDifference(shiftStartTime, shiftEndTime);
      console.log("CTOOD minDiff22: ", minDiff);
      minutesWorked = minutesWorked - minDiff;
      console.log("CTOOD minutesWorked22: ", minutesWorked);
    }
    // } while (minutesWorked >= 0);

    if (minutesWorked <= 0) {
      console.log("CTOOD minutesWorked shiftStartTime: ", shiftStartTime);
      let mmm = Math.abs(minutesWorked);
      // บวก time zone thailand 7 ชั่วโมง
      const originalDate = new Date(shiftStartTime);
      let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000); // แปลงเป็นมิลลิวินาทีแล้วลบ
      console.log("CTOOD minutesWorked originalDate: ", originalDate);
      newDate = new Date(newDate.getTime() + mmm * 60 * 1000); // แปลงเป็นมิลลิวินาทีแล้วลบ
      console.log("CTOOD minutesWorked: ", "minutesWorked <= 0");
      console.log("CTOOD stamp_date main_date_cal: ", newDate);
      first_day_stop = true;
      stamp_date = newDate;
      break;
    }
  }

  // ---------------  start Loop 2 ----------------

  //ถ้าวันแรก ลบเวลาเสร็จแล้ว ให้หยุด ถ้าไม่ให้วน loop ต่อ
  if (first_day_stop == false) {
    console.log("CTOOD minutesWorked main_date_cal: ", main_date_cal);
    console.log("CTOOD minutesWorked: ", "first_day_stop == false");
    do {
      const newDate = new Date(main_date_cal);
      newDate.setDate(newDate.getDate() - 1);

      // ------- check holiday -------
      const searchIndex = holiday_all.findIndex(
        (item) =>
          item.date_rom == newDate.toISOString().replace("T00:00:00.000Z", "")
      );
      console.log("CTOOD cal_index searchIndex: ", searchIndex);
      console.log("CTOOD cal_index holiday_all: ", JSON.stringify(holiday_all));

      if (searchIndex > -1) {
        const { holiday_type, hours } = holiday_all[searchIndex];

        console.log("CTOOD searchIndex > -1 222");
        console.log("CTOOD newDate: ", newDate);
        if (holiday_type == "D") {
          newDate.setDate(newDate.getDate() - 1);
        } else if (holiday_type == "H") {
          let cm = convertHourToMinute(hours);
          minutesWorked = minutesWorked + cm;
        } else if (holiday_type == "I") {
          let cm = convertHourToMinute(hours);
          minutesWorked = minutesWorked - cm;
        }
      }
      console.log("CTOOD newDate: ", newDate);

      // ------- check holiday -------

      console.log(
        "loop main_date_cal main_date_cal Start Loop: ",
        main_date_cal
      );
      console.log("loop main_date_cal newDate Start Loop: ", newDate);

      shifts.forEach((shift) => {
        shift.date_cal = newDate.toISOString().replace("T00:00:00.000Z", "");
      });
      // console.log("shifts: ", JSON.stringify(shifts));
      // console.log("minutesWorked: ", "first_day_stop == false");
      // console.log("main_date_cal: ", main_date_cal);

      for (let i = shifts.length - 1; i >= 0; i--) {
        const shift = shifts[i];
        // console.log("first_day_stop shift: ", shift);
        // console.log("minutesWorked: ", minutesWorked);
        let shiftStartTime = `${shift.date_cal} ${shift.start_time}`;
        let shiftEndTime = `${shift.date_cal} ${shift.end_time}`;

        console.log("CTOOD shiftIndex_loop2: ", shift.index);
        console.log("CTOOD shiftStartTime_loop2: ", shiftStartTime);
        console.log("CTOOD strEndOfWork_loop2: ", shiftEndTime);
        // หาเวลาคงเหลือ
        let minDiff = calculateTimeDifference(shiftStartTime, shiftEndTime);
        console.log("CTOOD minDiff22_loop2: ", minDiff);
        minutesWorked = minutesWorked - minDiff;
        console.log("CTOOD minutesWorked22_loop2: ", minutesWorked);

        if (minutesWorked <= 0) {
          console.log(
            "CTOOD minutesWorked shiftStartTime_loop2: ",
            shiftStartTime
          );
          let mmm = Math.abs(minutesWorked);
          // บวก time zone thailand 7 ชั่วโมง
          const originalDate = new Date(shiftStartTime);
          let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000); // แปลงเป็นมิลลิวินาทีแล้วลบ
          console.log("CTOOD minutesWorked originalDate_loop2: ", originalDate);
          newDate = new Date(newDate.getTime() + mmm * 60 * 1000); // แปลงเป็นมิลลิวินาทีแล้วลบ
          console.log(
            "CTOOD minutesWorked_loop2: ",
            "minutesWorked_loop2 <= 0"
          );
          console.log("CTOOD stamp_date main_date_cal_loop2: ", newDate);
          stamp_date = newDate;
          break;
        }

        if (i == 0) {
          // console.log("loop main_date_cal i == 0 End Loop: ", main_date_cal);
          let newDate = new Date(main_date_cal);
          newDate.setDate(newDate.getDate() - 1);

          shifts.forEach((shift) => {
            shift.date_cal = newDate
              .toISOString()
              .replace("T00:00:00.000Z", "");
          });

          // console.log("CTOOD loop main_date_cal shifts End Loop: ", shifts);

          console.log("CTOOD loop main_date_cal newDate End Loop: ", newDate);

          let ct = newDate.toISOString().split("T");
          main_date_cal = ct[0];
          console.log("CTOOD loop main_date_cal End Loop: ", main_date_cal);
        }
      }
      console.log("CTOOD End Loop minutesWorked: ", minutesWorked);
    } while (minutesWorked >= 0);
    console.log("CTOOD End While Loop");
  }

  try {
    stamp_date = stamp_date
      .toISOString()
      .replace("T", " ")
      .replace(".000Z", "");
  } catch (error) {
    console.log("CPOP stamp_date error: ", error);
    stamp_date = stamp_date.toString().replace("T", " ").replace(".000Z", "");
  }
  let data_due_date = {
    opn_start_date_time: stamp_date,
    time_process_by_opn: time_process_by_opn,
    real_qty_order_scrap_by_opn: real_qty_order_scrap_by_opn,
  };

  try {
    await TempOpnTmp.update(
      doc_running,
      rtg_id,
      item_master_id,
      opn_id,
      data_due_date
    );
  } catch (error) {
    console.log("TempOpnTmp.update error: ", error);
  }

  return stamp_date;
}

async function calculateTempOpnOrdOverLabDate(
  order_qty,
  machine_all,
  holiday_all,
  shift_all,
  real_qty_order_scrap_by_opn,
  set_up_time,
  time_process_by_opn,
  over_lap_time_cal,
  doc_running,
  rtg_id,
  item_master_id,
  opn_id
) {
  // console.log("CPOPOVL order_qty: ", order_qty);
  // console.log("CPOPOVL machine_all: ", machine_all);
  // console.log("CPOPOVL holiday_all: ", holiday_all);
  // console.log("CPOPOVL shift_all: ", shift_all);
  // console.log(
  //   "CPOPOVL real_qty_order_scrap_by_opn: ",
  //   real_qty_order_scrap_by_opn
  // );
  // console.log("CPOPOVL set_up_time: ", set_up_time);
  // console.log("CPOPOVL time_process_by_opn: ", time_process_by_opn);
  // console.log("CPOPOVL over_lap_time_cal: ", over_lap_time_cal);
  // console.log("CPOPOVL doc_running: ", doc_running);
  // console.log("CPOPOVL rtg_id: ", rtg_id);
  // console.log("CPOPOVL item_master_id: ", item_master_id);
  // console.log("CPOPOVL opn_id: ", opn_id);

  // let minutesWorked = 630;
  let minutesWorked = 0;
  minutesWorked = convertHourToMinute(time_process_by_opn);
  // console.log("CPOPOVL minutesWorked: ", minutesWorked);
  // let startTime = new Date(endOfWork);

  let shifts = shift_all;
  let cal_index = 0;
  let first_cal = false;
  let main_date_cal = "2024-02-29";
  let main_min_cal = "08:00:00";
  let first_day_stop = false;
  let stamp_date = "2024-02-29 08:00:00";

  // console.log("CPOPOVL set_up_time: ", "1111111");

  // let strEndOfWork = await TempOpnTmp.findDueDateByRouting(
  //   doc_running,
  //   rtg_id,
  //   item_master_id,
  //   opn_id
  // );

  // let ced1 = new Date(strEndOfWork[0].opn_end_date_time);
  // let ced2 = new Date(ced1.getTime() + 420 * 60 * 1000); // แปลงเป็นมิลลิวินาทีแล้วลบ
  // const formattedDate = ced2
  //   .toISOString()
  //   .replace("T", " ")
  //   .replace(".000Z", "");

  let strEndOfWork = null;
  const formattedDate = over_lap_time_cal
    .toISOString()
    .replace("T", " ")
    .replace(".000Z", "");

  strEndOfWork = formattedDate;
  let f1 = strEndOfWork.split(" ");
  let formattedDate2 = f1[0];
  // console.log("CPOPOVL strEndOfWork: ", strEndOfWork);
  // console.log("CPOPOVL formattedDate2: ", formattedDate2);

  // ------- check holiday -------
  const searchIndex = holiday_all.findIndex(
    (item) => item.date_rom == formattedDate2
  );
  // console.log("cal_index searchIndex: ", searchIndex);
  // console.log("cal_index holiday_all: ", JSON.stringify(holiday_all));

  if (searchIndex > -1) {
    const { holiday_type, hours } = holiday_all[searchIndex];

    // console.log(
    //   `Holiday found on ${formattedDate2}: Type - ${holiday_type}, Hours - ${hours}`
    // );

    if (holiday_type == "D") {
      let drp = null;
      const newDate = new Date(formattedDate2);
      newDate.setDate(newDate.getDate() + 1);
      drp = newDate.toISOString().replace("T00:00:00.000Z", "");

      // console.log("CPOPOVL holiday_type: ", "D");
      // console.log("CPOPOVL shift.date_cal: ", formattedDate2);
      // console.log("CPOPOVL newDate: ", newDate);
      // console.log("CPOPOVL drp: ", drp);
      formattedDate2 = drp;
      strEndOfWork = drp;
    } else if (holiday_type == "H") {
      let cm = convertHourToMinute(hours);
      minutesWorked = minutesWorked + cm;
    } else if (holiday_type == "I") {
      let cm = convertHourToMinute(hours);
      minutesWorked = minutesWorked - cm;
    }
  }

  // ------- check holiday -------

  // // Replace date_cal with "2024-02-28"
  const newDate = formattedDate2;
  shifts.forEach((shift) => {
    shift.date_cal = newDate;
    // shift.summary_time = shift.summary_time * 60;
  });

  // console.log("CPOPOVL shifts main: ", JSON.stringify(shifts));

  // const endOfWork = new Date("2024-02-29 16:00:00");
  // const strEndOfWork = "2024-02-29 16:00:00";

  // ตรวจสอบว่าวันสิ้นสุดต้องอยู่ในช่วงเวลาของกะ
  let isInShift = false;
  for (let i = shifts.length - 1; i >= 0; i--) {
    main_date_cal = shifts[i].date_cal;
    const shift = shifts[i];
    // console.log("CPOPOVL Intersec shift: ", shift);
    const shiftStartTime = `${shift.date_cal} ${shift.start_time}`;
    const shiftEndTime = `${shift.date_cal} ${shift.end_time}`;
    // console.log("CPOPOVL Intersec shiftStartTime: ", shiftStartTime);
    // console.log("CPOPOVL Intersec shiftEndTime: ", shiftEndTime);

    if (isDateBetween(shiftStartTime, shiftEndTime, strEndOfWork)) {
      isInShift = true;
      cal_index = shift.index;
      break;
    }
  }

  // console.log("CPOPOVL isInShift: ", isInShift);
  // console.log("CPOPOVL cal_index: ", cal_index);

  // วน loop เช็ควันแรกที่เริ่มทำงาน ตามกะที่เหลือ
  // เริ่มลบเวลาตามกะ
  for (let i = cal_index; i < shifts.length; i++) {
    const shift = shifts[i];
    let tmp_mindiff = 0;
    // console.log("CPOPOVL cal_index shift: ", shift);
    // console.log("minutesWorked: ", minutesWorked);

    let shiftStartTime = `${shift.date_cal} ${shift.start_time}`;
    let shiftEndTime = `${shift.date_cal} ${shift.end_time}`;

    // console.log("CPOPOVL shiftStartTime: ", shiftStartTime);
    // console.log("CPOPOVL shiftEndTime: ", shiftEndTime);
    // console.log("CPOPOVL strEndOfWork: ", strEndOfWork);

    // คำนวนครั้งแรก ให้ใช้ endOfWork แทน end_time
    if (first_cal == false) {
      // shiftEndTime = strEndOfWork;
      shiftStartTime = strEndOfWork;
      // console.log("CPOPOVL first_cal111: ", "True");
      // console.log("CPOPOVL shiftStartTime111: ", shiftStartTime);
      // console.log("CPOPOVL shiftEndTime111: ", shiftEndTime);
      // main_date_cal = endOfWork;
      // หาเวลาคงเหลือ

      let minDiff = calculateTimeDifference(shiftStartTime, shiftEndTime);
      // console.log("CPOPOVL minDiff11: ", minDiff);
      tmp_mindiff = minDiff;
      minutesWorked = minutesWorked - minDiff;
      // console.log("CPOPOVL minutesWorked11: ", minutesWorked);
      first_cal = true;
    } else {
      // console.log("CPOPOVL first_cal222: ", "False");
      // console.log("CPOPOVL shiftEndTime222: ", shiftEndTime);
      // console.log("CPOPOVL shiftStartTime222: ", shiftStartTime);
      // หาเวลาคงเหลือ
      let minDiff = calculateTimeDifference(shiftStartTime, shiftEndTime);
      // console.log("CPOPOVL minDiff22: ", minDiff);
      tmp_mindiff = minDiff;
      minutesWorked = minutesWorked - minDiff;
      // console.log("CPOPOVL minutesWorked22: ", minutesWorked);
    }

    if (minutesWorked <= 0) {
      // console.log("CPOPOVL minutesWorked shiftStartTime: ", shiftStartTime);
      let mmm = tmp_mindiff - Math.abs(minutesWorked);
      // บวก time zone thailand 7 ชั่วโมง
      const originalDate = new Date(shiftStartTime);
      let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000); // แปลงเป็นมิลลิวินาทีแล้วลบ
      // console.log("CPOPOVL minutesWorked originalDate: ", originalDate);
      newDate = new Date(newDate.getTime() + mmm * 60 * 1000); // แปลงเป็นมิลลิวินาทีแล้วลบ
      // console.log("CPOPOVL minutesWorked: ", "minutesWorked <= 0");
      // console.log("CPOPOVL stamp_date main_date_cal: ", newDate);
      first_day_stop = true;
      stamp_date = newDate;
      break;
    }
  }

  // ---------------  start Loop 2 ----------------

  //ถ้าวันแรก ลบเวลาเสร็จแล้ว ให้หยุด ถ้าไม่ให้วน loop ต่อ
  if (first_day_stop == false) {
    // console.log("CPOPOVL minutesWorked: ", "first_day_stop == false");
    do {
      const newDate = new Date(main_date_cal);
      newDate.setDate(newDate.getDate() + 1);

      // ------- check holiday -------
      const searchIndex = holiday_all.findIndex(
        (item) => item.date_rom == main_date_cal
      );
      // console.log("cal_index searchIndex: ", searchIndex);
      // console.log("cal_index holiday_all: ", JSON.stringify(holiday_all));

      if (searchIndex > -1) {
        const { holiday_type, hours } = holiday_all[searchIndex];

        // console.log("searchIndex > 0");

        if (holiday_type == "D") {
          newDate.setDate(newDate.getDate() + 1);
        } else if (holiday_type == "H") {
          let cm = convertHourToMinute(hours);
          minutesWorked = minutesWorked + cm;
        } else if (holiday_type == "I") {
          let cm = convertHourToMinute(hours);
          minutesWorked = minutesWorked - cm;
        }
      }

      // ------- check holiday -------

      // console.log(
      //   "CPOPOVL loop main_date_cal main_date_cal Start Loop: ",
      //   main_date_cal
      // );
      // console.log("CPOPOVL loop main_date_cal newDate Start Loop: ", newDate);

      shifts.forEach((shift) => {
        shift.date_cal = newDate.toISOString().replace("T00:00:00.000Z", "");
      });
      // console.log("CPOPOVL shifts: ", JSON.stringify(shifts));
      // console.log("CPOPOVL minutesWorked: ", "first_day_stop == false");
      // console.log("CPOPOVL main_date_cal: ", main_date_cal);

      for (let i = 0; i < shifts.length; i++) {
        const shift = shifts[i];
        let tmp_mindiff = 0;
        // console.log("CPOPOVL first_day_stop shift: ", shift);
        // console.log("minutesWorked: ", minutesWorked);
        let shiftStartTime = `${shift.date_cal} ${shift.start_time}`;
        let shiftEndTime = `${shift.date_cal} ${shift.end_time}`;

        // console.log("CPOPOVL shiftIndex_loop2: ", shift.index);
        // console.log("CPOPOVL shiftStartTime_loop2: ", shiftStartTime);
        // console.log("CPOPOVL strEndOfWork_loop2: ", shiftEndTime);
        // หาเวลาคงเหลือ
        let minDiff = calculateTimeDifference(shiftStartTime, shiftEndTime);
        // console.log("CPOPOVL minDiff22_loop2: ", minDiff);
        tmp_mindiff = minDiff;
        minutesWorked = minutesWorked - minDiff;
        // console.log("CPOPOVL minutesWorked22_loop2: ", minutesWorked);

        if (minutesWorked <= 0) {
          // console.log(
          //   "CPOPOVL minutesWorked shiftStartTime_loop2: ",
          //   shiftStartTime
          // );
          let mmm = tmp_mindiff - Math.abs(minutesWorked);
          // บวก time zone thailand 7 ชั่วโมง
          const originalDate = new Date(shiftStartTime);
          let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000); // แปลงเป็นมิลลิวินาทีแล้วลบ
          // console.log(
          //   "CPOPOVL minutesWorked originalDate_loop2: ",
          //   originalDate
          // );
          newDate = new Date(newDate.getTime() + mmm * 60 * 1000); // แปลงเป็นมิลลิวินาทีแล้วลบ
          // console.log(
          //   "CPOPOVL minutesWorked_loop2: ",
          //   "CPOPOVL minutesWorked_loop2 <= 0"
          // );
          // console.log("CPOPOVL stamp_date main_date_cal_loop2: ", newDate);
          stamp_date = newDate;
          break;
        }

        if (i == shifts.length - 1 && minutesWorked > 0) {
          // console.log(
          //   "CPOPOVL loop main_date_cal i == 0 End Loop: ",
          //   main_date_cal
          // );
          let newDate = new Date(main_date_cal);
          newDate.setDate(newDate.getDate() + 1);

          shifts.forEach((shift) => {
            shift.date_cal = newDate
              .toISOString()
              .replace("T00:00:00.000Z", "");
          });

          // console.log("CPOPOVL loop main_date_cal shifts End Loop: ", shifts);

          // console.log("CPOPOVL loop main_date_cal newDate End Loop: ", newDate);

          let ct = newDate.toISOString().split("T");
          main_date_cal = ct[0];
          // console.log("CPOPOVL loop main_date_cal End Loop: ", main_date_cal);
        }
      }
    } while (minutesWorked >= 0);
    console.log("CPOPOVL End While Loop");
  }

  // return over_lap_time_cal;
  let tmp_start_date = null;

  try {
    tmp_start_date = over_lap_time_cal
      .toISOString()
      .replace("T", " ")
      .replace(".000Z", "");
    stamp_date = stamp_date
      .toISOString()
      .replace("T", " ")
      .replace(".000Z", "");
  } catch (error) {
    console.log("CPOPOVL error: ", error);
    stamp_date = stamp_date.toString().replace("T", " ").replace(".000Z", "");
  }

  let data_due_date = {
    opn_start_date_time: tmp_start_date,
    opn_end_date_time: stamp_date,
    time_process_by_opn: time_process_by_opn,
    real_qty_order_scrap_by_opn: real_qty_order_scrap_by_opn,
  };

  try {
    await TempOpnTmp.update(
      doc_running,
      rtg_id,
      item_master_id,
      opn_id,
      data_due_date
    );
  } catch (error) {
    console.log("TempOpnTmp.update error: ", error);
  }

  return stamp_date;
}

async function reCalculatePD(doc_running) {
  let res_draft2 = await ProductionOrderTempService.findALLByRoutingV2(
    doc_running
  );

  console.log("pd res_draft2: ", JSON.stringify(res_draft2));

  for (let i = 0; i < res_draft2.length; i++) {
    // console.log("pd res_draft2: ", res_draft2[i].machine_id);

    if (res_draft2[i].dependency == "FS") {
      // FS
      console.log("PD Type FS");

      if (res_draft2[i].overlap_time != 0 && res_draft2[i].predecessor != "0") {
        // SS
        // ถ้าเป็น SS + overlab ต้องมี predecessor id ตลอด , ต้องมี OPN ก่อนหน้าเสมอ
        console.log("PD Type FS + Overlab");
        // console.log("res_draft2[i].predecessor != 0");
        // หา OPN จาก routting id
        let res_rtg_opn = await tbl_routingService.findRoutingByRTGID(
          res_draft2[i].predecessor
        );
        console.log("PD res_rtg_opn: ", JSON.stringify(res_rtg_opn));
        // หา opn_end_date_time จาก opn_id
        let res_predecessor =
          await ProductionOrderTempService.findPOTempByOPNMINEndDate(
            doc_running,
            res_draft2[i].rtg_id,
            res_draft2[i].item_master_id,
            res_rtg_opn[0].opn_id
          );
        // console.log("PD res_rtg_opn[0].opn_id: ", res_rtg_opn[0].opn_id);
        // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
        // console.log(
        //   "PD res_predecessor res_predecessor[0].opn_start_date_time: ",
        //   res_predecessor[0].opn_start_date_time
        // );
        // console.log(
        //   "PD res_predecessor res_predecessor[0].opn_end_date_time: ",
        //   res_predecessor[0].opn_end_date_time
        // );

        const originalDate = new Date(res_predecessor[0].opn_end_date_time);
        // console.log("tmp_overlab originalDate: ", originalDate);
        let tov = convertHourToMinute(res_predecessor[0].overlab_time_cal);
        // console.log("tmp_overlab tov: ", tov);
        let newDate = new Date(originalDate.getTime() + 420 + tov * 60 * 1000); // แปลงเป็นมิล

        let holiday_all = await getHolidayByMachineId(
          res_draft2[i].machine_id,
          res_draft2[i].company_id
        );
        // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
        let shift_all = await getShiftByMachineId(
          res_draft2[i].machine_id,
          res_draft2[i].company_id
        );
        // console.log("PD shift_all2: ", JSON.stringify(shift_all));

        // holiday_all,
        // shift_all,
        // time_process_by_opn,
        // start_date,
        let stamp_end_date = await calculateWorkOrderUpToDown(
          holiday_all,
          shift_all,
          res_draft2[i].time_process_by_opn,
          newDate
        );

        let new_date_start = newDate
          .toISOString()
          .replace("T", " ")
          .replace(".000Z", "");

        // -------- update opn_end_date_time to database ---------
        let data_due_date = {
          opn_start_date_time: new_date_start,
          opn_end_date_time: stamp_end_date,
        };
        await ProductionOrderTempService.updateByID(
          res_draft2[i].id,
          data_due_date
        );
      } else if (
        res_draft2[i].predecessor == "0" &&
        res_draft2[i].overlap_time == 0
      ) {
        // console.log("res_draft2[i].predecessor == 0");
        // เป็น OPN แรก ไม่มี predecessor
        // console.log("PD res_rtg_opn[0].opn_id: ", res_draft2[i].opn_id);
        // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
        console.log(
          "PD FS 0 res_predecessor res_predecessor[0].opn_start_date_time: ",
          res_draft2[i].opn_start_date_time
        );
        // console.log(
        //   "PD res_predecessor res_predecessor[0].opn_end_date_time: ",
        //   res_draft2[i].opn_end_date_time
        // );
        const originalDate = new Date(res_draft2[i].opn_start_date_time);
        let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000);
        console.log("PD FS 0 newDate: ", newDate);

        let holiday_all = await getHolidayByMachineId(
          res_draft2[i].machine_id,
          res_draft2[i].company_id
        );
        // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
        let shift_all = await getShiftByMachineId(
          res_draft2[i].machine_id,
          res_draft2[i].company_id
        );
        // console.log("PD shift_all2: ", JSON.stringify(shift_all));

        // holiday_all,
        // shift_all,
        // time_process_by_opn,
        // start_date,
        let stamp_end_date = await calculateWorkOrderUpToDown(
          holiday_all,
          shift_all,
          res_draft2[i].time_process_by_opn,
          newDate
        );

        let new_date_start = newDate
          .toISOString()
          .replace("T", " ")
          .replace(".000Z", "");

        // -------- update opn_end_date_time to database ---------
        let data_due_date = {
          opn_start_date_time: new_date_start,
          opn_end_date_time: stamp_end_date,
        };
        await ProductionOrderTempService.updateByID(
          res_draft2[i].id,
          data_due_date
        );
      } else if (
        res_draft2[i].predecessor != "0" &&
        res_draft2[i].overlap_time == 0
      ) {
        // console.log("res_draft2[i].predecessor != 0");
        // หา OPN จาก routting id
        let res_rtg_opn = await tbl_routingService.findRoutingByRTGID(
          res_draft2[i].predecessor
        );
        // console.log("PD res_rtg_opn: ", JSON.stringify(res_rtg_opn));
        // หา opn_end_date_time จาก opn_id
        let res_predecessor =
          await ProductionOrderTempService.findPOTempByOPNMINEndDate(
            doc_running,
            res_draft2[i].rtg_id,
            res_draft2[i].item_master_id,
            res_rtg_opn[0].opn_id
          );
        // console.log("PD res_rtg_opn[0].opn_id: ", res_rtg_opn[0].opn_id);
        // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
        // console.log(
        //   "PD res_predecessor res_predecessor[0].opn_start_date_time: ",
        //   res_predecessor[0].opn_start_date_time
        // );
        console.log(
          "PD FS !0 res_predecessor res_predecessor[0].opn_end_date_time: ",
          res_predecessor[0].opn_end_date_time
        );

        const originalDate = new Date(res_predecessor[0].opn_end_date_time);
        let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000);
        console.log("PD FS !0 newDate: ", newDate);

        let holiday_all = await getHolidayByMachineId(
          res_draft2[i].machine_id,
          res_draft2[i].company_id
        );
        // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
        let shift_all = await getShiftByMachineId(
          res_draft2[i].machine_id,
          res_draft2[i].company_id
        );
        // console.log("PD shift_all2: ", JSON.stringify(shift_all));

        // holiday_all,
        // shift_all,
        // time_process_by_opn,
        // start_date,
        let stamp_end_date = await calculateWorkOrderUpToDown(
          holiday_all,
          shift_all,
          res_draft2[i].time_process_by_opn,
          newDate
        );

        let new_date_start = newDate
          .toISOString()
          .replace("T", " ")
          .replace(".000Z", "");

        // -------- update opn_end_date_time to database ---------
        let data_due_date = {
          opn_start_date_time: new_date_start,
          opn_end_date_time: stamp_end_date,
        };
        await ProductionOrderTempService.updateByID(
          res_draft2[i].id,
          data_due_date
        );
      }
    } else if (res_draft2[i].dependency == "SS") {
      // SS
      // ถ้าเป็น SS ต้องมี predecessor id ตลอด , ต้องมี OPN ก่อนหน้าเสมอ
      console.log("PD Type SS");
      if (res_draft2[i].overlap_time != 0 && res_draft2[i].predecessor != "0") {
        // SS
        // ถ้าเป็น SS + overlab ต้องมี predecessor id ตลอด , ต้องมี OPN ก่อนหน้าเสมอ
        console.log("PD Type SS + Overlab");
        // console.log("res_draft2[i].predecessor != 0");
        // หา OPN จาก routting id
        let res_rtg_opn = await tbl_routingService.findRoutingByRTGID(
          res_draft2[i].predecessor
        );
        console.log("PD res_rtg_opn: ", JSON.stringify(res_rtg_opn));
        // หา opn_end_date_time จาก opn_id
        let res_predecessor =
          await ProductionOrderTempService.findPOTempByOPNMINStartDate(
            doc_running,
            res_draft2[i].rtg_id,
            res_draft2[i].item_master_id,
            res_rtg_opn[0].opn_id
          );
        // console.log("PD res_rtg_opn[0].opn_id: ", res_rtg_opn[0].opn_id);
        // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
        // console.log(
        //   "PD res_predecessor res_predecessor[0].opn_start_date_time: ",
        //   res_predecessor[0].opn_start_date_time
        // );
        // console.log(
        //   "PD res_predecessor res_predecessor[0].opn_end_date_time: ",
        //   res_predecessor[0].opn_end_date_time
        // );

        const originalDate = new Date(res_predecessor[0].opn_start_date_time);
        // console.log("tmp_overlab originalDate: ", originalDate);
        let tov = convertHourToMinute(res_predecessor[0].overlab_time_cal);
        // console.log("tmp_overlab tov: ", tov);
        let newDate = new Date(originalDate.getTime() + 420 + tov * 60 * 1000); // แปลงเป็นมิล

        let holiday_all = await getHolidayByMachineId(
          res_draft2[i].machine_id,
          res_draft2[i].company_id
        );
        // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
        let shift_all = await getShiftByMachineId(
          res_draft2[i].machine_id,
          res_draft2[i].company_id
        );
        // console.log("PD shift_all2: ", JSON.stringify(shift_all));

        // holiday_all,
        // shift_all,
        // time_process_by_opn,
        // start_date,
        let stamp_end_date = await calculateWorkOrderUpToDown(
          holiday_all,
          shift_all,
          res_draft2[i].time_process_by_opn,
          newDate
        );

        let new_date_start = newDate
          .toISOString()
          .replace("T", " ")
          .replace(".000Z", "");

        // -------- update opn_end_date_time to database ---------
        let data_due_date = {
          opn_start_date_time: new_date_start,
          opn_end_date_time: stamp_end_date,
        };
        await ProductionOrderTempService.updateByID(
          res_draft2[i].id,
          data_due_date
        );
      } else if (
        res_draft2[i].predecessor == "0" &&
        res_draft2[i].overlap_time == 0
      ) {
        // console.log("res_draft2[i].predecessor == 0");
        // เป็น OPN แรก ไม่มี predecessor
        // console.log("PD res_rtg_opn[0].opn_id: ", res_draft2[i].opn_id);
        // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
        console.log(
          "PD SS 0 res_predecessor res_predecessor[0].opn_start_date_time: ",
          res_draft2[i].opn_start_date_time
        );
        // console.log(
        //   "PD res_predecessor res_predecessor[0].opn_end_date_time: ",
        //   res_draft2[i].opn_end_date_time
        // );

        // let newDate = new Date(res_draft2[i].opn_start_date_time);

        const originalDate = new Date(res_draft2[i].opn_start_date_time);
        let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000);
        console.log("PD SS 0 newDate: ", newDate);

        let holiday_all = await getHolidayByMachineId(
          res_draft2[i].machine_id,
          res_draft2[i].company_id
        );
        // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
        let shift_all = await getShiftByMachineId(
          res_draft2[i].machine_id,
          res_draft2[i].company_id
        );
        // console.log("PD shift_all2: ", JSON.stringify(shift_all));

        // holiday_all,
        // shift_all,
        // time_process_by_opn,
        // start_date,
        let stamp_end_date = await calculateWorkOrderUpToDown(
          holiday_all,
          shift_all,
          res_draft2[i].time_process_by_opn,
          newDate
        );

        let new_date_start = newDate
          .toISOString()
          .replace("T", " ")
          .replace(".000Z", "");

        // -------- update opn_end_date_time to database ---------
        let data_due_date = {
          opn_start_date_time: new_date_start,
          opn_end_date_time: stamp_end_date,
        };
        await ProductionOrderTempService.updateByID(
          res_draft2[i].id,
          data_due_date
        );
      } else if (
        res_draft2[i].predecessor != "0" &&
        res_draft2[i].overlap_time == 0
      ) {
        // console.log("res_draft2[i].predecessor != 0");
        // หา OPN จาก routting id
        let res_rtg_opn = await tbl_routingService.findRoutingByRTGID(
          res_draft2[i].predecessor
        );
        // console.log("PD res_rtg_opn: ", JSON.stringify(res_rtg_opn));
        // หา opn_end_date_time จาก opn_id
        let res_predecessor =
          await ProductionOrderTempService.findPOTempByOPNMINStartDate(
            doc_running,
            res_draft2[i].rtg_id,
            res_draft2[i].item_master_id,
            res_rtg_opn[0].opn_id
          );
        // console.log("PD res_rtg_opn[0].opn_id: ", res_rtg_opn[0].opn_id);
        // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
        console.log(
          "PD SS !0 res_predecessor res_predecessor[0].opn_start_date_time: ",
          res_predecessor[0].opn_start_date_time
        );
        // console.log(
        //   "PD res_predecessor res_predecessor[0].opn_end_date_time: ",
        //   res_predecessor[0].opn_end_date_time
        // );

        // let newDate = new Date(res_predecessor[0].opn_start_date_time);

        const originalDate = new Date(res_predecessor[0].opn_start_date_time);
        let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000);
        console.log("PD SS !0 newDate: ", newDate);

        let holiday_all = await getHolidayByMachineId(
          res_draft2[i].machine_id,
          res_draft2[i].company_id
        );
        // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
        let shift_all = await getShiftByMachineId(
          res_draft2[i].machine_id,
          res_draft2[i].company_id
        );
        // console.log("PD shift_all2: ", JSON.stringify(shift_all));

        // holiday_all,
        // shift_all,
        // time_process_by_opn,
        // start_date,
        let stamp_end_date = await calculateWorkOrderUpToDown(
          holiday_all,
          shift_all,
          res_draft2[i].time_process_by_opn,
          newDate
        );

        let new_date_start = newDate
          .toISOString()
          .replace("T", " ")
          .replace(".000Z", "");

        // -------- update opn_end_date_time to database ---------
        let data_due_date = {
          opn_start_date_time: new_date_start,
          opn_end_date_time: stamp_end_date,
        };
        await ProductionOrderTempService.updateByID(
          res_draft2[i].id,
          data_due_date
        );
      }
    } else if (res_draft2[i].dependency == "FF") {
      // FF

      // ถ้าเป็น FF ต้องมี predecessor id ตลอด , ต้องมี OPN ก่อนหน้าเสมอ
      console.log("PD Type FF");

      if (res_draft2[i].overlap_time != 0 && res_draft2[i].predecessor != "0") {
        // SS
        // ถ้าเป็น SS + overlab ต้องมี predecessor id ตลอด , ต้องมี OPN ก่อนหน้าเสมอ
        console.log("PD Type FF + Overlab");
        // console.log("res_draft2[i].predecessor != 0");
        // หา OPN จาก routting id
        let res_rtg_opn = await tbl_routingService.findRoutingByRTGID(
          res_draft2[i].predecessor
        );
        console.log("PD res_rtg_opn: ", JSON.stringify(res_rtg_opn));
        // หา opn_end_date_time จาก opn_id
        let res_predecessor =
          await ProductionOrderTempService.findPOTempByOPNMINEndDate(
            doc_running,
            res_draft2[i].rtg_id,
            res_draft2[i].item_master_id,
            res_rtg_opn[0].opn_id
          );
        // console.log("PD res_rtg_opn[0].opn_id: ", res_rtg_opn[0].opn_id);
        // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
        // console.log(
        //   "PD res_predecessor res_predecessor[0].opn_start_date_time: ",
        //   res_predecessor[0].opn_start_date_time
        // );
        // console.log(
        //   "PD res_predecessor res_predecessor[0].opn_end_date_time: ",
        //   res_predecessor[0].opn_end_date_time
        // );

        const originalDate = new Date(res_predecessor[0].opn_end_date_time);
        // console.log("tmp_overlab originalDate: ", originalDate);
        let tov = convertHourToMinute(res_predecessor[0].overlab_time_cal);
        // console.log("tmp_overlab tov: ", tov);
        let newDate = new Date(originalDate.getTime() + 420 + tov * 60 * 1000); // แปลงเป็นมิล

        let holiday_all = await getHolidayByMachineId(
          res_draft2[i].machine_id,
          res_draft2[i].company_id
        );
        // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
        let shift_all = await getShiftByMachineId(
          res_draft2[i].machine_id,
          res_draft2[i].company_id
        );
        // console.log("PD shift_all2: ", JSON.stringify(shift_all));

        // holiday_all,
        // shift_all,
        // time_process_by_opn,
        // start_date,
        let new_date_start = await calculateWorkOrderDownToUp(
          holiday_all,
          shift_all,
          res_draft2[i].time_process_by_opn,
          newDate
        );

        let stamp_end_date = newDate
          .toISOString()
          .replace("T", " ")
          .replace(".000Z", "");

        // -------- update opn_end_date_time to database ---------
        let data_due_date = {
          opn_start_date_time: new_date_start,
          opn_end_date_time: stamp_end_date,
        };
        await ProductionOrderTempService.updateByID(
          res_draft2[i].id,
          data_due_date
        );
      } else if (
        res_draft2[i].predecessor == "0" &&
        res_draft2[i].overlap_time == 0
      ) {
        // console.log("res_draft2[i].predecessor == 0");
        // เป็น OPN แรก ไม่มี predecessor
        // console.log("PD res_rtg_opn[0].opn_id: ", res_draft2[i].opn_id);
        // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
        // console.log(
        //   "PD res_predecessor res_predecessor[0].opn_start_date_time: ",
        //   res_draft2[i].opn_start_date_time
        // );
        console.log(
          "PD FF 0 res_predecessor res_predecessor[0].opn_end_date_time: ",
          res_draft2[i].opn_end_date_time
        );

        // let newDate = new Date(res_draft2[i].opn_end_date_time);

        const originalDate = new Date(res_draft2[i].opn_end_date_time);
        let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000);
        console.log("PD FF 0 newDate: ", newDate);

        let holiday_all = await getHolidayByMachineId(
          res_draft2[i].machine_id,
          res_draft2[i].company_id
        );
        // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
        let shift_all = await getShiftByMachineId(
          res_draft2[i].machine_id,
          res_draft2[i].company_id
        );
        // console.log("PD shift_all2: ", JSON.stringify(shift_all));

        // holiday_all,
        // shift_all,
        // time_process_by_opn,
        // start_date,
        let new_date_start = await calculateWorkOrderDownToUp(
          holiday_all,
          shift_all,
          res_draft2[i].time_process_by_opn,
          newDate
        );

        let stamp_end_date = newDate
          .toISOString()
          .replace("T", " ")
          .replace(".000Z", "");

        // -------- update opn_end_date_time to database ---------
        let data_due_date = {
          opn_start_date_time: new_date_start,
          opn_end_date_time: stamp_end_date,
        };
        await ProductionOrderTempService.updateByID(
          res_draft2[i].id,
          data_due_date
        );
      } else if (
        res_draft2[i].predecessor != "0" &&
        res_draft2[i].overlap_time == 0
      ) {
        // console.log("res_draft2[i].predecessor != 0");
        // หา OPN จาก routting id
        let res_rtg_opn = await tbl_routingService.findRoutingByRTGID(
          res_draft2[i].predecessor
        );
        // console.log("PD res_rtg_opn: ", JSON.stringify(res_rtg_opn));
        // หา opn_end_date_time จาก opn_id
        let res_predecessor =
          await ProductionOrderTempService.findPOTempByOPNMINEndDate(
            doc_running,
            res_draft2[i].rtg_id,
            res_draft2[i].item_master_id,
            res_rtg_opn[0].opn_id
          );
        // console.log("PD res_rtg_opn[0].opn_id: ", res_rtg_opn[0].opn_id);
        // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
        // console.log(
        //   "PD res_predecessor res_predecessor[0].opn_start_date_time: ",
        //   res_predecessor[0].opn_start_date_time
        // );
        console.log(
          "PD FF !0 res_predecessor res_predecessor[0].opn_end_date_time: ",
          res_predecessor[0].opn_end_date_time
        );

        // let newDate = new Date(res_predecessor[0].opn_end_date_time);

        const originalDate = new Date(res_predecessor[0].opn_end_date_time);
        let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000);
        console.log("PD FF !0 newDate: ", newDate);

        let holiday_all = await getHolidayByMachineId(
          res_draft2[i].machine_id,
          res_draft2[i].company_id
        );
        // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
        let shift_all = await getShiftByMachineId(
          res_draft2[i].machine_id,
          res_draft2[i].company_id
        );
        // console.log("PD shift_all2: ", JSON.stringify(shift_all));

        // holiday_all,
        // shift_all,
        // time_process_by_opn,
        // start_date,
        let new_date_start = await calculateWorkOrderDownToUp(
          holiday_all,
          shift_all,
          res_draft2[i].time_process_by_opn,
          newDate
        );

        let stamp_end_date = newDate
          .toISOString()
          .replace("T", " ")
          .replace(".000Z", "");

        // -------- update opn_end_date_time to database ---------
        let data_due_date = {
          opn_start_date_time: new_date_start,
          opn_end_date_time: stamp_end_date,
        };
        await ProductionOrderTempService.updateByID(
          res_draft2[i].id,
          data_due_date
        );
      }
    }
  }
}

async function reCalculateAdjustPD(doc_running) {
  let res_draft2 = await TempOpnTmp.findALLByRoutingV2(doc_running);

  console.log("pd res_draft2: ", JSON.stringify(res_draft2));

  for (let i = 0; i < res_draft2.length; i++) {
    // console.log("pd res_draft2: ", res_draft2[i].machine_id);

    if (res_draft2[i].dependency == "FS") {
      // FS
      console.log("PD Type FS");

      if (res_draft2[i].overlap_time != 0 && res_draft2[i].predecessor != "0") {
        // SS
        // ถ้าเป็น SS + overlab ต้องมี predecessor id ตลอด , ต้องมี OPN ก่อนหน้าเสมอ
        console.log("PD Type FS + Overlab");
        // console.log("res_draft2[i].predecessor != 0");
        // หา OPN จาก routting id
        let res_rtg_opn = await tbl_routingService.findRoutingByRTGID(
          res_draft2[i].predecessor
        );
        console.log("PD res_rtg_opn: ", JSON.stringify(res_rtg_opn));
        // หา opn_end_date_time จาก opn_id
        let res_predecessor = await TempOpnTmp.findPOTempByOPNMINEndDate(
          doc_running,
          res_draft2[i].rtg_id,
          res_draft2[i].item_master_id,
          res_rtg_opn[0].opn_id
        );
        // console.log("PD res_rtg_opn[0].opn_id: ", res_rtg_opn[0].opn_id);
        // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
        // console.log(
        //   "PD res_predecessor res_predecessor[0].opn_start_date_time: ",
        //   res_predecessor[0].opn_start_date_time
        // );
        // console.log(
        //   "PD res_predecessor res_predecessor[0].opn_end_date_time: ",
        //   res_predecessor[0].opn_end_date_time
        // );

        const originalDate = new Date(res_predecessor[0].opn_end_date_time);
        // console.log("tmp_overlab originalDate: ", originalDate);
        let tov = convertHourToMinute(res_predecessor[0].overlab_time_cal);
        // console.log("tmp_overlab tov: ", tov);
        let newDate = new Date(originalDate.getTime() + 420 + tov * 60 * 1000); // แปลงเป็นมิล

        let holiday_all = await getHolidayByMachineId(
          res_draft2[i].machine_id,
          res_draft2[i].company_id
        );
        // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
        let shift_all = await getShiftByMachineId(
          res_draft2[i].machine_id,
          res_draft2[i].company_id
        );
        // console.log("PD shift_all2: ", JSON.stringify(shift_all));

        // holiday_all,
        // shift_all,
        // time_process_by_opn,
        // start_date,
        let stamp_end_date = await calculateWorkOrderUpToDown(
          holiday_all,
          shift_all,
          res_draft2[i].time_process_by_opn,
          newDate
        );

        console.log("PD FS + Overlab stamp_end_date: ", stamp_end_date);

        let new_date_start = newDate
          .toISOString()
          .replace("T", " ")
          .replace(".000Z", "");

        // -------- update opn_end_date_time to database ---------
        let data_due_date = {
          opn_start_date_time: new_date_start,
          opn_end_date_time: stamp_end_date,
        };
        await TempOpnTmp.updateByID(res_draft2[i].id, data_due_date);
      } else if (
        res_draft2[i].predecessor == "0" &&
        res_draft2[i].overlap_time == 0
      ) {
        // console.log("res_draft2[i].predecessor == 0");
        // เป็น OPN แรก ไม่มี predecessor
        // console.log("PD res_rtg_opn[0].opn_id: ", res_draft2[i].opn_id);
        // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
        console.log(
          "PD FS 0 res_predecessor res_predecessor[0].opn_start_date_time: ",
          res_draft2[i].opn_start_date_time
        );
        // console.log(
        //   "PD res_predecessor res_predecessor[0].opn_end_date_time: ",
        //   res_draft2[i].opn_end_date_time
        // );
        const originalDate = new Date(res_draft2[i].opn_start_date_time);
        let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000);
        console.log("PD FS 0 newDate: ", newDate);

        let holiday_all = await getHolidayByMachineId(
          res_draft2[i].machine_id,
          res_draft2[i].company_id
        );
        // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
        let shift_all = await getShiftByMachineId(
          res_draft2[i].machine_id,
          res_draft2[i].company_id
        );
        // console.log("PD shift_all2: ", JSON.stringify(shift_all));

        // holiday_all,
        // shift_all,
        // time_process_by_opn,
        // start_date,
        let stamp_end_date = null;
        try {
          stamp_end_date = await calculateWorkOrderUpToDown(
            holiday_all,
            shift_all,
            res_draft2[i].time_process_by_opn,
            newDate
          );
        } catch (error) {
          console.log("PD FS 0 error: ", error);
        }

        console.log("PD FS 0 stamp_end_date: ", stamp_end_date);

        let new_date_start = newDate
          .toISOString()
          .replace("T", " ")
          .replace(".000Z", "");

        // -------- update opn_end_date_time to database ---------
        let data_due_date = {
          opn_start_date_time: new_date_start,
          opn_end_date_time: stamp_end_date,
        };
        console.log("PD FS 0 data_due_date: ", JSON.stringify(data_due_date));
        console.log("PD FS 0 res_draft2[i].id: ", res_draft2[i].id);

        await TempOpnTmp.updateByID(res_draft2[i].id, data_due_date);
      } else if (
        res_draft2[i].predecessor != "0" &&
        res_draft2[i].overlap_time == 0
      ) {
        // console.log("res_draft2[i].predecessor != 0");
        // หา OPN จาก routting id
        let res_rtg_opn = await tbl_routingService.findRoutingByRTGID(
          res_draft2[i].predecessor
        );
        // console.log("PD res_rtg_opn: ", JSON.stringify(res_rtg_opn));
        // หา opn_end_date_time จาก opn_id
        let res_predecessor = await TempOpnTmp.findPOTempByOPNMINEndDate(
          doc_running,
          res_draft2[i].rtg_id,
          res_draft2[i].item_master_id,
          res_rtg_opn[0].opn_id
        );
        // console.log("PD res_rtg_opn[0].opn_id: ", res_rtg_opn[0].opn_id);
        // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
        // console.log(
        //   "PD res_predecessor res_predecessor[0].opn_start_date_time: ",
        //   res_predecessor[0].opn_start_date_time
        // );
        console.log(
          "PD FS !0 res_predecessor res_predecessor[0].opn_end_date_time: ",
          res_predecessor[0].opn_end_date_time
        );

        const originalDate = new Date(res_predecessor[0].opn_end_date_time);
        let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000);
        console.log("PD FS !0 newDate: ", newDate);

        let holiday_all = await getHolidayByMachineId(
          res_draft2[i].machine_id,
          res_draft2[i].company_id
        );
        // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
        let shift_all = await getShiftByMachineId(
          res_draft2[i].machine_id,
          res_draft2[i].company_id
        );
        // console.log("PD shift_all2: ", JSON.stringify(shift_all));

        // holiday_all,
        // shift_all,
        // time_process_by_opn,
        // start_date,
        let stamp_end_date = await calculateWorkOrderUpToDown(
          holiday_all,
          shift_all,
          res_draft2[i].time_process_by_opn,
          newDate
        );
        console.log("PD FS !0 stamp_end_date: ", stamp_end_date);

        let new_date_start = newDate
          .toISOString()
          .replace("T", " ")
          .replace(".000Z", "");

        // -------- update opn_end_date_time to database ---------
        let data_due_date = {
          opn_start_date_time: new_date_start,
          opn_end_date_time: stamp_end_date,
        };
        console.log("PD FS !0 data_due_date: ", JSON.stringify(data_due_date));
        console.log("PD FS !0 res_draft2[i].id: ", res_draft2[i].id);
        await TempOpnTmp.updateByID(res_draft2[i].id, data_due_date);
      }
    } else if (res_draft2[i].dependency == "SS") {
      // SS
      // ถ้าเป็น SS ต้องมี predecessor id ตลอด , ต้องมี OPN ก่อนหน้าเสมอ
      console.log("PD Type SS");
      if (res_draft2[i].overlap_time != 0 && res_draft2[i].predecessor != "0") {
        // SS
        // ถ้าเป็น SS + overlab ต้องมี predecessor id ตลอด , ต้องมี OPN ก่อนหน้าเสมอ
        console.log("PD Type SS + Overlab");
        // console.log("res_draft2[i].predecessor != 0");
        // หา OPN จาก routting id
        let res_rtg_opn = await tbl_routingService.findRoutingByRTGID(
          res_draft2[i].predecessor
        );
        console.log("PD res_rtg_opn: ", JSON.stringify(res_rtg_opn));
        // หา opn_end_date_time จาก opn_id
        let res_predecessor = await TempOpnTmp.findPOTempByOPNMINStartDate(
          doc_running,
          res_draft2[i].rtg_id,
          res_draft2[i].item_master_id,
          res_rtg_opn[0].opn_id
        );
        // console.log("PD res_rtg_opn[0].opn_id: ", res_rtg_opn[0].opn_id);
        // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
        // console.log(
        //   "PD res_predecessor res_predecessor[0].opn_start_date_time: ",
        //   res_predecessor[0].opn_start_date_time
        // );
        // console.log(
        //   "PD res_predecessor res_predecessor[0].opn_end_date_time: ",
        //   res_predecessor[0].opn_end_date_time
        // );

        const originalDate = new Date(res_predecessor[0].opn_start_date_time);
        // console.log("tmp_overlab originalDate: ", originalDate);
        let tov = convertHourToMinute(res_predecessor[0].overlab_time_cal);
        // console.log("tmp_overlab tov: ", tov);
        let newDate = new Date(originalDate.getTime() + 420 + tov * 60 * 1000); // แปลงเป็นมิล

        let holiday_all = await getHolidayByMachineId(
          res_draft2[i].machine_id,
          res_draft2[i].company_id
        );
        // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
        let shift_all = await getShiftByMachineId(
          res_draft2[i].machine_id,
          res_draft2[i].company_id
        );
        // console.log("PD shift_all2: ", JSON.stringify(shift_all));

        // holiday_all,
        // shift_all,
        // time_process_by_opn,
        // start_date,
        let stamp_end_date = await calculateWorkOrderUpToDown(
          holiday_all,
          shift_all,
          res_draft2[i].time_process_by_opn,
          newDate
        );

        let new_date_start = newDate
          .toISOString()
          .replace("T", " ")
          .replace(".000Z", "");

        // -------- update opn_end_date_time to database ---------
        let data_due_date = {
          opn_start_date_time: new_date_start,
          opn_end_date_time: stamp_end_date,
        };
        await TempOpnTmp.updateByID(res_draft2[i].id, data_due_date);
      } else if (
        res_draft2[i].predecessor == "0" &&
        res_draft2[i].overlap_time == 0
      ) {
        // console.log("res_draft2[i].predecessor == 0");
        // เป็น OPN แรก ไม่มี predecessor
        // console.log("PD res_rtg_opn[0].opn_id: ", res_draft2[i].opn_id);
        // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
        console.log(
          "PD SS 0 res_predecessor res_predecessor[0].opn_start_date_time: ",
          res_draft2[i].opn_start_date_time
        );
        // console.log(
        //   "PD res_predecessor res_predecessor[0].opn_end_date_time: ",
        //   res_draft2[i].opn_end_date_time
        // );

        // let newDate = new Date(res_draft2[i].opn_start_date_time);

        const originalDate = new Date(res_draft2[i].opn_start_date_time);
        let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000);
        console.log("PD SS 0 newDate: ", newDate);

        let holiday_all = await getHolidayByMachineId(
          res_draft2[i].machine_id,
          res_draft2[i].company_id
        );
        // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
        let shift_all = await getShiftByMachineId(
          res_draft2[i].machine_id,
          res_draft2[i].company_id
        );
        // console.log("PD shift_all2: ", JSON.stringify(shift_all));

        // holiday_all,
        // shift_all,
        // time_process_by_opn,
        // start_date,
        let stamp_end_date = await calculateWorkOrderUpToDown(
          holiday_all,
          shift_all,
          res_draft2[i].time_process_by_opn,
          newDate
        );

        let new_date_start = newDate
          .toISOString()
          .replace("T", " ")
          .replace(".000Z", "");

        // -------- update opn_end_date_time to database ---------
        let data_due_date = {
          opn_start_date_time: new_date_start,
          opn_end_date_time: stamp_end_date,
        };
        await TempOpnTmp.updateByID(res_draft2[i].id, data_due_date);
      } else if (
        res_draft2[i].predecessor != "0" &&
        res_draft2[i].overlap_time == 0
      ) {
        // console.log("res_draft2[i].predecessor != 0");
        // หา OPN จาก routting id
        let res_rtg_opn = await tbl_routingService.findRoutingByRTGID(
          res_draft2[i].predecessor
        );
        // console.log("PD res_rtg_opn: ", JSON.stringify(res_rtg_opn));
        // หา opn_end_date_time จาก opn_id
        let res_predecessor = await TempOpnTmp.findPOTempByOPNMINStartDate(
          doc_running,
          res_draft2[i].rtg_id,
          res_draft2[i].item_master_id,
          res_rtg_opn[0].opn_id
        );
        // console.log("PD res_rtg_opn[0].opn_id: ", res_rtg_opn[0].opn_id);
        // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
        console.log(
          "PD SS !0 res_predecessor res_predecessor[0].opn_start_date_time: ",
          res_predecessor[0].opn_start_date_time
        );
        // console.log(
        //   "PD res_predecessor res_predecessor[0].opn_end_date_time: ",
        //   res_predecessor[0].opn_end_date_time
        // );

        // let newDate = new Date(res_predecessor[0].opn_start_date_time);

        const originalDate = new Date(res_predecessor[0].opn_start_date_time);
        let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000);
        console.log("PD SS !0 newDate: ", newDate);

        let holiday_all = await getHolidayByMachineId(
          res_draft2[i].machine_id,
          res_draft2[i].company_id
        );
        // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
        let shift_all = await getShiftByMachineId(
          res_draft2[i].machine_id,
          res_draft2[i].company_id
        );
        // console.log("PD shift_all2: ", JSON.stringify(shift_all));

        // holiday_all,
        // shift_all,
        // time_process_by_opn,
        // start_date,
        let stamp_end_date = await calculateWorkOrderUpToDown(
          holiday_all,
          shift_all,
          res_draft2[i].time_process_by_opn,
          newDate
        );

        let new_date_start = newDate
          .toISOString()
          .replace("T", " ")
          .replace(".000Z", "");

        // -------- update opn_end_date_time to database ---------
        let data_due_date = {
          opn_start_date_time: new_date_start,
          opn_end_date_time: stamp_end_date,
        };
        await TempOpnTmp.updateByID(res_draft2[i].id, data_due_date);
      }
    } else if (res_draft2[i].dependency == "FF") {
      // FF

      // ถ้าเป็น FF ต้องมี predecessor id ตลอด , ต้องมี OPN ก่อนหน้าเสมอ
      console.log("PD Type FF");

      if (res_draft2[i].overlap_time != 0 && res_draft2[i].predecessor != "0") {
        // SS
        // ถ้าเป็น SS + overlab ต้องมี predecessor id ตลอด , ต้องมี OPN ก่อนหน้าเสมอ
        console.log("PD Type FF + Overlab");
        // console.log("res_draft2[i].predecessor != 0");
        // หา OPN จาก routting id
        let res_rtg_opn = await tbl_routingService.findRoutingByRTGID(
          res_draft2[i].predecessor
        );
        console.log("PD res_rtg_opn: ", JSON.stringify(res_rtg_opn));
        // หา opn_end_date_time จาก opn_id
        let res_predecessor = await TempOpnTmp.findPOTempByOPNMINEndDate(
          doc_running,
          res_draft2[i].rtg_id,
          res_draft2[i].item_master_id,
          res_rtg_opn[0].opn_id
        );
        // console.log("PD res_rtg_opn[0].opn_id: ", res_rtg_opn[0].opn_id);
        // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
        // console.log(
        //   "PD res_predecessor res_predecessor[0].opn_start_date_time: ",
        //   res_predecessor[0].opn_start_date_time
        // );
        // console.log(
        //   "PD res_predecessor res_predecessor[0].opn_end_date_time: ",
        //   res_predecessor[0].opn_end_date_time
        // );

        const originalDate = new Date(res_predecessor[0].opn_end_date_time);
        // console.log("tmp_overlab originalDate: ", originalDate);
        let tov = convertHourToMinute(res_predecessor[0].overlab_time_cal);
        // console.log("tmp_overlab tov: ", tov);
        let newDate = new Date(originalDate.getTime() + 420 + tov * 60 * 1000); // แปลงเป็นมิล

        let holiday_all = await getHolidayByMachineId(
          res_draft2[i].machine_id,
          res_draft2[i].company_id
        );
        // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
        let shift_all = await getShiftByMachineId(
          res_draft2[i].machine_id,
          res_draft2[i].company_id
        );
        // console.log("PD shift_all2: ", JSON.stringify(shift_all));

        // holiday_all,
        // shift_all,
        // time_process_by_opn,
        // start_date,
        let new_date_start = await calculateWorkOrderDownToUp(
          holiday_all,
          shift_all,
          res_draft2[i].time_process_by_opn,
          newDate
        );

        let stamp_end_date = newDate
          .toISOString()
          .replace("T", " ")
          .replace(".000Z", "");

        // -------- update opn_end_date_time to database ---------
        let data_due_date = {
          opn_start_date_time: new_date_start,
          opn_end_date_time: stamp_end_date,
        };
        await TempOpnTmp.updateByID(res_draft2[i].id, data_due_date);
      } else if (
        res_draft2[i].predecessor == "0" &&
        res_draft2[i].overlap_time == 0
      ) {
        // console.log("res_draft2[i].predecessor == 0");
        // เป็น OPN แรก ไม่มี predecessor
        // console.log("PD res_rtg_opn[0].opn_id: ", res_draft2[i].opn_id);
        // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
        // console.log(
        //   "PD res_predecessor res_predecessor[0].opn_start_date_time: ",
        //   res_draft2[i].opn_start_date_time
        // );
        console.log(
          "PD FF 0 res_predecessor res_predecessor[0].opn_end_date_time: ",
          res_draft2[i].opn_end_date_time
        );

        // let newDate = new Date(res_draft2[i].opn_end_date_time);

        const originalDate = new Date(res_draft2[i].opn_end_date_time);
        let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000);
        console.log("PD FF 0 newDate: ", newDate);

        let holiday_all = await getHolidayByMachineId(
          res_draft2[i].machine_id,
          res_draft2[i].company_id
        );
        // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
        let shift_all = await getShiftByMachineId(
          res_draft2[i].machine_id,
          res_draft2[i].company_id
        );
        // console.log("PD shift_all2: ", JSON.stringify(shift_all));

        // holiday_all,
        // shift_all,
        // time_process_by_opn,
        // start_date,
        let new_date_start = await calculateWorkOrderDownToUp(
          holiday_all,
          shift_all,
          res_draft2[i].time_process_by_opn,
          newDate
        );

        let stamp_end_date = newDate
          .toISOString()
          .replace("T", " ")
          .replace(".000Z", "");

        // -------- update opn_end_date_time to database ---------
        let data_due_date = {
          opn_start_date_time: new_date_start,
          opn_end_date_time: stamp_end_date,
        };
        await TempOpnTmp.updateByID(res_draft2[i].id, data_due_date);
      } else if (
        res_draft2[i].predecessor != "0" &&
        res_draft2[i].overlap_time == 0
      ) {
        // console.log("res_draft2[i].predecessor != 0");
        // หา OPN จาก routting id
        let res_rtg_opn = await tbl_routingService.findRoutingByRTGID(
          res_draft2[i].predecessor
        );
        // console.log("PD res_rtg_opn: ", JSON.stringify(res_rtg_opn));
        // หา opn_end_date_time จาก opn_id
        let res_predecessor = await TempOpnTmp.findPOTempByOPNMINEndDate(
          doc_running,
          res_draft2[i].rtg_id,
          res_draft2[i].item_master_id,
          res_rtg_opn[0].opn_id
        );
        // console.log("PD res_rtg_opn[0].opn_id: ", res_rtg_opn[0].opn_id);
        // // console.log("PD res_predecessor: ", JSON.stringify(res_predecessor));
        // console.log(
        //   "PD res_predecessor res_predecessor[0].opn_start_date_time: ",
        //   res_predecessor[0].opn_start_date_time
        // );
        console.log(
          "PD FF !0 res_predecessor res_predecessor[0].opn_end_date_time: ",
          res_predecessor[0].opn_end_date_time
        );

        // let newDate = new Date(res_predecessor[0].opn_end_date_time);

        const originalDate = new Date(res_predecessor[0].opn_end_date_time);
        let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000);
        console.log("PD FF !0 newDate: ", newDate);

        let holiday_all = await getHolidayByMachineId(
          res_draft2[i].machine_id,
          res_draft2[i].company_id
        );
        // console.log("PD holiday_all2: ", JSON.stringify(holiday_all));
        let shift_all = await getShiftByMachineId(
          res_draft2[i].machine_id,
          res_draft2[i].company_id
        );
        // console.log("PD shift_all2: ", JSON.stringify(shift_all));

        // holiday_all,
        // shift_all,
        // time_process_by_opn,
        // start_date,
        let new_date_start = await calculateWorkOrderDownToUp(
          holiday_all,
          shift_all,
          res_draft2[i].time_process_by_opn,
          newDate
        );

        let stamp_end_date = newDate
          .toISOString()
          .replace("T", " ")
          .replace(".000Z", "");

        // -------- update opn_end_date_time to database ---------
        let data_due_date = {
          opn_start_date_time: new_date_start,
          opn_end_date_time: stamp_end_date,
        };
        await TempOpnTmp.updateByID(res_draft2[i].id, data_due_date);
      }
    }
  }
}

async function calculateDateRangeMinuteUpToDown(
  shift_all,
  opn_start_date_time,
  opn_end_date_time
) {
  let minutesWorked = 0;

  let shifts = shift_all;
  let cal_index = 0;
  let first_cal = false;
  let main_date_cal = "2024-02-29";
  let main_min_cal = "08:00:00";
  let first_day_stop = false;
  let stamp_date = "2024-02-29 08:00:00";

  // console.log("calculateDateRangeMinuteUpToDown set_up_time: 1111111");
  // console.log(
  //   "calculateDateRangeMinuteUpToDown opn_start_date_time: ",
  //   opn_start_date_time
  // );
  // console.log(
  //   "calculateDateRangeMinuteUpToDown opn_end_date_time: ",
  //   opn_end_date_time
  // );

  let strEndOfWork = null;
  // const formattedDate = start_date
  //   .toISOString()
  //   .replace("T", " ")
  //   .replace(".000Z", "");

  let due_date_compare = new Date(opn_end_date_time);
  // let due_date_compare = new Date(
  //   due_date_compare_tmp1.getTime() + 420 * 60 * 1000
  // );

  let ced1 = new Date(opn_start_date_time);
  // let ced2 = new Date(ced1.getTime() + 420 * 60 * 1000); // แปลงเป็นมิลลิวินาทีแล้วลบ
  const formattedDate = ced1
    .toISOString()
    .replace("T", " ")
    .replace(".000Z", "");

  strEndOfWork = formattedDate;
  let f1 = strEndOfWork.split(" ");
  let formattedDate2 = f1[0];
  // console.log("calculateDateRangeMinuteUpToDown strEndOfWork: ", strEndOfWork);
  // console.log("calculateDateRangeMinuteUpToDown formattedDate2: ", formattedDate2);

  // // Replace date_cal with "2024-02-28"
  const newDate = formattedDate2;
  shifts.forEach((shift) => {
    shift.date_cal = newDate;
    // shift.summary_time = shift.summary_time * 60;
  });

  // console.log("calculateDateRangeMinuteUpToDown shifts main: ", JSON.stringify(shifts));

  // const endOfWork = new Date("2024-02-29 16:00:00");
  // const strEndOfWork = "2024-02-29 16:00:00";

  // ตรวจสอบว่าวันสิ้นสุดต้องอยู่ในช่วงเวลาของกะ
  let isInShift = false;
  for (let i = shifts.length - 1; i >= 0; i--) {
    main_date_cal = shifts[i].date_cal;
    const shift = shifts[i];
    // console.log("calculateDateRangeMinuteUpToDown Intersec shift: ", shift);
    const shiftStartTime = `${shift.date_cal} ${shift.start_time}`;
    const shiftEndTime = `${shift.date_cal} ${shift.end_time}`;
    // console.log("calculateDateRangeMinuteUpToDown Intersec shiftStartTime: ", shiftStartTime);
    // console.log("calculateDateRangeMinuteUpToDown Intersec shiftEndTime: ", shiftEndTime);

    if (isDateBetween(shiftStartTime, shiftEndTime, strEndOfWork)) {
      isInShift = true;
      cal_index = shift.index;
      break;
    }
  }

  // console.log("calculateDateRangeMinuteUpToDown isInShift: ", isInShift);
  // console.log("calculateDateRangeMinuteUpToDown cal_index: ", cal_index);

  // วน loop เช็ควันแรกที่เริ่มทำงาน ตามกะที่เหลือ
  // เริ่มลบเวลาตามกะ
  for (let i = cal_index; i < shifts.length; i++) {
    const shift = shifts[i];
    let tmp_mindiff = 0;
    // console.log("calculateDateRangeMinuteUpToDown cal_index shift: ", shift);
    // console.log("minutesWorked: ", minutesWorked);

    let shiftStartTime = `${shift.date_cal} ${shift.start_time}`;
    let shiftEndTime = `${shift.date_cal} ${shift.end_time}`;

    // console.log(
    //   "calculateDateRangeMinuteUpToDown shiftStartTime: ",
    //   shiftStartTime
    // );
    // console.log(
    //   "calculateDateRangeMinuteUpToDown shiftEndTime: ",
    //   shiftEndTime
    // );
    // console.log(
    //   "calculateDateRangeMinuteUpToDown strEndOfWork: ",
    //   strEndOfWork
    // );

    // คำนวนครั้งแรก ให้ใช้ endOfWork แทน end_time
    if (first_cal == false) {
      // shiftEndTime = strEndOfWork;
      shiftStartTime = strEndOfWork;
      // console.log("calculateDateRangeMinuteUpToDown first_cal111: ", "True");
      // console.log(
      //   "calculateDateRangeMinuteUpToDown shiftStartTime111: ",
      //   shiftStartTime
      // );
      // console.log(
      //   "calculateDateRangeMinuteUpToDown shiftEndTime111: ",
      //   shiftEndTime
      // );
      // main_date_cal = endOfWork;
      // หาเวลาคงเหลือ

      let minDiff = calculateTimeDifference(shiftStartTime, shiftEndTime);
      minDiff = Math.abs(minDiff);
      // console.log("calculateDateRangeMinuteUpToDown minDiff11: ", minDiff);
      // tmp_mindiff = minDiff;
      // minutesWorked = minutesWorked - minDiff;
      minutesWorked += minDiff;
      console.log(
        "calculateDateRangeMinuteUpToDown minutesWorked11: ",
        minutesWorked
      );
      first_cal = true;
    } else {
      // console.log("calculateDateRangeMinuteUpToDown first_cal222: ", "False");
      // console.log(
      //   "calculateDateRangeMinuteUpToDown shiftEndTime222: ",
      //   shiftEndTime
      // );
      // console.log(
      //   "calculateDateRangeMinuteUpToDown shiftStartTime222: ",
      //   shiftStartTime
      // );
      // หาเวลาคงเหลือ
      let minDiff = calculateTimeDifference(shiftStartTime, shiftEndTime);
      minDiff = Math.abs(minDiff);
      // console.log("calculateDateRangeMinuteUpToDown minDiff22: ", minDiff);
      // tmp_mindiff = minDiff;
      // minutesWorked = minutesWorked - minDiff;
      minutesWorked += minDiff;
      console.log(
        "calculateDateRangeMinuteUpToDown minutesWorked22: ",
        minutesWorked
      );
    }

    let tmp_date_start_compare = new Date(shiftEndTime);
    let date_start_compare = new Date(
      tmp_date_start_compare.getTime() + 420 * 60 * 1000
    ); // แปลงเป็นมิลลิวินาทีแล้วลบ

    console.log(
      "calculateDateRangeMinuteUpToDown first_day due_date_compare: ",
      due_date_compare
    );
    console.log(
      "calculateDateRangeMinuteUpToDown first_day date_start_compare: ",
      date_start_compare
    );

    if (due_date_compare < date_start_compare) {
      console.log("due_date_compare < date_start_compare 44");
      // console.log("calculateDateRangeMinuteUpToDown minutesWorked shiftStartTime: ", shiftStartTime);
      // let mmm = tmp_mindiff - Math.abs(minutesWorked);
      let tmp_date_start_compare3 = new Date(shiftStartTime);
      let date_start_compare3 = new Date(
        tmp_date_start_compare3.getTime() + 420 * 60 * 1000
      ); // แปลงเป็นมิลลิวินาทีแล้วลบ

      let DS = new Date(date_start_compare3)
        .toISOString()
        .replace("T", " ")
        .replace(".000Z", "");
      let DE = new Date(due_date_compare)
        .toISOString()
        .replace("T", " ")
        .replace(".000Z", "");
      let minDiff = calculateTimeDifference(DS, DE);
      minDiff = Math.abs(minDiff);
      console.log("calculateDateRangeMinuteUpToDown minDiff44: ", minDiff);
      // console.log("calculateDateRangeMinuteUpToDown DS44: ", DS);
      // console.log("calculateDateRangeMinuteUpToDown DE44: ", DE);
      minutesWorked += minDiff;
      // console.log("calculateDateRangeMinuteUpToDown minutesWorked33: ", minutesWorked);
      first_day_stop = true;
      break;
    } else {
      console.log("due_date_compare > date_start_compare 44");
    }
  }

  // ---------------  start Loop 2 ----------------
  let c_over = 0;
  let date_start_compare2 = new Date();
  //ถ้าวันแรก ลบเวลาเสร็จแล้ว ให้หยุด ถ้าไม่ให้วน loop ต่อ
  if (first_day_stop == false) {
    // console.log("calculateDateRangeMinuteUpToDown minutesWorked: ", "first_day_stop == false");
    do {
      c_over++;
      const newDate = new Date(main_date_cal);
      newDate.setDate(newDate.getDate() + 1);
      main_date_cal = newDate.toISOString().replace("T00:00:00.000Z", "");

      // console.log(
      //   "calculateDateRangeMinuteUpToDown loop main_date_cal main_date_cal Start Loop: ",
      //   main_date_cal
      // );
      // console.log(
      //   "calculateDateRangeMinuteUpToDown loop main_date_cal newDate Start Loop: ",
      //   newDate
      // );

      shifts.forEach((shift) => {
        shift.date_cal = newDate.toISOString().replace("T00:00:00.000Z", "");
      });
      // console.log("calculateDateRangeMinuteUpToDown shifts: ", JSON.stringify(shifts));
      // console.log(
      //   "calculateDateRangeMinuteUpToDown minutesWorked: ",
      //   "first_day_stop == false"
      // );
      // console.log(
      //   "calculateDateRangeMinuteUpToDown main_date_cal: ",
      //   main_date_cal
      // );

      for (let i = 0; i < shifts.length; i++) {
        const shift = shifts[i];
        let tmp_mindiff = 0;
        // console.log("calculateDateRangeMinuteUpToDown first_day_stop shift: ", shift);
        // console.log("minutesWorked: ", minutesWorked);
        let shiftStartTime = `${shift.date_cal} ${shift.start_time}`;
        let shiftEndTime = `${shift.date_cal} ${shift.end_time}`;

        // console.log("calculateDateRangeMinuteUpToDown shiftIndex_loop2: ", shift.index);
        // console.log(
        //   "calculateDateRangeMinuteUpToDown shiftStartTime_loop2: ",
        //   shiftStartTime
        // );
        // console.log(
        //   "calculateDateRangeMinuteUpToDown strEndOfWork_loop2: ",
        //   shiftEndTime
        // );

        let tmp_date_start_compare2 = new Date(shiftEndTime);
        date_start_compare2 = new Date(
          tmp_date_start_compare2.getTime() + 420 * 60 * 1000
        ); // แปลงเป็นมิลลิวินาทีแล้วลบ

        // console.log(
        //   "calculateDateRangeMinuteUpToDown not_first_day due_date_compare: ",
        //   due_date_compare
        // );
        // console.log(
        //   "calculateDateRangeMinuteUpToDown not_first_day date_start_compare2: ",
        //   date_start_compare2
        // );

        if (due_date_compare < date_start_compare2) {
          // console.log("due_date_compare < date_start_compare2 55");

          let tmp_date_start_compare3 = new Date(shiftStartTime);
          let date_start_compare3 = new Date(
            tmp_date_start_compare3.getTime() + 420 * 60 * 1000
          ); // แปลงเป็นมิลลิวินาทีแล้วลบ

          let DS = new Date(date_start_compare3)
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");
          let DE = new Date(due_date_compare)
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");
          let minDiff = calculateTimeDifference(DS, DE);
          minDiff = Math.abs(minDiff);
          console.log("calculateDateRangeMinuteUpToDown minDiff55: ", minDiff);
          // console.log("calculateDateRangeMinuteUpToDown DS55: ", DS);
          // console.log("calculateDateRangeMinuteUpToDown DE55: ", DE);
          minutesWorked += minDiff;
          // console.log("calculateDateRangeMinuteUpToDown minutesWorked33: ", minutesWorked);
          break;
        }

        // หาเวลาคงเหลือ
        let minDiff = calculateTimeDifference(shiftStartTime, shiftEndTime);
        minDiff = Math.abs(minDiff);
        console.log(
          "calculateDateRangeMinuteUpToDown minDiff33_loop3: ",
          minDiff
        );
        minutesWorked += minDiff;
        // console.log("calculateDateRangeMinuteUpToDown minutesWorked22_loop2: ", minutesWorked);
      }
      // } while (due_date_compare > date_start_compare2);
    } while (c_over < 10);
    // console.log("calculateDateRangeMinuteUpToDown End While Loop");
  }
  // console.log(
  //   "calculateDateRangeMinuteUpToDown End While Loop minutesWorked:",
  //   minutesWorked
  // );
  return minutesWorked;
}

async function calculateReDateUpToDown(
  holiday_all,
  shift_all,
  minutesWorkedCal,
  opn_end_date_time
) {
  let minutesWorked = 0;
  // minutesWorked = convertHourToMinute(time_process_by_opn);
  minutesWorked = minutesWorkedCal;
  // console.log("CPOPOVL minutesWorked: ", minutesWorked);
  // let startTime = new Date(endOfWork);

  let shifts = shift_all;
  let cal_index = 0;
  let first_cal = false;
  let main_date_cal = "2024-02-29";
  let main_min_cal = "08:00:00";
  let first_day_stop = false;
  let stamp_date = "2024-02-29 08:00:00";

  // console.log("CPOPOVL set_up_time: ", "1111111");

  let strEndOfWork = null;
  // const formattedDate = start_date
  //   .toISOString()
  //   .replace("T", " ")
  //   .replace(".000Z", "");

  let ced1 = new Date(opn_end_date_time);
  let ced2 = new Date(ced1.getTime() + 420 * 60 * 1000); // แปลงเป็นมิลลิวินาทีแล้วลบ
  const formattedDate = ced2
    .toISOString()
    .replace("T", " ")
    .replace(".000Z", "");

  strEndOfWork = formattedDate;
  let f1 = strEndOfWork.split(" ");
  let formattedDate2 = f1[0];
  // console.log("CPOPOVL strEndOfWork: ", strEndOfWork);
  // console.log("CPOPOVL formattedDate2: ", formattedDate2);

  // ------- check holiday -------
  const searchIndex = holiday_all.findIndex(
    (item) => item.date_rom == formattedDate2
  );
  // console.log("cal_index searchIndex: ", searchIndex);
  // console.log("cal_index holiday_all: ", JSON.stringify(holiday_all));

  if (searchIndex > -1) {
    const { holiday_type, hours } = holiday_all[searchIndex];

    // console.log(
    //   `Holiday found on ${formattedDate2}: Type - ${holiday_type}, Hours - ${hours}`
    // );

    if (holiday_type == "D") {
      let drp = null;
      const newDate = new Date(formattedDate2);
      newDate.setDate(newDate.getDate() + 1);
      drp = newDate.toISOString().replace("T00:00:00.000Z", "");

      // console.log("CPOPOVL holiday_type: ", "D");
      // console.log("CPOPOVL shift.date_cal: ", formattedDate2);
      // console.log("CPOPOVL newDate: ", newDate);
      // console.log("CPOPOVL drp: ", drp);
      formattedDate2 = drp;
      strEndOfWork = drp;
    } else if (holiday_type == "H") {
      let cm = convertHourToMinute(hours);
      minutesWorked = minutesWorked + cm;
    } else if (holiday_type == "I") {
      let cm = convertHourToMinute(hours);
      minutesWorked = minutesWorked - cm;
    }
  }

  // ------- check holiday -------

  // // Replace date_cal with "2024-02-28"
  const newDate = formattedDate2;
  shifts.forEach((shift) => {
    shift.date_cal = newDate;
    // shift.summary_time = shift.summary_time * 60;
  });

  // console.log("CPOPOVL shifts main: ", JSON.stringify(shifts));

  // const endOfWork = new Date("2024-02-29 16:00:00");
  // const strEndOfWork = "2024-02-29 16:00:00";

  // ตรวจสอบว่าวันสิ้นสุดต้องอยู่ในช่วงเวลาของกะ
  let isInShift = false;
  for (let i = shifts.length - 1; i >= 0; i--) {
    main_date_cal = shifts[i].date_cal;
    const shift = shifts[i];
    // console.log("CPOPOVL Intersec shift: ", shift);
    const shiftStartTime = `${shift.date_cal} ${shift.start_time}`;
    const shiftEndTime = `${shift.date_cal} ${shift.end_time}`;
    // console.log("CPOPOVL Intersec shiftStartTime: ", shiftStartTime);
    // console.log("CPOPOVL Intersec shiftEndTime: ", shiftEndTime);

    if (isDateBetween(shiftStartTime, shiftEndTime, strEndOfWork)) {
      isInShift = true;
      cal_index = shift.index;
      break;
    }
  }

  // console.log("CPOPOVL isInShift: ", isInShift);
  // console.log("CPOPOVL cal_index: ", cal_index);

  // วน loop เช็ควันแรกที่เริ่มทำงาน ตามกะที่เหลือ
  // เริ่มลบเวลาตามกะ
  for (let i = cal_index; i < shifts.length; i++) {
    const shift = shifts[i];
    let tmp_mindiff = 0;
    // console.log("CPOPOVL cal_index shift: ", shift);
    // console.log("minutesWorked: ", minutesWorked);

    let shiftStartTime = `${shift.date_cal} ${shift.start_time}`;
    let shiftEndTime = `${shift.date_cal} ${shift.end_time}`;

    // console.log("CPOPOVL shiftStartTime: ", shiftStartTime);
    // console.log("CPOPOVL shiftEndTime: ", shiftEndTime);
    // console.log("CPOPOVL strEndOfWork: ", strEndOfWork);

    // คำนวนครั้งแรก ให้ใช้ endOfWork แทน end_time
    if (first_cal == false) {
      // shiftEndTime = strEndOfWork;
      shiftStartTime = strEndOfWork;
      // console.log("CPOPOVL first_cal111: ", "True");
      // console.log("CPOPOVL shiftStartTime111: ", shiftStartTime);
      // console.log("CPOPOVL shiftEndTime111: ", shiftEndTime);
      // main_date_cal = endOfWork;
      // หาเวลาคงเหลือ

      let minDiff = calculateTimeDifference(shiftStartTime, shiftEndTime);
      // console.log("CPOPOVL minDiff11: ", minDiff);
      tmp_mindiff = minDiff;
      minutesWorked = minutesWorked - minDiff;
      // console.log("CPOPOVL minutesWorked11: ", minutesWorked);
      first_cal = true;
    } else {
      // console.log("CPOPOVL first_cal222: ", "False");
      // console.log("CPOPOVL shiftEndTime222: ", shiftEndTime);
      // console.log("CPOPOVL shiftStartTime222: ", shiftStartTime);
      // หาเวลาคงเหลือ
      let minDiff = calculateTimeDifference(shiftStartTime, shiftEndTime);
      // console.log("CPOPOVL minDiff22: ", minDiff);
      tmp_mindiff = minDiff;
      minutesWorked = minutesWorked - minDiff;
      // console.log("CPOPOVL minutesWorked22: ", minutesWorked);
    }

    if (minutesWorked <= 0) {
      // console.log("CPOPOVL minutesWorked shiftStartTime: ", shiftStartTime);
      let mmm = tmp_mindiff - Math.abs(minutesWorked);
      // บวก time zone thailand 7 ชั่วโมง
      const originalDate = new Date(shiftStartTime);
      let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000); // แปลงเป็นมิลลิวินาทีแล้วลบ
      // console.log("CPOPOVL minutesWorked originalDate: ", originalDate);
      newDate = new Date(newDate.getTime() + mmm * 60 * 1000); // แปลงเป็นมิลลิวินาทีแล้วลบ
      // console.log("CPOPOVL minutesWorked: ", "minutesWorked <= 0");
      // console.log("CPOPOVL stamp_date main_date_cal: ", newDate);
      first_day_stop = true;
      stamp_date = newDate;
      break;
    }
  }

  // ---------------  start Loop 2 ----------------

  //ถ้าวันแรก ลบเวลาเสร็จแล้ว ให้หยุด ถ้าไม่ให้วน loop ต่อ
  if (first_day_stop == false) {
    // console.log("CPOPOVL minutesWorked: ", "first_day_stop == false");
    do {
      const newDate = new Date(main_date_cal);
      newDate.setDate(newDate.getDate() + 1);

      // ------- check holiday -------
      const searchIndex = holiday_all.findIndex(
        (item) => item.date_rom == main_date_cal
      );
      // console.log("cal_index searchIndex: ", searchIndex);
      // console.log("cal_index holiday_all: ", JSON.stringify(holiday_all));

      if (searchIndex > -1) {
        const { holiday_type, hours } = holiday_all[searchIndex];

        // console.log("searchIndex > 0");

        if (holiday_type == "D") {
          newDate.setDate(newDate.getDate() + 1);
        } else if (holiday_type == "H") {
          let cm = convertHourToMinute(hours);
          minutesWorked = minutesWorked + cm;
        } else if (holiday_type == "I") {
          let cm = convertHourToMinute(hours);
          minutesWorked = minutesWorked - cm;
        }
      }

      // ------- check holiday -------

      // console.log(
      //   "CPOPOVL loop main_date_cal main_date_cal Start Loop: ",
      //   main_date_cal
      // );
      // console.log("CPOPOVL loop main_date_cal newDate Start Loop: ", newDate);

      shifts.forEach((shift) => {
        shift.date_cal = newDate.toISOString().replace("T00:00:00.000Z", "");
      });
      // console.log("CPOPOVL shifts: ", JSON.stringify(shifts));
      // console.log("CPOPOVL minutesWorked: ", "first_day_stop == false");
      // console.log("CPOPOVL main_date_cal: ", main_date_cal);

      for (let i = 0; i < shifts.length; i++) {
        const shift = shifts[i];
        let tmp_mindiff = 0;
        // console.log("CPOPOVL first_day_stop shift: ", shift);
        // console.log("minutesWorked: ", minutesWorked);
        let shiftStartTime = `${shift.date_cal} ${shift.start_time}`;
        let shiftEndTime = `${shift.date_cal} ${shift.end_time}`;

        // console.log("CPOPOVL shiftIndex_loop2: ", shift.index);
        // console.log("CPOPOVL shiftStartTime_loop2: ", shiftStartTime);
        // console.log("CPOPOVL strEndOfWork_loop2: ", shiftEndTime);
        // หาเวลาคงเหลือ
        let minDiff = calculateTimeDifference(shiftStartTime, shiftEndTime);
        // console.log("CPOPOVL minDiff22_loop2: ", minDiff);
        tmp_mindiff = minDiff;
        minutesWorked = minutesWorked - minDiff;
        // console.log("CPOPOVL minutesWorked22_loop2: ", minutesWorked);

        if (minutesWorked <= 0) {
          // console.log(
          //   "CPOPOVL minutesWorked shiftStartTime_loop2: ",
          //   shiftStartTime
          // );
          let mmm = tmp_mindiff - Math.abs(minutesWorked);
          // บวก time zone thailand 7 ชั่วโมง
          const originalDate = new Date(shiftStartTime);
          let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000); // แปลงเป็นมิลลิวินาทีแล้วลบ
          // console.log(
          //   "CPOPOVL minutesWorked originalDate_loop2: ",
          //   originalDate
          // );
          newDate = new Date(newDate.getTime() + mmm * 60 * 1000); // แปลงเป็นมิลลิวินาทีแล้วลบ
          // console.log(
          //   "CPOPOVL minutesWorked_loop2: ",
          //   "CPOPOVL minutesWorked_loop2 <= 0"
          // );
          // console.log("CPOPOVL stamp_date main_date_cal_loop2: ", newDate);
          stamp_date = newDate;
          break;
        }

        if (i == shifts.length - 1 && minutesWorked > 0) {
          // console.log(
          //   "CPOPOVL loop main_date_cal i == 0 End Loop: ",
          //   main_date_cal
          // );
          let newDate = new Date(main_date_cal);
          newDate.setDate(newDate.getDate() + 1);

          shifts.forEach((shift) => {
            shift.date_cal = newDate
              .toISOString()
              .replace("T00:00:00.000Z", "");
          });

          // console.log("CPOPOVL loop main_date_cal shifts End Loop: ", shifts);

          // console.log("CPOPOVL loop main_date_cal newDate End Loop: ", newDate);

          let ct = newDate.toISOString().split("T");
          main_date_cal = ct[0];
          // console.log("CPOPOVL loop main_date_cal End Loop: ", main_date_cal);
        }
      }
    } while (minutesWorked >= 0);
    console.log("CPOPOVL End While Loop");
  }

  // stamp_date = stamp_date.toString().replace("T", " ").replace(".000Z", "");

  let stamp_date2 = new Date(stamp_date)
    .toISOString()
    .replace("T", " ")
    .replace(".000Z", "");
  console.log("CRDDTU stamp_date2: ", stamp_date2);

  return stamp_date2;
}

async function calculateReDateDownToUp(
  holiday_all,
  shift_all,
  minutesWorkedCal,
  opn_end_date_time
) {
  console.log("CRDDTU Function calculateReDateDownToUp Start");
  let minutesWorked = 0;
  // minutesWorked = convertHourToMinute(time_process_by_opn);
  minutesWorked = minutesWorkedCal;
  console.log("CRDDTU minutesWorked: ", minutesWorked);
  // let startTime = new Date(endOfWork);

  let shifts = shift_all;
  let cal_index = 0;
  let first_cal = false;
  let main_date_cal = "2024-02-29";
  let main_min_cal = "08:00:00";
  let first_day_stop = false;
  let stamp_date = "2024-02-29 08:00:00";

  console.log("CRDDTU  set_up_time: 1111111");

  let strEndOfWork = null;

  // let ced1 = new Date(strEndOfWork[0].opn_end_date_time);
  let ced1 = new Date(opn_end_date_time);
  let ced2 = new Date(ced1.getTime() + 420 * 60 * 1000); // แปลงเป็นมิลลิวินาทีแล้วลบ
  const formattedDate = ced2
    .toISOString()
    .replace("T", " ")
    .replace(".000Z", "");

  strEndOfWork = formattedDate;
  let f1 = strEndOfWork.split(" ");
  let formattedDate2 = f1[0];
  // console.log("strEndOfWork: ", strEndOfWork);
  // console.log("formattedDate2: ", formattedDate2);

  // ------- check holiday -------
  const searchIndex = holiday_all.findIndex(
    (item) => item.date_rom == formattedDate2
  );
  // console.log("CRDDTU cal_index searchIndex: ", searchIndex);
  // console.log("CRDDTU cal_index holiday_all: ", JSON.stringify(holiday_all));

  if (searchIndex > -1) {
    // console.log("CRDDTU searchIndex > -1 1111");
    // console.log("CRDDTU  newDate formattedDate2: ", formattedDate2);
    const { holiday_type, hours } = holiday_all[searchIndex];

    // console.log(
    //   `Holiday found on ${formattedDate2}: Type - ${holiday_type}, Hours - ${hours}`
    // );

    if (holiday_type == "D") {
      let drp = null;
      const newDate = new Date(formattedDate2);
      newDate.setDate(newDate.getDate() - 1);
      drp = newDate.toISOString().replace("T00:00:00.000Z", "");

      // console.log("CRDDTU  holiday_type: ", "D");
      // console.log("CRDDTU  shift.date_cal: ", formattedDate2);
      // console.log("CRDDTU  newDate: ", newDate);
      // console.log("CRDDTU  drp: ", drp);
      formattedDate2 = drp;
      strEndOfWork = drp;
    } else if (holiday_type == "H") {
      let cm = convertHourToMinute(hours);
      minutesWorked = minutesWorked + cm;
    } else if (holiday_type == "I") {
      let cm = convertHourToMinute(hours);
      minutesWorked = minutesWorked - cm;
    }
  }

  // ------- check holiday -------
  // console.log("CRDDTU  formattedDate2: ", formattedDate2);
  // // Replace date_cal with "2024-02-28"
  const newDate = formattedDate2;
  // console.log("CRDDTU  newDate: ", newDate);
  shifts.forEach((shift) => {
    shift.date_cal = newDate;
    shift.summary_time = shift.summary_time * 60;
  });

  // console.log("shifts main: ", JSON.stringify(shifts));

  // const endOfWork = new Date("2024-02-29 16:00:00");
  // const strEndOfWork = "2024-02-29 16:00:00";

  // ตรวจสอบว่าวันสิ้นสุดต้องอยู่ในช่วงเวลาของกะ
  let isInShift = false;
  for (let i = shifts.length - 1; i >= 0; i--) {
    main_date_cal = shifts[i].date_cal;
    const shift = shifts[i];
    // console.log("Intersec shift: ", shift);
    const shiftStartTime = `${shift.date_cal} ${shift.start_time}`;
    const shiftEndTime = `${shift.date_cal} ${shift.end_time}`;
    // console.log("Intersec shiftStartTime: ", shiftStartTime);
    // console.log("Intersec shiftEndTime: ", shiftEndTime);

    if (isDateBetween(shiftStartTime, shiftEndTime, strEndOfWork)) {
      isInShift = true;
      cal_index = shift.index;
      break;
    }
  }

  // console.log("CRDDTU isInShift: ", isInShift);
  // console.log("CRDDTU cal_index: ", cal_index);

  if (cal_index > 0) {
    cal_index = cal_index - 1;
  }

  // วน loop เช็ควันแรกที่เริ่มทำงาน ตามกะที่เหลือ
  // เริ่มลบเวลาตามกะ
  for (let i = cal_index; i >= 0; i--) {
    const shift = shifts[i];
    // console.log("cal_index shift N1: ", shift);
    // console.log("cal_index shift N1 shift.date_cal: ", shift.date_cal);

    // console.log("minutesWorked: ", minutesWorked);
    let shiftStartTime = `${shift.date_cal} ${shift.start_time}`;
    let shiftEndTime = `${shift.date_cal} ${shift.end_time}`;

    // console.log("CRDDTU shiftStartTime: ", shiftStartTime);
    // console.log("CRDDTU shiftEndTime: ", shiftEndTime);
    // console.log("strEndOfWork: ", strEndOfWork);

    // do {
    // คำนวนครั้งแรก ให้ใช้ endOfWork แทน end_time
    if (first_cal == false) {
      shiftEndTime = strEndOfWork;
      // console.log("CRDDTU first_cal111: ", "True");
      // console.log("CRDDTU shiftStartTime111: ", shiftStartTime);
      // console.log("CRDDTU shiftEndTime111: ", shiftEndTime);
      // main_date_cal = endOfWork;
      // หาเวลาคงเหลือ

      let minDiff = calculateTimeDifference(shiftStartTime, shiftEndTime);
      minDiff = Math.abs(minDiff);
      console.log("CRDDTU minDiff11: ", minDiff);
      minutesWorked = minutesWorked - minDiff;
      console.log("CRDDTU minutesWorked11: ", minutesWorked);
      first_cal = true;
    } else {
      // console.log("CRDDTU first_cal222: ", "False");
      // console.log("CRDDTU shiftEndTime222: ", shiftEndTime);
      // console.log("CRDDTU shiftStartTime222: ", shiftStartTime);
      // หาเวลาคงเหลือ
      let minDiff = calculateTimeDifference(shiftStartTime, shiftEndTime);
      minDiff = Math.abs(minDiff);
      console.log("CRDDTU minDiff22: ", minDiff);
      minutesWorked = minutesWorked - minDiff;
      console.log("CRDDTU minutesWorked22: ", minutesWorked);
    }
    // } while (minutesWorked >= 0);

    if (minutesWorked <= 0) {
      console.log("CRDDTU minutesWorked shiftStartTime: ", shiftStartTime);
      let mmm = Math.abs(minutesWorked);
      // บวก time zone thailand 7 ชั่วโมง
      const originalDate = new Date(shiftStartTime);
      let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000); // แปลงเป็นมิลลิวินาทีแล้วลบ
      console.log("CRDDTU minutesWorked originalDate: ", originalDate);
      newDate = new Date(newDate.getTime() + mmm * 60 * 1000); // แปลงเป็นมิลลิวินาทีแล้วลบ
      console.log("CRDDTU minutesWorked: ", "minutesWorked <= 0");
      console.log("CRDDTU stamp_date main_date_cal: ", newDate);
      first_day_stop = true;
      stamp_date = newDate;
      break;
    }
  }

  // ---------------  start Loop 2 ----------------

  //ถ้าวันแรก ลบเวลาเสร็จแล้ว ให้หยุด ถ้าไม่ให้วน loop ต่อ
  if (first_day_stop == false) {
    // console.log("CRDDTU minutesWorked main_date_cal: ", main_date_cal);
    // console.log("CRDDTU minutesWorked: ", "first_day_stop == false");
    do {
      const newDate = new Date(main_date_cal);
      newDate.setDate(newDate.getDate() - 1);

      // ------- check holiday -------
      const searchIndex = holiday_all.findIndex(
        (item) => item.date_rom == main_date_cal
      );
      // console.log("CCRDDTU cal_index searchIndex: ", searchIndex);
      // console.log("CCRDDTU cal_index newDate: ", newDate);
      // console.log("CCRDDTU cal_index holiday_all: ", JSON.stringify(holiday_all));

      if (searchIndex > -1) {
        console.log("searchIndex > -1 2222");
        const { holiday_type, hours } = holiday_all[searchIndex];

        // console.log("searchIndex > 0");

        if (holiday_type == "D") {
          newDate.setDate(newDate.getDate() - 1);
          console.log("cal_index newDate: ", newDate);
        } else if (holiday_type == "H") {
          let cm = convertHourToMinute(hours);
          minutesWorked = minutesWorked + cm;
        } else if (holiday_type == "I") {
          let cm = convertHourToMinute(hours);
          minutesWorked = minutesWorked - cm;
        }
      }

      // ------- check holiday -------

      console.log(
        "loop main_date_cal main_date_cal Start Loop: ",
        main_date_cal
      );
      console.log("loop main_date_cal newDate Start Loop: ", newDate);

      shifts.forEach((shift) => {
        shift.date_cal = newDate.toISOString().replace("T00:00:00.000Z", "");
      });
      // console.log("shifts: ", JSON.stringify(shifts));
      // console.log("minutesWorked: ", "first_day_stop == false");
      // console.log("main_date_cal: ", main_date_cal);

      for (let i = shifts.length - 1; i >= 0; i--) {
        const shift = shifts[i];
        // console.log("first_day_stop shift: ", shift);
        // console.log("minutesWorked: ", minutesWorked);
        let shiftStartTime = `${shift.date_cal} ${shift.start_time}`;
        let shiftEndTime = `${shift.date_cal} ${shift.end_time}`;

        // console.log("shiftIndex_loop2: ", shift.index);
        // console.log("CRDDTU shiftStartTime_loop2: ", shiftStartTime);
        // console.log("CRDDTU strEndOfWork_loop2: ", shiftEndTime);
        // หาเวลาคงเหลือ
        let minDiff = calculateTimeDifference(shiftStartTime, shiftEndTime);
        minDiff = Math.abs(minDiff);
        console.log("CRDDTU minDiff22_loop2: ", minDiff);
        minutesWorked = minutesWorked - minDiff;
        // console.log("CRDDTU minutesWorked22_loop2: ", minutesWorked);

        if (minutesWorked <= 0) {
          console.log(
            "CRDDTU minutesWorked shiftStartTime_loop2: ",
            shiftStartTime
          );
          let mmm = Math.abs(minutesWorked);
          // บวก time zone thailand 7 ชั่วโมง
          const originalDate = new Date(shiftStartTime);
          let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000); // แปลงเป็นมิลลิวินาทีแล้วลบ
          console.log(
            "CRDDTU minutesWorked originalDate_loop2: ",
            originalDate
          );
          newDate = new Date(newDate.getTime() + mmm * 60 * 1000); // แปลงเป็นมิลลิวินาทีแล้วลบ
          console.log(
            "CRDDTU minutesWorked_loop2: ",
            "minutesWorked_loop2 <= 0"
          );
          console.log("CRDDTU stamp_date main_date_cal_loop2: ", newDate);
          stamp_date = newDate;
          break;
        }

        if (i == 0) {
          // console.log("loop main_date_cal i == 0 End Loop: ", main_date_cal);
          let newDate = new Date(main_date_cal);
          newDate.setDate(newDate.getDate() - 1);

          shifts.forEach((shift) => {
            shift.date_cal = newDate
              .toISOString()
              .replace("T00:00:00.000Z", "");
          });

          // console.log("loop main_date_cal shifts End Loop: ", shifts);

          // console.log("loop main_date_cal newDate End Loop: ", newDate);

          let ct = newDate.toISOString().split("T");
          main_date_cal = ct[0];
          console.log("loop main_date_cal End Loop: ", main_date_cal);
        }
      }
      // } while (minutesWorked >= 0);
      console.log("CRDDTU minutesWorked:", minutesWorked);
    } while (minutesWorked > 0);
    console.log("CRDDTU End While Loop");
  }

  let stamp_date2 = new Date(stamp_date)
    .toISOString()
    .replace("T", " ")
    .replace(".000Z", "");
  console.log("CRDDTU stamp_date2: ", stamp_date2);
  return stamp_date2;
}

async function calculateWorkOrderUpToDown(
  holiday_all,
  shift_all,
  time_process_by_opn,
  start_date
) {
  console.log("CWORD_UD Start Function calculateWorkOrderUpToDown: ");
  // console.log("CPOPOVL order_qty: ", order_qty);
  // console.log("CPOPOVL machine_all: ", machine_all);
  // console.log("CWORD_UD holiday_all: ", holiday_all);
  // console.log("CWORD_UD shift_all: ", shift_all);
  // console.log(
  //   "CPOPOVL real_qty_order_scrap_by_opn: ",
  //   real_qty_order_scrap_by_opn
  // );
  // console.log("CPOPOVL set_up_time: ", set_up_time);
  console.log("CWORD_UD time_process_by_opn: ", time_process_by_opn);
  console.log("CWORD_UD start_date: ", start_date);
  // console.log("CPOPOVL over_lap_time_cal: ", over_lap_time_cal);
  // console.log("CPOPOVL doc_running: ", doc_running);
  // console.log("CPOPOVL rtg_id: ", rtg_id);
  // console.log("CPOPOVL item_master_id: ", item_master_id);
  // console.log("CPOPOVL opn_id: ", opn_id);

  // let minutesWorked = 630;
  let minutesWorked = 0;
  minutesWorked = convertHourToMinute(time_process_by_opn);
  console.log("CWORD_UD main minutesWorked: ", minutesWorked);
  // let startTime = new Date(endOfWork);

  let shifts = shift_all;
  let cal_index = 0;
  let first_cal = false;
  let main_date_cal = "2024-02-29";
  let main_min_cal = "08:00:00";
  let first_day_stop = false;
  let stamp_date = "2024-02-29 08:00:00";

  console.log("CWORD_UD set_up_time: ", "1111111");

  // let strEndOfWork = await ProductionOrderTempService.findDueDateByRouting(
  //   doc_running,
  //   rtg_id,
  //   item_master_id,
  //   opn_id
  // );

  // let ced1 = new Date(strEndOfWork[0].opn_end_date_time);
  // let ced2 = new Date(ced1.getTime() + 420 * 60 * 1000); // แปลงเป็นมิลลิวินาทีแล้วลบ
  // const formattedDate = ced2
  //   .toISOString()
  //   .replace("T", " ")
  //   .replace(".000Z", "");

  let strEndOfWork = null;
  const formattedDate = start_date
    .toISOString()
    .replace("T", " ")
    .replace(".000Z", "");

  strEndOfWork = formattedDate;
  let f1 = strEndOfWork.split(" ");
  let formattedDate2 = f1[0];
  console.log("CWORD_UD strEndOfWork: ", strEndOfWork);
  console.log("CWORD_UD formattedDate2: ", formattedDate2);

  // ------- check holiday -------
  const searchIndex = holiday_all.findIndex(
    (item) => item.date_rom == formattedDate2
  );
  console.log("CWORD_UD formattedDate2: ", formattedDate2);
  console.log("CWORD_UD cal_index searchIndex 111: ", searchIndex);
  console.log(
    "CWORD_UD cal_index holiday_all 111: ",
    JSON.stringify(holiday_all)
  );

  if (searchIndex > -1) {
    const { holiday_type, hours } = holiday_all[searchIndex];

    // console.log(
    //   `Holiday found on ${formattedDate2}: Type - ${holiday_type}, Hours - ${hours}`
    // );

    console.log("searchIndex > 0 111");

    if (holiday_type == "D") {
      let drp = null;
      const newDate = new Date(formattedDate2);
      newDate.setDate(newDate.getDate() + 1);
      drp = newDate.toISOString().replace("T00:00:00.000Z", "");
      // console.log("CWORD_UD holiday_type: ", "D");
      // console.log("CWORD_UD shift.date_cal: ", formattedDate2);
      // console.log("CWORD_UD newDate: ", newDate);
      // console.log("CWORD_UD drp: ", drp);
      formattedDate2 = drp;
      strEndOfWork = drp;
    } else if (holiday_type == "H") {
      let cm = convertHourToMinute(hours);
      minutesWorked = minutesWorked + cm;
    } else if (holiday_type == "I") {
      let cm = convertHourToMinute(hours);
      minutesWorked = minutesWorked - cm;
    }
  }

  // ------- check holiday -------

  // // Replace date_cal with "2024-02-28"
  const newDate = formattedDate2;
  shifts.forEach((shift) => {
    shift.date_cal = newDate;
    // shift.summary_time = shift.summary_time * 60;
  });

  console.log("CWORD_UD shifts main: ", JSON.stringify(shifts));

  // const endOfWork = new Date("2024-02-29 16:00:00");
  // const strEndOfWork = "2024-02-29 16:00:00";

  // ตรวจสอบว่าวันสิ้นสุดต้องอยู่ในช่วงเวลาของกะ
  let isInShift = false;
  for (let i = shifts.length - 1; i >= 0; i--) {
    main_date_cal = shifts[i].date_cal;
    const shift = shifts[i];
    console.log("CWORD_UD Intersec shift: ", shift);
    const shiftStartTime = `${shift.date_cal} ${shift.start_time}`;
    const shiftEndTime = `${shift.date_cal} ${shift.end_time}`;
    console.log("CWORD_UD Intersec shiftStartTime: ", shiftStartTime);
    console.log("CWORD_UD Intersec shiftEndTime: ", shiftEndTime);

    if (isDateBetween(shiftStartTime, shiftEndTime, strEndOfWork)) {
      isInShift = true;
      cal_index = shift.index;
      break;
    }
  }

  console.log("CWORD_UD isInShift: ", isInShift);
  console.log("CWORD_UD cal_index: ", cal_index);

  // วน loop เช็ควันแรกที่เริ่มทำงาน ตามกะที่เหลือ
  // เริ่มลบเวลาตามกะ
  for (let i = cal_index; i < shifts.length; i++) {
    const shift = shifts[i];
    let tmp_mindiff = 0;
    // console.log("CWORD_UD cal_index shift: ", shift);
    // console.log("CWORD_UD minutesWorked: ", minutesWorked);

    let shiftStartTime = `${shift.date_cal} ${shift.start_time}`;
    let shiftEndTime = `${shift.date_cal} ${shift.end_time}`;

    console.log("CWORD_UD shiftStartTime: ", shiftStartTime);
    console.log("CWORD_UD shiftEndTime: ", shiftEndTime);
    // console.log("CPOPOVL strEndOfWork: ", strEndOfWork);

    // คำนวนครั้งแรก ให้ใช้ endOfWork แทน end_time
    if (first_cal == false) {
      // shiftEndTime = strEndOfWork;
      shiftStartTime = strEndOfWork;
      // console.log("CWORD_UD first_cal111: ", "True");
      // console.log("CWORD_UD shiftStartTime111: ", shiftStartTime);
      // console.log("CWORD_UD shiftEndTime111: ", shiftEndTime);
      // main_date_cal = endOfWork;
      // หาเวลาคงเหลือ

      let minDiff = calculateTimeDifference(shiftStartTime, shiftEndTime);
      minDiff = Math.abs(minDiff);
      console.log("CWORD_UD minDiff11: ", minDiff);
      tmp_mindiff = minDiff;
      minutesWorked = minutesWorked - minDiff;
      console.log("CWORD_UD minutesWorked11: ", minutesWorked);
      first_cal = true;
    } else {
      // console.log("CWORD_UD first_cal222: ", "False");
      // console.log("CWORD_UD shiftEndTime222: ", shiftEndTime);
      // console.log("CWORD_UD shiftStartTime222: ", shiftStartTime);
      // หาเวลาคงเหลือ
      let minDiff = calculateTimeDifference(shiftStartTime, shiftEndTime);
      minDiff = Math.abs(minDiff);
      console.log("CWORD_UD minDiff22: ", minDiff);
      tmp_mindiff = minDiff;
      minutesWorked = minutesWorked - minDiff;
      console.log("CWORD_UD minutesWorked22: ", minutesWorked);
    }

    if (minutesWorked <= 0) {
      console.log("CWORD_UD minutesWorked shiftStartTime: ", shiftStartTime);
      let mmm = tmp_mindiff - Math.abs(minutesWorked);
      // บวก time zone thailand 7 ชั่วโมง
      console.log("CWORD_UD mmm: ", mmm);
      const originalDate = new Date(shiftStartTime);
      let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000); // แปลงเป็นมิลลิวินาทีแล้วลบ
      console.log("CWORD_UD minutesWorked originalDate: ", originalDate);
      newDate = new Date(newDate.getTime() + mmm * 60 * 1000); // แปลงเป็นมิลลิวินาทีแล้วลบ
      console.log("CWORD_UD minutesWorked: ", "minutesWorked <= 0");
      console.log("CWORD_UD stamp_date main_date_cal: ", newDate);
      first_day_stop = true;
      stamp_date = newDate;
      break;
    }
  }

  // ---------------  start Loop 2 ----------------

  //ถ้าวันแรก ลบเวลาเสร็จแล้ว ให้หยุด ถ้าไม่ให้วน loop ต่อ
  if (first_day_stop == false) {
    console.log("CWORD_UD minutesWorked: ", "first_day_stop == false");
    do {
      const newDate = new Date(main_date_cal);
      newDate.setDate(newDate.getDate() + 1);

      // ------- check holiday -------
      // const searchIndex = holiday_all.findIndex(
      //   (item) => item.date_rom == main_date_cal
      // );
      const searchIndex = holiday_all.findIndex(
        (item) =>
          item.date_rom == newDate.toISOString().replace("T00:00:00.000Z", "")
      );

      // console.log("CWORD_UD cal_index searchIndex 222: ", searchIndex);
      // console.log("CWORD_UD newDate: ", newDate);
      // console.log(
      //   "CWORD_UD cal_index holiday_all 222: ",
      //   JSON.stringify(holiday_all)
      // );

      if (searchIndex > -1) {
        const { holiday_type, hours } = holiday_all[searchIndex];

        console.log("searchIndex > 0 222");

        if (holiday_type == "D") {
          newDate.setDate(newDate.getDate() + 1);
          console.log("CWORD_UD newDate: ", newDate);
        } else if (holiday_type == "H") {
          let cm = convertHourToMinute(hours);
          minutesWorked = minutesWorked + cm;
        } else if (holiday_type == "I") {
          let cm = convertHourToMinute(hours);
          minutesWorked = minutesWorked - cm;
        }
      }

      // ------- check holiday -------

      // console.log(
      //   "CPOPOVL loop main_date_cal main_date_cal Start Loop: ",
      //   main_date_cal
      // );
      // console.log("CPOPOVL loop main_date_cal newDate Start Loop: ", newDate);

      shifts.forEach((shift) => {
        shift.date_cal = newDate.toISOString().replace("T00:00:00.000Z", "");
      });
      // console.log("CPOPOVL shifts: ", JSON.stringify(shifts));
      // console.log("CPOPOVL minutesWorked: ", "first_day_stop == false");
      // console.log("CPOPOVL main_date_cal: ", main_date_cal);

      for (let i = 0; i < shifts.length; i++) {
        const shift = shifts[i];
        let tmp_mindiff = 0;
        console.log("CWORD_UD 2222 first_day_stop shift: ", shift);
        // console.log("minutesWorked: ", minutesWorked);
        let shiftStartTime = `${shift.date_cal} ${shift.start_time}`;
        let shiftEndTime = `${shift.date_cal} ${shift.end_time}`;

        // console.log("CWORD_UD shiftIndex_loop2: ", shift.index);
        // console.log("CWORD_UD shiftStartTime_loop2: ", shiftStartTime);
        // console.log("CWORD_UD strEndOfWork_loop2: ", shiftEndTime);
        // หาเวลาคงเหลือ
        let minDiff = calculateTimeDifference(shiftStartTime, shiftEndTime);
        minDiff = Math.abs(minDiff);
        console.log("CWORD_UD minDiff22_loop2: ", minDiff);
        // minDiff = Math.abs(minDiff);
        tmp_mindiff = minDiff;
        minutesWorked = minutesWorked - minDiff;
        console.log("CWORD_UD minutesWorked22_loop2: ", minutesWorked);

        if (minutesWorked <= 0) {
          console.log(
            "CWORD_UD minutesWorked shiftStartTime_loop2: ",
            shiftEndTime
          );
          let mmm = tmp_mindiff - Math.abs(minutesWorked);
          console.log("CWORD_UD mmm: ", mmm);
          // บวก time zone thailand 7 ชั่วโมง
          const originalDate = new Date(shiftEndTime);
          let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000); // แปลงเป็นมิลลิวินาทีแล้วลบ
          console.log(
            "CWORD_UD minutesWorked originalDate_loop2: ",
            originalDate
          );
          let mnw = 0;
          if (minutesWorked == -240) {
            mnw = 0;
          } else {
            mnw = minutesWorked;
          }
          newDate = new Date(newDate.getTime() + mnw * 60 * 1000); // แปลงเป็นมิลลิวินาทีแล้วลบ
          console.log(
            "CWORD_UD minutesWorked_loop2: ",
            "CWORD_UD minutesWorked_loop2 <= 0"
          );
          console.log("CWORD_UD stamp_date main_date_cal_loop2: ", newDate);
          stamp_date = newDate;
          break;
        }

        if (i == shifts.length - 1 && minutesWorked > 0) {
          console.log(
            "CWORD_UD loop main_date_cal i == 0 End Loop: ",
            main_date_cal
          );
          let newDate = new Date(main_date_cal);
          newDate.setDate(newDate.getDate() + 1);

          shifts.forEach((shift) => {
            shift.date_cal = newDate
              .toISOString()
              .replace("T00:00:00.000Z", "");
          });

          console.log("CWORD_UD loop main_date_cal shifts End Loop: ", shifts);

          console.log(
            "CWORD_UD loop main_date_cal newDate End Loop: ",
            newDate
          );

          let ct = newDate.toISOString().split("T");
          main_date_cal = ct[0];
          console.log("CWORD_UD loop main_date_cal End Loop: ", main_date_cal);
        }
      }
      console.log("CWORD_UD check minutesWorked: ", minutesWorked);
    } while (minutesWorked > 0);
    console.log("CWORD_UD End While Loop");
  }

  try {
    stamp_date = stamp_date
      .toISOString()
      .replace("T", " ")
      .replace(".000Z", "");
  } catch (error) {
    console.log("CWORD_UD error: ", error);
    stamp_date = stamp_date.toString().replace("T", " ").replace(".000Z", "");
  }

  console.log("CWORD_UD stamp_date: ", stamp_date);
  return stamp_date;
}

async function calculateWorkOrderDownToUp(
  holiday_all,
  shift_all,
  time_process_by_opn,
  opn_end_date_time
) {
  // // กำหนดข้อมูล
  // const shifts = [
  //   {
  //     index: 0,
  //     shift_name: "กระเช้า",
  //     date_cal: "2024-02-29",
  //     start_time: "08:00:00",
  //     end_time: "12:00:00",
  //     summary_time: 4,
  //   },
  //   {
  //     index: 1,
  //     shift_name: "กระเช้า",
  //     date_cal: "2024-02-29",
  //     start_time: "13:00:00",
  //     end_time: "17:00:00",
  //     summary_time: 4,
  //   },
  //   {
  //     index: 2,
  //     shift_name: "กะB",
  //     date_cal: "2024-02-29",
  //     start_time: "17:01:00",
  //     end_time: "20:00:00",
  //     summary_time: 3,
  //   },
  // ];

  // console.log("CPOP order_qty: ", order_qty);
  // console.log("CPOP machine_all: ", machine_all);
  // console.log("CPOP holiday_all: ", holiday_all);
  // console.log("CPOP shift_all: ", shift_all);
  // console.log(
  //   "CPOP real_qty_order_scrap_by_opn: ",
  //   real_qty_order_scrap_by_opn
  // );
  // console.log("CPOP set_up_time: ", set_up_time);
  // console.log("CPOP time_process_by_opn: ", time_process_by_opn);
  // console.log("CPOP doc_running: ", doc_running);
  // console.log("CPOP rtg_id: ", rtg_id);
  // console.log("CPOP item_master_id: ", item_master_id);
  // console.log("CPOP opn_id: ", opn_id);

  // let minutesWorked = 630;
  let minutesWorked = 0;
  minutesWorked = convertHourToMinute(time_process_by_opn);
  // console.log("minutesWorked: ", minutesWorked);
  // let startTime = new Date(endOfWork);

  let shifts = shift_all;
  let cal_index = 0;
  let first_cal = false;
  let main_date_cal = "2024-02-29";
  let main_min_cal = "08:00:00";
  let first_day_stop = false;
  let stamp_date = "2024-02-29 08:00:00";

  // console.log("CPOP set_up_time: ", "1111111");

  // let strEndOfWork = await ProductionOrderTempService.findDueDateByRouting(
  //   doc_running,
  //   rtg_id,
  //   item_master_id,
  //   opn_id
  // );

  let strEndOfWork = null;

  // let ced1 = new Date(strEndOfWork[0].opn_end_date_time);
  let ced1 = new Date(opn_end_date_time);
  let ced2 = new Date(ced1.getTime() + 420 * 60 * 1000); // แปลงเป็นมิลลิวินาทีแล้วลบ
  const formattedDate = ced2
    .toISOString()
    .replace("T", " ")
    .replace(".000Z", "");

  strEndOfWork = formattedDate;
  let f1 = strEndOfWork.split(" ");
  let formattedDate2 = f1[0];
  // console.log("strEndOfWork: ", strEndOfWork);
  // console.log("formattedDate2: ", formattedDate2);

  // ------- check holiday -------
  const searchIndex = holiday_all.findIndex(
    (item) => item.date_rom == formattedDate2
  );
  // console.log("cal_index searchIndex: ", searchIndex);
  // console.log("cal_index holiday_all: ", JSON.stringify(holiday_all));

  if (searchIndex > -1) {
    const { holiday_type, hours } = holiday_all[searchIndex];

    // console.log(
    //   `Holiday found on ${formattedDate2}: Type - ${holiday_type}, Hours - ${hours}`
    // );

    if (holiday_type == "D") {
      let drp = null;
      const newDate = new Date(formattedDate2);
      newDate.setDate(newDate.getDate() - 1);
      drp = newDate.toISOString().replace("T00:00:00.000Z", "");

      // console.log("CPOPOVL holiday_type: ", "D");
      // console.log("CPOPOVL shift.date_cal: ", formattedDate2);
      // console.log("CPOPOVL newDate: ", newDate);
      // console.log("CPOPOVL drp: ", drp);
      formattedDate2 = drp;
      strEndOfWork = drp;
    } else if (holiday_type == "H") {
      let cm = convertHourToMinute(hours);
      minutesWorked = minutesWorked + cm;
    } else if (holiday_type == "I") {
      let cm = convertHourToMinute(hours);
      minutesWorked = minutesWorked - cm;
    }
  }

  // ------- check holiday -------
  // console.log("CPOPOVL formattedDate2: ", formattedDate2);
  // // Replace date_cal with "2024-02-28"
  const newDate = formattedDate2;
  // console.log("CPOPOVL newDate: ", newDate);
  shifts.forEach((shift) => {
    shift.date_cal = newDate;
    shift.summary_time = shift.summary_time * 60;
  });

  // console.log("shifts main: ", JSON.stringify(shifts));

  // const endOfWork = new Date("2024-02-29 16:00:00");
  // const strEndOfWork = "2024-02-29 16:00:00";

  // ตรวจสอบว่าวันสิ้นสุดต้องอยู่ในช่วงเวลาของกะ
  let isInShift = false;
  for (let i = shifts.length - 1; i >= 0; i--) {
    main_date_cal = shifts[i].date_cal;
    const shift = shifts[i];
    // console.log("Intersec shift: ", shift);
    const shiftStartTime = `${shift.date_cal} ${shift.start_time}`;
    const shiftEndTime = `${shift.date_cal} ${shift.end_time}`;
    // console.log("Intersec shiftStartTime: ", shiftStartTime);
    // console.log("Intersec shiftEndTime: ", shiftEndTime);

    if (isDateBetween(shiftStartTime, shiftEndTime, strEndOfWork)) {
      isInShift = true;
      cal_index = shift.index;
      break;
    }
  }

  // console.log("isInShift: ", isInShift);
  // console.log("cal_index: ", cal_index);

  if (cal_index > 0) {
    cal_index = cal_index - 1;
  }

  // วน loop เช็ควันแรกที่เริ่มทำงาน ตามกะที่เหลือ
  // เริ่มลบเวลาตามกะ
  for (let i = cal_index; i >= 0; i--) {
    const shift = shifts[i];
    // console.log("cal_index shift N1: ", shift);
    // console.log("cal_index shift N1 shift.date_cal: ", shift.date_cal);

    // console.log("minutesWorked: ", minutesWorked);
    let shiftStartTime = `${shift.date_cal} ${shift.start_time}`;
    let shiftEndTime = `${shift.date_cal} ${shift.end_time}`;

    // console.log("shiftStartTime: ", shiftStartTime);
    // console.log("shiftEndTime: ", shiftEndTime);
    // console.log("strEndOfWork: ", strEndOfWork);

    // do {
    // คำนวนครั้งแรก ให้ใช้ endOfWork แทน end_time
    if (first_cal == false) {
      shiftEndTime = strEndOfWork;
      // console.log("first_cal111: ", "True");
      // console.log("shiftStartTime111: ", shiftStartTime);
      // console.log("shiftEndTime111: ", shiftEndTime);
      // main_date_cal = endOfWork;
      // หาเวลาคงเหลือ

      let minDiff = calculateTimeDifference(shiftStartTime, shiftEndTime);
      // console.log("minDiff11: ", minDiff);
      minutesWorked = minutesWorked - minDiff;
      // console.log("minutesWorked11: ", minutesWorked);
      first_cal = true;
    } else {
      // console.log("first_cal222: ", "False");
      // console.log("shiftEndTime222: ", shiftEndTime);
      // console.log("shiftStartTime222: ", shiftStartTime);
      // หาเวลาคงเหลือ
      let minDiff = calculateTimeDifference(shiftStartTime, shiftEndTime);
      // console.log("minDiff22: ", minDiff);
      minutesWorked = minutesWorked - minDiff;
      // console.log("minutesWorked22: ", minutesWorked);
    }
    // } while (minutesWorked >= 0);

    if (minutesWorked <= 0) {
      // console.log("minutesWorked shiftStartTime: ", shiftStartTime);
      let mmm = Math.abs(minutesWorked);
      // บวก time zone thailand 7 ชั่วโมง
      const originalDate = new Date(shiftStartTime);
      let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000); // แปลงเป็นมิลลิวินาทีแล้วลบ
      // console.log("minutesWorked originalDate: ", originalDate);
      newDate = new Date(newDate.getTime() + mmm * 60 * 1000); // แปลงเป็นมิลลิวินาทีแล้วลบ
      // console.log("minutesWorked: ", "minutesWorked <= 0");
      // console.log("stamp_date main_date_cal: ", newDate);
      first_day_stop = true;
      stamp_date = newDate;
      break;
    }
  }

  // ---------------  start Loop 2 ----------------

  //ถ้าวันแรก ลบเวลาเสร็จแล้ว ให้หยุด ถ้าไม่ให้วน loop ต่อ
  if (first_day_stop == false) {
    // console.log("minutesWorked main_date_cal: ", main_date_cal);
    // console.log("minutesWorked: ", "first_day_stop == false");
    do {
      const newDate = new Date(main_date_cal);
      newDate.setDate(newDate.getDate() - 1);

      // ------- check holiday -------
      const searchIndex = holiday_all.findIndex(
        (item) => item.date_rom == main_date_cal
      );
      // console.log("cal_index searchIndex: ", searchIndex);
      // console.log("cal_index holiday_all: ", JSON.stringify(holiday_all));

      if (searchIndex > -1) {
        const { holiday_type, hours } = holiday_all[searchIndex];

        // console.log("searchIndex > 0");

        if (holiday_type == "D") {
          newDate.setDate(newDate.getDate() - 1);
        } else if (holiday_type == "H") {
          let cm = convertHourToMinute(hours);
          minutesWorked = minutesWorked + cm;
        } else if (holiday_type == "I") {
          let cm = convertHourToMinute(hours);
          minutesWorked = minutesWorked - cm;
        }
      }

      // ------- check holiday -------

      // console.log(
      //   "loop main_date_cal main_date_cal Start Loop: ",
      //   main_date_cal
      // );
      // console.log("loop main_date_cal newDate Start Loop: ", newDate);

      shifts.forEach((shift) => {
        shift.date_cal = newDate.toISOString().replace("T00:00:00.000Z", "");
      });
      // console.log("shifts: ", JSON.stringify(shifts));
      // console.log("minutesWorked: ", "first_day_stop == false");
      // console.log("main_date_cal: ", main_date_cal);

      for (let i = shifts.length - 1; i >= 0; i--) {
        const shift = shifts[i];
        // console.log("first_day_stop shift: ", shift);
        // console.log("minutesWorked: ", minutesWorked);
        let shiftStartTime = `${shift.date_cal} ${shift.start_time}`;
        let shiftEndTime = `${shift.date_cal} ${shift.end_time}`;

        // console.log("shiftIndex_loop2: ", shift.index);
        // console.log("shiftStartTime_loop2: ", shiftStartTime);
        // console.log("strEndOfWork_loop2: ", shiftEndTime);
        // หาเวลาคงเหลือ
        let minDiff = calculateTimeDifference(shiftStartTime, shiftEndTime);
        // console.log("minDiff22_loop2: ", minDiff);
        minutesWorked = minutesWorked - minDiff;
        // console.log("minutesWorked22_loop2: ", minutesWorked);

        if (minutesWorked <= 0) {
          // console.log("minutesWorked shiftStartTime_loop2: ", shiftStartTime);
          let mmm = Math.abs(minutesWorked);
          // บวก time zone thailand 7 ชั่วโมง
          const originalDate = new Date(shiftStartTime);
          let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000); // แปลงเป็นมิลลิวินาทีแล้วลบ
          // console.log("minutesWorked originalDate_loop2: ", originalDate);
          newDate = new Date(newDate.getTime() + mmm * 60 * 1000); // แปลงเป็นมิลลิวินาทีแล้วลบ
          // console.log("minutesWorked_loop2: ", "minutesWorked_loop2 <= 0");
          // console.log("stamp_date main_date_cal_loop2: ", newDate);
          stamp_date = newDate;
          break;
        }

        if (i == 0) {
          // console.log("loop main_date_cal i == 0 End Loop: ", main_date_cal);
          let newDate = new Date(main_date_cal);
          newDate.setDate(newDate.getDate() - 1);

          shifts.forEach((shift) => {
            shift.date_cal = newDate
              .toISOString()
              .replace("T00:00:00.000Z", "");
          });

          // console.log("loop main_date_cal shifts End Loop: ", shifts);

          // console.log("loop main_date_cal newDate End Loop: ", newDate);

          let ct = newDate.toISOString().split("T");
          main_date_cal = ct[0];
          // console.log("loop main_date_cal End Loop: ", main_date_cal);
        }
      }
    } while (minutesWorked >= 0);
    console.log("End While Loop");
  }

  try {
    stamp_date = stamp_date
      .toISOString()
      .replace("T", " ")
      .replace(".000Z", "");
  } catch (error) {
    console.log("CPOP stamp_date error: ", error);
    stamp_date = stamp_date.toString().replace("T", " ").replace(".000Z", "");
  }
  // let data_due_date = {
  //   opn_start_date_time: stamp_date,
  //   time_process_by_opn: time_process_by_opn,
  //   real_qty_order_scrap_by_opn: real_qty_order_scrap_by_opn,
  // };

  // try {
  //   await ProductionOrderTempService.update(
  //     doc_running,
  //     rtg_id,
  //     item_master_id,
  //     opn_id,
  //     data_due_date
  //   );
  // } catch (error) {
  //   console.log("ProductionOrderTempService.update error: ", error);
  // }

  return stamp_date;
}

async function getShiftByMachineId(machine_id, company_id) {
  let time_stamp = "2024-02-29";
  let template_shift = [];

  let shift_all = await tbl_routingService.findRoutingShift(
    machine_id,
    company_id
  );
  // console.log("getShiftByMachineId shift_all: ", shift_all);

  let data = shift_all;

  for (let i = 0; i < data.length; i++) {
    data[i].date_cal = time_stamp;
  }

  let shift_index = 0;
  let tmp_shift_model = {
    index: 0,
    shift_name: "กะA",
    date_cal: "2024-02-29",
    start_time: "08:00:00",
    end_time: "17:00:00",
    summary_time: 0,
  };

  for (let i = data.length - 1; i >= 0; i--) {
    //   console.log(data[i]);

    console.log(`Shift: ${data[i].shift_name}`);
    try {
      if (data[i].break_start != null && data[i].break_end != null) {
        tmp_shift_model = {
          index: 0,
          shift_name: "กะA",
          date_cal: "2024-02-29",
          start_time: "08:00:00",
          end_time: "17:00:00",
          summary_time: 0,
        };

        let hourDifference = calculateHourDifference(
          data[i].date_cal + " " + data[i].start_time,
          data[i].date_cal + " " + data[i].break_start
        );

        tmp_shift_model.index = i;
        tmp_shift_model.shift_name = data[i].shift_name;
        tmp_shift_model.date_cal = data[i].date_cal;
        tmp_shift_model.start_time = data[i].start_time;
        tmp_shift_model.end_time = data[i].break_start;
        tmp_shift_model.summary_time = Math.ceil(hourDifference);

        template_shift.push(tmp_shift_model);

        // console.log(
        //   `ความต่างของเวลาในชั่วโมง11: ${Math.ceil(hourDifference)} ชั่วโมง`
        // );

        tmp_shift_model = {
          index: 0,
          shift_name: "กะA",
          date_cal: "2024-02-29",
          start_time: "08:00:00",
          end_time: "17:00:00",
          summary_time: 0,
        };

        let hourDifference2 = calculateHourDifference(
          data[i].date_cal + " " + data[i].break_end,
          data[i].date_cal + " " + data[i].end_time
        );
        shift_index = shift_index++;
        tmp_shift_model.index = i + 1;
        tmp_shift_model.shift_name = data[i].shift_name;
        tmp_shift_model.date_cal = data[i].date_cal;
        tmp_shift_model.start_time = data[i].break_end;
        tmp_shift_model.end_time = data[i].end_time;
        tmp_shift_model.summary_time = Math.ceil(hourDifference2);

        template_shift.push(tmp_shift_model);

        // console.log(
        //   `ความต่างของเวลาในชั่วโมง22: ${Math.ceil(hourDifference2)} ชั่วโมง`
        // );
      } else {
        tmp_shift_model = {
          index: 0,
          shift_name: "กะA",
          date_cal: "2024-02-29",
          start_time: "08:00:00",
          end_time: "17:00:00",
          summary_time: 0,
        };

        let hourDifference3 = calculateHourDifference(
          data[i].date_cal + " " + data[i].start_time,
          data[i].date_cal + " " + data[i].end_time
        );
        shift_index = i + 1;
        tmp_shift_model.index = shift_index;
        tmp_shift_model.shift_name = data[i].shift_name;
        tmp_shift_model.date_cal = data[i].date_cal;
        tmp_shift_model.start_time = data[i].start_time;
        tmp_shift_model.end_time = data[i].end_time;
        // tmp_shift_model.summary_time = Math.ceil(hourDifference3);

        let time = data[i].summary_time; // Input time
        let parts = time.split(":"); // Split the time into [hours, minutes, seconds]
        let hours = parseInt(parts[0], 10); // Convert hours to integer
        tmp_shift_model.summary_time = hours;

        template_shift.push(tmp_shift_model);

        // console.log(
        //   `ความต่างของเวลาในชั่วโมง33: ${Math.ceil(hourDifference3)} ชั่วโมง`
        // );
      }
    } catch (error) {
      console.log("SplitBatch error: ", error);
    }
  }
  shift_index = 0;

  template_shift.sort(function (a, b) {
    return a.index - b.index;
  });
  // console.log("getShiftByMachineId template_shift: ", template_shift);
  return template_shift;
}

async function getHolidayByMachineId(machine_id, company_id) {
  let holiday_all = null;
  holiday_all = await tbl_routingService.findRoutingHolidayByMachineID(
    machine_id,
    company_id
  );
  return holiday_all;
}

async function calculateSplitMachineBatchDateV2(
  holiday_all,
  shift_all,
  production_time,
  opn_end_date_time
) {
  let minutesWorked = 0;
  // minutesWorked = convertHourToMinute(time_process_by_opn);
  // minutesWorked = minutesWorkedCal;
  minutesWorked = convertHourToMinute(production_time);
  // console.log("CPOPOVL minutesWorked: ", minutesWorked);
  // let startTime = new Date(endOfWork);

  let shifts = shift_all;
  let cal_index = 0;
  let first_cal = false;
  let main_date_cal = "2024-02-29";
  let main_min_cal = "08:00:00";
  let first_day_stop = false;
  let stamp_date = "2024-02-29 08:00:00";

  // console.log("CPOPOVL set_up_time: ", "1111111");

  let strEndOfWork = null;
  // const formattedDate = start_date
  //   .toISOString()
  //   .replace("T", " ")
  //   .replace(".000Z", "");

  let ced1 = new Date(opn_end_date_time);
  let ced2 = new Date(ced1.getTime() + 420 * 60 * 1000); // แปลงเป็นมิลลิวินาทีแล้วลบ
  const formattedDate = ced2
    .toISOString()
    .replace("T", " ")
    .replace(".000Z", "");

  strEndOfWork = formattedDate;
  let f1 = strEndOfWork.split(" ");
  let formattedDate2 = f1[0];
  // console.log("CPOPOVL strEndOfWork: ", strEndOfWork);
  // console.log("CPOPOVL formattedDate2: ", formattedDate2);

  // ------- check holiday -------
  const searchIndex = holiday_all.findIndex(
    (item) => item.date_rom == formattedDate2
  );
  // console.log("cal_index searchIndex: ", searchIndex);
  // console.log("cal_index holiday_all: ", JSON.stringify(holiday_all));

  if (searchIndex > -1) {
    const { holiday_type, hours } = holiday_all[searchIndex];

    // console.log(
    //   `Holiday found on ${formattedDate2}: Type - ${holiday_type}, Hours - ${hours}`
    // );

    if (holiday_type == "D") {
      let drp = null;
      const newDate = new Date(formattedDate2);
      newDate.setDate(newDate.getDate() + 1);
      drp = newDate.toISOString().replace("T00:00:00.000Z", "");

      // console.log("CPOPOVL holiday_type: ", "D");
      // console.log("CPOPOVL shift.date_cal: ", formattedDate2);
      // console.log("CPOPOVL newDate: ", newDate);
      // console.log("CPOPOVL drp: ", drp);
      formattedDate2 = drp;
      strEndOfWork = drp;
    } else if (holiday_type == "H") {
      let cm = convertHourToMinute(hours);
      minutesWorked = minutesWorked + cm;
    } else if (holiday_type == "I") {
      let cm = convertHourToMinute(hours);
      minutesWorked = minutesWorked - cm;
    }
  }

  // ------- check holiday -------

  // // Replace date_cal with "2024-02-28"
  const newDate = formattedDate2;
  shifts.forEach((shift) => {
    shift.date_cal = newDate;
    // shift.summary_time = shift.summary_time * 60;
  });

  // console.log("CPOPOVL shifts main: ", JSON.stringify(shifts));

  // const endOfWork = new Date("2024-02-29 16:00:00");
  // const strEndOfWork = "2024-02-29 16:00:00";

  // ตรวจสอบว่าวันสิ้นสุดต้องอยู่ในช่วงเวลาของกะ
  let isInShift = false;
  for (let i = shifts.length - 1; i >= 0; i--) {
    main_date_cal = shifts[i].date_cal;
    const shift = shifts[i];
    // console.log("CPOPOVL Intersec shift: ", shift);
    const shiftStartTime = `${shift.date_cal} ${shift.start_time}`;
    const shiftEndTime = `${shift.date_cal} ${shift.end_time}`;
    // console.log("CPOPOVL Intersec shiftStartTime: ", shiftStartTime);
    // console.log("CPOPOVL Intersec shiftEndTime: ", shiftEndTime);

    if (isDateBetween(shiftStartTime, shiftEndTime, strEndOfWork)) {
      isInShift = true;
      cal_index = shift.index;
      break;
    }
  }

  // console.log("CPOPOVL isInShift: ", isInShift);
  // console.log("CPOPOVL cal_index: ", cal_index);

  // วน loop เช็ควันแรกที่เริ่มทำงาน ตามกะที่เหลือ
  // เริ่มลบเวลาตามกะ
  for (let i = cal_index; i < shifts.length; i++) {
    const shift = shifts[i];
    let tmp_mindiff = 0;
    // console.log("CPOPOVL cal_index shift: ", shift);
    // console.log("minutesWorked: ", minutesWorked);

    let shiftStartTime = `${shift.date_cal} ${shift.start_time}`;
    let shiftEndTime = `${shift.date_cal} ${shift.end_time}`;

    // console.log("CPOPOVL shiftStartTime: ", shiftStartTime);
    // console.log("CPOPOVL shiftEndTime: ", shiftEndTime);
    // console.log("CPOPOVL strEndOfWork: ", strEndOfWork);

    // คำนวนครั้งแรก ให้ใช้ endOfWork แทน end_time
    if (first_cal == false) {
      // shiftEndTime = strEndOfWork;
      shiftStartTime = strEndOfWork;
      // console.log("CPOPOVL first_cal111: ", "True");
      // console.log("CPOPOVL shiftStartTime111: ", shiftStartTime);
      // console.log("CPOPOVL shiftEndTime111: ", shiftEndTime);
      // main_date_cal = endOfWork;
      // หาเวลาคงเหลือ

      let minDiff = calculateTimeDifference(shiftStartTime, shiftEndTime);
      // console.log("CPOPOVL minDiff11: ", minDiff);
      tmp_mindiff = minDiff;
      minutesWorked = minutesWorked - minDiff;
      // console.log("CPOPOVL minutesWorked11: ", minutesWorked);
      first_cal = true;
    } else {
      // console.log("CPOPOVL first_cal222: ", "False");
      // console.log("CPOPOVL shiftEndTime222: ", shiftEndTime);
      // console.log("CPOPOVL shiftStartTime222: ", shiftStartTime);
      // หาเวลาคงเหลือ
      let minDiff = calculateTimeDifference(shiftStartTime, shiftEndTime);
      // console.log("CPOPOVL minDiff22: ", minDiff);
      tmp_mindiff = minDiff;
      minutesWorked = minutesWorked - minDiff;
      // console.log("CPOPOVL minutesWorked22: ", minutesWorked);
    }

    if (minutesWorked <= 0) {
      // console.log("CPOPOVL minutesWorked shiftStartTime: ", shiftStartTime);
      let mmm = tmp_mindiff - Math.abs(minutesWorked);
      // บวก time zone thailand 7 ชั่วโมง
      const originalDate = new Date(shiftStartTime);
      let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000); // แปลงเป็นมิลลิวินาทีแล้วลบ
      // console.log("CPOPOVL minutesWorked originalDate: ", originalDate);
      newDate = new Date(newDate.getTime() + mmm * 60 * 1000); // แปลงเป็นมิลลิวินาทีแล้วลบ
      // console.log("CPOPOVL minutesWorked: ", "minutesWorked <= 0");
      // console.log("CPOPOVL stamp_date main_date_cal: ", newDate);
      first_day_stop = true;
      stamp_date = newDate;
      break;
    }
  }

  // ---------------  start Loop 2 ----------------

  //ถ้าวันแรก ลบเวลาเสร็จแล้ว ให้หยุด ถ้าไม่ให้วน loop ต่อ
  if (first_day_stop == false) {
    // console.log("CPOPOVL minutesWorked: ", "first_day_stop == false");
    do {
      const newDate = new Date(main_date_cal);
      newDate.setDate(newDate.getDate() + 1);

      // ------- check holiday -------
      const searchIndex = holiday_all.findIndex(
        (item) => item.date_rom == main_date_cal
      );
      // console.log("cal_index searchIndex: ", searchIndex);
      // console.log("cal_index holiday_all: ", JSON.stringify(holiday_all));

      if (searchIndex > -1) {
        const { holiday_type, hours } = holiday_all[searchIndex];

        // console.log("searchIndex > 0");

        if (holiday_type == "D") {
          newDate.setDate(newDate.getDate() + 1);
        } else if (holiday_type == "H") {
          let cm = convertHourToMinute(hours);
          minutesWorked = minutesWorked + cm;
        } else if (holiday_type == "I") {
          let cm = convertHourToMinute(hours);
          minutesWorked = minutesWorked - cm;
        }
      }

      // ------- check holiday -------

      // console.log(
      //   "CPOPOVL loop main_date_cal main_date_cal Start Loop: ",
      //   main_date_cal
      // );
      // console.log("CPOPOVL loop main_date_cal newDate Start Loop: ", newDate);

      shifts.forEach((shift) => {
        shift.date_cal = newDate.toISOString().replace("T00:00:00.000Z", "");
      });
      // console.log("CPOPOVL shifts: ", JSON.stringify(shifts));
      // console.log("CPOPOVL minutesWorked: ", "first_day_stop == false");
      // console.log("CPOPOVL main_date_cal: ", main_date_cal);

      for (let i = 0; i < shifts.length; i++) {
        const shift = shifts[i];
        let tmp_mindiff = 0;
        // console.log("CPOPOVL first_day_stop shift: ", shift);
        // console.log("minutesWorked: ", minutesWorked);
        let shiftStartTime = `${shift.date_cal} ${shift.start_time}`;
        let shiftEndTime = `${shift.date_cal} ${shift.end_time}`;

        // console.log("CPOPOVL shiftIndex_loop2: ", shift.index);
        // console.log("CPOPOVL shiftStartTime_loop2: ", shiftStartTime);
        // console.log("CPOPOVL strEndOfWork_loop2: ", shiftEndTime);
        // หาเวลาคงเหลือ
        let minDiff = calculateTimeDifference(shiftStartTime, shiftEndTime);
        // console.log("CPOPOVL minDiff22_loop2: ", minDiff);
        tmp_mindiff = minDiff;
        minutesWorked = minutesWorked - minDiff;
        // console.log("CPOPOVL minutesWorked22_loop2: ", minutesWorked);

        if (minutesWorked <= 0) {
          // console.log(
          //   "CPOPOVL minutesWorked shiftStartTime_loop2: ",
          //   shiftStartTime
          // );
          let mmm = tmp_mindiff - Math.abs(minutesWorked);
          // บวก time zone thailand 7 ชั่วโมง
          const originalDate = new Date(shiftStartTime);
          let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000); // แปลงเป็นมิลลิวินาทีแล้วลบ
          // console.log(
          //   "CPOPOVL minutesWorked originalDate_loop2: ",
          //   originalDate
          // );
          newDate = new Date(newDate.getTime() + mmm * 60 * 1000); // แปลงเป็นมิลลิวินาทีแล้วลบ
          // console.log(
          //   "CPOPOVL minutesWorked_loop2: ",
          //   "CPOPOVL minutesWorked_loop2 <= 0"
          // );
          // console.log("CPOPOVL stamp_date main_date_cal_loop2: ", newDate);
          stamp_date = newDate;
          break;
        }

        if (i == shifts.length - 1 && minutesWorked > 0) {
          // console.log(
          //   "CPOPOVL loop main_date_cal i == 0 End Loop: ",
          //   main_date_cal
          // );
          let newDate = new Date(main_date_cal);
          newDate.setDate(newDate.getDate() + 1);

          shifts.forEach((shift) => {
            shift.date_cal = newDate
              .toISOString()
              .replace("T00:00:00.000Z", "");
          });

          // console.log("CPOPOVL loop main_date_cal shifts End Loop: ", shifts);

          // console.log("CPOPOVL loop main_date_cal newDate End Loop: ", newDate);

          let ct = newDate.toISOString().split("T");
          main_date_cal = ct[0];
          // console.log("CPOPOVL loop main_date_cal End Loop: ", main_date_cal);
        }
      }
    } while (minutesWorked >= 0);
    console.log("CPOPOVL End While Loop");
  }

  try {
    stamp_date = stamp_date
      .toISOString()
      .replace("T", " ")
      .replace(".000Z", "");
  } catch (error) {
    console.log("CPOPOVL error: ", error);
    stamp_date = stamp_date.toString().replace("T", " ").replace(".000Z", "");
  }

  return stamp_date;
}

async function calculateSplitMachineBatchDate(
  machine_id,
  company_id,
  production_time,
  stamp_batch_start
) {
  let minutesWorked = 0;
  let shift_all = null;
  let time_stamp = "2024-02-29";
  let template_shift = [];

  minutesWorked = convertHourToMinute(production_time);
  // console.log("SplitBatch convertHourToMinute minutesWorked: ", minutesWorked);
  // let startTime = new Date(endOfWork);

  // --------------- หากะ โดย เครื่องจักร ---------------
  shift_all = await tbl_routingService.findRoutingShift(machine_id, company_id);
  // console.log("SplitBatch shift_all: ", JSON.stringify(shift_all));

  // ข้อมูลตัวอย่าง
  // let data = [
  //   {
  //     machine_id: "mccom1",
  //     date_cal: "2024-01-30",
  //     shift_name: "กะA",
  //     start_time: "08:00:00",
  //     end_time: "17:00:00",
  //     break_start: "12:00:00",
  //     break_end: "13:00:00",
  //     summary_time: "08:00:00",
  //   },
  //   {
  //     machine_id: "mccom1",
  //     date_cal: "2024-01-30",
  //     shift_name: "กะB",
  //     start_time: "17:01:00",
  //     end_time: "20:00:00",
  //     break_start: "00:00:00",
  //     break_end: "00:00:00",
  //     summary_time: "03:00:00",
  //   },
  // ];
  data = shift_all;

  for (let i = 0; i < data.length; i++) {
    data[i].date_cal = time_stamp;
  }

  // console.log("data: ", JSON.stringify(data));

  // ------------  step3.4 : แตกกะและหาเวลารวมของแต่ละกะ + ทำ template  ------------
  // ------------  แตกกะและหาเวลารวมของแต่ละกะ ------------
  // ต้องทำ template กะไว้ก่อนเพื่อเอาไว้เช็ค due_date ว่าตรงกับกะไหม
  // และเอาไว้วน loop หา start_time OPN ปัจจุบัน
  // และเอาไว้วน loop หา end_time OPN ถัดไป

  let shift_index = 0;
  let tmp_shift_model = {
    index: 0,
    shift_name: "กะA",
    date_cal: "2024-02-29",
    start_time: "08:00:00",
    end_time: "17:00:00",
    summary_time: 0,
  };

  for (let i = data.length - 1; i >= 0; i--) {
    //   console.log(data[i]);

    console.log(`Shift: ${data[i].shift_name}`);
    try {
      if (data[i].break_start != null && data[i].break_end != null) {
        tmp_shift_model = {
          index: 0,
          shift_name: "กะA",
          date_cal: "2024-02-29",
          start_time: "08:00:00",
          end_time: "17:00:00",
          summary_time: 0,
        };

        let hourDifference = calculateHourDifference(
          data[i].date_cal + " " + data[i].start_time,
          data[i].date_cal + " " + data[i].break_start
        );

        tmp_shift_model.index = i;
        tmp_shift_model.shift_name = data[i].shift_name;
        tmp_shift_model.date_cal = data[i].date_cal;
        tmp_shift_model.start_time = data[i].start_time;
        tmp_shift_model.end_time = data[i].break_start;
        tmp_shift_model.summary_time = Math.ceil(hourDifference);

        template_shift.push(tmp_shift_model);

        // console.log(
        //   `ความต่างของเวลาในชั่วโมง11: ${Math.ceil(hourDifference)} ชั่วโมง`
        // );

        tmp_shift_model = {
          index: 0,
          shift_name: "กะA",
          date_cal: "2024-02-29",
          start_time: "08:00:00",
          end_time: "17:00:00",
          summary_time: 0,
        };

        let hourDifference2 = calculateHourDifference(
          data[i].date_cal + " " + data[i].break_end,
          data[i].date_cal + " " + data[i].end_time
        );
        shift_index = shift_index++;
        tmp_shift_model.index = i + 1;
        tmp_shift_model.shift_name = data[i].shift_name;
        tmp_shift_model.date_cal = data[i].date_cal;
        tmp_shift_model.start_time = data[i].break_end;
        tmp_shift_model.end_time = data[i].end_time;
        tmp_shift_model.summary_time = Math.ceil(hourDifference2);

        template_shift.push(tmp_shift_model);

        // console.log(
        //   `ความต่างของเวลาในชั่วโมง22: ${Math.ceil(hourDifference2)} ชั่วโมง`
        // );
      } else {
        tmp_shift_model = {
          index: 0,
          shift_name: "กะA",
          date_cal: "2024-02-29",
          start_time: "08:00:00",
          end_time: "17:00:00",
          summary_time: 0,
        };

        let hourDifference3 = calculateHourDifference(
          data[i].date_cal + " " + data[i].start_time,
          data[i].date_cal + " " + data[i].end_time
        );
        shift_index = i + 1;
        tmp_shift_model.index = shift_index;
        tmp_shift_model.shift_name = data[i].shift_name;
        tmp_shift_model.date_cal = data[i].date_cal;
        tmp_shift_model.start_time = data[i].start_time;
        tmp_shift_model.end_time = data[i].end_time;
        // tmp_shift_model.summary_time = Math.ceil(hourDifference3);

        let time = data[i].summary_time; // Input time
        let parts = time.split(":"); // Split the time into [hours, minutes, seconds]
        let hours = parseInt(parts[0], 10); // Convert hours to integer
        tmp_shift_model.summary_time = hours;

        template_shift.push(tmp_shift_model);

        // console.log(
        //   `ความต่างของเวลาในชั่วโมง33: ${Math.ceil(hourDifference3)} ชั่วโมง`
        // );
      }
    } catch (error) {
      console.log("SplitBatch error: ", error);
    }
  }
  shift_index = 0;

  template_shift.sort(function (a, b) {
    return a.index - b.index;
  });

  // console.log("template_shift: ", JSON.stringify(template_shift));
  // --------------- หากะ โดย เครื่องจักร ---------------

  let shifts = template_shift;
  let cal_index = 0;
  let first_cal = false;
  let main_date_cal = "2024-02-29";
  let main_min_cal = "08:00:00";
  let first_day_stop = false;
  let stamp_date = "2024-02-29 08:00:00";

  // console.log("SplitBatch set_up_time: ", "1111111");

  const d1 = new Date(stamp_batch_start);
  let d2 = new Date(d1.getTime() + 420 * 60 * 1000); // แปลงเป็นมิลลิวินาทีแล้วลบ
  // console.log("SplitBatch minutesWorked originalDate: ", originalDate);

  let strEndOfWork = null;
  const formattedDate = d2.toISOString().replace("T", " ").replace(".000Z", "");

  strEndOfWork = formattedDate;
  let f1 = strEndOfWork.split(" ");
  let formattedDate2 = f1[0];
  // console.log("SplitBatch strEndOfWork: ", strEndOfWork);
  // console.log("SplitBatch formattedDate2: ", formattedDate2);

  // // Replace date_cal with "2024-02-28"
  const newDate = formattedDate2;
  shifts.forEach((shift) => {
    shift.date_cal = newDate;
  });

  // console.log("SplitBatch shifts main: ", JSON.stringify(shifts));

  // const endOfWork = new Date("2024-02-29 16:00:00");
  // const strEndOfWork = "2024-02-29 16:00:00";

  // ตรวจสอบว่าวันสิ้นสุดต้องอยู่ในช่วงเวลาของกะ
  let isInShift = false;
  for (let i = shifts.length - 1; i >= 0; i--) {
    main_date_cal = shifts[i].date_cal;
    const shift = shifts[i];
    // console.log("SplitBatch Intersec shift: ", shift);
    const shiftStartTime = `${shift.date_cal} ${shift.start_time}`;
    const shiftEndTime = `${shift.date_cal} ${shift.end_time}`;
    // console.log("SplitBatch Intersec shiftStartTime: ", shiftStartTime);
    // console.log("SplitBatch Intersec shiftEndTime: ", shiftEndTime);

    if (isDateBetween(shiftStartTime, shiftEndTime, strEndOfWork)) {
      isInShift = true;
      cal_index = shift.index;
      break;
    }
  }

  // console.log("SplitBatch isInShift: ", isInShift);
  // console.log("SplitBatch cal_index: ", cal_index);

  // วน loop เช็ควันแรกที่เริ่มทำงาน ตามกะที่เหลือ
  // เริ่มลบเวลาตามกะ
  for (let i = cal_index; i < shifts.length; i++) {
    const shift = shifts[i];
    let tmp_mindiff = 0;
    // console.log("SplitBatch cal_index shift: ", shift);
    // console.log("minutesWorked: ", minutesWorked);

    let shiftStartTime = `${shift.date_cal} ${shift.start_time}`;
    let shiftEndTime = `${shift.date_cal} ${shift.end_time}`;

    // console.log("SplitBatch shiftStartTime: ", shiftStartTime);
    // console.log("SplitBatch shiftEndTime: ", shiftEndTime);
    // console.log("SplitBatch strEndOfWork: ", strEndOfWork);

    // คำนวนครั้งแรก ให้ใช้ endOfWork แทน end_time
    if (first_cal == false) {
      // shiftEndTime = strEndOfWork;
      shiftStartTime = strEndOfWork;
      // console.log("SplitBatch first_cal111: ", "True");
      // console.log("SplitBatch shiftStartTime111: ", shiftStartTime);
      // console.log("SplitBatch shiftEndTime111: ", shiftEndTime);
      // main_date_cal = endOfWork;
      // หาเวลาคงเหลือ

      let minDiff = calculateTimeDifference(shiftStartTime, shiftEndTime);
      // console.log("SplitBatch minDiff11: ", minDiff);
      tmp_mindiff = minDiff;
      minutesWorked = minutesWorked - minDiff;
      // console.log("SplitBatch minutesWorked11: ", minutesWorked);
      first_cal = true;
    } else {
      // console.log("SplitBatch first_cal222: ", "False");
      // console.log("SplitBatch shiftEndTime222: ", shiftEndTime);
      // console.log("SplitBatch shiftStartTime222: ", shiftStartTime);
      // หาเวลาคงเหลือ
      let minDiff = calculateTimeDifference(shiftStartTime, shiftEndTime);
      // console.log("SplitBatch minDiff22: ", minDiff);
      tmp_mindiff = minDiff;
      minutesWorked = minutesWorked - minDiff;
      // console.log("SplitBatch minutesWorked22: ", minutesWorked);
    }

    if (minutesWorked <= 0) {
      // console.log("SplitBatch minutesWorked shiftStartTime: ", shiftStartTime);
      let mmm = tmp_mindiff - Math.abs(minutesWorked);
      // บวก time zone thailand 7 ชั่วโมง
      const originalDate = new Date(shiftStartTime);
      let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000); // แปลงเป็นมิลลิวินาทีแล้วลบ
      // console.log("SplitBatch minutesWorked newDate: ", newDate);
      newDate = new Date(newDate.getTime() + mmm * 60 * 1000); // แปลงเป็นมิลลิวินาทีแล้วลบ
      // console.log("SplitBatch minutesWorked: ", "minutesWorked <= 0");
      // console.log("SplitBatch stamp_date main_date_cal: ", newDate);
      first_day_stop = true;
      stamp_date = newDate;
      // break;
      stamp_date = stamp_date
        .toISOString()
        .replace("T", " ")
        .replace(".000Z", "");

      // console.log("SplitBatch stamp_date: ", stamp_date);

      return stamp_date;
    }
  }

  // ---------------  start Loop 2 ----------------

  //ถ้าวันแรก ลบเวลาเสร็จแล้ว ให้หยุด ถ้าไม่ให้วน loop ต่อ
  if (first_day_stop == false) {
    // console.log("SplitBatch minutesWorked: ", "first_day_stop == false");
    do {
      const newDate = new Date(main_date_cal);
      newDate.setDate(newDate.getDate() + 1);

      // console.log(
      //   "SplitBatch loop main_date_cal main_date_cal Start Loop: ",
      //   main_date_cal
      // );
      // console.log(
      //   "SplitBatch loop main_date_cal newDate Start Loop: ",
      //   newDate
      // );

      shifts.forEach((shift) => {
        shift.date_cal = newDate.toISOString().replace("T00:00:00.000Z", "");
      });
      // console.log("SplitBatch shifts: ", JSON.stringify(shifts));
      // console.log("SplitBatch minutesWorked: ", "first_day_stop == false");
      // console.log("SplitBatch main_date_cal: ", main_date_cal);

      for (let i = 0; i < shifts.length; i++) {
        const shift = shifts[i];
        let tmp_mindiff = 0;
        // console.log("SplitBatch first_day_stop shift: ", shift);
        // console.log("minutesWorked: ", minutesWorked);
        let shiftStartTime = `${shift.date_cal} ${shift.start_time}`;
        let shiftEndTime = `${shift.date_cal} ${shift.end_time}`;

        // console.log("SplitBatch shiftIndex_loop2: ", shift.index);
        // console.log("SplitBatch shiftStartTime_loop2: ", shiftStartTime);
        // console.log("SplitBatch strEndOfWork_loop2: ", shiftEndTime);
        // หาเวลาคงเหลือ
        let minDiff = calculateTimeDifference(shiftStartTime, shiftEndTime);
        // console.log("SplitBatch minDiff22_loop2: ", minDiff);
        tmp_mindiff = minDiff;
        minutesWorked = minutesWorked - minDiff;
        // console.log("SplitBatch minutesWorked22_loop2: ", minutesWorked);

        if (minutesWorked <= 0) {
          // console.log(
          //   "SplitBatch minutesWorked shiftStartTime_loop2: ",
          //   shiftStartTime
          // );
          let mmm = tmp_mindiff - Math.abs(minutesWorked);
          // บวก time zone thailand 7 ชั่วโมง
          const originalDate = new Date(shiftStartTime);
          let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000); // แปลงเป็นมิลลิวินาทีแล้วลบ
          // console.log(
          //   "SplitBatch minutesWorked originalDate_loop2: ",
          //   originalDate
          // );
          newDate = new Date(newDate.getTime() + mmm * 60 * 1000); // แปลงเป็นมิลลิวินาทีแล้วลบ
          // console.log(
          //   "SplitBatch minutesWorked_loop2: ",
          //   "SplitBatch minutesWorked_loop2 <= 0"
          // );
          // console.log("SplitBatch stamp_date main_date_cal_loop2: ", newDate);
          stamp_date = newDate;
          // break;
          stamp_date = stamp_date
            .toISOString()
            .replace("T", " ")
            .replace(".000Z", "");

          // console.log("SplitBatch stamp_date: ", stamp_date);

          return stamp_date;
        }

        if (i == shifts.length - 1 && minutesWorked > 0) {
          // console.log(
          //   "SplitBatch loop main_date_cal i == 0 End Loop: ",
          //   main_date_cal
          // );
          let newDate = new Date(main_date_cal);
          newDate.setDate(newDate.getDate() + 1);

          shifts.forEach((shift) => {
            shift.date_cal = newDate
              .toISOString()
              .replace("T00:00:00.000Z", "");
          });

          // console.log(
          //   "SplitBatch loop main_date_cal shifts End Loop: ",
          //   shifts
          // );

          // console.log(
          //   "SplitBatch loop main_date_cal newDate End Loop: ",
          //   newDate
          // );

          let ct = newDate.toISOString().split("T");
          main_date_cal = ct[0];
          // console.log(
          //   "SplitBatch loop main_date_cal End Loop: ",
          //   main_date_cal
          // );
        }
      }
    } while (minutesWorked >= 0);
    console.log("SplitBatch End While Loop");
  }

  // return over_lap_time_cal;
  let tmp_start_date = over_lap_time_cal
    .toISOString()
    .replace("T", " ")
    .replace(".000Z", "");
  stamp_date = stamp_date.toISOString().replace("T", " ").replace(".000Z", "");

  // console.log("SplitBatch stamp_date: ", stamp_date);

  return stamp_date;
}

async function calculateProductionOrderPlanOverLabDate(
  order_qty,
  machine_all,
  holiday_all,
  shift_all,
  real_qty_order_scrap_by_opn,
  set_up_time,
  time_process_by_opn,
  over_lap_time_cal,
  doc_running,
  rtg_id,
  item_master_id,
  opn_id
) {
  // console.log("CPOPOVL order_qty: ", order_qty);
  // console.log("CPOPOVL machine_all: ", machine_all);
  // console.log("CPOPOVL holiday_all: ", holiday_all);
  // console.log("CPOPOVL shift_all: ", shift_all);
  // console.log(
  //   "CPOPOVL real_qty_order_scrap_by_opn: ",
  //   real_qty_order_scrap_by_opn
  // );
  // console.log("CPOPOVL set_up_time: ", set_up_time);
  // console.log("CPOPOVL time_process_by_opn: ", time_process_by_opn);
  // console.log("CPOPOVL over_lap_time_cal: ", over_lap_time_cal);
  // console.log("CPOPOVL doc_running: ", doc_running);
  // console.log("CPOPOVL rtg_id: ", rtg_id);
  // console.log("CPOPOVL item_master_id: ", item_master_id);
  // console.log("CPOPOVL opn_id: ", opn_id);

  // let minutesWorked = 630;
  let minutesWorked = 0;
  minutesWorked = convertHourToMinute(time_process_by_opn);
  // console.log("CPOPOVL minutesWorked: ", minutesWorked);
  // let startTime = new Date(endOfWork);

  let shifts = shift_all;
  let cal_index = 0;
  let first_cal = false;
  let main_date_cal = "2024-02-29";
  let main_min_cal = "08:00:00";
  let first_day_stop = false;
  let stamp_date = "2024-02-29 08:00:00";

  // console.log("CPOPOVL set_up_time: ", "1111111");

  // let strEndOfWork = await ProductionOrderTempService.findDueDateByRouting(
  //   doc_running,
  //   rtg_id,
  //   item_master_id,
  //   opn_id
  // );

  // let ced1 = new Date(strEndOfWork[0].opn_end_date_time);
  // let ced2 = new Date(ced1.getTime() + 420 * 60 * 1000); // แปลงเป็นมิลลิวินาทีแล้วลบ
  // const formattedDate = ced2
  //   .toISOString()
  //   .replace("T", " ")
  //   .replace(".000Z", "");

  let strEndOfWork = null;
  const formattedDate = over_lap_time_cal
    .toISOString()
    .replace("T", " ")
    .replace(".000Z", "");

  strEndOfWork = formattedDate;
  let f1 = strEndOfWork.split(" ");
  let formattedDate2 = f1[0];
  // console.log("CPOPOVL strEndOfWork: ", strEndOfWork);
  // console.log("CPOPOVL formattedDate2: ", formattedDate2);

  // ------- check holiday -------
  const searchIndex = holiday_all.findIndex(
    (item) => item.date_rom == formattedDate2
  );
  // console.log("cal_index searchIndex: ", searchIndex);
  // console.log("cal_index holiday_all: ", JSON.stringify(holiday_all));

  if (searchIndex > -1) {
    const { holiday_type, hours } = holiday_all[searchIndex];

    // console.log(
    //   `Holiday found on ${formattedDate2}: Type - ${holiday_type}, Hours - ${hours}`
    // );

    if (holiday_type == "D") {
      let drp = null;
      const newDate = new Date(formattedDate2);
      newDate.setDate(newDate.getDate() + 1);
      drp = newDate.toISOString().replace("T00:00:00.000Z", "");

      // console.log("CPOPOVL holiday_type: ", "D");
      // console.log("CPOPOVL shift.date_cal: ", formattedDate2);
      // console.log("CPOPOVL newDate: ", newDate);
      // console.log("CPOPOVL drp: ", drp);
      formattedDate2 = drp;
      strEndOfWork = drp;
    } else if (holiday_type == "H") {
      let cm = convertHourToMinute(hours);
      minutesWorked = minutesWorked + cm;
    } else if (holiday_type == "I") {
      let cm = convertHourToMinute(hours);
      minutesWorked = minutesWorked - cm;
    }
  }

  // ------- check holiday -------

  // // Replace date_cal with "2024-02-28"
  const newDate = formattedDate2;
  shifts.forEach((shift) => {
    shift.date_cal = newDate;
    // shift.summary_time = shift.summary_time * 60;
  });

  // console.log("CPOPOVL shifts main: ", JSON.stringify(shifts));

  // const endOfWork = new Date("2024-02-29 16:00:00");
  // const strEndOfWork = "2024-02-29 16:00:00";

  // ตรวจสอบว่าวันสิ้นสุดต้องอยู่ในช่วงเวลาของกะ
  let isInShift = false;
  for (let i = shifts.length - 1; i >= 0; i--) {
    main_date_cal = shifts[i].date_cal;
    const shift = shifts[i];
    // console.log("CPOPOVL Intersec shift: ", shift);
    const shiftStartTime = `${shift.date_cal} ${shift.start_time}`;
    const shiftEndTime = `${shift.date_cal} ${shift.end_time}`;
    // console.log("CPOPOVL Intersec shiftStartTime: ", shiftStartTime);
    // console.log("CPOPOVL Intersec shiftEndTime: ", shiftEndTime);

    if (isDateBetween(shiftStartTime, shiftEndTime, strEndOfWork)) {
      isInShift = true;
      cal_index = shift.index;
      break;
    }
  }

  // console.log("CPOPOVL isInShift: ", isInShift);
  // console.log("CPOPOVL cal_index: ", cal_index);

  // วน loop เช็ควันแรกที่เริ่มทำงาน ตามกะที่เหลือ
  // เริ่มลบเวลาตามกะ
  for (let i = cal_index; i < shifts.length; i++) {
    const shift = shifts[i];
    let tmp_mindiff = 0;
    // console.log("CPOPOVL cal_index shift: ", shift);
    // console.log("minutesWorked: ", minutesWorked);

    let shiftStartTime = `${shift.date_cal} ${shift.start_time}`;
    let shiftEndTime = `${shift.date_cal} ${shift.end_time}`;

    // console.log("CPOPOVL shiftStartTime: ", shiftStartTime);
    // console.log("CPOPOVL shiftEndTime: ", shiftEndTime);
    // console.log("CPOPOVL strEndOfWork: ", strEndOfWork);

    // คำนวนครั้งแรก ให้ใช้ endOfWork แทน end_time
    if (first_cal == false) {
      // shiftEndTime = strEndOfWork;
      shiftStartTime = strEndOfWork;
      // console.log("CPOPOVL first_cal111: ", "True");
      // console.log("CPOPOVL shiftStartTime111: ", shiftStartTime);
      // console.log("CPOPOVL shiftEndTime111: ", shiftEndTime);
      // main_date_cal = endOfWork;
      // หาเวลาคงเหลือ

      let minDiff = calculateTimeDifference(shiftStartTime, shiftEndTime);
      // console.log("CPOPOVL minDiff11: ", minDiff);
      tmp_mindiff = minDiff;
      minutesWorked = minutesWorked - minDiff;
      // console.log("CPOPOVL minutesWorked11: ", minutesWorked);
      first_cal = true;
    } else {
      // console.log("CPOPOVL first_cal222: ", "False");
      // console.log("CPOPOVL shiftEndTime222: ", shiftEndTime);
      // console.log("CPOPOVL shiftStartTime222: ", shiftStartTime);
      // หาเวลาคงเหลือ
      let minDiff = calculateTimeDifference(shiftStartTime, shiftEndTime);
      // console.log("CPOPOVL minDiff22: ", minDiff);
      tmp_mindiff = minDiff;
      minutesWorked = minutesWorked - minDiff;
      // console.log("CPOPOVL minutesWorked22: ", minutesWorked);
    }

    if (minutesWorked <= 0) {
      // console.log("CPOPOVL minutesWorked shiftStartTime: ", shiftStartTime);
      let mmm = tmp_mindiff - Math.abs(minutesWorked);
      // บวก time zone thailand 7 ชั่วโมง
      const originalDate = new Date(shiftStartTime);
      let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000); // แปลงเป็นมิลลิวินาทีแล้วลบ
      // console.log("CPOPOVL minutesWorked originalDate: ", originalDate);
      newDate = new Date(newDate.getTime() + mmm * 60 * 1000); // แปลงเป็นมิลลิวินาทีแล้วลบ
      // console.log("CPOPOVL minutesWorked: ", "minutesWorked <= 0");
      // console.log("CPOPOVL stamp_date main_date_cal: ", newDate);
      first_day_stop = true;
      stamp_date = newDate;
      break;
    }
  }

  // ---------------  start Loop 2 ----------------

  //ถ้าวันแรก ลบเวลาเสร็จแล้ว ให้หยุด ถ้าไม่ให้วน loop ต่อ
  if (first_day_stop == false) {
    // console.log("CPOPOVL minutesWorked: ", "first_day_stop == false");
    do {
      const newDate = new Date(main_date_cal);
      newDate.setDate(newDate.getDate() + 1);

      // ------- check holiday -------
      const searchIndex = holiday_all.findIndex(
        (item) => item.date_rom == main_date_cal
      );
      // console.log("cal_index searchIndex: ", searchIndex);
      // console.log("cal_index holiday_all: ", JSON.stringify(holiday_all));

      if (searchIndex > -1) {
        const { holiday_type, hours } = holiday_all[searchIndex];

        // console.log("searchIndex > 0");

        if (holiday_type == "D") {
          newDate.setDate(newDate.getDate() + 1);
        } else if (holiday_type == "H") {
          let cm = convertHourToMinute(hours);
          minutesWorked = minutesWorked + cm;
        } else if (holiday_type == "I") {
          let cm = convertHourToMinute(hours);
          minutesWorked = minutesWorked - cm;
        }
      }

      // ------- check holiday -------

      // console.log(
      //   "CPOPOVL loop main_date_cal main_date_cal Start Loop: ",
      //   main_date_cal
      // );
      // console.log("CPOPOVL loop main_date_cal newDate Start Loop: ", newDate);

      shifts.forEach((shift) => {
        shift.date_cal = newDate.toISOString().replace("T00:00:00.000Z", "");
      });
      // console.log("CPOPOVL shifts: ", JSON.stringify(shifts));
      // console.log("CPOPOVL minutesWorked: ", "first_day_stop == false");
      // console.log("CPOPOVL main_date_cal: ", main_date_cal);

      for (let i = 0; i < shifts.length; i++) {
        const shift = shifts[i];
        let tmp_mindiff = 0;
        // console.log("CPOPOVL first_day_stop shift: ", shift);
        // console.log("minutesWorked: ", minutesWorked);
        let shiftStartTime = `${shift.date_cal} ${shift.start_time}`;
        let shiftEndTime = `${shift.date_cal} ${shift.end_time}`;

        // console.log("CPOPOVL shiftIndex_loop2: ", shift.index);
        // console.log("CPOPOVL shiftStartTime_loop2: ", shiftStartTime);
        // console.log("CPOPOVL strEndOfWork_loop2: ", shiftEndTime);
        // หาเวลาคงเหลือ
        let minDiff = calculateTimeDifference(shiftStartTime, shiftEndTime);
        // console.log("CPOPOVL minDiff22_loop2: ", minDiff);
        tmp_mindiff = minDiff;
        minutesWorked = minutesWorked - minDiff;
        // console.log("CPOPOVL minutesWorked22_loop2: ", minutesWorked);

        if (minutesWorked <= 0) {
          // console.log(
          //   "CPOPOVL minutesWorked shiftStartTime_loop2: ",
          //   shiftStartTime
          // );
          let mmm = tmp_mindiff - Math.abs(minutesWorked);
          // บวก time zone thailand 7 ชั่วโมง
          const originalDate = new Date(shiftStartTime);
          let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000); // แปลงเป็นมิลลิวินาทีแล้วลบ
          // console.log(
          //   "CPOPOVL minutesWorked originalDate_loop2: ",
          //   originalDate
          // );
          newDate = new Date(newDate.getTime() + mmm * 60 * 1000); // แปลงเป็นมิลลิวินาทีแล้วลบ
          // console.log(
          //   "CPOPOVL minutesWorked_loop2: ",
          //   "CPOPOVL minutesWorked_loop2 <= 0"
          // );
          // console.log("CPOPOVL stamp_date main_date_cal_loop2: ", newDate);
          stamp_date = newDate;
          break;
        }

        if (i == shifts.length - 1 && minutesWorked > 0) {
          // console.log(
          //   "CPOPOVL loop main_date_cal i == 0 End Loop: ",
          //   main_date_cal
          // );
          let newDate = new Date(main_date_cal);
          newDate.setDate(newDate.getDate() + 1);

          shifts.forEach((shift) => {
            shift.date_cal = newDate
              .toISOString()
              .replace("T00:00:00.000Z", "");
          });

          // console.log("CPOPOVL loop main_date_cal shifts End Loop: ", shifts);

          // console.log("CPOPOVL loop main_date_cal newDate End Loop: ", newDate);

          let ct = newDate.toISOString().split("T");
          main_date_cal = ct[0];
          // console.log("CPOPOVL loop main_date_cal End Loop: ", main_date_cal);
        }
      }
    } while (minutesWorked >= 0);
    console.log("CPOPOVL End While Loop");
  }

  // return over_lap_time_cal;
  let tmp_start_date = null;

  try {
    tmp_start_date = over_lap_time_cal
      .toISOString()
      .replace("T", " ")
      .replace(".000Z", "");
    stamp_date = stamp_date
      .toISOString()
      .replace("T", " ")
      .replace(".000Z", "");
  } catch (error) {
    console.log("CPOPOVL error: ", error);
    stamp_date = stamp_date.toString().replace("T", " ").replace(".000Z", "");
  }

  let data_due_date = {
    opn_start_date_time: tmp_start_date,
    opn_end_date_time: stamp_date,
    time_process_by_opn: time_process_by_opn,
    real_qty_order_scrap_by_opn: real_qty_order_scrap_by_opn,
  };

  try {
    await ProductionOrderTempService.update(
      doc_running,
      rtg_id,
      item_master_id,
      opn_id,
      data_due_date
    );
  } catch (error) {
    console.log("ProductionOrderTempService.update error: ", error);
  }

  return stamp_date;
}

async function calculateProductionOrderPlanDate(
  order_qty,
  machine_all,
  holiday_all,
  shift_all,
  real_qty_order_scrap_by_opn,
  set_up_time,
  time_process_by_opn,
  doc_running,
  rtg_id,
  item_master_id,
  opn_id
) {
  // // กำหนดข้อมูล
  // const shifts = [
  //   {
  //     index: 0,
  //     shift_name: "กระเช้า",
  //     date_cal: "2024-02-29",
  //     start_time: "08:00:00",
  //     end_time: "12:00:00",
  //     summary_time: 4,
  //   },
  //   {
  //     index: 1,
  //     shift_name: "กระเช้า",
  //     date_cal: "2024-02-29",
  //     start_time: "13:00:00",
  //     end_time: "17:00:00",
  //     summary_time: 4,
  //   },
  //   {
  //     index: 2,
  //     shift_name: "กะB",
  //     date_cal: "2024-02-29",
  //     start_time: "17:01:00",
  //     end_time: "20:00:00",
  //     summary_time: 3,
  //   },
  // ];

  // console.log("CPOP order_qty: ", order_qty);
  // console.log("CPOP machine_all: ", machine_all);
  // console.log("CPOP holiday_all: ", holiday_all);
  // console.log("CPOP shift_all: ", shift_all);
  // console.log(
  //   "CPOP real_qty_order_scrap_by_opn: ",
  //   real_qty_order_scrap_by_opn
  // );
  // console.log("CPOP set_up_time: ", set_up_time);
  // console.log("CPOP time_process_by_opn: ", time_process_by_opn);
  // console.log("CPOP doc_running: ", doc_running);
  // console.log("CPOP rtg_id: ", rtg_id);
  // console.log("CPOP item_master_id: ", item_master_id);
  // console.log("CPOP opn_id: ", opn_id);

  // let minutesWorked = 630;
  let minutesWorked = 0;
  minutesWorked = convertHourToMinute(time_process_by_opn);
  // console.log("minutesWorked: ", minutesWorked);
  // let startTime = new Date(endOfWork);

  let shifts = shift_all;
  let cal_index = 0;
  let first_cal = false;
  let main_date_cal = "2024-02-29";
  let main_min_cal = "08:00:00";
  let first_day_stop = false;
  let stamp_date = "2024-02-29 08:00:00";

  // console.log("CPOP set_up_time: ", "1111111");

  let strEndOfWork = await ProductionOrderTempService.findDueDateByRouting(
    doc_running,
    rtg_id,
    item_master_id,
    opn_id
  );

  console.log("CPOP strEndOfWork: ", JSON.stringify(strEndOfWork));

  let ced1 = new Date(strEndOfWork[0].opn_end_date_time);
  let ced2 = new Date(ced1.getTime() + 420 * 60 * 1000); // แปลงเป็นมิลลิวินาทีแล้วลบ
  const formattedDate = ced2
    .toISOString()
    .replace("T", " ")
    .replace(".000Z", "");

  strEndOfWork = formattedDate;
  let f1 = strEndOfWork.split(" ");
  let formattedDate2 = f1[0];
  console.log("CPOP strEndOfWork: ", strEndOfWork);
  console.log("CPOP formattedDate2: ", formattedDate2);

  // ------- check holiday -------
  const searchIndex = holiday_all.findIndex(
    (item) => item.date_rom == formattedDate2
  );
  // console.log("cal_index searchIndex: ", searchIndex);
  // console.log("cal_index holiday_all: ", JSON.stringify(holiday_all));

  if (searchIndex > -1) {
    const { holiday_type, hours } = holiday_all[searchIndex];

    // console.log(
    //   `Holiday found on ${formattedDate2}: Type - ${holiday_type}, Hours - ${hours}`
    // );

    if (holiday_type == "D") {
      let drp = null;
      const newDate = new Date(formattedDate2);
      newDate.setDate(newDate.getDate() - 1);
      drp = newDate.toISOString().replace("T00:00:00.000Z", "");

      // console.log("CPOPOVL holiday_type: ", "D");
      // console.log("CPOPOVL shift.date_cal: ", formattedDate2);
      // console.log("CPOPOVL newDate: ", newDate);
      // console.log("CPOPOVL drp: ", drp);
      formattedDate2 = drp;
      strEndOfWork = drp;
    } else if (holiday_type == "H") {
      let cm = convertHourToMinute(hours);
      minutesWorked = minutesWorked + cm;
    } else if (holiday_type == "I") {
      let cm = convertHourToMinute(hours);
      minutesWorked = minutesWorked - cm;
    }
  }

  // ------- check holiday -------
  // console.log("CPOPOVL formattedDate2: ", formattedDate2);
  // // Replace date_cal with "2024-02-28"
  const newDate = formattedDate2;
  console.log("CPOP newDate: ", newDate);
  shifts.forEach((shift) => {
    shift.date_cal = newDate;
    shift.summary_time = shift.summary_time * 60;
  });

  // console.log("shifts main: ", JSON.stringify(shifts));

  // const endOfWork = new Date("2024-02-29 16:00:00");
  // const strEndOfWork = "2024-02-29 16:00:00";

  // ตรวจสอบว่าวันสิ้นสุดต้องอยู่ในช่วงเวลาของกะ
  let isInShift = false;
  for (let i = shifts.length - 1; i >= 0; i--) {
    main_date_cal = shifts[i].date_cal;
    const shift = shifts[i];
    // console.log("Intersec shift: ", shift);
    const shiftStartTime = `${shift.date_cal} ${shift.start_time}`;
    const shiftEndTime = `${shift.date_cal} ${shift.end_time}`;
    // console.log("Intersec shiftStartTime: ", shiftStartTime);
    // console.log("Intersec shiftEndTime: ", shiftEndTime);

    if (isDateBetween(shiftStartTime, shiftEndTime, strEndOfWork)) {
      isInShift = true;
      cal_index = shift.index;
      break;
    }
  }

  // console.log("isInShift: ", isInShift);
  // console.log("cal_index: ", cal_index);

  if (cal_index > 0) {
    cal_index = cal_index - 1;
  }
  // วน loop เช็ควันแรกที่เริ่มทำงาน ตามกะที่เหลือ
  // เริ่มลบเวลาตามกะ
  for (let i = cal_index; i >= 0; i--) {
    const shift = shifts[i];
    // console.log("cal_index shift N1: ", shift);
    // console.log("cal_index shift N1 shift.date_cal: ", shift.date_cal);

    // console.log("minutesWorked: ", minutesWorked);
    let shiftStartTime = `${shift.date_cal} ${shift.start_time}`;
    let shiftEndTime = `${shift.date_cal} ${shift.end_time}`;

    // console.log("CPOP shiftStartTime: ", shiftStartTime);
    // console.log("CPOP shiftEndTime: ", shiftEndTime);
    // console.log("CPOP strEndOfWork: ", strEndOfWork);

    // do {
    // คำนวนครั้งแรก ให้ใช้ endOfWork แทน end_time
    if (first_cal == false) {
      shiftEndTime = strEndOfWork;
      // console.log("first_cal111: ", "True");
      // console.log("shiftStartTime111: ", shiftStartTime);
      // console.log("shiftEndTime111: ", shiftEndTime);
      // main_date_cal = endOfWork;
      // หาเวลาคงเหลือ

      let minDiff = calculateTimeDifference(shiftStartTime, shiftEndTime);
      // console.log("minDiff11: ", minDiff);
      minutesWorked = minutesWorked - minDiff;
      // console.log("minutesWorked11: ", minutesWorked);
      first_cal = true;
    } else {
      // console.log("first_cal222: ", "False");
      // console.log("shiftEndTime222: ", shiftEndTime);
      // console.log("shiftStartTime222: ", shiftStartTime);
      // หาเวลาคงเหลือ
      let minDiff = calculateTimeDifference(shiftStartTime, shiftEndTime);
      // console.log("minDiff22: ", minDiff);
      minutesWorked = minutesWorked - minDiff;
      // console.log("minutesWorked22: ", minutesWorked);
    }
    // } while (minutesWorked >= 0);

    if (minutesWorked <= 0) {
      // console.log("minutesWorked shiftStartTime: ", shiftStartTime);
      let mmm = Math.abs(minutesWorked);
      // บวก time zone thailand 7 ชั่วโมง
      const originalDate = new Date(shiftStartTime);
      let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000); // แปลงเป็นมิลลิวินาทีแล้วลบ
      // console.log("minutesWorked originalDate: ", originalDate);
      newDate = new Date(newDate.getTime() + mmm * 60 * 1000); // แปลงเป็นมิลลิวินาทีแล้วลบ
      // console.log("minutesWorked: ", "minutesWorked <= 0");
      // console.log("stamp_date main_date_cal: ", newDate);
      first_day_stop = true;
      stamp_date = newDate;
      break;
    }
  }

  // ---------------  start Loop 2 ----------------

  //ถ้าวันแรก ลบเวลาเสร็จแล้ว ให้หยุด ถ้าไม่ให้วน loop ต่อ
  if (first_day_stop == false) {
    // console.log("CPOP minutesWorked main_date_cal: ", main_date_cal);
    // console.log("CPOP minutesWorked: ", "first_day_stop == false");
    do {
      const newDate = new Date(main_date_cal);
      newDate.setDate(newDate.getDate() - 1);

      console.log("CPOP newDate: ", newDate);

      // ------- check holiday -------
      const searchIndex = holiday_all.findIndex(
        (item) => item.date_rom == main_date_cal
      );
      // console.log("cal_index searchIndex: ", searchIndex);
      // console.log("cal_index holiday_all: ", JSON.stringify(holiday_all));

      if (searchIndex > -1) {
        const { holiday_type, hours } = holiday_all[searchIndex];

        // console.log("searchIndex > 0");

        if (holiday_type == "D") {
          newDate.setDate(newDate.getDate() - 1);
        } else if (holiday_type == "H") {
          let cm = convertHourToMinute(hours);
          minutesWorked = minutesWorked + cm;
        } else if (holiday_type == "I") {
          let cm = convertHourToMinute(hours);
          minutesWorked = minutesWorked - cm;
        }
      }

      // ------- check holiday -------

      // console.log(
      //   "loop main_date_cal main_date_cal Start Loop: ",
      //   main_date_cal
      // );
      // console.log("loop main_date_cal newDate Start Loop: ", newDate);

      shifts.forEach((shift) => {
        shift.date_cal = newDate.toISOString().replace("T00:00:00.000Z", "");
      });
      // console.log("CPOP shifts: ", JSON.stringify(shifts));
      // console.log("minutesWorked: ", "first_day_stop == false");
      // console.log("main_date_cal: ", main_date_cal);

      for (let i = shifts.length - 1; i >= 0; i--) {
        const shift = shifts[i];
        // console.log("first_day_stop shift: ", shift);
        // console.log("minutesWorked: ", minutesWorked);
        let shiftStartTime = `${shift.date_cal} ${shift.start_time}`;
        let shiftEndTime = `${shift.date_cal} ${shift.end_time}`;

        // console.log("CPOP shiftIndex_loop2: ", shift.index);
        // console.log("CPOP shiftStartTime_loop2: ", shiftStartTime);
        // console.log("CPOP strEndOfWork_loop2: ", shiftEndTime);
        // หาเวลาคงเหลือ
        let minDiff = calculateTimeDifference(shiftStartTime, shiftEndTime);
        minDiff = Math.abs(minDiff);
        console.log("CPOP minDiff22_loop2: ", minDiff);
        minutesWorked = minutesWorked - minDiff;
        console.log("CPOP minutesWorked22_loop22: ", minutesWorked);

        if (minutesWorked <= 0) {
          // console.log("minutesWorked shiftStartTime_loop2: ", shiftStartTime);
          let mmm = Math.abs(minutesWorked);
          // บวก time zone thailand 7 ชั่วโมง
          const originalDate = new Date(shiftStartTime);
          let newDate = new Date(originalDate.getTime() + 420 * 60 * 1000); // แปลงเป็นมิลลิวินาทีแล้วลบ
          // console.log("minutesWorked originalDate_loop2: ", originalDate);
          newDate = new Date(newDate.getTime() + mmm * 60 * 1000); // แปลงเป็นมิลลิวินาทีแล้วลบ
          // console.log("minutesWorked_loop2: ", "minutesWorked_loop2 <= 0");
          // console.log("stamp_date main_date_cal_loop2: ", newDate);
          stamp_date = newDate;
          break;
        }

        if (i == 0) {
          // console.log("loop main_date_cal i == 0 End Loop: ", main_date_cal);
          let newDate = new Date(main_date_cal);
          newDate.setDate(newDate.getDate() - 1);

          shifts.forEach((shift) => {
            shift.date_cal = newDate
              .toISOString()
              .replace("T00:00:00.000Z", "");
          });

          // console.log("loop main_date_cal shifts End Loop: ", shifts);

          // console.log("loop main_date_cal newDate End Loop: ", newDate);

          let ct = newDate.toISOString().split("T");
          main_date_cal = ct[0];
          // console.log("loop main_date_cal End Loop: ", main_date_cal);
        }
      }

      console.log("CPOP minutesWorked: ", minutesWorked);
    } while (minutesWorked >= 0);
    console.log("End While Loop");
  }

  try {
    stamp_date = stamp_date
      .toISOString()
      .replace("T", " ")
      .replace(".000Z", "");
  } catch (error) {
    console.log("CPOP stamp_date error: ", error);
    stamp_date = stamp_date.toString().replace("T", " ").replace(".000Z", "");
  }
  let data_due_date = {
    opn_start_date_time: stamp_date,
    time_process_by_opn: time_process_by_opn,
    real_qty_order_scrap_by_opn: real_qty_order_scrap_by_opn,
  };
  console.log("CCPTOPD data_due_date: ", JSON.stringify(data_due_date));
  try {
    await ProductionOrderTempService.update(
      doc_running,
      rtg_id,
      item_master_id,
      opn_id,
      data_due_date
    );
  } catch (error) {
    console.log("ProductionOrderTempService.update error: ", error);
  }

  return stamp_date;
}

function convertHourToMinute(hour) {
  console.log("convertHourToMinute: ", hour);
  let ct = 0.0;
  let ctm = 0.0;
  let str_hour = hour.toString().split(".");
  let str_hour_1 = str_hour[0];
  let str_hour_2 = "0." + str_hour[1];

  // console.log("str_hour_1: ", str_hour_1);
  // console.log("str_hour_2: ", str_hour_2);

  try {
    ct = parseInt(str_hour_1) * 60;
    ctm = parseFloat(str_hour_2) * 60;
    // console.log("ct: ", ct);
    // console.log("ctm: ", ctm);
  } catch (error) {
    // console.log("convertHourToMinute error: ", error);
    ct = parseInt(str_hour_1) * 60;
  }

  ct = ct + ctm;
  // console.log("ct+: ", ct);
  return ct;
}

function BatchOrder(QtyOrder, QtyPer, QtyBy, Scrap, NoMch, Batch) {
  let bo = 0;
  if (Batch == 0) {
    Batch = 1;
  }

  if (QtyPer == 0) {
    QtyPer = 1;
  }
  if (QtyBy == 0) {
    QtyBy = 1;
  }

  Scrap = ScrapPercentage(Scrap);

  bo = (((QtyOrder * QtyPer) / QtyBy) * Scrap) / NoMch / Batch;
  // bo = (((1000 * QtyPer) / QtyBy) * Scrap) / NoMch / Batch;

  // console.log("QtyOrder: ", QtyOrder);
  // console.log("QtyPer: ", QtyPer);
  // console.log("QtyBy: ", QtyBy);
  // console.log("Scrap: ", Scrap);
  // console.log("NoMch: ", NoMch);
  // console.log("Batch: ", Batch);
  // console.log("BatchOrder bo: ", Math.ceil(bo));

  return Math.ceil(bo);
  // return (((QtyOrder * QtyPer) / QtyBy) * Scrap) / NoMch / Batch;
}

function ManufactureOrder(QtyOrder, QtyPer, QtyBy, Scrap, NoMch) {
  // if (Batch == 0) {
  //   Batch = 1;
  // }

  if (QtyPer == 0) {
    QtyPer = 1;
  }
  if (QtyBy == 0) {
    QtyBy = 1;
  }

  Scrap = ScrapPercentage(Scrap);

  // console.log("ManufactureOrder QtyOrder: ", QtyOrder);
  // console.log("ManufactureOrder QtyPer: ", QtyPer);
  // console.log("ManufactureOrder QtyBy: ", QtyBy);
  // console.log("ManufactureOrder Scrap: ", Scrap);
  // console.log("ManufactureOrder NoMch: ", NoMch);

  return (((QtyOrder * QtyPer) / QtyBy) * Scrap) / NoMch / 1;
}

function SetUpTime(
  qty_order_scrap,
  pcs_hr,
  set_up_time,
  setup_timehr_per,
  QtyPer,
  QtyBy,
  Scrap,
  NoMch,
  Batch
) {
  let n_setup_time = 0.0;
  let bo = 0.0;

  // if (Batch == 0) {
  //   Batch = 1;
  // }

  // if (QtyPer == 0) {
  //   QtyPer = 1;
  // }
  // if (QtyBy == 0) {
  //   QtyBy = 1;
  // }

  // console.log("qty_order_scrap: ", qty_order_scrap);
  // console.log("pcs_hr: ", pcs_hr);
  // console.log("set_up_time: ", set_up_time);
  // console.log("setup_timehr_per: ", setup_timehr_per);
  // console.log("QtyPer: ", QtyPer);
  // console.log("QtyBy: ", QtyBy);
  // console.log("Scrap: ", Scrap);
  // console.log("NoMch: ", NoMch);
  // console.log("Batch: ", Batch);

  if (setup_timehr_per == "B") {
    //QtyOrder, QtyPer, QtyBy, Scrap, NoMch, Batch
    bo = BatchOrder(qty_order_scrap, QtyPer, QtyBy, Scrap, NoMch, Batch);
    n_setup_time = bo * set_up_time;
  } else if (setup_timehr_per == "O") {
    n_setup_time = set_up_time;
  } else if (setup_timehr_per == "Q") {
    n_setup_time = qty_order_scrap * set_up_time;
  }

  // console.log("n_setup_time: ", n_setup_time);
  return n_setup_time;
}

//ฟังก์ชัน intersec กะ
function isDateBetween(date1, date2, date3) {
  const timestamp1 = new Date(date1).getTime();
  const timestamp2 = new Date(date2).getTime();
  const timestamp3 = new Date(date3).getTime();

  return timestamp3 >= timestamp1 && timestamp3 <= timestamp2;
}

// ฟังก์ชันคำนวณวันที่ย้อนหลัง 560 นาที
function calculatePreviousDateRange(startDateString, endDateString, minutes) {
  const startDate = new Date(startDateString);
  const endDate = new Date(endDateString);

  // ลบ 560 นาที
  const newStartDate = new Date(startDate.getTime() - minutes * 60 * 1000);
  const newEndDate = new Date(endDate.getTime() - minutes * 60 * 1000);

  // นำผลลัพธ์กลับมาในรูปแบบ 'YYYY-MM-DD HH:mm:ss'
  const formattedStartDate = newStartDate
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");
  const formattedEndDate = newEndDate
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  return {
    start: formattedStartDate,
    end: formattedEndDate,
  };
}

// ฟังก์ชันคำนวณวันที่ย้อนหลัง 560 นาที
function calculatePreviousDate22(dateString, minutes) {
  const originalDate = new Date(dateString);
  const newDate = new Date(originalDate.getTime() - minutes * 60 * 1000); // แปลงเป็นมิลลิวินาทีแล้วลบ

  // นำผลลัพธ์กลับมาในรูปแบบ 'YYYY-MM-DD HH:mm:ss'
  const formattedDate = newDate.toISOString().slice(0, 19).replace("T", " ");

  return formattedDate;
}

// ฟังก์ชันคำนวณความต่างของเวลาในชั่วโมง
function calculateHourDifference(date1, date2) {
  const timestamp1 = new Date(date1).getTime();
  const timestamp2 = new Date(date2).getTime();

  // หาความต่างของ timestamp แล้วแปลงเป็นชั่วโมง
  const hourDifference = Math.abs(timestamp2 - timestamp1) / (1000 * 60 * 60);

  return hourDifference;
}

function calculateTimeDifference(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (start > end) {
    // console.log("calculateTimeDifference start > end");
    end.setDate(end.getDate() + 1);
  } else {
    // console.log("calculateTimeDifference start < end");
  }

  // console.log("calculateTimeDifference startTime: ", start);
  // console.log("calculateTimeDifference endTime: ", end);

  // คำนวณความต่างของเวลาในมิลลิวินาที
  const timeDifference = end - start;

  // console.log("calculateTimeDifference timeDifference: ", timeDifference);

  // แปลงมิลลิวินาทีเป็นนาทีและปัดเศษ
  const minutesDifference = Math.floor(timeDifference / (1000 * 60));

  // console.log("calculateTimeDifference minutesDifference: ", minutesDifference);

  return minutesDifference;
}

function ScrapPercentage(scrap) {
  let scrap_per = 0;

  scrap_per = 1 + scrap / 100;

  return scrap_per;
}

// batch / machine
// batch ord = ((((qtyord * qty per)/qty by)*scrap)/no.mch)/batch
// batch ord = (((( 1000*10)/2)*1.02)/2/500
// batch ord = 5.1 > 6  = 6 batch/mch
// qtyord2/opn = (( 1000*10)/2)*1.02)/2 = 2550

// opn1 mch1 batch 1 >500
// opn1 mch1 batch 2 >500
// opn1 mch1 batch 3 > 500
// opn1 mch1 batch 4 > 500
// opn1 mch1 batch 5 > 500
// opn1 mch1 batch 6 > 50
// opn1 mch2 batch 7 >500
// opn1 mch2 batch 8 >500
// opn1 mch2 batch 9 > 500
// opn1 mch2 batch 10 > 500
// opn1 mch2 batch 11 > 500
// opn1 mch2 batch 12 > 50

exports.update = async (req, res) => {
  try {
    res
      .status(201)
      .json(await ProductionOrderService.update(req.params.id, req.body));
  } catch (error) {
    res.status(204).json({ message: "Item ID Duplicate" });
    return;
  }
};

exports.getAlldatabycompany = async (req, res) =>
  res.json(await ProductionOrderService.getAlldatabycompany(req.params.id));

exports.delete = async (req, res) => {
  res.json(await ProductionOrderService.delete(req.params.id));
};

exports.productionstatusreport = async (req, res) => {
  console.log(req.body);
  res.json(await ProductionOrderService.productionstatusreport(req.body));
};

exports.putUpdateDockRunningNo = async (req, res) => {
  res.json(
    await ProductionOrderService.putUpdateDockRunningNo(
      req.params.doc_running,
      req.body
    )
  );
};

exports.updateTblOrd = async (req, res) => {
  try {
    res
      .status(201)
      .json(await ProductionOrderService.updateTblOrd(req.params.id, req.body));
  } catch (error) {
    res.status(204).json({ message: error });
    return;
  }
};

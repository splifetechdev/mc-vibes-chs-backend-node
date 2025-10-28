const nodeCron = require("node-schedule");
const costingRepository = require("../repositories/costing.repository");
const cost_foh_per_opnRepository = require("../repositories/cost_foh_per_opn.repository");
const cost_labor_per_opnRepository = require("../repositories/cost_labor_per_opn.repository");
const cost_per_timecardRepository = require("../repositories/cost_per_timecard.repository");
const orderRepository = require("../repositories/order.repository");
const tbl_routingRepository = require("../repositories/tbl_routing.repository");
const item_masterRepository = require("../repositories/item_master.repository");



exports.scheduleJob_Automatic_Bank_Report = async () => {
  console.log(`scheduleJob_Automatic_Bank_Report`);

  // var today = new Date();
  // var lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  // var Year = lastDayOfMonth.getFullYear();
  // var Month = lastDayOfMonth.getMonth() + 1;
  // today = formatDate(today);
  // lastDayOfMonth = formatDate(lastDayOfMonth);

  //   console.log(`today: ${today}`);
  //   console.log(`lastDayOfMonth: ${lastDayOfMonth}`);
  //   console.log(`Year: ${Year}`);
  //   console.log(`Month: ${Month}`);

  // if (today === lastDayOfMonth) {
  //   console.log(`today === lastDayOfMonth`);
  //   const notificationService = require("./notification.service");
  //   await notificationService.createExcel(Year, Month);
  // }

  // const notificationService = require("./notification.service");
  // await notificationService.createExcel(Year, 11);

  const payload = { hour: 23, minute: 00 };
//   จะรัน scheduleJob ทุกๆ 10 วินาที
//   "*/10 * * * * *"
  nodeCron.scheduleJob(payload, async () => {
    var today = new Date();
    var lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    var Year = lastDayOfMonth.getFullYear();
    var Month = lastDayOfMonth.getMonth() + 1;
    today = formatDate(today);
    lastDayOfMonth = formatDate(lastDayOfMonth);

    //เปิดใช้งานกับ production
    // ตัวใช้งานให้ใส่ lastDayOfMonth แทน today ตัวที่ 2
    if (today === lastDayOfMonth) {
      console.log(`today === lastDayOfMonth`);
      const notificationService = require("./notification.service");
      await notificationService.createbankExcel(Year, Month);
    }

  });
  console.log(
    `Scheduled Notifications to run at: ${payload.hour}:${payload.minute}`
  );
};


exports.scheduleJob_Costing = async () => {

  console.log(`scheduleJob_Costing`);
  const payload = { hour: 00, minute: 00};
  // const payload = "*/5 * * * * *";

  nodeCron.scheduleJob(payload, async () => {
    var today = new Date();
    var todayformat = formatDate(today.setDate(today.getDate() - 1));
    var currentDate = today.toLocaleDateString('en-GB', { timeZone: 'Asia/Bangkok' });

  
    // หาวันสุดท้ายของเดือนปัจจุบัน
    var lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    var end_date = lastDayOfMonth.toLocaleDateString('en-GB', { timeZone: 'Asia/Bangkok' });
    // console.log("today: " + todayformat)
    // console.log("currentDate: " + currentDate)
    // console.log("end_date: " + end_date)
    for(i=1;i<=2;i++){
      await cost_foh_per_opnRepository.deletebydate(formatDate(today.setDate(today.getDate() - i)));
      
    const result = await costingRepository.findALldataV_FOH_per_opn({date:formatDate(new Date().setDate(new Date().getDate() - i))});
    if(result.length > 0){

        result.forEach(async(x,i)=>{
          try {
          await cost_foh_per_opnRepository.create({
            tcdate: x.tcdate,
            mch_id: x.machine_id,
            wc_id: x.work_center_id,
            opn_count: x.opn_count,
            foh_per_opn: x.foh_rate_per_opn,
            voh_per_opn: x.voh_rate_per_opn
          });
        }catch (error) {
          console.error(error);
        }
      });
    }
  }


  });
  console.log(
    `Scheduled Notifications scheduleJob Costing:`
  );
};


exports.scheduleJob_Costing_Labor_per_opn = async () => {

  console.log(`scheduleJob_Costing_Labor_per_opn`);
  const payload = { hour: 00, minute: 01};
  // const payload = "*/5 * * * * *";
  nodeCron.scheduleJob(payload, async () => {
    var today = new Date();
    var todayformat = formatDate(today.setDate(today.getDate() - 1));
    var currentDate = today.toLocaleDateString('en-GB', { timeZone: 'Asia/Bangkok' });

  
    // หาวันสุดท้ายของเดือนปัจจุบัน
    var lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    var end_date = lastDayOfMonth.toLocaleDateString('en-GB', { timeZone: 'Asia/Bangkok' });
    // console.log("today: " + todayformat)
    // console.log("currentDate: " + currentDate)
    // console.log("end_date: " + end_date)
    for(i=1;i<=2;i++){
    await cost_labor_per_opnRepository.deletebydate(formatDate(new Date().setDate(new Date().getDate() - i)));

    const result = await costingRepository.findALldataV_Labor_per_opn({date:formatDate(new Date().setDate(new Date().getDate() - i))});
    if(result.length > 0){

        result.forEach(async(x,i)=>{
          try {
          await cost_labor_per_opnRepository.create({
            tc_date: x.tcdate,
            worker_id: x.worker_id,
            opn_count: x.opn_count,
            emp_rate: x.emp_rate,
            labor_per_opn: x.labor_rate_per_opn
          });
        }catch (error) {
          console.error(error);
        }
      });
    }
  }


  });
  console.log(
    `Scheduled Notifications scheduleJob_Costing_Labor_per_opn:`
  );
};

exports.scheduleJob_Costing_FOH_cost_detail = async () => {

  console.log(`scheduleJob_Costing_FOH_cost_detail`);
  const payload = { hour: 00, minute: 02};
  // const payload = "*/5 * * * * *";
  nodeCron.scheduleJob(payload, async () => {
    var today = new Date();
    var todayformat = formatDate(today.setDate(today.getDate() - 1));
    var currentDate = today.toLocaleDateString('en-GB', { timeZone: 'Asia/Bangkok' });

  
    // หาวันสุดท้ายของเดือนปัจจุบัน
    var lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    var end_date = lastDayOfMonth.toLocaleDateString('en-GB', { timeZone: 'Asia/Bangkok' });
    // console.log("today: " + todayformat)
    // console.log("currentDate: " + currentDate)
    // console.log("end_date: " + end_date)
    for(i=1;i<=2;i++){
    await cost_per_timecardRepository.deletebydate(formatDate(new Date().setDate(new Date().getDate() - i)));

    const result = await costingRepository.findALldataV_FOH_cost_detail({date:formatDate(new Date().setDate(new Date().getDate() - i))});
    if(result.length > 0){
        result.forEach(async(x,i)=>{
          try {
          await cost_per_timecardRepository.create({
            timecard_detail_id: x.tcdid,
            opn_ord_id: x.opn_ord_id,
            timecard_date: x.tcdate_start,
            act_foh: x.act_foh,
            act_voh: x.act_voh,
            act_labor:0,
          });
        }catch (error) {
          console.error(error);
        }
      });
    }
  }


  });
  console.log(
    `Scheduled Notifications scheduleJob_Costing_FOH_cost_detail:`
  );
};

exports.scheduleJob_Costing_Labor_cost_detail = async () => {

  console.log(`scheduleJob_Costing_Labor_cost_detail`);
  const payload = { hour: 00, minute: 03};
  // const payload = "*/5 * * * * *";
  nodeCron.scheduleJob(payload, async () => {
    var today = new Date();
    var todayformat = formatDate(today.setDate(today.getDate() - 1));
    var currentDate = today.toLocaleDateString('en-GB', { timeZone: 'Asia/Bangkok' });

  
    // หาวันสุดท้ายของเดือนปัจจุบัน
    var lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    var end_date = lastDayOfMonth.toLocaleDateString('en-GB', { timeZone: 'Asia/Bangkok' });
    // console.log("today: " + todayformat)
    // console.log("currentDate: " + currentDate)
    // console.log("end_date: " + end_date)
    for(i=1;i<=2;i++){
    const result = await costingRepository.findALldataV_Labor_cost_detail({date:formatDate(new Date().setDate(new Date().getDate() - i))});
    if(result.length > 0){
        result.forEach(async(x,i)=>{
          try {
          await cost_per_timecardRepository.updatemanywhere({
            timecard_detail_id: x.tcdid,
            opn_ord_id: x.opn_ord_id,
            timecard_date: x.tcdate_start,
            act_labor:x.act_labor,
          });
        }catch (error) {
          console.error(error);
        }
      });
    }
  }
  

  });
  console.log(
    `Scheduled Notifications scheduleJob_Costing_Labor_cost_detail:`
  );
};



function formatDate(date) {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
}

exports.InsertItemMasterDataFromEcons = async () => {
  console.log(`scheduleJob InsertItemMasterDataFromEcons`);
  // const payload = { hour: 00, minute: 00};
  // const payload = "*/5 * * * * *";

  // รันตอน 00:00 และ 12:00
  // '0 0,12 * * *'
  //'50 8,20 * * *'

  nodeCron.scheduleJob('0 0,12 * * *', async () => {
    var today = new Date();
    var todayformat = formatDate(today.setDate(today.getDate() - 1));
    var currentDate = today.toLocaleDateString('en-GB', { timeZone: 'Asia/Bangkok' });
    // หาวันสุดท้ายของเดือนปัจจุบัน
    var lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    var end_date = lastDayOfMonth.toLocaleDateString('en-GB', { timeZone: 'Asia/Bangkok' });
      
    const result = await item_masterRepository.V_ItemMaster_From_Econs();
    if(result.length > 0){
        result.forEach(async(x,i)=>{
                        try {
                       await item_masterRepository.create({
              company_id: 1,
              item_group_id: x.item_group_id,
              item_type: x.item_type,
              item_id: x.item_id,
              item_name: x.item_name,
              unit_id: x.unit_id,
              alias_name: x.alias_name,
              sheft_id: x.sheft_id,
              dim_group_id: x.dim_group_id,
              model_group_id: x.model_group_id,
              last_purchase_price: x.last_purchase_price,
              cost_price: x.cost_price,
              sales_price: x.sales_price,
              raw_material: x.raw_material,
              std_dl: x.std_dl,
              std_foh: x.std_foh,
              std_voh: x.std_voh,
              user_create:1,
              user_update:1,
              });
                      }catch (error) {
                        console.error(error);
                      }
                    });
    }


  });
  console.log(
    `Scheduled Notifications scheduleJob InsertItemMasterDataFromEcons:`
  );
};


exports.InsertORDDataFromEcons = async () => {
  console.log(`scheduleJob InsertDataFromEcons`);
  // const payload = { hour: 00, minute: 00};
  // const payload = "*/5 * * * * *";

  // รันตอน 00:00 และ 12:00
  // '0 0,12 * * *'
  //'50 8,20 * * *'

  nodeCron.scheduleJob('0 0,12 * * *', async () => {
    var today = new Date();
    var todayformat = formatDate(today.setDate(today.getDate() - 1));
    var currentDate = today.toLocaleDateString('en-GB', { timeZone: 'Asia/Bangkok' });
    // หาวันสุดท้ายของเดือนปัจจุบัน
    var lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    var end_date = lastDayOfMonth.toLocaleDateString('en-GB', { timeZone: 'Asia/Bangkok' });
    // console.log("today: " + todayformat)
    // console.log("currentDate: " + currentDate)
    // console.log("end_date: " + end_date)
      // await cost_foh_per_opnRepository.deletebydate(formatDate(today.setDate(today.getDate() - i)));
      
    const result = await orderRepository.V_ORD_From_Econs();
    if(result.length > 0){
        result.forEach(async(x,i)=>{
          try {
          await orderRepository.create({
            doc_module_name: x.module,
      doc_running_no: x.REFMFG,
      item_master_id: x.itemid,
      order_qty: x.QTYORD,
      rtg_id: x.rtgid,
      line_of_mch: '1',
      order_date: x.ORDDATE,
      due_date: x.DUEDATE,
      due_time:'01:00:00.0000000',
      status: 'D',
      company_id: 1,
      qty_receive: x.QTYRCD,
      qty_remain: x.remain,
      qty_kg: 0,
      user_create: 1,
      user_update: 1,
          });
        }catch (error) {
          console.error(error);
        }
      });
    }


  });
  console.log(
    `Scheduled Notifications scheduleJob InsertDataFromEcons:`
  );
};

exports.InsertRoutingDataFromEcons = async () => {
  console.log(`scheduleJob InsertRoutingDataFromEcons`);
  // const payload = { hour: 00, minute: 00};
  // const payload = "*/5 * * * * *";

  // รันตอน 00:00 และ 12:00
  // '0 0,12 * * *'
  //'50 8,20 * * *'

  nodeCron.scheduleJob('0 0,12 * * *', async () => {
    var today = new Date();
    var todayformat = formatDate(today.setDate(today.getDate() - 1));
    var currentDate = today.toLocaleDateString('en-GB', { timeZone: 'Asia/Bangkok' });
    // หาวันสุดท้ายของเดือนปัจจุบัน
    var lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    var end_date = lastDayOfMonth.toLocaleDateString('en-GB', { timeZone: 'Asia/Bangkok' });
    // console.log("today: " + todayformat)
    // console.log("currentDate: " + currentDate)
    // console.log("end_date: " + end_date)
      // await cost_foh_per_opnRepository.deletebydate(formatDate(today.setDate(today.getDate() - i)));
      
    const result = await tbl_routingRepository.V_Routing_From_Econs();
    if(result.length > 0){
        result.forEach(async(x,i)=>{
          try {
          await tbl_routingRepository.create({
           rtg_id: x.rtgid,
      company_id: 1,
      item_master_id: x.itemid,
      opn_id: x.OPN,
      opn_name: x.OPNDESC,
      work_center_id: x.wcid,
      no_of_machine: '1',
      machine_id: x.mchid,
      unit_id: 3,
      predecessor: 0,
      dependency: 'FS',
      setup_time: x.SUHR,
      setup_timehr_per: 'O',
      eoq: x.EOQ,
      pcs_hr: x.PCSHR,
      hr_pcs: x.HR_PCS,
      qty_per:1,
      qty_by: 1,
      scrap: 0,
      batch: 0,
      over_lap_time: 0,
      over_lap_unit: 0,
      std_cost: x.rtgid == '00'? 1 : 0,
      std_dl: x.stddl?x.stddl:0,
      std_foh: x.stdfoh?x.stdfoh:0,
      std_voh: x.stdvoh?x.stdvoh:0,
      std_setup_time_pc: x.stdsetup?x.stdsetup:0,
      operation_cost: (x.stddl?x.stddl:0)+(x.stdfoh?x.stdfoh:0)+(x.stdvoh?x.stdvoh:0)+(x.stdsetup?x.stdsetup:0),
      iot_um_conv: x.uom,
      user_create:1,
      user_update: 1,
          });
        }catch (error) {
          console.error(error);
        }
      });
    }


  });
  console.log(
    `Scheduled Notifications scheduleJob InsertRoutingDataFromEcons:`
  );
};
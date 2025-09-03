const { Op, where } = require("sequelize");
const db = require("../db/models");
const tbl_workerService = require("../services/tbl_worker.service");
const tbl_time_card_service = require("../services/tbl_time_card.service");
const doc_running_service = require("../services/doc_running.service");
const u_define_module_service = require("../services/u_define_module.service");
const departmentService = require("../services/department.service");
const positionService = require("../services/position.service");
const divisionService = require("../services/division.service");
const sectionService = require("../services/section.service");
const timezone = require("dayjs/plugin/timezone");
const utc = require("dayjs/plugin/utc");
const dayjs = require("dayjs");
const sequelize = require("../db/sequelize");
dayjs.extend(utc);
dayjs.extend(timezone);

exports.addUserAccount = async (req, res) => {
  if(req.body.emp_rate == "" || !req.body.emp_rate || req.body.emp_rate == null || req.body.emp_rate == "null"){
    req.body.emp_rate = null;
  }
  res.json(await tbl_workerService.add(req.body));
  // let findsystem_id = await tbl_workerService.findSystemId()
  // if(!findsystem_id[0] || !findsystem_id[0].id){
  //   req.params.file_number = 1;
  // }else{
  //   req.params.file_number = parseInt(findsystem_id[0].id + 1);
  // }
  // upload(req, res, async (error) => {
  //   if (error) {
  //     console.log(`error: ${JSON.stringify(error)}`);
  //     return res.status(500).json({ message: error.message });
  //   }
  //   req.body.id = req.params.file_number;
  //   res.status(200).json(await tbl_workerService.add(req.body));
  // });
};

exports.getByCompany = async (req, res) =>
  res.json(await tbl_workerService.findByCompany(req.requester_company_id));

exports.getAll = async (req, res) =>
  res.json(await tbl_workerService.findAll());

exports.update = async (req, res) => {
  if(req.body.emp_rate == "" || !req.body.emp_rate || req.body.emp_rate == null || req.body.emp_rate == "null"){
    req.body.emp_rate = null;
  }
  res.json(await tbl_workerService.update(req.params.id, req.body));
};

exports.delete = async (req, res) =>
  res.json(await tbl_workerService.delete(req.params.id));

exports.getFindId = async (req, res) =>
  res.json(await tbl_workerService.findId(req.params.id));

exports.changeapprovalworker = async (req, res) => {
  // res.json(await accountService.changeapprovallv1(req.body));
  await tbl_workerService.changeapprovallv1(req.body);
  await tbl_workerService.changeapprovallv2(req.body);
  res.json(await tbl_workerService.changeapprovallv3(req.body));
};

exports.checkIn = async (req, res) => {
  try {
    const { shift_id, worker_ids, machine_opn_ids, doc_date } = req.body;
    if (machine_opn_ids.length === 0) {
      return res.status(400).json({
        message: "Please select at least one operation",
      });
    }
    const shift = await db.tbl_shift.findOne({
      where: {
        id: shift_id,
      },
    });
    if (!shift) {
      return res.status(400).json({
        message: "Shift not found",
      });
    }
    const currentDate = dayjs().format("YYYY-MM-DD");
    const startShiftDate = dayjs(`${shift.start_time}`).tz("utc");
    const endShiftDate = dayjs(`${shift.end_time}`).tz("utc");
    const startTime = startShiftDate.format("HH:mm");
    const endTime = endShiftDate.format("HH:mm");
    const workerIdsStr = worker_ids.sort().join(",");
    const existingDetails = await db.tbl_time_card_detail.findAll({
      where: {
        created_at: {
          [Op.gte]: dayjs().startOf("day").toDate(),
          [Op.lte]: dayjs().endOf("day").toDate(),
        },
      },
      include: [
        {
          model: db.tbl_time_card_detail_worker,
          where: {
            worker_id: {
              [Op.in]: worker_ids,
            },
          },
          required: true,
        },
        {
          model: db.tbl_time_card,
          where: {
            shift_id: shift.id,
            doc_date: {
              [Op.gte]: dayjs(doc_date).startOf("day").toDate(),
              [Op.lte]: dayjs(doc_date).endOf("day").toDate(),
            },
          },
          required: true,
        },
      ],
    });
    if (existingDetails.length > 0) {
      console.log({
        existingDetails: existingDetails.map((data) => ({
          ...data.dataValues,
        })),
      });
      console.log({ machine_opn_ids });
      const isCheckedOnMachine = machine_opn_ids.some(([machineId, opnId]) => {
        return existingDetails.some(
          (detail) => detail.mch_id == machineId && opnId == detail.opn_ord_id
        );
      });
      if (isCheckedOnMachine) {
        return res.status(400).json({
          message: "Worker already checked in with this machine and shift",
        });
      }
    }

    const docGroups = await doc_running_service.findByGroupName(
      "TC",
      req.requester_company_id
    );
    const doc_group_id = docGroups[0].id;
    const docRunning = await doc_running_service.findOneById(doc_group_id);
    const runningNumber = await doc_running_service.docGenerate(
      docRunning.module
    );
    const timecard = await tbl_time_card_service.create({
      company_id: req.requester_company_id,
      doc_running_id: doc_group_id,
      time_card_type: "worker",
      doc_running_no: runningNumber,
      created_by: req.requester_id,
      updated_by: req.requester_id,
      doc_date: dayjs(doc_date).utc().toDate(),
      worker_ids: workerIdsStr,
      shift_id: shift.id,
    });

    let timecardDetails = [];
    const machineCache = {};
    const opnCache = {};
    if (machine_opn_ids.length > 0) {
      timecardDetails = await Promise.all(
        machine_opn_ids.map(async ([machineId, opnId]) => {
          let machineData = {};
          let opnData = {};
          if (machineId in machineCache) {
            machineData = machineCache[machineId];
          } else {
            const machine = await db.tbl_mch.findOne({
              where: {
                id: machineId,
              },
            });
            machineCache[`${machine.id}`] = machine;
            machineData = machine;
          }

          if (opnId in opnCache) {
            opnData = opnCache[opnId];
          } else {
            const opn = await db.tbl_opn_ord.findOne({
              where: {
                id: opnId,
              },
            });
            opnCache[`${opn.id}`] = opn;
            opnData = opn;
          }

          const rtg = await db.tbl_routing.findOne({
            where: {
              rtg_id: opnData.rtg_id,
              opn_id: opnData.opn_id,
              company_id: req.requester_company_id,
            },
          });

          return {
            time_card_id: timecard.id,
            opn_ord_id: opnData.id,
            mch_id: machineData.id,
            opn_desc: rtg ? rtg.opn_name : "",
            opn_id: opnData.opn_id,
            item_id: opnData.item_master_id,
            wo_type: "N",
            time_start: startTime,
            time_end: endTime,
            time_card_date: dayjs(doc_date).utc().toDate(),
            created_by: req.requester_id,
            updated_by: req.requester_id,
            wo_running_no: opnData.doc_running_no,
            batch: opnData.batch,
          };
        })
      );
      await db.tbl_opn_ord.update(
        { prod_status: "S" },
        {
          where: {
            id: {
              [Op.in]: timecardDetails.map((job) => job.opn_ord_id),
            },
          },
        }
      );
    } else {
      timecardDetails = [
        {
          time_card_id: timecard.id,
          wo_type: "N",
          time_start: startTime,
          time_end: endTime,
          time_card_date: dayjs(doc_date).utc().toDate(),
          created_by: req.requester_id,
          updated_by: req.requester_id,
        },
      ];
    }
    const createdDetails = await db.tbl_time_card_detail.bulkCreate(
      timecardDetails
    );
    createdDetails.map((timecardDetail) => {
      const workerData = worker_ids.map((id) => ({
        time_card_detail_id: timecardDetail.id,
        worker_id: id,
      }));
      db.tbl_time_card_detail_worker.bulkCreate(workerData);
    });
    const [timecardUdefined] =
      await u_define_module_service.getUdefineIDByCompanyAndModuleName(
        "Timecard",
        req.requester_company_id
      );
    await db.u_define_master.create({
      module_master_id: timecard.id,
      company_id: req.requester_company_id,
      u_define_module_id: timecardUdefined.id,
      numeric1: "",
      numeric2: "",
      date1: new Date(),
      date2: new Date(),
      boolean1: false,
      boolean2: false,
      char1: "",
      char2: "",
      text1: "",
      text2: "",
    });
    return res.json({ message: "success", createdDetails });
  } catch (error) {
    console.error({ error });
    return res.status(500).json({
      message: error.message,
    });
  }
};


exports.import_worker = async (req, res) => {
  let dataAllinsertlength = [];
  let dataAllfaillength = [];
  let newData = [];
  if(req.body.length > 0){
    newData = req.body.slice(2);
    // return res.json({ message: "No data" });
    newData.forEach(async(item,index) => {
      const checkemp_id =  await tbl_workerService.findByemp_id(String(item[0]),req.requester_company_id);
      const getdapartment_id =  await departmentService.findBycode(String(item[8]),req.requester_company_id);
      const getposition_id =  await positionService.findByname(String(item[9]),req.requester_company_id);
      const getdivision_id =  await divisionService.findBycode(String(item[10]),req.requester_company_id);
      const getsection_id =  await sectionService.findBycode(String(item[11]),req.requester_company_id);
      
      // const checkemp_id =  await tbl_workerService.findByemp_id(String(item.emp_id));
     if(checkemp_id?.emp_id || !getdapartment_id?.id || !getposition_id?.id){
      // console.log("ไม่มีข้อมูล");
      dataAllfaillength.push(item);
     }else{
      let data = {
        emp_id: item[0],
        email:"",
        prename_th: item[1],
        firstname: item[2],
        lastname: item[3],
        prename_en: item[4],
        firstname_en: item[5],
        lastname_en: item[6],
        abbname_en: item[7],
        department_id: getdapartment_id?.id,
        position_id: getposition_id?.id,
        division_id:getdivision_id?.id ?? null,
        section_id:getsection_id?.id ?? null,
        level: item[12],
        entry_date: item[13],
        user_role:"WORKER",
        email_verified:0,
        company_id: req.requester_company_id,
        authorize_id: 2,
        emp_rate: item[14],
        emp_status:"A",
        image:"",
        user_create:req.requester_id,
        user_update:req.requester_id,
      };
      // console.log("data:", data);

      try {
          dataAllinsertlength.push(data);
        await tbl_workerService.add(data);
     
      } catch (error) {
          console.log(error)
        dataAllfaillength.push(data);
      }
     }
     if(index == newData.length - 1){
      res.json({ message: "Import data successfully", total:newData.length, insert:dataAllinsertlength.length, fail:newData.length-dataAllinsertlength.length });
      return;

     }
    });
  }else{
    res.json({ message: "No data" });
    return;
  }
 
}
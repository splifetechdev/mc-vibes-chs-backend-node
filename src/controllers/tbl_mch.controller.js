const tbl_mch_service = require("../services/tbl_mch.service");
const u_define_moduleService = require("../services/u_define_module.service");
const u_define_masterService = require("../services/u_define_master.service");
const WorkCenterService = require("../services/work_center.service");

exports.getAll = async (req, res) =>
  res.json(await tbl_mch_service.find_all(req.params.company_id));

exports.getAllMchToAdjustPOByCompany = async (req, res) =>
  res.json(
    await tbl_mch_service.findAllMchToAdjustPOByCompany(req.params.company_id)
  );

exports.get_mch_adjust_list = async (req, res) =>
  res.json(await tbl_mch_service.find_mch_adjust_list(req.params.company_id));

exports.get_by_id = async (req, res) =>
  res.json(
    await tbl_mch_service.find_by_id(
      req.params.mch_id,
      req.params.u_define_module_id
    )
  );

exports.get_machine_by_id = async (req, res) => {
  res.json(await tbl_mch_service.find_machine_by_id(req.params.mch_id));
};

exports.findByWorkcenterId = async (req, res) =>
  res.json(await tbl_mch_service.findByWorkcenterId(req.params.work_center_id));

exports.create = async (req, res) => {
  try {
    const result = await tbl_mch_service.create(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    res
      .status(201)
      .json(await tbl_mch_service.update(req.params.mch_id, req.body));
  } catch (error) {
    res.json({ message: error.message });
    return;
  }
};

exports.delete = async (req, res) => {
  res.json(await tbl_mch_service.delete(req.params.mch_id));
};

exports.getdataganttchart = async (req, res) => {
  if (req.body.typesearch == "Month") {
    res.json(
      await tbl_mch_service.getdataganttchart(
        req.params.work_center_id,
        req.body
      )
    );
  } else {
    res.json(
      await tbl_mch_service.getdataganttchartday(
        req.params.work_center_id,
        req.body
      )
    );
  }
};

exports.import_mch = async (req, res) => {
  let dataAllinsertlength = [];
  let dataAllfaillength = [];
  let newData = [];
  if(req.body.length > 0){
    newData = req.body.slice(2);

    const result_udefine = await u_define_moduleService.getUdefineIDByCompanyAndModuleName('Machine',req.requester_company_id);
    // return res.json({ message: "No data" });
    newData.forEach(async(item,index) => {
      const checkwc =  await WorkCenterService.findBywc_id(String(item[1]),req.requester_company_id);
      if(!checkwc?.id){
      // console.log("ไม่มีข้อมูล");
      dataAllfaillength.push(item);
     }else{
      let data = {
        machine_id: item[0],
        work_center_id:checkwc?.id,
        name: item[2],
        is_active:1,
        company_id: req.requester_company_id,
        created_by:req.requester_id,
        updated_by:req.requester_id,
      };
      try {
        dataAllinsertlength.push(data);
       const result = await tbl_mch_service.create(data);
       if(result){
        await u_define_masterService.create(
          {
      module_master_id:result.id,
      u_define_module_id:result_udefine[0]?.id??0,
      numeric1: "",
      numeric2: "",
      company_id:req.requester_company_id?req.requester_company_id:0,
      date1: null,
      date2: null,
      boolean1: false,
      boolean2: false,
      char1: "",
      char2: "",
      text1: "",
      text2: "",
    }
        );
        }
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
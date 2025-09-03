const defect_causeService = require("../services/tbl_defect_cause.service");
const u_define_moduleService = require("../services/u_define_module.service");
const u_define_masterService = require("../services/u_define_master.service");

exports.getAll = async (req, res) =>
  res.json(await defect_causeService.findAll(req.params.id));

exports.getAllByID = async (req, res) =>
  res.json(await defect_causeService.findAllByID(req.params.id,req.params.u_define_id));


exports.create = async (req, res) => {
    try {
     res.json(await defect_causeService.create(req.body));
    } catch (err) {
      res.status(204).json({ message: "Defect Code Duplicate" });
    }
}
  

exports.update = async (req, res) => {
  try {
    res
      .status(201)
      .json(await defect_causeService.update(req.params.id, req.body));
  } catch (error) {
    res.json({ message: error.message });
    return;
  }
};

exports.delete = async (req, res) => {
  res.json(await defect_causeService.delete(req.params.id));
};

exports.import_defect_cause = async (req, res) => {
  let dataAllinsertlength = [];
  let dataAllfaillength = [];
  let newData = [];
  if(req.body.length > 0){
    newData = req.body.slice(2);

    const result_udefine = await u_define_moduleService.getUdefineIDByCompanyAndModuleName('DefectCause',req.requester_company_id);
    // return res.json({ message: "No data" });
    newData.forEach(async(item,index) => {
      // const checkwc_group =  await WorkCenterGroupService.findBywork_center_group_id(String(item[2]));
    //   if(!checkwc_group?.id){
    //   // console.log("ไม่มีข้อมูล");
    //   dataAllfaillength.push(item);
    //  }else{
      let data = {
        waste_code: item[0],
        description: item[1],
        company_id: req.requester_company_id,
        user_create:req.requester_id,
        user_update:req.requester_id,
      };
      try {
        dataAllinsertlength.push(data);
       const result = await defect_causeService.create(data);
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
    // }
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
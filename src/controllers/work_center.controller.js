const WorkCenterService = require("../services/work_center.service");
const u_define_moduleService = require("../services/u_define_module.service");
const u_define_masterService = require("../services/u_define_master.service");
const WorkCenterGroupService = require("../services/work_center_group.service");

exports.getAll = async (req, res) =>
  res.json(await WorkCenterService.findAll(req.params.id));

exports.getWorkCenterAndName = async (req, res) =>
  res.json(await WorkCenterService.findWorkCenterAndName(req.params.id));

  exports.getbyWorkcentergroup = async (req, res) =>
  res.json(await WorkCenterService.getbyWorkcentergroup(req.params.wc_group));

exports.getAllByID = async (req, res) =>
  res.json(
    await WorkCenterService.findAllByID(req.params.id, req.params.u_define_id)
  );

exports.getListAll = async (req, res) => {
  var tmpObject = [];

  const res_position = await WorkCenterService.findListAll();

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

  const res_position = await WorkCenterService.findListByCompany(
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
  res.json(await WorkCenterService.getAlldata());

// exports.create = async (req, res) =>
//   res.json(await WorkCenterService.create(req.body));

exports.create = async (req, res) => {
  try {
    res.json(await WorkCenterService.create(req.body));
  } catch (err) {
    res.status(204).json({ message: "Work Center ID Duplicate" });
  }
};

// exports.update = async (req, res) => {
//   try {
//     res
//       .status(201)
//       .json(await WorkCenterService.update(req.params.id, req.body));
//   } catch (error) {
//     res.json({ message: error.message });
//     return;
//   }
// };

exports.update = async (req, res) => {
  try {
    res
      .status(201)
      .json(await WorkCenterService.update(req.params.id, req.body));
  } catch (error) {
    res.status(204).json({ message: "Item ID Duplicate" });
    return;
  }
};

exports.getAlldatabycompany = async (req, res) =>
  res.json(await WorkCenterService.getAlldatabycompany(req.params.id));

exports.delete = async (req, res) => {
  res.json(await WorkCenterService.delete(req.params.id));
};

exports.findWorkCenterAllforganttchart = async (req, res) =>{
  if(req.body.typesearch == "Month"){
    res.json(await WorkCenterService.findWorkCenterAllforganttchart(req.params.id,req.body));
  }else{
    res.json(await WorkCenterService.findWorkCenterAllforganttchartday(req.params.id,req.body));
    
  }

}
 
exports.import_work_center = async (req, res) => {
  let dataAllinsertlength = [];
  let dataAllfaillength = [];
  let newData = [];
  if(req.body.length > 0){
    newData = req.body.slice(2);

    const result_udefine = await u_define_moduleService.getUdefineIDByCompanyAndModuleName('WorkCenter',req.requester_company_id);
    // return res.json({ message: "No data" });
    newData.forEach(async(item,index) => {
      const checkwc_group =  await WorkCenterGroupService.findBywork_center_group_id(String(item[2],req.requester_company_id));
      if(!checkwc_group?.id){
      // console.log("ไม่มีข้อมูล");
      dataAllfaillength.push(item);
     }else{
      let data = {
        wc_id: item[0],
        wc_name: item[1],
        wc_group: item[2],
        labor_rate: item[3],
        foh_rate:item[4],
        voh_rate:item[5],
        total_plan_hour: item[6],
        company_id: req.requester_company_id,
        user_create:req.requester_id,
        user_update:req.requester_id,
      };
      try {
        dataAllinsertlength.push(data);
       const result = await WorkCenterService.create(data);
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
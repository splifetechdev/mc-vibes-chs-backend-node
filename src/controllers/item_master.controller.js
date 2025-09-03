const item_masterService = require("../services/item_master.service");
const GroupItemService = require("../services/group_item.service");
const ItemTypeService = require("../services/item_type.service");
const tbl_sheftService = require("../services/tbl_sheft.service");
const UnitService = require("../services/unit.service");
const u_define_moduleService = require("../services/u_define_module.service");
const u_define_masterService = require("../services/u_define_master.service");


exports.getAll = async (req, res) =>
  res.json(await item_masterService.findAll(req.params.id));

exports.getAllByID = async (req, res) =>
  res.json(await item_masterService.findAllByID(req.params.id,req.params.u_define_id));

  exports.getAllByItemGroup = async (req, res) =>
  res.json(await item_masterService.getAllByItemGroup(req.params.id));


exports.getAlldata = async (req, res) =>
  res.json(await item_masterService.getAlldata());

exports.create = async (req, res) => {
  if(!req.body.last_purchase_price || req.body.last_purchase_price == ''){
    req.body.last_purchase_price = 0;
  }
  if(!req.body.cost_price || req.body.cost_price == ''){
    req.body.cost_price = 0;
  }
  if(!req.body.sales_price || req.body.sales_price == ''){
    req.body.sales_price = 0;
  }
  try {
  res.json(await item_masterService.create(req.body));
  }catch (err) {
    res.status(204).json({ message: "Item ID Duplicate"});
 }
}
  

exports.update = async (req, res) => {
  try {
    res
      .status(201)
      .json(await item_masterService.update(req.params.id, req.body));
  } catch (error) {
    res.status(204).json({ message: "Item ID Duplicate"});
    return;
  }
};

exports.getAlldatabycompany = async (req, res) =>
  res.json(await item_masterService.getAlldatabycompany(req.params.id));

  exports.delete = async (req, res) => {
    res.json(await item_masterService.delete(req.params.id));
}

exports.import_item_master = async (req, res) => {
  let dataAllinsertlength = [];
  let dataAllfaillength = [];
  let newData = [];
  if(req.body.length > 0){
    newData = req.body.slice(2);
    // return res.json({ message: "No data" });
    const result_udefine = await u_define_moduleService.getUdefineIDByCompanyAndModuleName('Item',req.requester_company_id);

    newData.forEach(async(item,index) => {
      const checkitem_master_id =  await item_masterService.findByitem_masterID(String(item[2]),req.requester_company_id);
      const checkunit_id =  await UnitService.findUnitByunit_name(String(item[4]),req.requester_company_id);
      const getitemgroup_id =  await GroupItemService.findGroupItemBygroup_item(String(item[0]),req.requester_company_id);
      const getitemtype_id =  await ItemTypeService.findItemTypeByitem_type(String(item[1]),req.requester_company_id);
      const getshelf_id =  await tbl_sheftService.findtbl_sheftByshf_id(String(item[6]),String(item[7]),String(item[8]));
    

      // return  res.json({ message: "No data" });

     if(checkitem_master_id?.id || !checkunit_id?.id || !getitemtype_id?.id){
      // console.log("ไม่มีข้อมูล");
      dataAllfaillength.push(item);
     }else{
      let data = {
        item_group_id:getitemgroup_id?.id ?? 0,
        item_type:getitemtype_id?.id,
        item_id:item[2],
        item_name:item[3],
        unit_id:checkunit_id?.id,
        alias_name:item[5],
        sheft_id:getshelf_id[0]?.id ?? null,
        last_purchase_price:item[9],
        last_purchase_price_date:item[10],
        cost_price:item[11],
        cost_price_date:item[12],
        sales_price:item[13],
        sales_price_date:item[14],
        raw_material:item[15],
        std_dl:item[16],
        std_foh:item[17],
        std_voh:item[18],
        std_setup_time_pc:item[19],
        company_id: req.requester_company_id,
        dim_group_id:0,
        model_group_id:0,
        user_create:req.requester_id,
        user_update:req.requester_id,
      };
      // console.log("data:", data);
      try {
        dataAllinsertlength.push(data);
         const result = await item_masterService.create(data);
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
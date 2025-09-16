const tbl_routingService = require("../services/tbl_routing.service");
const tbl_mchService = require("../services/tbl_mch.service");
const u_define_masterService = require("../services/u_define_master.service");
const item_masterService = require("../services/item_master.service");
const u_define_moduleService = require("../services/u_define_module.service");
const WorkCenterService = require("../services/work_center.service");
const tbl_mch_service = require("../services/tbl_mch.service");
const UnitService = require("../services/unit.service");

exports.getAll = async (req, res) =>
  res.json(await tbl_routingService.findAll(req.params.id));

exports.findroutingByID = async (req, res) =>
  res.json(await tbl_routingService.findroutingByID(req.params.id));

exports.getRoutingWorkOrder = async (req, res) =>
  res.json(
    await tbl_routingService.findRoutingWorkOrder(
      req.params.item_master_id,
      req.params.company_id
    )
  );

exports.findtbl_routingAllgroupby = async (req, res) =>
  res.json(await tbl_routingService.findtbl_routingAllgroupby(req.params.id));

exports.getAllByID = async (req, res) =>
  res.json(
    await tbl_routingService.findAllByID(req.params.id, req.params.u_define_id)
  );

exports.searchbyitem_rtg = async (req, res) => {
  const result = await tbl_routingService.searchbyitem_rtg(
    req.body.item_master_id,
    req.body.rtg_id,
    req.body.company_id,
    req.body.u_define_module_id
  );

  if (result.length > 0) {
    let setdataAll = [];
    setdataAll = await result.map(function (data) {
      return data.toJSON();
    });
    for (let index = 0; index <= setdataAll.length - 1; index++) {
      setdataAll[index].machine_name = "";
      setdataAll[index].setup_time = setdataAll[index].setup_time
        ? parseFloat(setdataAll[index].setup_time).toFixed(1)
        : setdataAll[index].setup_time;
      setdataAll[index].over_lap_time = setdataAll[index].over_lap_time
        ? parseFloat(setdataAll[index].over_lap_time).toFixed(1)
        : setdataAll[index].over_lap_time;
      if (setdataAll[index].predecessor !== 0) {
        let resultfrompd = await tbl_routingService.findroutingByID(
          setdataAll[index].predecessor
        );
        if (resultfrompd) {
          let dataoverlaptime = "";
          if (setdataAll[index].over_lap_time) {
            dataoverlaptime =
              setdataAll[index].over_lap_time > 0
                ? `+` + setdataAll[index].over_lap_time
                : setdataAll[index].over_lap_time;
          } else {
          }
          setdataAll[
            index
          ].pdinfo = `${resultfrompd.opn_id}${setdataAll[index].dependency} ${dataoverlaptime}`;
        }
      }

      let arraymcid = await setdataAll[index].machine_id.split(",");
      if (arraymcid.length > 0 && arraymcid[0]) {
        for (let imid = 0; imid <= arraymcid.length - 1; imid++) {
          let resultmc = await tbl_mchService.find_by_id_getname(
            arraymcid[imid]
          );
          if (imid == 0) {
            setdataAll[index].machine_name = `${resultmc.name}`;
          } else {
            setdataAll[index].machine_name += `,${resultmc.name}`;
          }
          if (imid == arraymcid.length - 1 && index == setdataAll.length - 1) {
            return res.json(setdataAll);
          }
        }
      } else {
        if (index == setdataAll.length - 1 && !arraymcid[0]) {
          return res.json(setdataAll);
        }
      }
    }
  } else {
    return res.json(result);
  }
};

// exports.checkvalidaterouting = async (req, res)=>{
//   res.json(await tbl_routingService.checkvalidaterouting(req.params));
// };

exports.create = async (req, res) => {
  try {
    let dataadd;
    let datagetIsrtg_idanditem_id;
    const checkdata = await tbl_routingService.checkvalidaterouting(req.body);
    if (checkdata) {
      res.status(204).json({ message: "Data Duplicate" });
    } else {
      dataadd = await tbl_routingService.create(req.body);
      if (dataadd && (req.body.std_cost == 1 || req.body.std_cost == true)) {
        datagetIsrtg_idanditem_id =
          await tbl_routingService.getIsrtg_idanditem_id(
            req.params.id,
            req.body.item_master_id,
            req.body.rtg_id
          );
        if (datagetIsrtg_idanditem_id) {
          await Promise.all(
            datagetIsrtg_idanditem_id.map(async (x) => {
              await tbl_routingService.update(x.id, { std_cost: 1 });
            })
          );
        }

        const datartg_id_item_id = await tbl_routingService.getrtg_id_item_id(
          req.params.id,
          req.body.item_master_id,
          req.body.rtg_id
        );
        if (datartg_id_item_id) {
          await Promise.all(
            datartg_id_item_id.map(async (x) => {
              await tbl_routingService.update(x.id, { std_cost: 0 });
            })
          );
        }
      }

      const datastd = await tbl_routingService.getSumSTD(
        req.body.item_master_id,
        req.body.rtg_id
      );
      if (datastd[0] && datastd[0].std_cost == 1) {
        await item_masterService.update(req.body.item_master_id, {
          std_dl: datastd[0].sumstd_dl,
          std_foh: datastd[0].sumstd_foh,
          std_voh: datastd[0].sumstd_voh,
          std_setup_time_pc: datastd[0].sumstd_setup_time_pc,
        });
        if (datagetIsrtg_idanditem_id) {
          await Promise.all(
            datagetIsrtg_idanditem_id.map(async (x) => {
              await tbl_routingService.update(x.id, {
                operation_cost:
                  parseFloat(datastd[0].sumstd_dl) +
                  parseFloat(datastd[0].sumstd_foh) +
                  parseFloat(datastd[0].sumstd_voh) +
                  parseFloat(datastd[0].sumstd_setup_time_pc),
              });
            })
          );
        }
      }

      res.status(200).json(dataadd);
    }
  } catch (err) {
    // console.log("add routing error: ", err);
    res.status(204).json({ message: "Data Duplicate" });
  }
};

exports.update = async (req, res) => {
  try {
    let datagetIsrtg_idanditem_id;
    const dataupdate = await tbl_routingService.update(req.params.id, req.body);
    if (dataupdate && (req.body.std_cost == 1 || req.body.std_cost == true)) {
      datagetIsrtg_idanditem_id =
        await tbl_routingService.getIsrtg_idanditem_id(
          req.params.id,
          req.body.item_master_id,
          req.body.rtg_id
        );
      if (datagetIsrtg_idanditem_id) {
        await Promise.all(
          datagetIsrtg_idanditem_id.map(async (x) => {
            await tbl_routingService.update(x.id, { std_cost: 1 });
          })
        );
      }

      const datartg_id_item_id = await tbl_routingService.getrtg_id_item_id(
        req.params.id,
        req.body.item_master_id,
        req.body.rtg_id
      );
      if (datartg_id_item_id) {
        await Promise.all(
          datartg_id_item_id.map(async (x) => {
            await tbl_routingService.update(x.id, { std_cost: 0 });
          })
        );
      }
    }

    const datastd = await tbl_routingService.getSumSTD(
      req.body.item_master_id,
      req.body.rtg_id
    );
    if (datastd[0] && datastd[0].std_cost == 1) {
      await item_masterService.update(req.body.item_master_id, {
        std_dl: datastd[0].sumstd_dl,
        std_foh: datastd[0].sumstd_foh,
        std_voh: datastd[0].sumstd_voh,
        std_setup_time_pc: datastd[0].sumstd_setup_time_pc,
      });
      if (datagetIsrtg_idanditem_id) {
        await Promise.all(
          datagetIsrtg_idanditem_id.map(async (x) => {
            await tbl_routingService.update(x.id, {
              operation_cost:
                parseFloat(datastd[0].sumstd_dl) +
                parseFloat(datastd[0].sumstd_foh) +
                parseFloat(datastd[0].sumstd_voh) +
                parseFloat(datastd[0].sumstd_setup_time_pc),
            });
          })
        );
      }
    }
    res.status(201).json({ message: "Successfully updated!" });
  } catch (error) {
    // res.json({ message: error.message });
    res.status(204).json({ message: "Item ID Duplicate" });
    return;
  }
};

exports.delete = async (req, res) => {
  await u_define_masterService.deletemodule_master_and_udefine(
    req.params.id,
    req.params.u_define_module_id
  );
  res.json(await tbl_routingService.delete(req.params.id));
};

exports.getItemhavestd_cost = async (req, res) =>
  res.json(
    await tbl_routingService.getItemhavestd_cost(
      req.params.item_master_id,
      req.params.company_id
    )
  );

  exports.import_routing = async (req, res) => {
    let dataAllinsertlength = [];
    let dataAllfaillength = [];
    let newData = [];
    if(req.body.length > 0){
      newData = req.body.slice(2);
  
      const result_udefine = await u_define_moduleService.getUdefineIDByCompanyAndModuleName('Routing',req.requester_company_id);
      // return res.json({ message: "No data" });
      newData.forEach(async(item,index) => {
        const checkitem_master_id =  await item_masterService.findByitem_masterID(String(item[1]),req.requester_company_id);
        const checkwc =  await WorkCenterService.findBywc_id(String(item[4]),req.requester_company_id);
        const checkmch =  await tbl_mch_service.findBy_MachineID(String(item[6]),req.requester_company_id);
        const checkunit =  await UnitService.findUnitByunit_name(String(item[7]),req.requester_company_id);
        
        if(!checkitem_master_id?.id || !checkwc?.id || !checkmch?.id || !checkunit?.id){
        // console.log("ไม่มีข้อมูล");
        dataAllfaillength.push(item);
       }else{
        let datastd_dl = checkwc.labor_rate / item[13];
        let datastd_foh = checkwc.foh_rate / item[13];
        let datastd_voh = checkwc.voh_rate / item[13];
        let datastd_setup_time_pc = item[11] == "O" || item[11] == "Q"?checkwc.labor_rate / (item[12] / item[10]):checkwc.labor_rate / (item[18] / item[10]);

        let data = {
          rtg_id:item[0],
          item_master_id:checkitem_master_id?.id,
          opn_id:item[2],
          opn_name:item[3],
          work_center_id:checkwc?.id,
          no_of_machine:item[5],
          machine_id:checkmch?.id,
          unit_id:checkunit?.id,
          predecessor:item[8],
          dependency:item[9],
          setup_time:item[10],
          setup_timehr_per:item[11],
          eoq:item[12],
          pcs_hr:item[13],
          hr_pcs:item[14],
          qty_per:item[15],
          qty_by:item[16],
          scrap:item[17],
          batch:item[18],
          over_lap_time:item[19],
          over_lap_unit:item[20],
          std_cost:item[21],
          iot_um_conv: item[22],
          std_dl: datastd_dl,
          std_foh: datastd_foh,
          std_voh: datastd_voh,
          std_setup_time_pc: datastd_setup_time_pc,
          operation_cost:datastd_dl + datastd_foh + datastd_voh + datastd_setup_time_pc,
          company_id: req.requester_company_id,
          user_create:req.requester_id,
          user_update:req.requester_id,
        };
        try {
           let dataadd;
    let datagetIsrtg_idanditem_id;
       
        //  const result = await tbl_routingService.create(data);
    const checkdata = await tbl_routingService.checkvalidaterouting(data);
    if (checkdata) {
      // res.status(204).json({ message: "Data Duplicate" });
    } else {
        dataAllinsertlength.push(data);
      dataadd = await tbl_routingService.create(data);
     
      if (dataadd && (item[21] == 1 || item[21] == true)) {
        datagetIsrtg_idanditem_id = await tbl_routingService.getIsrtg_idanditem_id(
            req.params.id,
            checkitem_master_id?.id,
            item[0]
          );
        if (datagetIsrtg_idanditem_id) {
          await Promise.all(
            datagetIsrtg_idanditem_id.map(async (x) => {
              await tbl_routingService.update(x.id, { std_cost: 1 });
            })
          );
        }

        const datartg_id_item_id = await tbl_routingService.getrtg_id_item_id(
          req.params.id,
          checkitem_master_id?.id,
          item[0]
        );
        if (datartg_id_item_id) {
          await Promise.all(
            datartg_id_item_id.map(async (x) => {
              await tbl_routingService.update(x.id, { std_cost: 0 });
            })
          );
        }
      }

      const datastd = await tbl_routingService.getSumSTD(
        checkitem_master_id?.id,
        item[0]
      );
      if (datastd[0] && datastd[0].std_cost == 1) {
        await item_masterService.update(checkitem_master_id?.id, {
          std_dl: datastd[0].sumstd_dl,
          std_foh: datastd[0].sumstd_foh,
          std_voh: datastd[0].sumstd_voh,
          std_setup_time_pc: datastd[0].sumstd_setup_time_pc,
        });
        if (datagetIsrtg_idanditem_id) {
          await Promise.all(
            datagetIsrtg_idanditem_id.map(async (x) => {
              await tbl_routingService.update(x.id, {
                operation_cost:
                  parseFloat(datastd[0].sumstd_dl) +
                  parseFloat(datastd[0].sumstd_foh) +
                  parseFloat(datastd[0].sumstd_voh) +
                  parseFloat(datastd[0].sumstd_setup_time_pc),
              });
            })
          );
        }
      }

      // res.status(200).json(dataadd);
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

      //    if(result){
      //     await u_define_masterService.create(
      //       {
      //   module_master_id:result.id,
      //   u_define_module_id:result_udefine[0]?.id??0,
      //   numeric1: "",
      //   numeric2: "",
      //   company_id:req.requester_company_id?req.requester_company_id:0,
      //   date1: null,
      //   date2: null,
      //   boolean1: false,
      //   boolean2: false,
      //   char1: "",
      //   char2: "",
      //   text1: "",
      //   text2: "",
      // }
      //     );
      //     }
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

   exports.InsertRoutingdataFromEcons = async (req, res) => {
    let checkdata_success=0;
    let checkdata_fail=0;
    try {
       const result = await tbl_routingService.V_Routing_From_Econs();
          if(result.length > 0){
              result.forEach(async(x,i)=>{
                try {
               await tbl_routingService.create({
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
                checkdata_success++;
              }catch (error) {
                checkdata_fail++;
                console.error(error);
              }
              if(i === result.length - 1) {
                res.status(200).json({
                  total:result.length,
                  success:checkdata_success,
                  fail:checkdata_fail,
                  message: `Insert data from Econs completed. Success: ${checkdata_success}, Fail: ${checkdata_fail}`,
                });
  
              }
            });
          }else{
             res.status(200).json({
                  total:result.length,
                  success:checkdata_success,
                  fail:checkdata_fail,
                  message: `Insert data from Econs completed. Success: ${checkdata_success}, Fail: ${checkdata_fail}`,
                });
          }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

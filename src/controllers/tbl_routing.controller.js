const tbl_routingService = require("../services/tbl_routing.service");
const tbl_mchService = require("../services/tbl_mch.service");
const u_define_masterService = require("../services/u_define_master.service");
const item_masterService = require("../services/item_master.service");

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

const RoutingTmpService = require("../services/tbl_routing_tmp.service");
const multer = require("multer");
const multerConfig = require("../configs/multercompany");
const e = require("express");
const upload = multer(multerConfig.config).array(multerConfig.keyUpload);

exports.getPONewMachine = async (req, res) => {
  res.json(await RoutingTmpService.getPONewMachine(req.params.company_id));
};

exports.getPONewMachineName = async (req, res) => {
  res.json(await RoutingTmpService.getPONewMachineName(req.params.company_id));
};

exports.getMainRoutingByItemAndRtgId = async (req, res) =>
  res.json(
    await RoutingTmpService.getMainRoutingByItemAndRtgId(
      req.params.item_master_id,
      req.params.rtg_id,
      req.params.company_id
    )
  );

exports.getMainRoutingById = async (req, res) =>
  res.json(await RoutingTmpService.getMainRoutingById(req.params.id));

exports.getRoutingTmpNewByRtgMainId = async (req, res) => {
  res.json(
    await RoutingTmpService.getRoutingTmpNewByRtgMainId(req.params.rtg_main_id)
  );
};

exports.getRoutingTmpById = async (req, res) =>
  res.json(await RoutingTmpService.getRoutingTmpById(req.params.id));

exports.saveRoutingTmpNew = async (req, res) =>
  res.json(await RoutingTmpService.saveRoutingTmpNew(req.body));

exports.deleteRoutingTmpNew = async (req, res) =>
  res.json(await RoutingTmpService.deleteRoutingTmpNew(req.params.id));

exports.saveRoutingTmp = async (req, res) =>
  res.json(await RoutingTmpService.saveRoutingTmp(req.body));

exports.deleteRoutingTmp = async (req, res) =>
  res.json(await RoutingTmpService.deleteRoutingTmp(req.params.id));

exports.findById = async (req, res) =>
  res.json(await RoutingTmpService.findById(req.params.id));

exports.getAll = async (req, res) =>
  res.json(await RoutingTmpService.findAll(req.params.id));

exports.create = async (req, res) => {
  let findsystem_id = await RoutingTmpService.findSystemId();
  if (!findsystem_id[0] || !findsystem_id[0].id) {
    req.params.file_number = 1;
  } else {
    req.params.file_number = parseInt(findsystem_id[0].id + 1);
  }
  upload(req, res, async (error) => {
    if (error) {
      console.log(`error: ${JSON.stringify(error)}`);
      return res.status(500).json({ message: error.message });
    }
    // let filename = "";
    // if(req.files){
    //   req.files.forEach((x,index) =>{
    //     imagesService.create({ image: x.filename });
    //     filename += x.filename
    //     if(index < req.files.length-1){
    //       filename += ",";
    //     }
    //     }
    //   )
    // }
    // req.body.im_file =filename;

    req.body.id = req.params.file_number;

    res.status(200).json(await RoutingTmpService.create(req.body));
  });
};

exports.update = async (req, res) => {
  try {
    req.params.file_number = req.params.id;
    upload(req, res, async (error) => {
      if (error) {
        console.log(`error: ${JSON.stringify(error)}`);
        return res.status(500).json({ message: error.message });
      }
      // let filename = "";
      // if(req.files){

      //   req.files.forEach((x,index) =>{
      //     imagesService.create({ image: x.filename });
      //     filename += x.filename
      //     if(index < req.files.length-1){
      //       filename += ",";
      //     }
      //     }
      //   )
      // }
      // req.body.im_file =filename;
      res.json(await RoutingTmpService.update(req.params.id, req.body));
    });
  } catch (error) {
    res.json({ message: error.message });
    return;
  }
};

exports.delete = async (req, res) =>
  res.json(await RoutingTmpService.delete(req.params.id));

exports.updateMainRouting = async (req, res) =>
  res.json(await RoutingTmpService.updateMainRouting(req.params.id, req.body));

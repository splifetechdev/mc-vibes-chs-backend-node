const tbl_plc_mapping_machineService = require("../services/tbl_plc_mapping_machine.service");

exports.getAll = async (req, res) =>
  res.json(await tbl_plc_mapping_machineService.findAll(req.params.id));

exports.getAllByID = async (req, res) =>
  res.json(await tbl_plc_mapping_machineService.findAllByID(req.params.id,req.params.u_define_id));


  exports.create = async (req, res) => {
    try {
    res.json(await tbl_plc_mapping_machineService.create(req.body));
    }catch (err) {
      res.status(204).json({ message: "Item ID Duplicate"});
   }
  }

exports.update = async (req, res) => {
  try {
    res
      .status(201)
      .json(await tbl_plc_mapping_machineService.update(req.params.id, req.body));
  } catch (error) {
    // res.json({ message: error.message });
    res.status(204).json({ message: "Item ID Duplicate"});
    return;
  }
};

exports.delete = async (req, res) => {
  res.json(await tbl_plc_mapping_machineService.delete(req.params.id));
};

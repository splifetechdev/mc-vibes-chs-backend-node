const tbl_shiftService = require("../services/tbl_shift.service");

exports.getAll = async (req, res) =>
  res.json(await tbl_shiftService.findAll(req.params.id));

exports.getAllByID = async (req, res) =>
  res.json(await tbl_shiftService.findAllByID(req.params.id,req.params.u_define_id));


exports.create = async (req, res) =>
  res.json(await tbl_shiftService.create(req.body));

exports.update = async (req, res) => {
  try {
    res
      .status(201)
      .json(await tbl_shiftService.update(req.params.id, req.body));
  } catch (error) {
    res.json({ message: error.message });
    return;
  }
};

exports.delete = async (req, res) => {
  res.json(await tbl_shiftService.delete(req.params.id));
};

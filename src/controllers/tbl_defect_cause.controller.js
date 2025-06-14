const defect_causeService = require("../services/tbl_defect_cause.service");

exports.getAll = async (req, res) =>
  res.json(await defect_causeService.findAll(req.params.id));

exports.getAllByID = async (req, res) =>
  res.json(await defect_causeService.findAllByID(req.params.id,req.params.u_define_id));


exports.create = async (req, res) =>
  res.json(await defect_causeService.create(req.body));

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

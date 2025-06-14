const tbl_sheftService = require("../services/tbl_sheft.service");

exports.findById = async (req, res) =>
  res.json(await tbl_sheftService.findById(req.params.id));

exports.getAll = async (req, res) =>
  res.json(await tbl_sheftService.findAll(req.params.id));

exports.create = async (req, res) =>
  res.json(await tbl_sheftService.create(req.body));

exports.update = async (req, res) => {
  res.json(await tbl_sheftService.update(req.params.id, req.body));
};

exports.delete = async (req, res) => {
  res.json(await tbl_sheftService.delete(req.params.id));
};

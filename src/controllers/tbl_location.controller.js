const tbl_locationService = require("../services/tbl_location.service");

exports.findById = async (req, res) =>
  res.json(await tbl_locationService.findById(req.params.id));

exports.getAll = async (req, res) =>
  res.json(await tbl_locationService.findAll(req.params.id));

exports.create = async (req, res) =>
  res.json(await tbl_locationService.create(req.body));

exports.update = async (req, res) => {
  res.json(await tbl_locationService.update(req.params.id, req.body));
};

exports.delete = async (req, res) => {
  res.json(await tbl_locationService.delete(req.params.id));
};

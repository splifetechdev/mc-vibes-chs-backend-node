const tbl_warehouseService = require("../services/tbl_warehouse.service");

exports.findById = async (req, res) =>
  res.json(await tbl_warehouseService.findById(req.params.id));

exports.getAll = async (req, res) =>
  res.json(await tbl_warehouseService.findAll(req.params.id));

exports.create = async (req, res) =>
  res.json(await tbl_warehouseService.create(req.body));

exports.update = async (req, res) => {
  res.json(await tbl_warehouseService.update(req.params.id, req.body));
};

exports.delete = async (req, res) => {
  res.json(await tbl_warehouseService.delete(req.params.id));
};

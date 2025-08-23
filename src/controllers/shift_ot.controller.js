const shiftOTService = require("../services/shift_ot.service");

exports.getAll = async (req, res) => res.json(await shiftOTService.findAll());

exports.getShiftOTByShiftID = async (req, res) =>
  res.json(await shiftOTService.findByShiftID(req.params.shift_id));

exports.create = async (req, res) =>
  res.json(await shiftOTService.create(req.body));

exports.update = async (req, res) =>
  res.json(await shiftOTService.update(req.params.id, req.body));

exports.delete = async (req, res) =>
  res.json(await shiftOTService.delete(req.params.id));

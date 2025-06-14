const groupMenuService = require("../services/group_menu.service");

exports.getAll = async (req, res) => res.json(await groupMenuService.findAll());

exports.create = async (req, res) =>
  res.json(await groupMenuService.create(req.body));

exports.update = async (req, res) =>
  res.json(await groupMenuService.update(req.params.id, req.body));

exports.delete = async (req, res) =>
  res.json(await groupMenuService.delete(req.params.id));

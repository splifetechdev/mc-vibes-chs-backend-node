const settingGroupMenuService = require("../services/setting_group_menu.service");

exports.getAll = async (req, res) =>
  res.json(await settingGroupMenuService.findAll());

exports.create = async (req, res) =>
  res.json(await settingGroupMenuService.create(req.body));

exports.update = async (req, res) =>
  res.json(await settingGroupMenuService.update(req.params.id, req.body));

exports.delete = async (req, res) =>
  res.json(await settingGroupMenuService.delete(req.params.id));

exports.deleteMenuCache = async (req, res) =>
  res.json(await settingGroupMenuService.deleteMenuCache());

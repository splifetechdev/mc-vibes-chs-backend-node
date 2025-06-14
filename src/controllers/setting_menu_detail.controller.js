const settingMenuDetailService = require("../services/setting_menu_detail.service");

exports.getAll = async (req, res) =>
  res.json(await settingMenuDetailService.findAll());

exports.getCountById = async (req, res) => {
  res.json(await settingMenuDetailService.findCountById(req.params.id));
};

exports.getListMenuDetailById = async (req, res) => {
  res.json(
    await settingMenuDetailService.findListMenuDetailById(req.params.id)
  );
};

exports.create = async (req, res) =>
  res.json(await settingMenuDetailService.create(req.body));

exports.update = async (req, res) =>
  res.json(await settingMenuDetailService.update(req.params.id, req.body));

exports.delete = async (req, res) =>
  res.json(await settingMenuDetailService.delete(req.params.id));

const settingGroupMenuRepository = require("../repositories/setting_group_menu.repository");

exports.findAll = async () => await settingGroupMenuRepository.findAll();

exports.create = async (data) => await settingGroupMenuRepository.create(data);

exports.update = async (id, data) =>
  await settingGroupMenuRepository.update(id, data);

exports.delete = async (id) => await settingGroupMenuRepository.delete(id);

exports.deleteMenuCache = async () =>
  await settingGroupMenuRepository.deleteMenuCache();

const settingMenuDetailRepository = require("../repositories/setting_menu_detail.repository");
// const settingMenuDetailRepositoryQ = require("../repositories/setting_menu_detail_q.repository");

exports.findAll = async () => await settingMenuDetailRepository.findAll();

exports.findCountById = async (id) => {
  const res_count = await settingMenuDetailRepository.findCountById(id);
  return res_count;
};

exports.findListMenuDetailById = async (id) =>
  await settingMenuDetailRepository.findListMenuDetailById(id);

exports.create = async (data) => await settingMenuDetailRepository.create(data);

exports.update = async (id, data) =>
  await settingMenuDetailRepository.update(id, data);

exports.delete = async (id) => await settingMenuDetailRepository.delete(id);

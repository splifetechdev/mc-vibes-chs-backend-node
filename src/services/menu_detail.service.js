const menuDetailRepository = require("../repositories/menu_detail.repository");
// const menuDetailRepositoryQ = require("../repositories/menu_detail_q.repository");

exports.findAll = async () => await menuDetailRepository.findAll();

exports.findAllDetailGroupMenu = async () =>
  await menuDetailRepository.findAllDetailGroupMenu();

exports.findLast1MenuDetail = async () =>
  await menuDetailRepository.findLast1MenuDetail();

// exports.create = async (data) => await menuDetailRepository.create(data);
exports.create = async (data) =>
  await menuDetailRepository.createMenuDetailAndSettingDetail(data);

exports.update = async (id, data) =>
  await menuDetailRepository.update(id, data);

exports.delete = async (id) => await menuDetailRepository.delete(id);

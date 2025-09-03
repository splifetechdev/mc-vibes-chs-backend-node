const GroupItemRepository = require("../repositories/group_item.repository");

exports.findAll = async (id) =>
  await GroupItemRepository.findGroupItemAll(id);

exports.findAllByID = async (id) =>
  await GroupItemRepository.findGroupItemAllByID(id);

exports.findListAll = async () => await GroupItemRepository.findListAll();

exports.findListByCompany = async (company_id) =>
  await GroupItemRepository.findListByCompany(company_id);
exports.getAlldata = async (id) => await GroupItemRepository.getAlldata(id);

exports.create = async (data) => await GroupItemRepository.create(data);

exports.update = async (id, data) =>
  await GroupItemRepository.update(id, data);

exports.getAlldatabycompany = async (id) =>
  await GroupItemRepository.getAlldatabycompany(id);

exports.delete = async (id) => await GroupItemRepository.delete(id);

exports.findGroupItemBygroup_item = async (group_item,company_id) => await GroupItemRepository.findGroupItemBygroup_item(group_item,company_id);

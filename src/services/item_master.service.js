const item_masterRepository = require("../repositories/item_master.repository");

exports.findAll = async (id) =>
  await item_masterRepository.finditem_masterAll(id);

exports.findAllByID = async (id, u_define_id) =>
  await item_masterRepository.finditem_masterAllByID(id, u_define_id);

  exports.getAllByItemGroup = async (id) =>
  await item_masterRepository.getAllByItemGroup(id);
  
exports.getAlldata = async (id) => await item_masterRepository.getAlldata(id);

exports.create = async (data) => await item_masterRepository.create(data);

exports.update = async (id, data) =>
  await item_masterRepository.update(id, data);

exports.getAlldatabycompany = async (id) => await item_masterRepository.getAlldatabycompany(id);

exports.delete = async (id) => await item_masterRepository.delete(id);

exports.findByitem_masterID = async (item_id,company_id) => await item_masterRepository.findByitem_masterID(item_id,company_id);

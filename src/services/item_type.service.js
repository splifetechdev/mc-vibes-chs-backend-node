const ItemTypeRepository = require("../repositories/item_type.repository");

exports.findAll = async (id) => await ItemTypeRepository.findItemTypeAll(id);

exports.findAllByID = async (id) =>
  await ItemTypeRepository.findItemTypeAllByID(id);

exports.findListAll = async () => await ItemTypeRepository.findListAll();

exports.findListByCompany = async (company_id) =>
  await ItemTypeRepository.findListByCompany(company_id);
exports.getAlldata = async (id) => await ItemTypeRepository.getAlldata(id);

exports.create = async (data) => await ItemTypeRepository.create(data);

exports.update = async (id, data) => await ItemTypeRepository.update(id, data);

exports.getAlldatabycompany = async (id) =>
  await ItemTypeRepository.getAlldatabycompany(id);

exports.delete = async (id) => await ItemTypeRepository.delete(id);

exports.findItemTypeByitem_type = async (item_type,company_id) => await ItemTypeRepository.findItemTypeByitem_type(item_type,company_id);
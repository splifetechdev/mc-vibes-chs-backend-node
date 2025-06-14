const u_define_masterRepository = require("../repositories/u_define_master.repository");

exports.findAll = async (id) =>
  await u_define_masterRepository.findu_define_masterAll();

exports.findAllByID = async (id) =>
  await u_define_masterRepository.findu_define_masterAllByID(id);

exports.getAllByGroup = async (id) =>
  await u_define_masterRepository.getAllByGroup(id);

exports.getAlldata = async (id) =>
  await u_define_masterRepository.getAlldata(id);

exports.create = async (data) => await u_define_masterRepository.create(data);

exports.update = async (id, data) =>
  await u_define_masterRepository.update(id, data);

exports.updateBymodulemasterid = async (id, data) =>
  await u_define_masterRepository.updateBymodulemasterid(id, data);

exports.updateByModuleMasterIdANDUdefineModuleId = async (
  module_master_id,
  u_define_module_id,
  data
) =>
  await u_define_masterRepository.updateByModuleMasterIdANDUdefineModuleId(
    module_master_id,
    u_define_module_id,
    data
  );

exports.getAlldatabycompany = async (id) =>
  await u_define_masterRepository.getAlldatabycompany(id);

exports.delete = async (id) => await u_define_masterRepository.delete(id);

exports.deletemodule_master_and_udefine = async (id,u_define_module_id) => await u_define_masterRepository.deletemodule_master_and_udefine(id,u_define_module_id);

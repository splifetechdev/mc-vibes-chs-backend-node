const u_define_moduleRepository = require("../repositories/u_define_module.repository");

exports.findAll = async (id) =>
  await u_define_moduleRepository.findu_define_moduleAll();

exports.findAllByID = async (id) =>
  await u_define_moduleRepository.findu_define_moduleAllByID(id);

exports.getAllByCompany = async (id) =>
  await u_define_moduleRepository.getAllByCompany(id);

exports.getUdefineIDByCompanyAndModuleName = async (module_name, company_id) =>
  await u_define_moduleRepository.getUdefineIDByCompanyAndModuleName(
    module_name,
    company_id
  );

exports.getAlldata = async (id) =>
  await u_define_moduleRepository.getAlldata(id);

exports.create = async (data) => await u_define_moduleRepository.create(data);

exports.update = async (id, data) =>
  await u_define_moduleRepository.update(id, data);

exports.updateBymodulemasterid = async (id, data) =>
  await u_define_moduleRepository.updateBymodulemasterid(id, data);

// exports.updateByModuleMasterIdANDUdefineModuleId = async (
//   module_master_id,
//   u_define_module_id,
//   data
// ) =>
//   await u_define_moduleRepository.updateByModuleMasterIdANDUdefineModuleId(
//     module_master_id,
//     u_define_module_id,
//     data
//   );

exports.getAlldatabycompany = async (id) =>
  await u_define_moduleRepository.getAlldatabycompany(id);

exports.delete = async (id) => await u_define_moduleRepository.delete(id);

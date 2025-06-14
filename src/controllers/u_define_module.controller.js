const u_define_moduleService = require("../services/u_define_module.service");

exports.getAll = async (req, res) =>
  res.json(await u_define_moduleService.findAll());

exports.getAllByID = async (req, res) =>
  res.json(await u_define_moduleService.findAllByID(req.params.id));

exports.getAllByCompany = async (req, res) =>
  res.json(await u_define_moduleService.getAllByCompany(req.params.id));

exports.getUdefineIDByCompanyAndModuleName = async (req, res) =>
  res.json(
    await u_define_moduleService.getUdefineIDByCompanyAndModuleName(
      req.params.module_name,
      req.params.company_id
    )
  );

exports.getAlldata = async (req, res) =>
  res.json(await u_define_moduleService.getAlldata());

exports.create = async (req, res) =>
  res.json(await u_define_moduleService.create(req.body));

exports.update = async (req, res) => {
  try {
    res
      .status(201)
      .json(await u_define_moduleService.update(req.params.id, req.body));
  } catch (error) {
    res.json({ message: error.message });
    return;
  }
};

exports.updateBymodulemasterid = async (req, res) => {
  try {
    res
      .status(201)
      .json(
        await u_define_moduleService.updateBymodulemasterid(
          req.params.id,
          req.body
        )
      );
  } catch (error) {
    res.json({ message: error.message });
    return;
  }
};

// exports.updateByModuleMasterIdANDUdefineModuleId = async (req, res) => {
//   try {
//     res
//       .status(201)
//       .json(
//         await u_define_moduleService.updateByModuleMasterIdANDUdefineModuleId(
//           req.params.module_master_id,
//           req.params.u_define_module_id,
//           req.body
//         )
//       );
//   } catch (error) {
//     res.json({ message: error.message });
//     return;
//   }
// };

exports.getAlldatabycompany = async (req, res) =>
  res.json(await u_define_moduleService.getAlldatabycompany(req.params.id));

exports.delete = async (req, res) => {
  res.json(await u_define_moduleService.delete(req.params.id));
};

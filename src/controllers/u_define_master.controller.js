const u_define_masterService = require("../services/u_define_master.service");


exports.getAll = async (req, res) =>
  res.json(await u_define_masterService.findAll());

exports.getAllByID = async (req, res) =>
  res.json(await u_define_masterService.findAllByID(req.params.id));

  exports.getAllByGroup = async (req, res) =>
  res.json(await u_define_masterService.getAllByGroup(req.params.id));


exports.getAlldata = async (req, res) =>
  res.json(await u_define_masterService.getAlldata());

exports.create = async (req, res) =>
  res.json(await u_define_masterService.create(req.body));

exports.update = async (req, res) => {
  try {
    res
      .status(201)
      .json(await u_define_masterService.update(req.params.id, req.body));
  } catch (error) {
    res.json({ message: error.message });
    return;
  }
};


exports.updateBymodulemasterid = async (req, res) => {
  try {
    res
      .status(201)
      .json(await u_define_masterService.updateBymodulemasterid(req.params.id, req.body));
  } catch (error) {
    res.json({ message: error.message });
    return;
  }
};


exports.updateByModuleMasterIdANDUdefineModuleId = async (req, res) => {
  try {
    res
      .status(201)
      .json(
        await u_define_masterService.updateByModuleMasterIdANDUdefineModuleId(
          req.params.module_master_id,
          req.params.u_define_module_id,
          req.body
        )
      );
  } catch (error) {
    res.json({ message: error.message });
    return;
  }
};

exports.getAlldatabycompany = async (req, res) =>
  res.json(await u_define_masterService.getAlldatabycompany(req.params.id));

  exports.delete = async (req, res) => {
    res.json(await u_define_masterService.delete(req.params.id));
}

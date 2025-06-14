const router = require("express").Router();
const u_define_moduleController = require("../controllers/u_define_module.controller");

router.get("/", u_define_moduleController.getAll);
router.get("/getAllByID/:id", u_define_moduleController.getAllByID);
router.get("/getAllByCompany/:id", u_define_moduleController.getAllByCompany);
router.get(
  "/getUdefineIDByCompanyAndModuleName/:module_name/:company_id",
  u_define_moduleController.getUdefineIDByCompanyAndModuleName
);
router.get("/get/All", u_define_moduleController.getAlldata);
router.post("/", u_define_moduleController.create);
router.put("/:id", u_define_moduleController.update);

// router.put(
//   "/updateByModuleMasterIdANDUdefineModuleId/:module_master_id/:u_define_module_id",
//   u_define_moduleController.updateByModuleMasterIdANDUdefineModuleId
// );

router.put(
  "/updateUdefineBymodulemasterid/:id",
  u_define_moduleController.updateBymodulemasterid
);

router.get("/get/All/:id", u_define_moduleController.getAlldatabycompany);
router.delete("/:id", u_define_moduleController.delete);

module.exports = router;

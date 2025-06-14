const router = require("express").Router();
const u_define_masterController = require("../controllers/u_define_master.controller");

router.get("/", u_define_masterController.getAll);
router.get("/getAllByID/:id", u_define_masterController.getAllByID);
router.get("/getAllByGroup/:id", u_define_masterController.getAllByGroup);
router.get("/get/All", u_define_masterController.getAlldata);
router.post("/", u_define_masterController.create);
router.put("/:id", u_define_masterController.update);
router.put(
  "/updateBymodulemasterid/:id",
  u_define_masterController.updateBymodulemasterid
);

router.put(
  "/updateByModuleMasterIdANDUdefineModuleId/:module_master_id/:u_define_module_id",
  u_define_masterController.updateByModuleMasterIdANDUdefineModuleId
);

router.get("/get/All/:id", u_define_masterController.getAlldatabycompany);
router.delete("/:id", u_define_masterController.delete);

module.exports = router;

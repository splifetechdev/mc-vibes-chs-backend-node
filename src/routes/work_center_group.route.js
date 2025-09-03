const router = require("express").Router();
const WorkCenterGroupController = require("../controllers/work_center_group.controller");

router.get("/:id", WorkCenterGroupController.getAll);
router.get(
  "/getWorkCenterGroupAndName/:id",
  WorkCenterGroupController.getWorkCenterGroupAndName
);

router.get(
  "/getWorkCenterGroupByMachineId/:machine_id",
  WorkCenterGroupController.getWorkCenterGroupByMachineId
);

router.get(
  "/getAllByID/:id/:u_define_id",
  WorkCenterGroupController.getAllByID
);
router.get("/get/All", WorkCenterGroupController.getAlldata);
router.post("/", WorkCenterGroupController.create);
router.put("/:id", WorkCenterGroupController.update);

router.get("/getListAll/list", WorkCenterGroupController.getListAll);
router.get(
  "/getListByCompany/:company_id",
  WorkCenterGroupController.getListByCompany
);
router.get("/get/All/:id", WorkCenterGroupController.getAlldatabycompany);
router.delete("/:id", WorkCenterGroupController.delete);

router.post("/wcgganttchart/:id", WorkCenterGroupController.findWorkCenterAllforganttchart);

router.post("/import_work_center_group", WorkCenterGroupController.import_work_center_group);

module.exports = router;

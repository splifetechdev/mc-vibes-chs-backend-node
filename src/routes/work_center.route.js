const router = require("express").Router();
const WorkCenterController = require("../controllers/work_center.controller");

router.get("/:id", WorkCenterController.getAll);
router.get(
  "/getWorkCenterAndName/:id",
  WorkCenterController.getWorkCenterAndName
);

router.get("/getbyWorkcentergroup/:wc_group",WorkCenterController.getbyWorkcentergroup);

router.get("/getAllByID/:id/:u_define_id", WorkCenterController.getAllByID);
router.get("/get/All", WorkCenterController.getAlldata);
router.post("/", WorkCenterController.create);
router.put("/:id", WorkCenterController.update);

router.get("/getListAll/list", WorkCenterController.getListAll);
router.get(
  "/getListByCompany/:company_id",
  WorkCenterController.getListByCompany
);
router.get("/get/All/:id", WorkCenterController.getAlldatabycompany);
router.delete("/:id", WorkCenterController.delete);

router.post("/wcganttchart/:id", WorkCenterController.findWorkCenterAllforganttchart);

router.post("/import_work_center", WorkCenterController.import_work_center);

module.exports = router;

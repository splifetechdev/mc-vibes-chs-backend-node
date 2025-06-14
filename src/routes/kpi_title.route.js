const router = require("express").Router();
const KPITitleController = require("../controllers/kpi_title.controller");

router.get("/:id", KPITitleController.getAll);

router.get("/getAllByID/:id/:u_define_id", KPITitleController.getAllByID);
router.get("/get/All", KPITitleController.getAlldata);
router.post("/", KPITitleController.create);
router.put("/:id", KPITitleController.update);

router.get("/getListAll/list", KPITitleController.getListAll);
router.get(
  "/getListByCompany/:company_id",
  KPITitleController.getListByCompany
);
router.get("/get/All/:id", KPITitleController.getAlldatabycompany);
router.delete("/:id", KPITitleController.delete);

module.exports = router;

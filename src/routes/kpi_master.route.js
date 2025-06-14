const router = require("express").Router();
const KPIMasterController = require("../controllers/kpi_master.controller");

router.get("/:id", KPIMasterController.getAll);

router.get("/getAllByID/:id/:u_define_id", KPIMasterController.getAllByID);
router.get("/get/All", KPIMasterController.getAlldata);
router.post("/", KPIMasterController.create);
router.put("/:id", KPIMasterController.update);

router.get("/getListAll/list", KPIMasterController.getListAll);
router.get(
  "/getListByCompany/:company_id",
  KPIMasterController.getListByCompany
);
router.get("/get/All/:id", KPIMasterController.getAlldatabycompany);
router.get(
  "/getKPIMasterList/:company_id",
  KPIMasterController.getKPIMasterList
);
router.delete("/:id", KPIMasterController.delete);

module.exports = router;

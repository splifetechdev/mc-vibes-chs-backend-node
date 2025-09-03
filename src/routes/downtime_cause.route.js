const router = require("express").Router();
const DownTimeCauseController = require("../controllers/downtime_cause.controller");

router.get("/:id", DownTimeCauseController.getAll);

router.get("/getAllByID/:id/:u_define_id", DownTimeCauseController.getAllByID);
router.get("/get/All", DownTimeCauseController.getAlldata);
router.post("/", DownTimeCauseController.create);
router.put("/:id", DownTimeCauseController.update);

router.get("/getListAll/list", DownTimeCauseController.getListAll);
router.get(
  "/getListByCompany/:company_id",
  DownTimeCauseController.getListByCompany
);
router.get("/get/All/:id", DownTimeCauseController.getAlldatabycompany);
router.delete("/:id", DownTimeCauseController.delete);
router.post("/import_downtime_cause", DownTimeCauseController.import_downtime_cause);

module.exports = router;

const router = require("express").Router();
const reportallController = require("../controllers/reportall.controller");

router.get("/get", reportallController.getAll);
router.get("/get_By_CompanyID/:id", reportallController.getAll_By_CompanyID);
router.post("/", reportallController.create);
router.put("/:id", reportallController.update);
router.delete("/:id", reportallController.delete);
router.post("/cloth_registration_mch", reportallController.cloth_registration_mch);
router.post("/cloth_registration_sum", reportallController.cloth_registration_sum);
router.post("/cloth_registration_detail", reportallController.cloth_registration_detail);
router.post("/report_lost_time", reportallController.report_lost_time);
router.post("/report_performance", reportallController.report_performance);
router.post("/report_waste", reportallController.report_waste);

module.exports = router;
